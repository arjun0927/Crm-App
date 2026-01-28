/**
 * Profile Screen
 * User profile management and settings
 */

import React from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors } from '../../constants/Colors';
import { Spacing, BorderRadius, Shadow } from '../../constants/Spacing';
import { ms, vs } from '../../utils/Responsive';
import { getInitials } from '../../utils/Helpers';
import { useAuth, useLeads, useTasks } from '../../context';
import { ScreenWrapper, AppText, AppButton } from '../../components';

const MENU_ITEMS = [
    {
        id: 'account',
        title: 'Account Settings',
        items: [
            { id: 'edit_profile', icon: 'account-edit', label: 'Edit Profile', screen: 'EditProfile' },
            { id: 'change_password', icon: 'lock-reset', label: 'Change Password', screen: null },
            { id: 'notifications', icon: 'bell-outline', label: 'Notifications', screen: null },
        ],
    },
    {
        id: 'app',
        title: 'App Settings',
        items: [
            { id: 'appearance', icon: 'palette-outline', label: 'Appearance', screen: null },
            { id: 'language', icon: 'translate', label: 'Language', screen: null },
            { id: 'data_sync', icon: 'sync', label: 'Data Sync', screen: null },
        ],
    },
    {
        id: 'support',
        title: 'Support',
        items: [
            { id: 'help', icon: 'help-circle-outline', label: 'Help Center', screen: null },
            { id: 'feedback', icon: 'message-text-outline', label: 'Send Feedback', screen: null },
            { id: 'about', icon: 'information-outline', label: 'About', screen: null },
        ],
    },
];

const ProfileScreen = ({ navigation }) => {
    const { user, logout } = useAuth();
    const { getLeadsStats } = useLeads();
    const { getTasksStats } = useTasks();

    const leadsStats = getLeadsStats();
    const tasksStats = getTasksStats();

    const STATS = [
        { id: 'leads', label: 'Leads', value: leadsStats.total.toString(), icon: 'account-group' },
        { id: 'tasks', label: 'Tasks', value: tasksStats.total.toString(), icon: 'clipboard-check' },
        { id: 'deals', label: 'Deals', value: '18', icon: 'handshake' },
    ];

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: async () => {
                        await logout();
                        navigation.reset({
                            index: 0,
                            routes: [{ name: 'Login' }],
                        });
                    },
                },
            ]
        );
    };

    const handleMenuPress = (item) => {
        if (item.screen) {
            navigation.navigate(item.screen);
        } else {
            // Show coming soon for unimplemented features
            Alert.alert('Coming Soon', `${item.label} will be available in a future update.`);
        }
    };

    const renderHeader = () => (
        <View style={styles.header}>
            <View style={styles.profileSection}>
                <View style={styles.avatar}>
                    <AppText size="xxl" weight="bold" color={Colors.primary}>
                        {user ? getInitials(user.name) : 'U'}
                    </AppText>
                </View>
                <View style={styles.profileInfo}>
                    <AppText size="xl" weight="bold">
                        {user?.name || 'User'}
                    </AppText>
                    <AppText size="sm" color={Colors.textSecondary}>
                        {user?.email || 'user@example.com'}
                    </AppText>
                    <View style={styles.roleBadge}>
                        <AppText size="xs" weight="semiBold" color={Colors.primary}>
                            {user?.role || 'User'}
                        </AppText>
                    </View>
                </View>
                <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => navigation.navigate('EditProfile')}
                >
                    <Icon name="pencil" size={ms(18)} color={Colors.primary} />
                </TouchableOpacity>
            </View>

            {/* Stats */}
            <View style={styles.statsContainer}>
                {STATS.map((stat) => (
                    <View key={stat.id} style={styles.statItem}>
                        <Icon name={stat.icon} size={ms(24)} color={Colors.primary} />
                        <AppText size="lg" weight="bold" style={styles.statValue}>
                            {stat.value}
                        </AppText>
                        <AppText size="xs" color={Colors.textSecondary}>
                            {stat.label}
                        </AppText>
                    </View>
                ))}
            </View>
        </View>
    );

    const renderMenuSection = (section) => (
        <View key={section.id} style={styles.menuSection}>
            <AppText size="sm" weight="semiBold" color={Colors.textSecondary} style={styles.sectionTitle}>
                {section.title}
            </AppText>
            <View style={styles.menuCard}>
                {section.items.map((item, index) => (
                    <TouchableOpacity
                        key={item.id}
                        style={[
                            styles.menuItem,
                            index < section.items.length - 1 && styles.menuItemBorder,
                        ]}
                        onPress={() => handleMenuPress(item)}
                    >
                        <View style={styles.menuItemLeft}>
                            <View style={styles.menuIconContainer}>
                                <Icon name={item.icon} size={ms(20)} color={Colors.primary} />
                            </View>
                            <AppText size="base" weight="medium">
                                {item.label}
                            </AppText>
                        </View>
                        <Icon name="chevron-right" size={ms(20)} color={Colors.textMuted} />
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );

    return (
        <ScreenWrapper withScrollView withPadding bottomSafeArea={false}>
            {renderHeader()}

            {MENU_ITEMS.map(renderMenuSection)}

            {/* Logout Button */}
            <View style={styles.logoutContainer}>
                <AppButton
                    title="Logout"
                    onPress={handleLogout}
                    variant="outline"
                    icon="logout"
                    style={styles.logoutButton}
                />
            </View>

            {/* App Version */}
            <View style={styles.versionContainer}>
                <AppText size="xs" color={Colors.textMuted}>
                    CRM Pro v1.0.0
                </AppText>
            </View>

            <View style={styles.bottomSpacer} />
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    header: {
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.card,
        padding: Spacing.lg,
        marginBottom: vs(24),
        ...Shadow.md,
    },
    profileSection: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: ms(70),
        height: ms(70),
        borderRadius: BorderRadius.round,
        backgroundColor: Colors.primaryBackground,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.md,
    },
    profileInfo: {
        flex: 1,
    },
    roleBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: Spacing.sm,
        paddingVertical: 4,
        backgroundColor: Colors.primaryBackground,
        borderRadius: BorderRadius.badge,
        marginTop: Spacing.xs,
    },
    editButton: {
        width: ms(40),
        height: ms(40),
        borderRadius: BorderRadius.round,
        backgroundColor: Colors.primaryBackground,
        justifyContent: 'center',
        alignItems: 'center',
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: vs(20),
        paddingTop: vs(20),
        borderTopWidth: 1,
        borderTopColor: Colors.border,
    },
    statItem: {
        alignItems: 'center',
    },
    statValue: {
        marginTop: Spacing.xs,
        marginBottom: 2,
    },
    menuSection: {
        marginBottom: vs(24),
    },
    sectionTitle: {
        marginBottom: Spacing.sm,
        marginLeft: Spacing.xs,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    menuCard: {
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.card,
        ...Shadow.sm,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: Spacing.md,
    },
    menuItemBorder: {
        borderBottomWidth: 1,
        borderBottomColor: Colors.borderLight,
    },
    menuItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    menuIconContainer: {
        width: ms(36),
        height: ms(36),
        borderRadius: BorderRadius.sm,
        backgroundColor: Colors.primaryBackground,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.md,
    },
    logoutContainer: {
        marginTop: vs(8),
        marginBottom: vs(16),
    },
    logoutButton: {
        borderColor: Colors.error,
    },
    versionContainer: {
        alignItems: 'center',
        marginBottom: vs(16),
    },
    bottomSpacer: {
        height: vs(60),
    },
});

export default ProfileScreen;
