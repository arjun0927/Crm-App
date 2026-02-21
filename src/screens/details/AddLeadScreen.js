/**
 * Add Lead Screen
 * Form to create a new lead — UI matched to Expo AddLeadScreen
 */

import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Keyboard,
    Alert,
} from 'react-native';
import IonIcon from 'react-native-vector-icons/Ionicons';
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
    { id: 'Website', icon: 'globe-outline', color: '#3B82F6' },
    { id: 'Referral', icon: 'people-outline', color: '#10B981' },
    { id: 'LinkedIn', icon: 'logo-linkedin', color: '#0A66C2' },
    { id: 'Event', icon: 'calendar-outline', color: '#8B5CF6' },
    { id: 'Ads', icon: 'megaphone-outline', color: '#F59E0B' },
    { id: 'Cold Call', icon: 'call-outline', color: '#EF4444' },
];

const LEAD_STATUSES = [
    { id: 'New', color: '#3B82F6', icon: 'star' },
    { id: 'Contacted', color: '#F59E0B', icon: 'chatbubble' },
    { id: 'Qualified', color: '#4D8733', icon: 'checkmark-circle' },
    { id: 'Converted', color: '#10B981', icon: 'trophy' },
    { id: 'Lost', color: '#EF4444', icon: 'close-circle' },
];

const AddLeadScreen = ({ navigation }) => {
    const { addLead } = useLeads();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        company: '',
        value: '',
        source: 'Website',
        status: 'New',
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
        if (!formData.name.trim()) newErrors.name = 'Name is required';
        if (formData.email.trim() && !isValidEmail(formData.email)) newErrors.email = 'Please enter a valid email';
        if (formData.phone.trim() && !isValidPhone(formData.phone)) newErrors.phone = 'Please enter a valid phone number';
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
            Alert.alert('Success', 'Lead created successfully!', [{ text: 'OK', onPress: () => navigation.goBack() }]);
        } else {
            Alert.alert('Error', result.error || 'Failed to create lead');
        }
    };

    const renderHeader = () => (
        <View style={styles.header}>
            <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
                <IonIcon name="arrow-back" size={22} color={Colors.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>New Lead</Text>
            <TouchableOpacity
                onPress={handleSave}
                disabled={loading || !formData.name.trim()}
                style={[styles.saveBtn, (!formData.name.trim() || loading) && { opacity: 0.4 }]}
                activeOpacity={0.85}
            >
                <View style={styles.saveBtnInner}>
                    <IonIcon name="checkmark" size={18} color="#fff" />
                    <Text style={styles.saveBtnText}>{loading ? 'Saving' : 'Save'}</Text>
                </View>
            </TouchableOpacity>
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
                {/* Contact Details */}
                <Text style={styles.sectionLabel}>CONTACT DETAILS</Text>
                <View style={styles.sectionCard}>
                    <AppInput
                        label="Full Name"
                        placeholder="e.g. Priya Mehta"
                        value={formData.name}
                        onChangeText={(text) => updateField('name', text)}
                        leftIcon="person-outline"
                        error={!!errors.name}
                        errorMessage={errors.name}
                        returnKeyType="next"
                        onSubmitEditing={() => emailRef.current?.focus()}
                        required
                    />

                    <AppInput
                        ref={emailRef}
                        label="Email Address"
                        placeholder="e.g. priya@company.com"
                        value={formData.email}
                        onChangeText={(text) => updateField('email', text)}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        leftIcon="mail-outline"
                        error={!!errors.email}
                        errorMessage={errors.email}
                        returnKeyType="next"
                        onSubmitEditing={() => phoneRef.current?.focus()}
                    />

                    <AppInput
                        ref={phoneRef}
                        label="Phone Number"
                        placeholder="e.g. +91 98765 43210"
                        value={formData.phone}
                        onChangeText={(text) => updateField('phone', text)}
                        keyboardType="phone-pad"
                        leftIcon="call-outline"
                        error={!!errors.phone}
                        errorMessage={errors.phone}
                        returnKeyType="next"
                        onSubmitEditing={() => companyRef.current?.focus()}
                    />
                </View>

                {/* Business Details */}
                <Text style={styles.sectionLabel}>BUSINESS DETAILS</Text>
                <View style={styles.sectionCard}>
                    <AppInput
                        ref={companyRef}
                        label="Company"
                        placeholder="e.g. CloudNova Solutions"
                        value={formData.company}
                        onChangeText={(text) => updateField('company', text)}
                        leftIcon="business-outline"
                        returnKeyType="next"
                        onSubmitEditing={() => valueRef.current?.focus()}
                    />

                    <AppInput
                        ref={valueRef}
                        label="Deal Value (INR)"
                        placeholder="e.g. 500000"
                        value={formData.value}
                        onChangeText={(text) => updateField('value', text.replace(/[^0-9.]/g, ''))}
                        keyboardType="numeric"
                        leftIcon="cash-outline"
                        returnKeyType="done"
                    />
                </View>

                {/* Lead Source — Expo chip grid style */}
                <Text style={styles.sectionLabel}>LEAD SOURCE</Text>
                <View style={styles.sourceGrid}>
                    {LEAD_SOURCES.map((src) => {
                        const active = formData.source === src.id;
                        return (
                            <TouchableOpacity
                                key={src.id}
                                style={[
                                    styles.sourceChip,
                                    active && { backgroundColor: src.color + '12', borderColor: src.color },
                                ]}
                                onPress={() => updateField('source', src.id)}
                                activeOpacity={0.7}
                            >
                                <IonIcon
                                    name={src.icon}
                                    size={15}
                                    color={active ? src.color : Colors.textTertiary}
                                />
                                <Text style={[styles.sourceLabel, { color: active ? src.color : Colors.textSecondary }]}>
                                    {src.id}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {/* Lead Status — Expo pill row */}
                <Text style={styles.sectionLabel}>STATUS</Text>
                <View style={styles.statusRow}>
                    {LEAD_STATUSES.map((s) => {
                        const active = formData.status === s.id;
                        return (
                            <TouchableOpacity
                                key={s.id}
                                style={[
                                    styles.statusPill,
                                    active && { backgroundColor: s.color, borderColor: s.color },
                                ]}
                                onPress={() => updateField('status', s.id)}
                                activeOpacity={0.8}
                            >
                                <IonIcon name={s.icon} size={14} color={active ? '#fff' : s.color} />
                                <Text style={[styles.statusText, { color: active ? '#fff' : Colors.textSecondary }]}>
                                    {s.id}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {/* Notes */}
                <Text style={styles.sectionLabel}>NOTES</Text>
                <View style={styles.sectionCard}>
                    <AppInput
                        ref={notesRef}
                        placeholder="Any additional details..."
                        value={formData.notes}
                        onChangeText={(text) => updateField('notes', text)}
                        multiline
                        numberOfLines={4}
                    />
                </View>
            </View>

            <View style={styles.bottomSpacer} />
            <ModalLoader visible={loading} text="Creating lead..." />
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    // Header — matching Expo AddLeadScreen
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: vs(16),
    },
    backButton: {
        width: ms(40),
        height: ms(40),
        borderRadius: ms(20),
        backgroundColor: Colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
        ...Shadow.sm,
    },
    headerTitle: {
        fontSize: ms(20),
        fontWeight: '700',
        color: Colors.textPrimary,
    },
    saveBtn: {},
    saveBtnInner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.primary,
        paddingHorizontal: ms(16),
        paddingVertical: ms(10),
        borderRadius: ms(12),
        gap: 6,
    },
    saveBtnText: {
        fontSize: ms(14),
        fontWeight: '700',
        color: '#fff',
    },

    formContainer: {
        flex: 1,
    },

    // Section labels — matching Expo uppercase style
    sectionLabel: {
        fontSize: ms(11),
        fontWeight: '700',
        color: Colors.textTertiary,
        letterSpacing: 0.8,
        marginTop: Spacing.xl,
        marginBottom: Spacing.sm,
        paddingLeft: 2,
    },
    sectionCard: {
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.lg,
        overflow: 'hidden',
        padding: Spacing.md,
        ...Shadow.sm,
    },

    // Source grid — matching Expo
    sourceGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    sourceChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: ms(14),
        paddingVertical: ms(10),
        borderRadius: BorderRadius.md,
        backgroundColor: Colors.surface,
        borderWidth: 1.5,
        borderColor: Colors.surfaceBorder,
        gap: 5,
    },
    sourceLabel: {
        fontSize: ms(13),
        fontWeight: '600',
    },

    // Status row — matching Expo
    statusRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    statusPill: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: ms(12),
        paddingVertical: ms(8),
        borderRadius: BorderRadius.md,
        backgroundColor: Colors.surface,
        borderWidth: 1.5,
        borderColor: Colors.surfaceBorder,
        gap: 5,
    },
    statusText: {
        fontSize: ms(13),
        fontWeight: '600',
    },

    bottomSpacer: {
        height: vs(40),
    },
});

export default AddLeadScreen;
