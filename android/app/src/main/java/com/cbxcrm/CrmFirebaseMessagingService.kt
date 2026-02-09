package com.cbxcrm

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.os.Build
import android.os.Handler
import android.os.Looper
import androidx.core.app.NotificationCompat
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage
import java.net.URL
import java.util.concurrent.Executors

/**
 * Custom FCM service to show notifications with BigPictureStyle when imageUrl is in the payload.
 * Receives data-only messages (sent when notification has an image) and displays them with the image.
 */
class CrmFirebaseMessagingService : FirebaseMessagingService() {

    private val executor = Executors.newSingleThreadExecutor()
    private val mainHandler = Handler(Looper.getMainLooper())

    override fun onMessageReceived(remoteMessage: RemoteMessage) {
        val data = remoteMessage.data ?: return
        // Only handle data-only messages (no notification payload) - these are sent when we have an image
        if (remoteMessage.notification != null) return

        val title = data["title"] ?: getString(R.string.app_name)
        val body = data["body"] ?: ""
        val imageUrl = data["imageUrl"]?.takeIf { it.startsWith("http") }

        if (imageUrl != null) {
            showNotificationWithImage(title, body, imageUrl, data)
        } else {
            showSimpleNotification(title, body, data)
        }
    }

    override fun onNewToken(token: String) {
        super.onNewToken(token)
        // Token refresh is handled by React Native Firebase; no need to duplicate
    }

    private fun showNotificationWithImage(title: String, body: String, imageUrl: String, data: Map<String, String>) {
        executor.execute {
            try {
                val bitmap = downloadBitmap(imageUrl)
                mainHandler.post {
                    val notification = buildNotificationWithBigPicture(title, body, bitmap, data)
                    show(notification, data["notificationId"] ?: System.currentTimeMillis().toString())
                }
            } catch (e: Exception) {
                mainHandler.post {
                    showSimpleNotification(title, body, data)
                }
            }
        }
    }

    private fun downloadBitmap(urlString: String): Bitmap? {
        return try {
            val url = URL(urlString)
            val connection = url.openConnection()
            connection.connectTimeout = 10_000
            connection.readTimeout = 10_000
            connection.getInputStream().use { stream ->
                BitmapFactory.decodeStream(stream)
            }
        } catch (e: Exception) {
            null
        }
    }

    private fun buildNotificationWithBigPicture(
        title: String,
        body: String,
        bitmap: Bitmap?,
        data: Map<String, String>
    ): android.app.Notification {
        val channelId = "crm_notifications"
        createChannelIfNeeded(channelId)

        val builder = NotificationCompat.Builder(this, channelId)
            .setSmallIcon(R.mipmap.ic_launcher)
            .setContentTitle(title)
            .setContentText(body)
            .setStyle(NotificationCompat.BigTextStyle().bigText(body))
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setAutoCancel(true)
            .setContentIntent(createContentIntent(data))

        if (bitmap != null) {
            builder.setStyle(NotificationCompat.BigPictureStyle().bigPicture(bitmap))
        }

        return builder.build()
    }

    private fun showSimpleNotification(title: String, body: String, data: Map<String, String>) {
        val notification = buildNotificationWithBigPicture(title, body, null, data)
        show(notification, data["notificationId"] ?: System.currentTimeMillis().toString())
    }

    private fun show(notification: android.app.Notification, notificationId: String) {
        val id = notificationId.hashCode().let { if (it < 0) -it else it }
        val nm = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        nm.notify(id, notification)
    }

    private fun createChannelIfNeeded(channelId: String) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                channelId,
                "CRM Notifications",
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "CRM push notifications"
                setShowBadge(true)
                enableVibration(true)
            }
            val nm = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            nm.createNotificationChannel(channel)
        }
    }

    private fun createContentIntent(data: Map<String, String>): PendingIntent {
        val intent = Intent(this, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            data.forEach { (k, v) -> putExtra(k, v) }
        }
        val flags = PendingIntent.FLAG_UPDATE_CURRENT or
            (if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) PendingIntent.FLAG_IMMUTABLE else 0)
        return PendingIntent.getActivity(this, 0, intent, flags)
    }
}
