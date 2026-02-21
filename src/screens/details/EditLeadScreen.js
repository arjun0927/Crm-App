/**
 * Edit Lead Screen
 * Screen for editing lead details with modern UI
 */

import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Animated,
    Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { Colors } from '../../constants/Colors';
import { Spacing, BorderRadius, Shadow } from '../../constants/Spacing';
import { ms, vs, wp } from '../../utils/Responsive';
import { AppText, AppInput, AppButton, ModalLoader } from '../../components';
import { leadsAPI } from '../../api';
import { showError, showSuccess } from '../../utils';

// Lead Source Options
const LEAD_SOURCES = [
    { id: 'website', label: 'Website', icon: 'globe-outline' },
    { id: 'referral', label: 'Referral', icon: 'people-outline' },
    { id: 'linkedin', label: 'LinkedIn', icon: 'logo-linkedin' },
    { id: 'event', label: 'Event', icon: 'calendar-outline' },
    { id: 'ads', label: 'Ads', icon: 'megaphone-outline' },
    { id: 'cold_call', label: 'Cold Call', icon: 'call-outline' },
];

// Lead Status Options
const LEAD_STATUS = [
    { id: 'cold', label: 'Cold', color: Colors.leadCold || '#3B82F6' },
    { id: 'warm', label: 'Warm', color: Colors.leadWarm || '#F59E0B' },
    { id: 'hot', label: 'Hot', color: Colors.leadHot || '#EF4444' },
];

// Section Header Component
const SectionHeader = ({ icon, title }) => (
    <View style={styles.sectionHeader}>
        <View style={styles.sectionHeaderContent}>
            <Icon name={icon} size={ms(20)} color={Colors.primary} />
            <AppText size="base" weight="bold" color={Colors.textPrimary} style={styles.sectionTitle}>
                {title}
            </AppText>
        </View>
        <View style={styles.sectionDivider} />
    </View>
);

// Input Field with Icon
const InputField = ({ icon, label, ...props }) => (
    <View style={styles.inputFieldContainer}>
        <AppInput
            label={label}
            leftIcon={icon}
            {...props}
            containerStyle={{ marginBottom: 0 }}
        />
    </View>
);

const EditLeadScreen = ({ navigation, route }) => {
    const { lead } = route.params;

    // Animation ref
    const fadeAnim = useRef(new Animated.Value(0)).current;

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        name: '',
        email: '',
        phone: '',
        company: '',
        value: '',
        source: 'website',
        status: 'cold',
        notes: '',
        expectedCloseDate: '',
        followUpDate: '',
    });

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    // Populate form when component mounts
    useEffect(() => {
        if (lead) {
            setFormData({
                title: lead.title || '',
                name: lead.contact?.firstName
                    ? `${lead.contact.firstName} ${lead.contact.lastName || ''}`.trim()
                    : lead.name || '',
                email: lead.contact?.email || lead.email || '',
                phone: lead.contact?.phone || lead.phone || '',
                company: lead.company?.name || lead.company || '',
                value: lead.value?.toString() || '',
                source: lead.source?.id || lead.source || 'website',
                status: lead.status || 'cold',
                notes: lead.notes || '',
                expectedCloseDate: lead.expectedCloseDate || '',
                followUpDate: lead.followUpDate || '',
            });
        }

        // Fade in animation
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
        }).start();
    }, []);

    // Handle input changes
    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: null }));
        }
    };

    // Validate form
    const validateForm = () => {
        const newErrors = {};

        if (!formData.title.trim()) {
            newErrors.title = 'Lead title is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submission
    const handleSubmit = async () => {
        Keyboard.dismiss();

        if (!validateForm()) return;

        setLoading(true);
        try {
            // Prepare data for API
            const updateData = {
                title: formData.title,
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                company: formData.company,
                value: formData.value ? parseFloat(formData.value) : null,
                source: formData.source,
                status: formData.status,
                notes: formData.notes,
            };

            const response = await leadsAPI.update(lead._id, updateData);

            if (response.success) {
                showSuccess('Success', 'Lead updated successfully');
                navigation.goBack();
            } else {
                showError('Error', response.error || 'Failed to update lead');
            }
        } catch (error) {
            console.error('Error updating lead:', error);
            showError('Error', 'Failed to update lead');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                    activeOpacity={0.7}
                >
                    <Icon name="arrow-back" size={ms(24)} color={Colors.black} />
                </TouchableOpacity>
                <View style={styles.headerCenter}>
                    <AppText size="lg" weight="bold" numberOfLines={1} color={Colors.black}>
                        Edit Lead
                    </AppText>
                    <AppText size="xs" color={Colors.textMuted} numberOfLines={1}>
                        {lead?.title || 'Lead'}
                    </AppText>
                </View>
                <View style={styles.headerRight} />
            </View>

            {/* Form Content */}
            <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Basic Information Section */}
                    <View style={styles.section}>
                        <SectionHeader icon="information-circle-outline" title="Basic Information" />

                        <InputField
                            icon="text-outline"
                            label="Lead Title *"
                            placeholder="Enter lead title"
                            value={formData.title}
                            onChangeText={(value) => handleInputChange('title', value)}
                            error={!!errors.title}
                            errorMessage={errors.title}
                        />

                        <InputField
                            icon="person-outline"
                            label="Contact Name"
                            placeholder="Enter contact name"
                            value={formData.name}
                            onChangeText={(value) => handleInputChange('name', value)}
                            autoCapitalize="words"
                        />

                        <InputField
                            icon="business-outline"
                            label="Company"
                            placeholder="Enter company name"
                            value={formData.company}
                            onChangeText={(value) => handleInputChange('company', value)}
                            autoCapitalize="words"
                        />

                        <InputField
                            icon="cash-outline"
                            label="Estimated Value"
                            placeholder="Enter estimated deal value"
                            value={formData.value}
                            onChangeText={(value) => handleInputChange('value', value.replace(/[^0-9.]/g, ''))}
                            keyboardType="numeric"
                        />
                    </View>

                    {/* Contact Information Section */}
                    <View style={styles.section}>
                        <SectionHeader icon="people-circle-outline" title="Contact Information" />

                        <InputField
                            icon="mail-outline"
                            label="Email Address"
                            placeholder="Enter email address"
                            value={formData.email}
                            onChangeText={(value) => handleInputChange('email', value)}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />

                        <InputField
                            icon="call-outline"
                            label="Phone Number"
                            placeholder="Enter phone number"
                            value={formData.phone}
                            onChangeText={(value) => handleInputChange('phone', value)}
                            keyboardType="phone-pad"
                        />
                    </View>

                    {/* Lead Source Section */}
                    <View style={styles.section}>
                        <SectionHeader icon="git-branch-outline" title="Lead Source" />
                        <View style={styles.optionsGrid}>
                            {LEAD_SOURCES.map((source) => (
                                <TouchableOpacity
                                    key={source.id}
                                    style={[
                                        styles.optionCard,
                                        formData.source === source.id && styles.optionCardActive,
                                    ]}
                                    onPress={() => handleInputChange('source', source.id)}
                                    activeOpacity={0.7}
                                >
                                    <Icon
                                        name={source.icon}
                                        size={ms(24)}
                                        color={formData.source === source.id ? Colors.primary : Colors.textMuted}
                                    />
                                    <AppText
                                        size="xs"
                                        weight={formData.source === source.id ? 'semiBold' : 'regular'}
                                        color={formData.source === source.id ? Colors.primary : Colors.textSecondary}
                                        style={styles.optionLabel}
                                    >
                                        {source.label}
                                    </AppText>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Lead Status Section */}
                    <View style={styles.section}>
                        <SectionHeader icon="thermometer-outline" title="Lead Status" />
                        <View style={styles.statusContainer}>
                            {LEAD_STATUS.map((status) => (
                                <TouchableOpacity
                                    key={status.id}
                                    style={[
                                        styles.statusButton,
                                        formData.status === status.id && { backgroundColor: status.color },
                                    ]}
                                    onPress={() => handleInputChange('status', status.id)}
                                    activeOpacity={0.7}
                                >
                                    <AppText
                                        size="sm"
                                        weight="semiBold"
                                        color={formData.status === status.id ? Colors.white : status.color}
                                    >
                                        {status.label}
                                    </AppText>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Notes Section */}
                    <View style={styles.section}>
                        <SectionHeader icon="document-text-outline" title="Notes" />
                        <AppInput
                            placeholder="Add any additional notes..."
                            value={formData.notes}
                            onChangeText={(value) => handleInputChange('notes', value)}
                            multiline
                            numberOfLines={4}
                            inputStyle={styles.textArea}
                        />
                    </View>

                    <View style={styles.bottomSpacer} />
                </ScrollView>

                {/* Floating Action Button */}
                <View style={styles.fabContainer}>
                    <AppButton
                        title="Update Lead"
                        onPress={handleSubmit}
                        loading={loading}
                        disabled={loading || !formData.title.trim()}
                        icon="save-outline"
                        fullWidth
                        style={styles.updateButton}
                    />
                </View>
            </Animated.View>

            <ModalLoader visible={loading} text="Updating lead..." />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: wp(4),
        paddingVertical: vs(10),
    },
    backButton: {
        width: ms(44),
        height: ms(44),
        borderRadius: BorderRadius.round,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerCenter: {
        flex: 1,
        marginLeft: wp(3),
    },
    headerRight: {
        width: ms(44),
    },
    content: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingTop: vs(16),
        paddingBottom: vs(100),
    },
    section: {
        marginHorizontal: wp(4),
        marginBottom: vs(20),
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.xl,
        padding: Spacing.lg,
        ...Shadow.md,
    },
    sectionHeader: {
        marginBottom: vs(16),
    },
    sectionHeaderContent: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: vs(8),
    },
    sectionTitle: {
        marginLeft: ms(8),
    },
    sectionDivider: {
        height: 2,
        backgroundColor: Colors.primary + '20',
        borderRadius: 1,
    },
    inputFieldContainer: {
        marginBottom: vs(16),
    },
    optionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.sm,
    },
    optionCard: {
        width: '31%',
        paddingVertical: vs(14),
        alignItems: 'center',
        borderRadius: BorderRadius.md,
        borderWidth: 1.5,
        borderColor: Colors.border,
        backgroundColor: Colors.background,
    },
    optionCardActive: {
        borderColor: Colors.primary,
        backgroundColor: Colors.primaryBackground,
    },
    optionLabel: {
        marginTop: Spacing.xs,
    },
    statusContainer: {
        flexDirection: 'row',
        gap: Spacing.sm,
    },
    statusButton: {
        flex: 1,
        paddingVertical: vs(12),
        alignItems: 'center',
        borderRadius: BorderRadius.button,
        borderWidth: 1.5,
        borderColor: Colors.border,
        backgroundColor: Colors.background,
    },
    textArea: {
        minHeight: vs(100),
        textAlignVertical: 'top',
    },
    fabContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: wp(4),
        paddingVertical: vs(16),
        backgroundColor: Colors.white,
        borderTopLeftRadius: BorderRadius.xl,
        borderTopRightRadius: BorderRadius.xl,
        ...Shadow.xl,
    },
    updateButton: {
        borderRadius: BorderRadius.xl,
        paddingVertical: vs(16),
    },
    bottomSpacer: {
        height: vs(20),
    },
});

export default EditLeadScreen;
