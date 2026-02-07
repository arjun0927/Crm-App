/**
 * Leads Screen
 * Display and manage leads in a list view with pagination (similar to Company screen)
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    TextInput,
    ActivityIndicator,
    RefreshControl,
    LayoutAnimation,
    Platform,
    UIManager,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors } from '../../constants/Colors';
import { Spacing, BorderRadius, Shadow } from '../../constants/Spacing';
import { ms, vs, wp } from '../../utils/Responsive';
import { AppText, AppButton } from '../../components';
import { leadsAPI } from '../../api';
import { showError } from '../../utils';
import { useAuth } from '../../context';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const LIMIT = 50;

// Lead Card Component with expandable section (similar to Company card)
const LeadCard = ({ lead, onPress, onEdit, onDelete }) => {
    const [expanded, setExpanded] = useState(false);

    const toggleExpand = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpanded(!expanded);
    };

    // Helper to get contact name
    const getContactName = () => {
        if (!lead.contact) return 'N/A';
        const firstName = lead.contact.firstName || '';
        const lastName = lead.contact.lastName || '';
        const fullName = `${firstName} ${lastName}`.trim();
        return fullName || lead.contact.name || 'N/A';
    };

    // Helper to get company name
    const getCompanyName = () => {
        if (!lead.company) return 'N/A';
        return lead.company.name || 'N/A';
    };

    // Helper to get stage info
    const getStageColor = () => lead.stage?.color || Colors.textMuted;
    const getStageName = () => lead.stage?.name || 'New';

    // Helper to get value or N/A
    const getValue = (value) => {
        if (value === undefined || value === null || value === '') {
            return 'N/A';
        }
        if (typeof value === 'object') {
            return value.name || 'N/A';
        }
        return value;
    };

    // Format currency value
    const formatLeadValue = () => {
        if (!lead.value) return 'N/A';
        const currency = lead.currency || 'INR';
        const symbol = currency === 'INR' ? '₹' : '$';
        return `${symbol}${lead.value.toLocaleString('en-IN')}`;
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
        <View style={styles.leadCard}>
            {/* Card Header */}
            <View style={styles.cardHeader}>
                <TouchableOpacity
                    style={styles.cardHeaderContent}
                    onPress={onPress}
                    activeOpacity={0.7}
                >
                    <View style={styles.iconContainer}>
                        <Icon name="account-tie" size={ms(20)} color={Colors.primary} />
                    </View>
                    <View style={styles.leadTitleContainer}>
                        <AppText size="base" weight="bold" numberOfLines={1}>
                            {getValue(lead.title) || 'Untitled Lead'}
                        </AppText>
                        {/* <View style={[styles.statusBadge, { backgroundColor: getStageColor() + '20' }]}>
                            <AppText size="xs" weight="semiBold" color={getStageColor()}>
                                {getStageName()}
                            </AppText>
                        </View> */}
                    </View>
                </TouchableOpacity>

                {/* Edit & Delete Icons */}
                <View style={styles.headerActions}>
                    <TouchableOpacity
                        style={styles.actionIconButton}
                        onPress={() => onEdit?.(lead)}
                        activeOpacity={0.7}
                    >
                        <Icon name="pencil" size={ms(18)} color={Colors.info} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.actionIconButton}
                        onPress={() => onDelete?.(lead)}
                        activeOpacity={0.7}
                    >
                        <Icon name="delete" size={ms(18)} color={Colors.error} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Card Body - Main Fields in Key-Value Layout */}
            <TouchableOpacity
                style={styles.cardBody}
                onPress={onPress}
                activeOpacity={0.8}
            >
                <KeyValueRow label="Contact" value={getContactName()} />
                <KeyValueRow label="Company" value={getCompanyName()} />
                <KeyValueRow label="Value" value={formatLeadValue()} valueColor={Colors.success} />
                <KeyValueRow label="Salesperson" value={getValue(lead.salesperson?.name)} isLast />
            </TouchableOpacity>

            {/* Expandable Content */}
            {expanded && (
                <View style={styles.expandedContent}>
                    <KeyValueRow label="Source" value={getValue(lead.source?.name)} />
                    <KeyValueRow label="Product" value={getValue(lead.product?.name)} />
                    <KeyValueRow label="Expected Close" value={formatDateValue(lead.expectedCloseDate)} />
                    <KeyValueRow label="Follow-up Date" value={formatDateValue(lead.followUpDate)} />
                    <KeyValueRow
                        label="Created By"
                        value={lead.createdBy?.name || 'N/A'}
                    />
                    <KeyValueRow label="Created At" value={formatDateValue(lead.createdAt)} />
                    <KeyValueRow label="Updated At" value={formatDateValue(lead.updatedAt)} isLast />
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

const LeadsScreen = ({ navigation }) => {
    const nav = useNavigation();
    const { user } = useAuth();
    const searchTimeoutRef = useRef(null);
    const currentSearchRef = useRef('');
    const isInitialLoadRef = useRef(true);

    // State
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [leads, setLeads] = useState([]);

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

        // If search query is empty, fetch all leads immediately
        if (!searchQuery.trim()) {
            fetchLeads(1, false, '');
            return;
        }

        // Debounce the search API call (300ms)
        searchTimeoutRef.current = setTimeout(() => {
            fetchLeads(1, false, searchQuery.trim());
        }, 300);

        // Cleanup timeout on unmount or query change
        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, [searchQuery]);

    // Fetch leads on mount (initial load only)
    useEffect(() => {
        fetchLeads(1, true, '');
        isInitialLoadRef.current = false;
    }, []);

    const fetchLeads = async (pageNum = 1, showLoader = false, search = '') => {
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

            const response = await leadsAPI.getAll(params);

            console.log('Leads API Response:', response, 'Search:', search);

            // Check if this response is still relevant (search query hasn't changed)
            if (search !== currentSearchRef.current && search !== '') {
                console.log('Search query changed, discarding stale response');
                return;
            }

            if (response.success) {
                const leadsData = response.data?.data || response.data?.leads || response.data || [];
                const newLeads = Array.isArray(leadsData) ? leadsData : [];

                if (pageNum === 1) {
                    setLeads(newLeads);
                } else {
                    setLeads(prev => [...prev, ...newLeads]);
                }

                // Check if there are more pages
                setHasMore(newLeads.length === LIMIT);
                setPage(pageNum);
            } else {
                console.error('Failed to fetch leads:', response.error);
                showError('Error', response.error || 'Failed to load leads');
            }
        } catch (error) {
            console.error('Error fetching leads:', error);
            showError('Error', 'Failed to load leads');
        } finally {
            setLoading(false);
            setLoadingMore(false);
            setRefreshing(false);
        }
    };

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        setHasMore(true);
        fetchLeads(1, false, searchQuery.trim());
    }, [searchQuery]);

    const loadMore = useCallback(() => {
        if (!loadingMore && hasMore && !loading) {
            fetchLeads(page + 1, false, searchQuery.trim());
        }
    }, [loadingMore, hasMore, loading, page, searchQuery]);

    const handleEditLead = (lead) => {
        nav.navigate('EditLead', { lead });
    };

    const handleDeleteLead = (lead) => {
        // TODO: Implement delete confirmation
        console.log('Delete lead:', lead._id);
    };

    const handleLeadPress = (lead) => {
        navigation.navigate('LeadDetails', { lead });
    };

    // Render header
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

    // Search Bar
    const renderSearchBar = () => (
        <View style={styles.searchContainer}>
            <Icon name="magnify" size={ms(20)} color={Colors.textMuted} style={styles.searchIcon} />
            <TextInput
                style={styles.searchInput}
                placeholder="Search leads..."
                placeholderTextColor={Colors.textMuted}
                value={searchQuery}
                onChangeText={setSearchQuery}
            />
            {searchQuery && searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                    <Icon name="close-circle" size={ms(18)} color={Colors.textMuted} />
                </TouchableOpacity>
            )}
        </View>
    );

    // Section Header
    const renderSectionHeader = () => (
        <View style={styles.sectionHeader}>
            <AppText size="lg" weight="semiBold">
                Leads
            </AppText>
            <AppButton
                title="Add Lead"
                icon={'plus'}
                onPress={() => navigation.navigate('AddLead')}
                size="small"
                fullWidth={false}
            />
        </View>
    );

    // Render Lead Card
    const renderLeadCard = ({ item }) => (
        <LeadCard
            lead={item}
            onPress={() => handleLeadPress(item)}
            onEdit={handleEditLead}
            onDelete={handleDeleteLead}
        />
    );

    // Footer loader
    const renderFooter = () => {
        if (!loadingMore) return null;
        return (
            <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color={Colors.primary} />
                <AppText size="sm" color={Colors.textMuted} style={styles.footerText}>
                    Loading more leads...
                </AppText>
            </View>
        );
    };

    // Empty State
    const renderEmptyState = () => {
        if (loading) return null;

        return (
            <View style={styles.emptyState}>
                <Icon name="account-search-outline" size={ms(60)} color={Colors.textMuted} />
                <AppText size="lg" weight="semiBold" color={Colors.textSecondary} style={styles.emptyTitle}>
                    No Leads Found
                </AppText>
                <AppText size="sm" color={Colors.textMuted} style={styles.emptySubtitle}>
                    {searchQuery
                        ? 'Try adjusting your search'
                        : 'Start adding leads to see them here'}
                </AppText>
                {!searchQuery && (
                    <AppButton
                        title="Add First Lead"
                        icon="plus"
                        onPress={() => navigation.navigate('AddLead')}
                        style={styles.emptyButton}
                    />
                )}
            </View>
        );
    };

    // Loading State
    if (loading) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <View style={styles.headerContainer}>
                    {renderHeader()}
                </View>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                    <AppText size="base" color={Colors.textMuted} style={styles.loadingText}>
                        Loading leads...
                    </AppText>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.headerContainer}>
                {renderHeader()}
                {renderSearchBar()}
                {renderSectionHeader()}
            </View>
            <FlatList
                data={leads}
                keyExtractor={(item) => item._id || item.id}
                renderItem={renderLeadCard}
                ListEmptyComponent={renderEmptyState}
                ListFooterComponent={renderFooter}
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
        paddingBottom: vs(100),
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: Spacing.md,
    },

    // Header Styles
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

    // Search Bar Styles
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.lg,
        paddingHorizontal: Spacing.md,
        height: vs(48),
        marginBottom: vs(12),
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

    // Section Header
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: vs(12),
    },

    // Lead Card Styles
    leadCard: {
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.card,
        marginBottom: Spacing.md,
        ...Shadow.sm,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    cardHeaderContent: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: ms(40),
        height: ms(40),
        borderRadius: BorderRadius.round,
        backgroundColor: Colors.primaryBackground,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.sm,
    },
    leadTitleContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
    },
    statusBadge: {
        paddingHorizontal: Spacing.sm,
        paddingVertical: 2,
        borderRadius: BorderRadius.badge,
    },
    actionIconButton: {
        padding: Spacing.xs,
        marginLeft: Spacing.xs,
    },
    cardBody: {
        padding: Spacing.md,
    },
    keyValueRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: vs(6),
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    keyValueRowLast: {
        borderBottomWidth: 0,
    },
    keyText: {
        flex: 1,
    },
    valueText: {
        flex: 2,
        textAlign: 'right',
    },
    expandedContent: {
        paddingHorizontal: Spacing.md,
        paddingBottom: Spacing.sm,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
        backgroundColor: Colors.background,
    },
    expandToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: vs(10),
        borderTopWidth: 1,
        borderTopColor: Colors.border,
        gap: Spacing.xs,
    },

    // Footer
    footerLoader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: vs(16),
        gap: Spacing.sm,
    },
    footerText: {
        marginLeft: Spacing.sm,
    },

    // Empty State
    emptyState: {
        alignItems: 'center',
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

export default LeadsScreen;
