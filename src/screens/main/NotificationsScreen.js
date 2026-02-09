/**
 * Notifications Screen
 * Live list of notifications (from API + FCM), with tabs like web: CRM | Marketing | Other
 */

import React, { useCallback, useMemo, useState } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
    RefreshControl,
    Image,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors } from '../../constants/Colors';
import { Spacing } from '../../constants/Spacing';
import { ms } from '../../utils/Responsive';
import { ScreenWrapper, AppText } from '../../components';
import { useNotification } from '../../context';

const TAB_CRM = 'crm';
const TAB_MARKETING = 'marketing';
const TAB_OTHER = 'other';

const CRM_TYPES = ['lead', 'task', 'company'];
const MARKETING_TYPES = ['campaign', 'broadcast'];
const OTHER_TYPES = ['system', 'announcement'];

const getUnreadCount = (items) => (items || []).filter((n) => !n.read).length;

const isValidImageUrl = (url) =>
    typeof url === 'string' &&
    url.trim().length > 0 &&
    (url.startsWith('http://') || url.startsWith('https://'));

const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
};

const NotificationItem = ({ item, onPress, onMarkRead }) => (
    <TouchableOpacity
        style={[styles.item, !item.read && styles.itemUnread]}
        onPress={() => {
            onMarkRead(item._id);
            onPress(item);
        }}
        activeOpacity={0.7}
    >
        {!item.read && <View style={styles.unreadDot} />}
        {isValidImageUrl(item.imageUrl) && (
            <View style={styles.thumb}>
                <Image source={{ uri: item.imageUrl }} style={styles.thumbImage} />
            </View>
        )}
        <View style={styles.itemContent}>
            <AppText size="sm" weight={item.read ? 'normal' : 'semiBold'} numberOfLines={1}>
                {item.title}
            </AppText>
            <AppText size="xs" color={Colors.textMuted} numberOfLines={2} style={styles.desc}>
                {item.description}
            </AppText>
        </View>
        <AppText size="xs" color={Colors.textMuted} style={styles.time}>
            {formatTime(item.createdAt)}
        </AppText>
    </TouchableOpacity>
);

const NotificationsScreen = () => {
    const navigation = useNavigation();
    const [activeTab, setActiveTab] = useState(TAB_CRM);
    const {
        notifications,
        notificationsLoading,
        unreadCount,
        fetchNotifications,
        markNotificationAsRead,
        markAllNotificationsAsRead,
    } = useNotification();

    const { crmNotifications, marketingNotifications, otherNotifications, filteredList } = useMemo(() => {
        const crm = (notifications || []).filter((n) => CRM_TYPES.includes(n.type));
        const marketing = (notifications || []).filter((n) => MARKETING_TYPES.includes(n.type));
        const other = (notifications || []).filter((n) => OTHER_TYPES.includes(n.type));
        const list =
            activeTab === TAB_CRM
                ? crm
                : activeTab === TAB_MARKETING
                    ? marketing
                    : other;
        return {
            crmNotifications: crm,
            marketingNotifications: marketing,
            otherNotifications: other,
            filteredList: list,
        };
    }, [notifications, activeTab]);

    useFocusEffect(
        useCallback(() => {
            fetchNotifications();
        }, [fetchNotifications])
    );

    const handleNotificationPress = (item) => {
        if (item.entityId && item.type === 'lead') {
            navigation.navigate('LeadDetails', { id: item.entityId });
        } else if (item.entityId && item.type === 'task') {
            navigation.navigate('TaskDetails', { id: item.entityId });
        }
        // company, campaign, broadcast, system, announcement: no deep link in app for now
    };

    const renderHeader = () => (
        <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                <Icon name="arrow-left" size={ms(24)} color={Colors.textPrimary} />
            </TouchableOpacity>
            <AppText size="lg" weight="bold">Notifications</AppText>
            {unreadCount > 0 ? (
                <TouchableOpacity onPress={markAllNotificationsAsRead} style={styles.markAllBtn}>
                    <AppText size="xs" color={Colors.primary}>Mark all read</AppText>
                </TouchableOpacity>
            ) : (
                <View style={styles.placeholder} />
            )}
        </View>
    );

    const renderTabs = () => (
        <View style={styles.tabsRow}>
            <TouchableOpacity
                style={[styles.tab, activeTab === TAB_CRM && styles.tabActive]}
                onPress={() => setActiveTab(TAB_CRM)}
                activeOpacity={0.7}
            >
                <Icon
                    name="account-group-outline"
                    size={ms(18)}
                    color={activeTab === TAB_CRM ? Colors.primary : Colors.textMuted}
                />
                <AppText
                    size="xs"
                    weight={activeTab === TAB_CRM ? 'semiBold' : 'normal'}
                    color={activeTab === TAB_CRM ? Colors.primary : Colors.textMuted}
                    style={styles.tabLabel}
                >
                    CRM
                </AppText>
                {getUnreadCount(crmNotifications) > 0 && (
                    <View style={styles.tabBadge}>
                        <AppText size="xs" weight="bold" color={Colors.white}>
                            {getUnreadCount(crmNotifications) > 9 ? '9+' : getUnreadCount(crmNotifications)}
                        </AppText>
                    </View>
                )}
            </TouchableOpacity>
            <TouchableOpacity
                style={[styles.tab, activeTab === TAB_MARKETING && styles.tabActive]}
                onPress={() => setActiveTab(TAB_MARKETING)}
                activeOpacity={0.7}
            >
                <Icon
                    name="bullhorn-outline"
                    size={ms(18)}
                    color={activeTab === TAB_MARKETING ? Colors.primary : Colors.textMuted}
                />
                <AppText
                    size="xs"
                    weight={activeTab === TAB_MARKETING ? 'semiBold' : 'normal'}
                    color={activeTab === TAB_MARKETING ? Colors.primary : Colors.textMuted}
                    style={styles.tabLabel}
                >
                    Marketing
                </AppText>
                {getUnreadCount(marketingNotifications) > 0 && (
                    <View style={styles.tabBadge}>
                        <AppText size="xs" weight="bold" color={Colors.white}>
                            {getUnreadCount(marketingNotifications) > 9 ? '9+' : getUnreadCount(marketingNotifications)}
                        </AppText>
                    </View>
                )}
            </TouchableOpacity>
            <TouchableOpacity
                style={[styles.tab, activeTab === TAB_OTHER && styles.tabActive]}
                onPress={() => setActiveTab(TAB_OTHER)}
                activeOpacity={0.7}
            >
                <Icon
                    name="dots-horizontal"
                    size={ms(18)}
                    color={activeTab === TAB_OTHER ? Colors.primary : Colors.textMuted}
                />
                <AppText
                    size="xs"
                    weight={activeTab === TAB_OTHER ? 'semiBold' : 'normal'}
                    color={activeTab === TAB_OTHER ? Colors.primary : Colors.textMuted}
                    style={styles.tabLabel}
                >
                    Other
                </AppText>
                {getUnreadCount(otherNotifications) > 0 && (
                    <View style={styles.tabBadge}>
                        <AppText size="xs" weight="bold" color={Colors.white}>
                            {getUnreadCount(otherNotifications) > 9 ? '9+' : getUnreadCount(otherNotifications)}
                        </AppText>
                    </View>
                )}
            </TouchableOpacity>
        </View>
    );

    if (notificationsLoading && notifications.length === 0) {
        return (
            <ScreenWrapper>
                {renderHeader()}
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                </View>
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper>
            {renderHeader()}
            {renderTabs()}
            <FlatList
                data={filteredList}
                keyExtractor={(n) => n._id}
                renderItem={({ item }) => (
                    <NotificationItem
                        item={item}
                        onPress={handleNotificationPress}
                        onMarkRead={markNotificationAsRead}
                    />
                )}
                contentContainerStyle={filteredList.length === 0 && styles.emptyList}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Icon name="bell-outline" size={ms(48)} color={Colors.textMuted} />
                        <AppText size="base" color={Colors.textMuted} style={styles.emptyText}>
                            No notifications in this tab
                        </AppText>
                    </View>
                }
                refreshControl={
                    <RefreshControl
                        refreshing={notificationsLoading}
                        onRefresh={fetchNotifications}
                        colors={[Colors.primary]}
                    />
                }
            />
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    tabsRow: {
        flexDirection: 'row',
        alignItems: 'stretch',
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
        paddingHorizontal: Spacing.xs,
        paddingVertical: Spacing.xs,
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.xs,
        borderRadius: 8,
        backgroundColor: Colors.background,
    },
    tabActive: {
        backgroundColor: Colors.primary + '18',
    },
    tabLabel: {
        marginLeft: 4,
    },
    tabBadge: {
        marginLeft: 4,
        minWidth: ms(18),
        height: ms(18),
        borderRadius: ms(9),
        backgroundColor: Colors.error,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 4,
    },
    backBtn: {
        padding: Spacing.xs,
    },
    markAllBtn: {
        padding: Spacing.xs,
    },
    placeholder: {
        width: ms(70),
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
        paddingLeft: Spacing.md + 6,
    },
    itemUnread: {
        backgroundColor: Colors.background + '99',
    },
    unreadDot: {
        position: 'absolute',
        left: Spacing.sm,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: Colors.primary,
    },
    thumb: {
        width: ms(44),
        height: ms(44),
        borderRadius: 8,
        overflow: 'hidden',
        backgroundColor: Colors.border,
        marginRight: Spacing.sm,
    },
    thumbImage: {
        width: '100%',
        height: '100%',
    },
    itemContent: {
        flex: 1,
        minWidth: 0,
    },
    desc: {
        marginTop: 2,
    },
    time: {
        marginLeft: Spacing.xs,
    },
    emptyList: {
        flexGrow: 1,
    },
    empty: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: Spacing.xxl,
    },
    emptyText: {
        marginTop: Spacing.sm,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default NotificationsScreen;
