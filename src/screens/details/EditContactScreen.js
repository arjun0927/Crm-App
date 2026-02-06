/**
 * Edit Contact Screen
 * Screen for editing contact details with modern UI
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
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors } from '../../constants/Colors';
import { Spacing, BorderRadius, Shadow } from '../../constants/Spacing';
import { ms, vs, wp } from '../../utils/Responsive';
import { AppText, AppInput, AppButton, ModalLoader } from '../../components';
import { contactsAPI } from '../../api';
import { showError, showSuccess } from '../../utils';

// Contact Source Options
const CONTACT_SOURCES = [
    { id: 'website', label: 'Website', icon: 'web' },
    { id: 'referral', label: 'Referral', icon: 'account-group' },
    { id: 'linkedin', label: 'LinkedIn', icon: 'linkedin' },
    { id: 'event', label: 'Event', icon: 'calendar' },
    { id: 'email', label: 'Email', icon: 'email' },
    { id: 'phone', label: 'Phone', icon: 'phone' },
];

// Contact Status Options
const CONTACT_STATUS = [
    { id: 'active', label: 'Active', color: Colors.success || '#10B981' },
    { id: 'inactive', label: 'Inactive', color: Colors.textMuted || '#9CA3AF' },
    { id: 'prospect', label: 'Prospect', color: Colors.info || '#3B82F6' },
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

const EditContactScreen = ({ navigation, route }) => {
    const { contact } = route.params;

    // Animation ref
    const fadeAnim = useRef(new Animated.Value(0)).current;

    // Form state
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        mobile: '',
        company: '',
        designation: '',
        website: '',
        address: '',
        city: '',
        state: '',
        country: '',
        pincode: '',
        source: 'website',
        status: 'active',
        notes: '',
    });

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    // Populate form when component mounts
    useEffect(() => {
        if (contact) {
            setFormData({
                firstName: contact.firstName || contact.first_name || '',
                lastName: contact.lastName || contact.last_name || '',
                email: contact.email || '',
                phone: contact.phone || '',
                mobile: contact.mobile || '',
                company: contact.company || contact.companyName || '',
                designation: contact.designation || contact.title || '',
                website: contact.website || '',
                address: contact.address || '',
                city: contact.city || '',
                state: contact.state || '',
                country: contact.country || '',
                pincode: contact.pincode || contact.zip || '',
                source: contact.source || 'website',
                status: contact.status || 'active',
                notes: contact.notes || '',
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

        if (!formData.firstName.trim() && !formData.lastName.trim() && !formData.email.trim()) {
            newErrors.firstName = 'At least first name, last name, or email is required';
        }

        // Email validation (if provided)
        if (formData.email.trim()) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.email)) {
                newErrors.email = 'Please enter a valid email address';
            }
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
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                phone: formData.phone,
                mobile: formData.mobile,
                company: formData.company,
                designation: formData.designation,
                website: formData.website,
                address: formData.address,
                city: formData.city,
                state: formData.state,
                country: formData.country,
                pincode: formData.pincode,
                source: formData.source,
                status: formData.status,
                notes: formData.notes,
            };

            const response = await contactsAPI.update(contact._id, updateData);

            if (response.success) {
                showSuccess('Success', 'Contact updated successfully');
                navigation.goBack();
            } else {
                showError('Error', response.error || 'Failed to update contact');
            }
        } catch (error) {
            console.error('Error updating contact:', error);
            showError('Error', 'Failed to update contact');
        } finally {
            setLoading(false);
        }
    };

    // Get display name for header
    const getDisplayName = () => {
        const fullName = `${formData.firstName} ${formData.lastName}`.trim();
        return fullName || contact?.email || 'Contact';
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
                    <Icon name="arrow-left" size={ms(24)} color={Colors.black} />
                </TouchableOpacity>
                <View style={styles.headerCenter}>
                    <AppText size="lg" weight="bold" numberOfLines={1} color={Colors.black}>
                        Edit Contact
                    </AppText>
                    <AppText size="xs" color={Colors.textMuted} numberOfLines={1}>
                        {getDisplayName()}
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
                        <SectionHeader icon="account" title="Basic Information" />

                        <View style={styles.row}>
                            <View style={styles.halfInput}>
                                <InputField
                                    icon="account"
                                    label="First Name"
                                    placeholder="Enter first name"
                                    value={formData.firstName}
                                    onChangeText={(value) => handleInputChange('firstName', value)}
                                    autoCapitalize="words"
                                    error={!!errors.firstName}
                                    errorMessage={errors.firstName}
                                />
                            </View>
                            <View style={styles.halfInput}>
                                <InputField
                                    icon="account"
                                    label="Last Name"
                                    placeholder="Enter last name"
                                    value={formData.lastName}
                                    onChangeText={(value) => handleInputChange('lastName', value)}
                                    autoCapitalize="words"
                                />
                            </View>
                        </View>

                        <InputField
                            icon="domain"
                            label="Company"
                            placeholder="Enter company name"
                            value={formData.company}
                            onChangeText={(value) => handleInputChange('company', value)}
                            autoCapitalize="words"
                        />

                        <InputField
                            icon="briefcase"
                            label="Designation"
                            placeholder="Enter job title / designation"
                            value={formData.designation}
                            onChangeText={(value) => handleInputChange('designation', value)}
                            autoCapitalize="words"
                        />
                    </View>

                    {/* Contact Information Section */}
                    <View style={styles.section}>
                        <SectionHeader icon="contacts" title="Contact Information" />

                        <InputField
                            icon="email"
                            label="Email Address"
                            placeholder="Enter email address"
                            value={formData.email}
                            onChangeText={(value) => handleInputChange('email', value)}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            error={!!errors.email}
                            errorMessage={errors.email}
                        />

                        <View style={styles.row}>
                            <View style={styles.halfInput}>
                                <InputField
                                    icon="phone"
                                    label="Phone"
                                    placeholder="Enter phone"
                                    value={formData.phone}
                                    onChangeText={(value) => handleInputChange('phone', value)}
                                    keyboardType="phone-pad"
                                />
                            </View>
                            <View style={styles.halfInput}>
                                <InputField
                                    icon="cellphone"
                                    label="Mobile"
                                    placeholder="Enter mobile"
                                    value={formData.mobile}
                                    onChangeText={(value) => handleInputChange('mobile', value)}
                                    keyboardType="phone-pad"
                                />
                            </View>
                        </View>

                        <InputField
                            icon="web"
                            label="Website"
                            placeholder="Enter website URL"
                            value={formData.website}
                            onChangeText={(value) => handleInputChange('website', value)}
                            keyboardType="url"
                            autoCapitalize="none"
                        />
                    </View>

                    {/* Address Section */}
                    <View style={styles.section}>
                        <SectionHeader icon="map-marker" title="Address Details" />

                        <InputField
                            icon="home"
                            label="Street Address"
                            placeholder="Enter street address"
                            value={formData.address}
                            onChangeText={(value) => handleInputChange('address', value)}
                            multiline
                            numberOfLines={2}
                        />

                        <View style={styles.row}>
                            <View style={styles.halfInput}>
                                <InputField
                                    icon="city"
                                    label="City"
                                    placeholder="Enter city"
                                    value={formData.city}
                                    onChangeText={(value) => handleInputChange('city', value)}
                                    autoCapitalize="words"
                                />
                            </View>
                            <View style={styles.halfInput}>
                                <InputField
                                    icon="map"
                                    label="State"
                                    placeholder="Enter state"
                                    value={formData.state}
                                    onChangeText={(value) => handleInputChange('state', value)}
                                    autoCapitalize="words"
                                />
                            </View>
                        </View>

                        <View style={styles.row}>
                            <View style={styles.halfInput}>
                                <InputField
                                    icon="earth"
                                    label="Country"
                                    placeholder="Enter country"
                                    value={formData.country}
                                    onChangeText={(value) => handleInputChange('country', value)}
                                    autoCapitalize="words"
                                />
                            </View>
                            <View style={styles.halfInput}>
                                <InputField
                                    icon="mailbox"
                                    label="Pincode"
                                    placeholder="Enter pincode"
                                    value={formData.pincode}
                                    onChangeText={(value) => handleInputChange('pincode', value)}
                                    keyboardType="number-pad"
                                />
                            </View>
                        </View>
                    </View>

                    {/* Contact Source Section */}
                    <View style={styles.section}>
                        <SectionHeader icon="source-branch" title="Contact Source" />
                        <View style={styles.optionsGrid}>
                            {CONTACT_SOURCES.map((source) => (
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

                    {/* Contact Status Section */}
                    <View style={styles.section}>
                        <SectionHeader icon="account-check" title="Contact Status" />
                        <View style={styles.statusContainer}>
                            {CONTACT_STATUS.map((status) => (
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
                        <SectionHeader icon="note-text" title="Notes" />
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
                        title="Update Contact"
                        onPress={handleSubmit}
                        loading={loading}
                        disabled={loading}
                        icon="content-save"
                        fullWidth
                        style={styles.updateButton}
                    />
                </View>
            </Animated.View>

            <ModalLoader visible={loading} text="Updating contact..." />
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
    row: {
        flexDirection: 'row',
        gap: Spacing.md,
    },
    halfInput: {
        flex: 1,
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

export default EditContactScreen;
