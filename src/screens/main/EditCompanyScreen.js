/**
 * Edit Company Screen
 * Screen for editing company details with modern UI
 */

import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors } from '../../constants/Colors';
import { Spacing, BorderRadius, Shadow } from '../../constants/Spacing';
import { ms, vs, wp } from '../../utils/Responsive';
import { AppText, AppInput, AppButton } from '../../components';
import { companiesAPI } from '../../api';
import { showError, showSuccess } from '../../utils';

// Section Header Component - defined outside to prevent re-renders
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

// Input Field with Icon - defined outside to prevent re-renders
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

const EditCompanyScreen = ({ navigation, route }) => {
    const { company } = route.params;

    console.log('EditCompanyScreen - company data:', company);

    // Animation ref
    const fadeAnim = useRef(new Animated.Value(0)).current;

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        ownerName: '',
        salesperson: '',
        city: '',
        state: '',
        country: '',
        website: '',
        industry: '',
        gstin: '',
        email: '',
        phone: '',
        address: '',
        pincode: '',
    });

    const [loading, setLoading] = useState(false);

    // Populate form when component mounts
    useEffect(() => {
        if (company) {
            setFormData({
                name: company.name || '',
                ownerName: company.ownerName || '',
                salesperson: company.salesperson || '',
                city: company.city || '',
                state: company.state || '',
                country: company.country || '',
                website: company.website || '',
                industry: company.industry || '',
                gstin: company.gstin || '',
                email: company.email || '',
                phone: company.phone || '',
                address: company.address || '',
                pincode: company.pincode || '',
            });
        }

        // Fade in animation
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
        }).start();
    }, []); // Only run once on mount

    // Handle input changes
    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    // Handle form submission
    const handleSubmit = async () => {
        if (!formData.name.trim()) {
            showError('Validation Error', 'Company name is required');
            return;
        }

        setLoading(true);
        try {
            const response = await companiesAPI.update(company._id, formData);

            if (response.success) {
                showSuccess('Success', 'Company updated successfully');
                navigation.goBack();
            } else {
                showError('Error', response.error || 'Failed to update company');
            }
        } catch (error) {
            console.error('Error updating company:', error);
            showError('Error', 'Failed to update company');
        } finally {
            setLoading(false);
        }
    };


    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Enhanced Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                    activeOpacity={0.7}
                >
                    <Icon name="arrow-left" size={ms(24)} color={Colors.black} />
                </TouchableOpacity>
                <View style={styles.headerCenter}>
                    {/* <View style={styles.headerIconContainer}>
                        <Icon name="office-building" size={ms(28)} color={Colors.black} />
                    </View> */}
                    <View>
                        {/* <AppText size="xs" color={Colors.black} style={styles.headerSubtitle}>
                            Editing
                        </AppText> */}
                        <AppText size="lg" weight="bold" numberOfLines={1} color={Colors.black}>
                            {company?.name || 'Company'}
                        </AppText>
                    </View>
                </View>
                <View style={styles.headerRight} />
            </View>

            {/* Form Content */}
            <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Basic Information Section */}
                    <View style={styles.section}>
                        <SectionHeader icon="information" title="Basic Information" />

                        <InputField
                            icon="office-building"
                            label="Company Name *"
                            placeholder="Enter company name"
                            value={formData.name}
                            onChangeText={(value) => handleInputChange('name', value)}
                            autoCapitalize="words"
                        />

                        <InputField
                            icon="account-tie"
                            label="Owner Name"
                            placeholder="Enter owner name"
                            value={formData.ownerName}
                            onChangeText={(value) => handleInputChange('ownerName', value)}
                            autoCapitalize="words"
                        />

                        <InputField
                            icon="account-star"
                            label="Salesperson"
                            placeholder="Enter salesperson name"
                            value={formData.salesperson}
                            onChangeText={(value) => handleInputChange('salesperson', value)}
                            autoCapitalize="words"
                        />

                        <InputField
                            icon="domain"
                            label="Industry"
                            placeholder="Enter industry"
                            value={formData.industry}
                            onChangeText={(value) => handleInputChange('industry', value)}
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
                        />

                        <InputField
                            icon="phone"
                            label="Phone Number"
                            placeholder="Enter phone number"
                            value={formData.phone}
                            onChangeText={(value) => handleInputChange('phone', value)}
                            keyboardType="phone-pad"
                        />

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
                            numberOfLines={3}
                            inputStyle={styles.textArea}
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

                    {/* Tax Information Section */}
                    <View style={styles.section}>
                        <SectionHeader icon="file-document" title="Tax Information" />

                        <InputField
                            icon="identifier"
                            label="GSTIN"
                            placeholder="Enter GSTIN"
                            value={formData.gstin}
                            onChangeText={(value) => handleInputChange('gstin', value)}
                            autoCapitalize="characters"
                        />
                    </View>

                    <View style={styles.bottomSpacer} />
                </ScrollView>

                {/* Floating Action Button */}
                <View style={styles.fabContainer}>
                    <AppButton
                        title="Update Company"
                        onPress={handleSubmit}
                        loading={loading}
                        disabled={loading || !formData.name.trim()}
                        icon="content-save"
                        fullWidth
                        style={styles.updateButton}
                    />
                </View>
            </Animated.View>
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
        // backgroundColor: Colors.white,
        // ...Shadow.lg,
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
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: wp(3),
        gap: Spacing.sm,
    },
    headerIconContainer: {
        width: ms(50),
        height: ms(50),
        borderRadius: BorderRadius.round,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerSubtitle: {
        opacity: 0.9,
        marginBottom: 2,
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
    textArea: {
        minHeight: vs(80),
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

export default EditCompanyScreen;
