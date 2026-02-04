/**
 * Dashboard Screen
 * Main overview screen with company list and pagination
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
    RefreshControl,
    LayoutAnimation,
    Platform,
    UIManager,
    TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors } from '../../constants/Colors';
import { Spacing, BorderRadius, Shadow } from '../../constants/Spacing';
import { ROUTES } from '../../constants';
import { ms, vs, wp } from '../../utils/Responsive';
import { formatDate } from '../../utils/Helpers';
import { useAuth } from '../../context';
import { AppText, AppButton } from '../../components';
import { companiesAPI } from '../../api';
import { showError } from '../../utils';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const LIMIT = 50;

// Company Card Component with expandable section
const CompanyCard = ({ company, onPress, onEdit, onDelete }) => {
    // ... existing CompanyCard code ...
    const [expanded, setExpanded] = useState(false);

    const toggleExpand = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpanded(!expanded);
    };

    // Helper to format location
    const formatLocation = () => {
        const parts = [company.city, company.state, company.country].filter(Boolean);
        return parts.length > 0 ? parts.join(', ') : 'N/A';
    };

    // Helper to get value or N/A
    const getValue = (value) => {
        if (value === undefined || value === null || value === '') {
            return 'N/A';
        }
        return value;
    };

    // Format date helper
    const formatDateValue = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });
        } catch {
            return 'N/A';
        }
    };

    // Key-Value Row Component
    const KeyValueRow = ({ label, value, valueColor, isLast }) => (
        <View style={[styles.keyValueRow, isLast && styles.keyValueRowLast]}>
            <AppText size="sm" color={Colors.textMuted} style={styles.keyText}>
                {label}
            </AppText>
            <AppText
                size="sm"
                weight="medium"
                color={valueColor || Colors.textPrimary}
                style={styles.valueText}
                numberOfLines={1}
            >
                {value}
            </AppText>
        </View>
    );

    return (
        <View style={styles.companyCard}>
            {/* Card Header */}
            <View style={styles.cardHeader}>
                <TouchableOpacity
                    style={styles.cardHeaderContent}
                    onPress={onPress}
                    activeOpacity={0.7}
                >
                    <View style={styles.iconContainer}>
                        <Icon name="office-building" size={ms(20)} color={Colors.primary} />
                    </View>
                    <View style={styles.companyTitleContainer}>
                        <AppText size="base" weight="bold" numberOfLines={1}>
                            {getValue(company.name)}
                        </AppText>
                    </View>
                </TouchableOpacity>

                {/* Edit & Delete Icons */}
                <View style={styles.headerActions}>
                    <TouchableOpacity
                        style={styles.actionIconButton}
                        onPress={() => onEdit?.(company)}
                        activeOpacity={0.7}
                    >
                        <Icon name="pencil" size={ms(18)} color={Colors.info} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.actionIconButton}
                        onPress={() => onDelete?.(company)}
                        activeOpacity={0.7}
                    >
                        <Icon name="delete" size={ms(18)} color={Colors.error} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Card Body - 4 Main Fields in Key-Value Layout */}
            <TouchableOpacity
                style={styles.cardBody}
                onPress={onPress}
                activeOpacity={0.8}
            >
                <KeyValueRow label="Owner" value={getValue(company.ownerName)} />
                <KeyValueRow label="Salesperson" value={getValue(company.salesperson)} />
                <KeyValueRow label="Location" value={formatLocation()} isLast />
            </TouchableOpacity>

            {/* Expandable Content */}
            {expanded && (
                <View style={styles.expandedContent}>
                    <KeyValueRow
                        label="Website"
                        value={getValue(company.website)}
                        valueColor={company.website ? Colors.info : Colors.textSecondary}
                    />
                    <KeyValueRow label="Industry" value={getValue(company.industry)} />
                    <KeyValueRow label="GSTIN" value={getValue(company.gstin)} />
                    <KeyValueRow
                        label="Created By"
                        value={company.createdBy?.name
                            ? `${company.createdBy.name}${company.createdBy.email ? ` (${company.createdBy.email})` : ''}`
                            : 'N/A'
                        }
                    />
                    <KeyValueRow label="Created At" value={formatDateValue(company.createdAt)} />
                    <KeyValueRow label="Updated At" value={formatDateValue(company.updatedAt)} isLast />
                </View>
            )}

            {/* Expandable Section Toggle */}
            <TouchableOpacity
                style={styles.expandToggle}
                onPress={toggleExpand}
                activeOpacity={0.7}
            >
                <AppText size="sm" weight="medium" color={Colors.primary}>
                    {expanded ? 'View Less' : 'View More'}
                </AppText>
                <Icon
                    name={expanded ? 'chevron-up' : 'chevron-down'}
                    size={ms(18)}
                    color={Colors.primary}
                />
            </TouchableOpacity>
        </View>
    );
};

const DashboardScreen = ({ navigation }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [companies, setCompanies] = useState([]);
    const { user } = useAuth();
    const searchTimeoutRef = useRef(null);
    const currentSearchRef = useRef('');
    const isInitialLoadRef = useRef(true);

    // Debounced search effect
    useEffect(() => {
        // Skip on initial mount - let the other useEffect handle it
        if (isInitialLoadRef.current) {
            return;
        }

        // Clear any existing timeout
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        // Store current search query
        currentSearchRef.current = searchQuery;

        // If search query is empty, fetch all companies immediately
        if (!searchQuery.trim()) {
            fetchCompanies(1, false, '');
            return;
        }

        // Debounce the search API call (500ms)
        searchTimeoutRef.current = setTimeout(() => {
            fetchCompanies(1, false, searchQuery.trim());
        }, 300);

        // Cleanup timeout on unmount or query change
        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, [searchQuery]);

    // Fetch companies on mount (initial load only)
    useEffect(() => {
        fetchCompanies(1, true, '');
        isInitialLoadRef.current = false;
    }, []);

    // Refresh companies when screen comes back into focus (after editing)
    useFocusEffect(
        useCallback(() => {
            // Only refresh if we're not already loading
            if (!loading) {
                fetchCompanies(1, true);
            }
        }, [])
    );

    const fetchCompanies = async (pageNum = 1, showLoader = false, search = '') => {
        try {
            // Only show loading spinner on initial load, not during search
            if (showLoader) {
                setLoading(true);
            } else if (pageNum > 1) {
                setLoadingMore(true);
            }

            // Build params with search
            const params = { page: pageNum, limit: LIMIT };
            if (search) {
                params.search = search;
            }

            const response = await companiesAPI.getAll(params);

            console.log('Companies API Response:', response, 'Search:', search);

            // Check if this response is still relevant (search query hasn't changed)
            if (search !== currentSearchRef.current && search !== '') {
                console.log('Search query changed, discarding stale response');
                return;
            }

            if (response.success) {
                const companiesData = response.data?.data || response.data?.companies || response.data || [];
                const newCompanies = Array.isArray(companiesData) ? companiesData : [];

                if (pageNum === 1) {
                    setCompanies(newCompanies);
                } else {
                    setCompanies(prev => [...prev, ...newCompanies]);
                }

                // Check if there are more pages
                setHasMore(newCompanies.length === LIMIT);
                setPage(pageNum);
            } else {
                console.error('Failed to fetch companies:', response.error);
                showError('Error', response.error || 'Failed to load companies');
            }
        } catch (error) {
            console.error('Error fetching companies:', error);
            showError('Error', 'Failed to load companies');
        } finally {
            setLoading(false);
            setLoadingMore(false);
            setRefreshing(false);
        }
    };

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        setHasMore(true);
        fetchCompanies(1, true, searchQuery.trim());
    }, [searchQuery]);

    const loadMore = useCallback(() => {
        if (!loadingMore && hasMore && !loading) {
            fetchCompanies(page + 1, false, searchQuery.trim());
        }
    }, [loadingMore, hasMore, loading, page, searchQuery]);

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

    // Search Bar Component
    const renderSearchBar = () => (
        <View style={styles.searchContainer}>
            <Icon name="magnify" size={ms(20)} color={Colors.textMuted} style={styles.searchIcon} />
            <TextInput
                style={styles.searchInput}
                placeholder="Search companies..."
                placeholderTextColor={Colors.textMuted}
                value={searchQuery}
                onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                    <Icon name="close-circle" size={ms(18)} color={Colors.textMuted} />
                </TouchableOpacity>
            )}
        </View>
    );

    const renderSectionHeader = () => (
        <View style={styles.sectionHeader}>
            <AppText size="lg" weight="semiBold">
                Companies
            </AppText>
            <AppButton
                title="Add Company"
                icon={'plus'}
                onPress={() => navigation.navigate('AddCompany')}
                size="small"
                fullWidth={false}
            />
        </View>
    );

    const nav = useNavigation();

    const handleEditCompany = (company) => {
        console.log('Navigating to EditCompany with:', company);
        console.log('Navigation object:', nav);
        nav.navigate('EditCompany', { company });
    };

    const handleDeleteCompany = (company) => {
        // TODO: Implement delete confirmation
        console.log('Delete company:', company._id);
    };

    const renderCompanyCard = ({ item: company }) => (
        <CompanyCard
            company={company}
            onPress={() => navigation.navigate('CompanDetails', { company })}
            onEdit={handleEditCompany}
            onDelete={handleDeleteCompany}
        />
    );

    const renderFooter = () => {
        if (!loadingMore) return null;

        return (
            <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color={Colors.primary} />
                <AppText size="sm" color={Colors.textMuted} style={styles.footerText}>
                    Loading more companies...
                </AppText>
            </View>
        );
    };

    const renderEmpty = () => {
        if (loading) return null;

        return (
            <View style={styles.emptyState}>
                <Icon name="office-building" size={ms(60)} color={Colors.textMuted} />
                <AppText size="lg" weight="semiBold" color={Colors.textSecondary} style={styles.emptyTitle}>
                    No Companies Found
                </AppText>
                <AppText size="sm" color={Colors.textMuted} style={styles.emptySubtitle}>
                    {searchQuery ? 'Try adjusting your search' : 'Start by adding your first company'}
                </AppText>
                <AppButton
                    title="Add Company"
                    onPress={() => navigation.navigate('AddCompany')}
                    icon="plus"
                    style={styles.emptyButton}
                />
            </View>
        );
    };

    const renderListHeader = () => (
        <View style={styles.listHeader}>
            {renderHeader()}
            {renderSearchBar()}
            {renderSectionHeader()}
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
                        Loading companies...
                    </AppText>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.headerContainer}>
                {renderListHeader()}
            </View>
            <FlatList
                data={companies}
                keyExtractor={(item) => item._id || item.id}
                renderItem={renderCompanyCard}
                // ListHeaderComponent={renderListHeader}
                ListFooterComponent={renderFooter}
                ListEmptyComponent={renderEmpty}
                onEndReached={loadMore}
                onEndReachedThreshold={0.5}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[Colors.primary]}
                        tintColor={Colors.primary}
                    />
                }
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
            />
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
    listContent: {
        paddingHorizontal: wp(4),
        paddingTop: vs(5),
        paddingBottom: vs(20),
    },
    listHeader: {
        marginBottom: vs(16),
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
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    sectionHeaderTitle: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
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

    // Company Card Styles
    companyCard: {
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.lg,
        marginBottom: vs(12),
        ...Shadow.md,
        overflow: 'hidden',
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.md,
        backgroundColor: Colors.background,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    cardHeaderContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    iconContainer: {
        marginRight: ms(10),
    },
    companyTitleContainer: {
        flex: 1,
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
    },
    actionIconButton: {
        width: ms(36),
        height: ms(36),
        borderRadius: BorderRadius.md,
        backgroundColor: Colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.border,
    },
    cardBody: {
        padding: Spacing.md,
    },

    // Key-Value Row Styles
    keyValueRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: vs(8),
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    keyValueRowLast: {
        borderBottomWidth: 0,
    },
    keyText: {
        flex: 0.4,
    },
    valueText: {
        flex: 0.6,
        textAlign: 'right',
    },

    // Expand Toggle Styles
    expandToggle: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: Spacing.sm,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
        backgroundColor: Colors.background,
        gap: Spacing.xs,
    },

    // Expanded Content Styles
    expandedContent: {
        paddingHorizontal: Spacing.md,
        paddingTop: Spacing.sm,
        backgroundColor: Colors.white,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
    },

    // Footer & Empty Styles
    footerLoader: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: vs(20),
    },
    footerText: {
        marginLeft: Spacing.sm,
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

    // Search Bar Styles
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.lg,
        paddingHorizontal: Spacing.md,
        height: vs(48),
        marginBottom: vs(16),
        ...Shadow.sm,
    },
    searchIcon: {
        marginRight: Spacing.sm,
    },
    searchInput: {
        flex: 1,
        fontSize: ms(14),
        color: Colors.textPrimary,
        height: '100%',
    },
});

export default DashboardScreen;
