/**
 * Contacts Screen
 * Screen for managing contacts
 */

import React, { useState } from 'react';
import {
    View,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors } from '../../constants/Colors';
import { Spacing, BorderRadius, Shadow } from '../../constants/Spacing';
import { ms, vs, wp } from '../../utils/Responsive';
import { AppText, AppButton } from '../../components';
import { useAuth } from '../../context';

const ContactsScreen = ({ navigation }) => {
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();

    const renderHeader = () => (
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
                <TouchableOpacity style={styles.notificationButton}>
                    <Icon name="bell-outline" size={ms(24)} color={Colors.textPrimary} />
                    <View style={styles.notificationBadge}>
                        <AppText size={8} weight="bold" color={Colors.white}>
                            3
                        </AppText>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.profileButton}
                    onPress={() => navigation.navigate('Profile')}
                >
                    <Icon name="account-circle" size={ms(24)} color={Colors.textPrimary} />
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderSectionHeader = () => (
        <View style={styles.sectionHeader}>
            <View>
                <AppText size="lg" weight="semiBold">
                    Contacts
                </AppText>
                <AppText size="xs" color={Colors.textMuted}>
                    {contacts.length} contacts
                </AppText>
            </View>
            <AppButton
                title="Add Contact"
                onPress={() => console.log('Add Contact')}
                fullWidth={false}
                size="small"
                icon="plus"
                style={styles.addButton}
            />
        </View>
    );

    const renderEmpty = () => (
        <View style={styles.emptyState}>
            <Icon name="account-multiple" size={ms(60)} color={Colors.textMuted} />
            <AppText size="lg" weight="semiBold" color={Colors.textSecondary} style={styles.emptyTitle}>
                No Contacts Found
            </AppText>
            <AppText size="sm" color={Colors.textMuted} style={styles.emptySubtitle}>
                Start by adding your first contact
            </AppText>
            <AppButton
                title="Add Contact"
                onPress={() => console.log('Add Contact')}
                icon="plus"
                style={styles.emptyButton}
            />
        </View>
    );

    if (loading) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <View style={styles.loadingHeaderContainer}>
                    {renderHeader()}
                </View>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                    <AppText size="base" color={Colors.textMuted} style={styles.loadingText}>
                        Loading contacts...
                    </AppText>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.headerContainer}>
                {renderHeader()}
            </View>
            <View style={styles.content}>
                {renderSectionHeader()}
                {renderEmpty()}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    headerContainer: {
        paddingHorizontal: wp(4),
    },
    loadingHeaderContainer: {
        paddingHorizontal: wp(4),
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: vs(16),
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
    notificationBadge: {
        position: 'absolute',
        top: ms(8),
        right: ms(8),
        width: ms(16),
        height: ms(16),
        borderRadius: ms(8),
        backgroundColor: Colors.error,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        flex: 1,
        paddingHorizontal: wp(4),
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: vs(16),
    },
    addButton: {
        paddingHorizontal: Spacing.md,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: Spacing.md,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: vs(60),
    },
    emptyTitle: {
        marginTop: vs(16),
    },
    emptySubtitle: {
        marginTop: vs(8),
        textAlign: 'center',
    },
    emptyButton: {
        marginTop: vs(24),
    },
});

export default ContactsScreen;
