/**
 * Lead Details Screen
 * Detailed view of a single lead with actions
 */

import React, { useState } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Linking,
    Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors } from '../../constants/Colors';
import { Spacing, BorderRadius, Shadow } from '../../constants/Spacing';
import { ms, vs } from '../../utils/Responsive';
import { formatCurrency, formatDate, getInitials, formatPhoneNumber } from '../../utils/Helpers';
import { useLeads } from '../../context';
import { ScreenWrapper, AppText, AppButton } from '../../components';

const LeadDetailsScreen = ({ route, navigation }) => {
    const { lead } = route.params || {};
    const { deleteLead, updateLead } = useLeads();
    const [isFavorite, setIsFavorite] = useState(false);

    if (!lead) {
        return (
            <ScreenWrapper withPadding>
                <View style={styles.errorContainer}>
                    <AppText color={Colors.error}>Lead not found</AppText>
                </View>
            </ScreenWrapper>
        );
    }

    const getStatusColor = (status) => {
        const colors = {
            hot: Colors.leadHot,
            warm: Colors.leadWarm,
            cold: Colors.leadCold,
            qualified: Colors.success,
        };
        return colors[status] || Colors.textMuted;
    };

    const handleCall = () => {
        if (lead.phone) {
            Linking.openURL(`tel:${lead.phone}`);
        }
    };

    const handleEmail = () => {
        if (lead.email) {
            Linking.openURL(`mailto:${lead.email}`);
        }
    };

    const handleWhatsApp = () => {
        if (lead.phone) {
            const phone = lead.phone.replace(/\D/g, '');
            Linking.openURL(`whatsapp://send?phone=${phone}`);
        }
    };

    const handleDelete = () => {
        Alert.alert(
            'Delete Lead',
            'Are you sure you want to delete this lead? This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        const result = await deleteLead(lead.id);
                        if (result.success) {
                            navigation.goBack();
                        } else {
                            Alert.alert('Error', 'Failed to delete lead');
                        }
                    },
                },
            ]
        );
    };

    const renderHeader = () => (
        <View style={styles.header}>
            <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
            >
                <Icon name="arrow-left" size={ms(24)} color={Colors.textPrimary} />
            </TouchableOpacity>
            <View style={styles.headerActions}>
                <TouchableOpacity
                    style={styles.headerButton}
                    onPress={() => setIsFavorite(!isFavorite)}
                >
                    <Icon
                        name={isFavorite ? 'heart' : 'heart-outline'}
                        size={ms(22)}
                        color={isFavorite ? Colors.error : Colors.textPrimary}
                    />
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.headerButton}
                    onPress={() => { }}
                >
                    <Icon name="dots-vertical" size={ms(22)} color={Colors.textPrimary} />
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderProfile = () => (
        <View style={styles.profileCard}>
            <View style={styles.avatarContainer}>
                <View style={styles.avatar}>
                    <AppText size="xxl" weight="bold" color={Colors.primary}>
                        {getInitials(lead.name)}
                    </AppText>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(lead.status) }]}>
                    <AppText size="xs" weight="bold" color={Colors.white}>
                        {lead.status?.toUpperCase()}
                    </AppText>
                </View>
            </View>

            <AppText size="xl" weight="bold" style={styles.name}>
                {lead.name}
            </AppText>
            <AppText size="base" color={Colors.textSecondary}>
                {lead.company}
            </AppText>

            <View style={styles.valueContainer}>
                <AppText size="xxl" weight="bold" color={Colors.success}>
                    {formatCurrency(lead.value || 0)}
                </AppText>
                <AppText size="sm" color={Colors.textMuted}>
                    Estimated Value
                </AppText>
            </View>

            {/* Quick Actions */}
            <View style={styles.quickActions}>
                <TouchableOpacity style={styles.actionButton} onPress={handleCall}>
                    <View style={[styles.actionIcon, { backgroundColor: Colors.successLight }]}>
                        <Icon name="phone" size={ms(20)} color={Colors.success} />
                    </View>
                    <AppText size="xs" color={Colors.textSecondary}>
                        Call
                    </AppText>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionButton} onPress={handleEmail}>
                    <View style={[styles.actionIcon, { backgroundColor: Colors.infoLight }]}>
                        <Icon name="email" size={ms(20)} color={Colors.info} />
                    </View>
                    <AppText size="xs" color={Colors.textSecondary}>
                        Email
                    </AppText>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionButton} onPress={handleWhatsApp}>
                    <View style={[styles.actionIcon, { backgroundColor: '#DCF8C6' }]}>
                        <Icon name="whatsapp" size={ms(20)} color="#25D366" />
                    </View>
                    <AppText size="xs" color={Colors.textSecondary}>
                        WhatsApp
                    </AppText>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionButton} onPress={() => { }}>
                    <View style={[styles.actionIcon, { backgroundColor: Colors.primaryBackground }]}>
                        <Icon name="calendar-plus" size={ms(20)} color={Colors.primary} />
                    </View>
                    <AppText size="xs" color={Colors.textSecondary}>
                        Schedule
                    </AppText>
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderInfoSection = () => (
        <View style={styles.section}>
            <AppText size="lg" weight="semiBold" style={styles.sectionTitle}>
                Contact Information
            </AppText>
            <View style={styles.infoCard}>
                <View style={styles.infoRow}>
                    <Icon name="email-outline" size={ms(20)} color={Colors.textMuted} />
                    <View style={styles.infoContent}>
                        <AppText size="xs" color={Colors.textMuted}>
                            Email
                        </AppText>
                        <AppText size="base" weight="medium">
                            {lead.email || 'Not provided'}
                        </AppText>
                    </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.infoRow}>
                    <Icon name="phone-outline" size={ms(20)} color={Colors.textMuted} />
                    <View style={styles.infoContent}>
                        <AppText size="xs" color={Colors.textMuted}>
                            Phone
                        </AppText>
                        <AppText size="base" weight="medium">
                            {lead.phone ? formatPhoneNumber(lead.phone) : 'Not provided'}
                        </AppText>
                    </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.infoRow}>
                    <Icon name="domain" size={ms(20)} color={Colors.textMuted} />
                    <View style={styles.infoContent}>
                        <AppText size="xs" color={Colors.textMuted}>
                            Company
                        </AppText>
                        <AppText size="base" weight="medium">
                            {lead.company || 'Not provided'}
                        </AppText>
                    </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.infoRow}>
                    <Icon name="tag-outline" size={ms(20)} color={Colors.textMuted} />
                    <View style={styles.infoContent}>
                        <AppText size="xs" color={Colors.textMuted}>
                            Source
                        </AppText>
                        <AppText size="base" weight="medium">
                            {lead.source || 'Unknown'}
                        </AppText>
                    </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.infoRow}>
                    <Icon name="calendar-outline" size={ms(20)} color={Colors.textMuted} />
                    <View style={styles.infoContent}>
                        <AppText size="xs" color={Colors.textMuted}>
                            Created
                        </AppText>
                        <AppText size="base" weight="medium">
                            {lead.createdAt ? formatDate(lead.createdAt, 'long') : 'Unknown'}
                        </AppText>
                    </View>
                </View>
            </View>
        </View>
    );

    const renderActions = () => (
        <View style={styles.actionsContainer}>
            <AppButton
                title="Edit Lead"
                variant="primary"
                icon="pencil"
                onPress={() => { }}
                style={styles.editButton}
            />
            <AppButton
                title="Delete"
                variant="outline"
                icon="delete"
                onPress={handleDelete}
                style={styles.deleteButton}
                textStyle={{ color: Colors.error }}
            />
        </View>
    );

    return (
        <ScreenWrapper withPadding backgroundColor={Colors.background}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {renderHeader()}
                {renderProfile()}
                {renderInfoSection()}
                {renderActions()}
                <View style={styles.bottomSpacer} />
            </ScrollView>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: vs(16),
    },
    backButton: {
        width: ms(44),
        height: ms(44),
        borderRadius: BorderRadius.round,
        backgroundColor: Colors.white,
        justifyContent: 'center',
        alignItems: 'center',
        ...Shadow.sm,
    },
    headerActions: {
        flexDirection: 'row',
        gap: Spacing.sm,
    },
    headerButton: {
        width: ms(44),
        height: ms(44),
        borderRadius: BorderRadius.round,
        backgroundColor: Colors.white,
        justifyContent: 'center',
        alignItems: 'center',
        ...Shadow.sm,
    },
    profileCard: {
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.card,
        padding: Spacing.lg,
        alignItems: 'center',
        marginBottom: vs(24),
        ...Shadow.md,
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: Spacing.md,
    },
    avatar: {
        width: ms(90),
        height: ms(90),
        borderRadius: BorderRadius.round,
        backgroundColor: Colors.primaryBackground,
        justifyContent: 'center',
        alignItems: 'center',
    },
    statusBadge: {
        position: 'absolute',
        bottom: 0,
        right: -5,
        paddingHorizontal: Spacing.sm,
        paddingVertical: 4,
        borderRadius: BorderRadius.round,
        borderWidth: 2,
        borderColor: Colors.white,
    },
    name: {
        marginBottom: 4,
    },
    valueContainer: {
        alignItems: 'center',
        marginTop: vs(16),
        paddingTop: vs(16),
        borderTopWidth: 1,
        borderTopColor: Colors.border,
        width: '100%',
    },
    quickActions: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        marginTop: vs(20),
        paddingTop: vs(20),
        borderTopWidth: 1,
        borderTopColor: Colors.border,
    },
    actionButton: {
        alignItems: 'center',
    },
    actionIcon: {
        width: ms(48),
        height: ms(48),
        borderRadius: BorderRadius.round,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.xs,
    },
    section: {
        marginBottom: vs(24),
    },
    sectionTitle: {
        marginBottom: Spacing.md,
    },
    infoCard: {
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.card,
        padding: Spacing.md,
        ...Shadow.sm,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: Spacing.sm,
    },
    infoContent: {
        marginLeft: Spacing.md,
        flex: 1,
    },
    divider: {
        height: 1,
        backgroundColor: Colors.borderLight,
    },
    actionsContainer: {
        flexDirection: 'row',
        gap: Spacing.md,
    },
    editButton: {
        flex: 2,
    },
    deleteButton: {
        flex: 1,
        borderColor: Colors.error,
    },
    bottomSpacer: {
        height: vs(40),
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default LeadDetailsScreen;
