/**
 * Lead Details Screen
 * Detailed view of a single lead with actions — UI matched to Expo LeadDetailScreen
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Linking,
    Alert,
} from 'react-native';
import IonIcon from 'react-native-vector-icons/Ionicons';
import { Colors } from '../../constants/Colors';
import { Spacing, BorderRadius, Shadow } from '../../constants/Spacing';
import { ms, vs } from '../../utils/Responsive';
import { formatCurrency, formatDate, getInitials, formatPhoneNumber } from '../../utils/Helpers';
import { useLeads } from '../../context';
import { ScreenWrapper, AppText, AppButton } from '../../components';

const STATUS_CONFIG = {
    New: { color: '#3B82F6', bg: '#EFF6FF', icon: 'sparkles' },
    Contacted: { color: '#F59E0B', bg: '#FFFBEB', icon: 'chatbubble' },
    Qualified: { color: '#4D8733', bg: '#EEF5E6', icon: 'checkmark-circle' },
    Converted: { color: '#10B981', bg: '#ECFDF5', icon: 'trophy' },
    Lost: { color: '#EF4444', bg: '#FEF2F2', icon: 'close-circle' },
    hot: { color: '#EF4444', bg: '#FEF2F2', icon: 'flame' },
    warm: { color: '#F59E0B', bg: '#FFFBEB', icon: 'sunny' },
    cold: { color: '#3B82F6', bg: '#EFF6FF', icon: 'snow' },
    qualified: { color: '#4D8733', bg: '#EEF5E6', icon: 'checkmark-circle' },
};

function getAvatarColor(name) {
    const palette = ['#4D8733', '#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#EF4444'];
    let hash = 0;
    for (let i = 0; i < (name || '').length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return palette[Math.abs(hash) % palette.length];
}

function InfoRow({ label, value, icon }) {
    if (!value) return null;
    return (
        <View style={styles.infoRow}>
            <IonIcon name={icon} size={16} color={Colors.textTertiary} />
            <Text style={styles.infoLabel}>{label}</Text>
            <Text style={styles.infoValue} numberOfLines={1}>{value}</Text>
        </View>
    );
}

const LeadDetailsScreen = ({ route, navigation }) => {
    const { lead } = route.params || {};
    const { deleteLead, updateLead } = useLeads();

    if (!lead) {
        return (
            <ScreenWrapper withPadding>
                <View style={styles.errorContainer}>
                    <AppText color={Colors.error}>Lead not found</AppText>
                </View>
            </ScreenWrapper>
        );
    }

    const sc = STATUS_CONFIG[lead.status] || STATUS_CONFIG.New;
    const avatarColor = getAvatarColor(lead.name);

    const handleCall = () => {
        if (lead.phone) Linking.openURL(`tel:${lead.phone}`);
    };

    const handleEmail = () => {
        if (lead.email) Linking.openURL(`mailto:${lead.email}`);
    };

    const handleSMS = () => {
        if (lead.phone) Linking.openURL(`sms:${lead.phone}`);
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

    return (
        <ScreenWrapper withPadding backgroundColor={Colors.background}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header — Expo style */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <IonIcon name="arrow-back" size={ms(22)} color={Colors.textPrimary} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Lead Details</Text>
                    <TouchableOpacity
                        onPress={() => navigation.navigate('EditLead', { lead })}
                        style={styles.editBtn}
                    >
                        <IonIcon name="create-outline" size={ms(18)} color={Colors.primary} />
                    </TouchableOpacity>
                </View>

                {/* Profile card — matching Expo */}
                <View style={styles.profileCard}>
                    <View style={[styles.avatar, { backgroundColor: avatarColor + '18' }]}>
                        <Text style={[styles.avatarText, { color: avatarColor }]}>{getInitials(lead.name)}</Text>
                    </View>
                    <Text style={styles.leadName}>{lead.name}</Text>
                    {lead.company ? (
                        <Text style={styles.companyName}>{lead.company}</Text>
                    ) : null}
                    <View style={styles.badgeRow}>
                        <View style={[styles.statusBadge, { backgroundColor: sc.bg }]}>
                            <IonIcon name={sc.icon} size={13} color={sc.color} />
                            <Text style={[styles.badgeText, { color: sc.color }]}>
                                {lead.status?.charAt(0).toUpperCase() + lead.status?.slice(1)}
                            </Text>
                        </View>
                        {lead.source ? (
                            <View style={styles.sourceBadge}>
                                <Text style={styles.sourceBadgeText}>{lead.source}</Text>
                            </View>
                        ) : null}
                    </View>

                    {/* Quick actions — Expo style */}
                    <View style={styles.quickActions}>
                        {lead.phone ? (
                            <TouchableOpacity style={styles.actionBtn} onPress={handleCall}>
                                <IonIcon name="call" size={20} color={Colors.primary} />
                                <Text style={styles.actionLabel}>Call</Text>
                            </TouchableOpacity>
                        ) : null}
                        {lead.email ? (
                            <TouchableOpacity style={styles.actionBtn} onPress={handleEmail}>
                                <IonIcon name="mail" size={20} color="#3B82F6" />
                                <Text style={styles.actionLabel}>Email</Text>
                            </TouchableOpacity>
                        ) : null}
                        {lead.phone ? (
                            <TouchableOpacity style={styles.actionBtn} onPress={handleSMS}>
                                <IonIcon name="chatbubble" size={20} color="#8B5CF6" />
                                <Text style={styles.actionLabel}>SMS</Text>
                            </TouchableOpacity>
                        ) : null}
                    </View>
                </View>

                {/* Contact Information — Expo info rows */}
                <View style={styles.sectionCard}>
                    <Text style={styles.sectionTitle}>CONTACT INFORMATION</Text>
                    <InfoRow icon="mail-outline" label="Email" value={lead.email} />
                    <InfoRow icon="call-outline" label="Phone" value={lead.phone ? formatPhoneNumber(lead.phone) : undefined} />
                    <InfoRow icon="business-outline" label="Company" value={lead.company} />
                </View>

                {/* Deal Information — Expo info rows */}
                <View style={styles.sectionCard}>
                    <Text style={styles.sectionTitle}>DEAL INFORMATION</Text>
                    <InfoRow icon="wallet-outline" label="Value" value={lead.value || lead.estimatedValue ? formatCurrency(lead.value || lead.estimatedValue || 0) : undefined} />
                    <InfoRow icon="globe-outline" label="Source" value={lead.source} />
                    <InfoRow icon="person-circle-outline" label="Salesperson" value={lead.salesperson} />
                </View>

                {/* Notes */}
                {lead.notes ? (
                    <View style={styles.sectionCard}>
                        <Text style={styles.sectionTitle}>NOTES</Text>
                        <Text style={styles.notesText}>{lead.notes}</Text>
                    </View>
                ) : null}

                {/* Actions */}
                <View style={styles.actionsContainer}>
                    <AppButton
                        title="Edit Lead"
                        variant="primary"
                        icon="create-outline"
                        onPress={() => navigation.navigate('EditLead', { lead })}
                        style={styles.editButton}
                    />
                    <AppButton
                        title="Delete"
                        variant="outline"
                        icon="trash-outline"
                        onPress={handleDelete}
                        style={styles.deleteButton}
                        textStyle={{ color: Colors.error }}
                    />
                </View>

                <View style={styles.bottomSpacer} />
            </ScrollView>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    // Header — matching Expo
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: vs(16),
    },
    backBtn: {
        width: ms(40),
        height: ms(40),
        borderRadius: ms(14),
        backgroundColor: Colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
        ...Shadow.sm,
    },
    headerTitle: {
        fontSize: ms(18),
        fontWeight: '700',
        color: Colors.textPrimary,
    },
    editBtn: {
        width: ms(40),
        height: ms(40),
        borderRadius: ms(14),
        backgroundColor: Colors.primaryBackground,
        justifyContent: 'center',
        alignItems: 'center',
    },

    // Profile card — matching Expo
    profileCard: {
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.xl,
        padding: ms(20),
        alignItems: 'center',
        ...Shadow.sm,
    },
    avatar: {
        width: ms(72),
        height: ms(72),
        borderRadius: ms(36),
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    avatarText: {
        fontSize: ms(28),
        fontWeight: '800',
    },
    leadName: {
        fontSize: ms(22),
        fontWeight: '800',
        color: Colors.textPrimary,
        textAlign: 'center',
    },
    companyName: {
        fontSize: ms(14),
        color: Colors.textSecondary,
        marginTop: 4,
    },
    badgeRow: {
        flexDirection: 'row',
        gap: 8,
        marginTop: Spacing.md,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 10,
        gap: 4,
    },
    badgeText: {
        fontSize: ms(12),
        fontWeight: '600',
    },
    sourceBadge: {
        backgroundColor: Colors.background,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 10,
    },
    sourceBadgeText: {
        fontSize: ms(12),
        fontWeight: '600',
        color: Colors.textSecondary,
    },

    // Quick actions — matching Expo
    quickActions: {
        flexDirection: 'row',
        gap: Spacing.xl,
        marginTop: Spacing.lg,
        paddingTop: Spacing.lg,
        borderTopWidth: 1,
        borderTopColor: Colors.divider,
        width: '100%',
        justifyContent: 'center',
    },
    actionBtn: {
        alignItems: 'center',
        gap: 4,
    },
    actionLabel: {
        fontSize: ms(11),
        fontWeight: '600',
        color: Colors.textSecondary,
    },

    // Section Card — matching Expo
    sectionCard: {
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.xl,
        padding: ms(16),
        marginTop: Spacing.md,
        ...Shadow.sm,
    },
    sectionTitle: {
        fontSize: ms(14),
        fontWeight: '700',
        color: Colors.textPrimary,
        marginBottom: Spacing.md,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: ms(10),
        borderBottomWidth: 1,
        borderBottomColor: Colors.divider,
        gap: 8,
    },
    infoLabel: {
        fontSize: ms(13),
        color: Colors.textTertiary,
        width: ms(90),
    },
    infoValue: {
        flex: 1,
        fontSize: ms(14),
        fontWeight: '600',
        color: Colors.textPrimary,
        textAlign: 'right',
    },
    notesText: {
        fontSize: ms(14),
        color: Colors.textSecondary,
        lineHeight: ms(22),
    },

    // Actions
    actionsContainer: {
        flexDirection: 'row',
        gap: Spacing.md,
        marginTop: Spacing.lg,
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
