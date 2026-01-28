/**
 * Add Lead Screen
 * Form to create a new lead
 */

import React, { useState, useRef } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    Keyboard,
    Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors } from '../../constants/Colors';
import { Spacing, BorderRadius, Shadow } from '../../constants/Spacing';
import { ms, vs } from '../../utils/Responsive';
import { isValidEmail, isValidPhone } from '../../utils/Helpers';
import { useLeads } from '../../context';
import {
    ScreenWrapper,
    AppText,
    AppButton,
    AppInput,
    ModalLoader,
} from '../../components';

const LEAD_SOURCES = [
    { id: 'website', label: 'Website', icon: 'web' },
    { id: 'referral', label: 'Referral', icon: 'account-group' },
    { id: 'linkedin', label: 'LinkedIn', icon: 'linkedin' },
    { id: 'event', label: 'Event', icon: 'calendar' },
    { id: 'ads', label: 'Ads', icon: 'bullhorn' },
    { id: 'cold_call', label: 'Cold Call', icon: 'phone' },
];

const LEAD_STATUS = [
    { id: 'cold', label: 'Cold', color: Colors.leadCold },
    { id: 'warm', label: 'Warm', color: Colors.leadWarm },
    { id: 'hot', label: 'Hot', color: Colors.leadHot },
];

const AddLeadScreen = ({ navigation }) => {
    const { addLead } = useLeads();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        company: '',
        value: '',
        source: 'website',
        status: 'cold',
        notes: '',
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const emailRef = useRef(null);
    const phoneRef = useRef(null);
    const companyRef = useRef(null);
    const valueRef = useRef(null);
    const notesRef = useRef(null);

    const updateField = (field, value) => {
        setFormData({ ...formData, [field]: value });
        if (errors[field]) {
            setErrors({ ...errors, [field]: null });
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        }

        if (formData.email.trim() && !isValidEmail(formData.email)) {
            newErrors.email = 'Please enter a valid email';
        }

        if (formData.phone.trim() && !isValidPhone(formData.phone)) {
            newErrors.phone = 'Please enter a valid phone number';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        Keyboard.dismiss();

        if (!validateForm()) return;

        setLoading(true);

        const result = await addLead(formData);

        setLoading(false);

        if (result.success) {
            Alert.alert(
                'Success',
                'Lead created successfully!',
                [{ text: 'OK', onPress: () => navigation.goBack() }]
            );
        } else {
            Alert.alert('Error', result.error || 'Failed to create lead');
        }
    };

    const renderHeader = () => (
        <View style={styles.header}>
            <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
            >
                <Icon name="close" size={ms(24)} color={Colors.textPrimary} />
            </TouchableOpacity>
            <AppText size="lg" weight="semiBold">
                Add New Lead
            </AppText>
            <View style={styles.placeholder} />
        </View>
    );

    return (
        <ScreenWrapper
            withScrollView
            withPadding
            backgroundColor={Colors.background}
        >
            {renderHeader()}

            <View style={styles.formContainer}>
                {/* Basic Info */}
                <View style={styles.section}>
                    <AppText size="base" weight="semiBold" style={styles.sectionTitle}>
                        Basic Information
                    </AppText>

                    <AppInput
                        label="Full Name"
                        placeholder="Enter lead's full name"
                        value={formData.name}
                        onChangeText={(text) => updateField('name', text)}
                        leftIcon="account-outline"
                        error={!!errors.name}
                        errorMessage={errors.name}
                        returnKeyType="next"
                        onSubmitEditing={() => emailRef.current?.focus()}
                        required
                    />

                    <AppInput
                        ref={emailRef}
                        label="Email Address"
                        placeholder="Enter email address"
                        value={formData.email}
                        onChangeText={(text) => updateField('email', text)}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        leftIcon="email-outline"
                        error={!!errors.email}
                        errorMessage={errors.email}
                        returnKeyType="next"
                        onSubmitEditing={() => phoneRef.current?.focus()}
                    />

                    <AppInput
                        ref={phoneRef}
                        label="Phone Number"
                        placeholder="Enter phone number"
                        value={formData.phone}
                        onChangeText={(text) => updateField('phone', text)}
                        keyboardType="phone-pad"
                        leftIcon="phone-outline"
                        error={!!errors.phone}
                        errorMessage={errors.phone}
                        returnKeyType="next"
                        onSubmitEditing={() => companyRef.current?.focus()}
                    />

                    <AppInput
                        ref={companyRef}
                        label="Company"
                        placeholder="Enter company name"
                        value={formData.company}
                        onChangeText={(text) => updateField('company', text)}
                        leftIcon="domain"
                        returnKeyType="next"
                        onSubmitEditing={() => valueRef.current?.focus()}
                    />

                    <AppInput
                        ref={valueRef}
                        label="Estimated Value"
                        placeholder="Enter estimated deal value"
                        value={formData.value}
                        onChangeText={(text) => updateField('value', text.replace(/[^0-9.]/g, ''))}
                        keyboardType="numeric"
                        leftIcon="currency-usd"
                        returnKeyType="done"
                    />
                </View>

                {/* Lead Source */}
                <View style={styles.section}>
                    <AppText size="base" weight="semiBold" style={styles.sectionTitle}>
                        Lead Source
                    </AppText>
                    <View style={styles.optionsGrid}>
                        {LEAD_SOURCES.map((source) => (
                            <TouchableOpacity
                                key={source.id}
                                style={[
                                    styles.optionCard,
                                    formData.source === source.id && styles.optionCardActive,
                                ]}
                                onPress={() => updateField('source', source.id)}
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

                {/* Lead Status */}
                <View style={styles.section}>
                    <AppText size="base" weight="semiBold" style={styles.sectionTitle}>
                        Lead Status
                    </AppText>
                    <View style={styles.statusContainer}>
                        {LEAD_STATUS.map((status) => (
                            <TouchableOpacity
                                key={status.id}
                                style={[
                                    styles.statusButton,
                                    formData.status === status.id && { backgroundColor: status.color },
                                ]}
                                onPress={() => updateField('status', status.id)}
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

                {/* Notes */}
                <View style={styles.section}>
                    <AppText size="base" weight="semiBold" style={styles.sectionTitle}>
                        Notes
                    </AppText>
                    <AppInput
                        ref={notesRef}
                        placeholder="Add any additional notes..."
                        value={formData.notes}
                        onChangeText={(text) => updateField('notes', text)}
                        multiline
                        numberOfLines={4}
                    />
                </View>

                {/* Save Button */}
                <AppButton
                    title="Save Lead"
                    onPress={handleSave}
                    loading={loading}
                    icon="check"
                    style={styles.saveButton}
                />
            </View>

            <View style={styles.bottomSpacer} />
            <ModalLoader visible={loading} text="Creating lead..." />
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: vs(24),
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
    placeholder: {
        width: ms(44),
    },
    formContainer: {
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.card,
        padding: Spacing.lg,
        ...Shadow.sm,
    },
    section: {
        marginBottom: vs(24),
    },
    sectionTitle: {
        marginBottom: Spacing.md,
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
    saveButton: {
        marginTop: Spacing.md,
    },
    bottomSpacer: {
        height: vs(40),
    },
});

export default AddLeadScreen;
