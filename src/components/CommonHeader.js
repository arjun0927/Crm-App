import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { AppText } from '../components';
import { Colors } from '../constants/Colors'
import { ms, vs, wp } from '../utils/Responsive'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { ROUTES } from '../constants'
import { Spacing, BorderRadius, Shadow } from '../constants/Spacing'
import { useAuth } from '../context';

const CommonHeader = ({ navigation }) => {
    const { user } = useAuth();
    return (
        <View style={styles.header}>
            <View>
                <AppText size="sm" color={Colors.textSecondary}>
                    Welcome back,
                </AppText>
                <AppText size="xl" weight="bold">
                    {user?.name || 'User'}
                </AppText>
            </View>
            <View style={styles.headerActions}>
                <TouchableOpacity
                    style={styles.aiButton}
                    onPress={() => navigation.navigate(ROUTES.AI_ASSISTANT)}
                >
                    <Icon name="creation" size={ms(24)} color={Colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.notificationButton}
                    onPress={() => navigation.navigate(ROUTES.NOTIFICATIONS)}
                >
                    <Icon name="bell-outline" size={ms(24)} color={Colors.textPrimary} />
                    {/* {unreadCount > 0 && (
                        <View style={styles.notificationBadge}>
                            <AppText size="xs" weight="bold" color={Colors.white}>
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </AppText>
                        </View>
                    )} */}
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.profileButton}
                    onPress={() => navigation.navigate('Profile')}
                >
                    <Icon name="account-circle" size={ms(24)} color={Colors.textPrimary} />
                </TouchableOpacity>
            </View>
        </View>
    )
}

export default CommonHeader

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: vs(16),
        paddingHorizontal: wp(4),
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
    },
    notificationButton: {
        width: ms(44),
        height: ms(44),
        borderRadius: BorderRadius.round,
        backgroundColor: Colors.white,
        justifyContent: 'center',
        alignItems: 'center',
        ...Shadow.sm,
        position: 'relative',
    },
    aiButton: {
        width: ms(44),
        height: ms(44),
        borderRadius: BorderRadius.round,
        backgroundColor: Colors.white,
        justifyContent: 'center',
        alignItems: 'center',
        ...Shadow.sm,
    },
    notificationBadge: {
        position: 'absolute',
        top: -2,
        right: -2,
        minWidth: ms(18),
        height: ms(18),
        borderRadius: ms(9),
        backgroundColor: Colors.error || '#ef4444',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 4,
    },
    profileButton: {
        width: ms(44),
        height: ms(44),
        borderRadius: BorderRadius.round,
        backgroundColor: Colors.white,
        justifyContent: 'center',
        alignItems: 'center',
        ...Shadow.sm,
    },
})