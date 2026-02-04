/**
 * Pipeline Screen
 * Display leads grouped by pipeline stages with tab-based navigation
 */

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
    View,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    ScrollView,
    Dimensions,
    TextInput,
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

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const LIMIT = 1000;

// Pipeline stages configuration
const PIPELINE_STAGES = [
    { id: 'all', name: 'All', color: Colors.primary },
    { id: 'New', name: 'New', probability: 20, color: '#ef4444' },
    { id: 'Contacted', name: 'Contacted', probability: 30, color: '#cca58a' },
    { id: 'Proposal Sent', name: 'Proposal', probability: 50, color: '#f59e0b' },
    { id: 'Negotiation', name: 'Negotiation', probability: 80, color: '#3b82f6' },
    { id: 'Final Review', name: 'Final Review', probability: 85, color: '#8b5cf6' },
    { id: 'Closed Won', name: 'Won', probability: 100, color: '#10b981' },
];

// Deal Card Component for Pipeline View (matching website UI)
const DealCard = ({ deal, onPress }) => {
    const getCompanyName = () => {
        if (!deal.company) return 'N/A';
        return deal.company.name || 'N/A';
    };

    const getSalespersonName = () => {
        if (!deal.salesperson) return 'N/A';
        return deal.salesperson.name || 'N/A';
    };

    const formatValue = () => {
        if (!deal.value) return '₹0';
        return `₹${deal.value.toLocaleString('en-IN')}`;
    };

    const getStageColor = () => deal.stage?.color || Colors.textMuted;

    return (
        <TouchableOpacity
            style={styles.dealCard}
            onPress={onPress}
            activeOpacity={0.7}
        >
            {/* Stage Color Indicator */}
            <View style={[styles.stageIndicator, { backgroundColor: getStageColor() }]} />

            <View style={styles.dealContent}>
                {/* Title */}
                <AppText size="sm" weight="semiBold" numberOfLines={2} style={styles.dealTitle}>
                    {deal.title || 'Untitled Deal'}
                </AppText>

                {/* Company */}
                <View style={styles.dealRow}>
                    <Icon name="office-building" size={ms(14)} color={Colors.textMuted} />
                    <AppText size="xs" color={Colors.textSecondary} style={styles.dealRowText} numberOfLines={1}>
                        {getCompanyName()}
                    </AppText>
                </View>

                {/* Value */}
                <View style={styles.dealRow}>
                    <Icon name="currency-inr" size={ms(14)} color={Colors.success} />
                    <AppText size="sm" weight="semiBold" color={Colors.success} style={styles.dealRowText}>
                        {formatValue()}
                    </AppText>
                </View>

                {/* Salesperson */}
                <View style={styles.dealRow}>
                    <Icon name="account" size={ms(14)} color={Colors.textMuted} />
                    <AppText size="xs" color={Colors.textMuted} style={styles.dealRowText} numberOfLines={1}>
                        {getSalespersonName()}
                    </AppText>
                </View>
            </View>
        </TouchableOpacity>
    );
};

// Stage Tab Component
const StageTab = ({ stage, isActive, count, onPress }) => (
    <TouchableOpacity
        style={[
            styles.stageTab,
            { backgroundColor: stage.color },
            isActive && styles.stageTabActive
        ]}
        onPress={onPress}
        activeOpacity={0.8}
    >
        <View style={styles.stageTabContent}>
            <AppText
                size="sm"
                weight={isActive ? 'bold' : 'medium'}
                color={Colors.white}
            >
                {stage.name}
            </AppText>
            <View style={[
                styles.countBadge,

            ]}>
                <AppText size="xs" weight="bold" color={Colors.white} style={styles.countText}>
                    {count}
                </AppText>
            </View>
        </View>
    </TouchableOpacity>
);

const PipelineScreen = ({ navigation }) => {
    const nav = useNavigation();
    const { user } = useAuth();
    const searchTimeoutRef = useRef(null);
    const currentSearchRef = useRef('');
    const isInitialLoadRef = useRef(true);

    // State
    const [searchQuery, setSearchQuery] = useState('');
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeStage, setActiveStage] = useState('all');

    // Group leads by stage
    const groupedLeads = useMemo(() => {
        const groups = { all: leads };

        // Initialize all stages with empty arrays
        PIPELINE_STAGES.forEach(stage => {
            if (stage.id !== 'all') {
                groups[stage.id] = [];
            }
        });

        // Group leads by their stage name
        leads.forEach(lead => {
            const stageName = lead.stage?.name;
            if (stageName && groups[stageName] !== undefined) {
                groups[stageName].push(lead);
            } else if (stageName) {
                // Handle stages that might have slightly different names
                const matchingStage = PIPELINE_STAGES.find(
                    s => s.id.toLowerCase() === stageName.toLowerCase() ||
                        s.name.toLowerCase() === stageName.toLowerCase()
                );
                if (matchingStage && matchingStage.id !== 'all') {
                    groups[matchingStage.id].push(lead);
                }
            }
        });

        return groups;
    }, [leads]);

    // Get counts for each stage
    const stageCounts = useMemo(() => {
        const counts = {};
        PIPELINE_STAGES.forEach(stage => {
            counts[stage.id] = groupedLeads[stage.id]?.length || 0;
        });
        return counts;
    }, [groupedLeads]);

    // Get current stage leads
    const currentStageLeads = useMemo(() => {
        return groupedLeads[activeStage] || [];
    }, [groupedLeads, activeStage]);

    // Get current stage info
    const currentStage = useMemo(() => {
        return PIPELINE_STAGES.find(s => s.id === activeStage) || PIPELINE_STAGES[0];
    }, [activeStage]);

    // Calculate stats for current stage
    const stageStats = useMemo(() => {
        const totalValue = currentStageLeads.reduce((sum, lead) => sum + (lead.value || 0), 0);
        const stage = PIPELINE_STAGES.find(s => s.id === activeStage);
        const weightedValue = stage?.probability
            ? Math.round(totalValue * (stage.probability / 100))
            : totalValue;
        return { totalValue, weightedValue, count: currentStageLeads.length };
    }, [currentStageLeads, activeStage]);

    // Format amount
    const formatAmount = (amount) => {
        if (amount >= 10000000) {
            return `₹${(amount / 10000000).toFixed(2)} Cr`;
        } else if (amount >= 100000) {
            return `₹${(amount / 100000).toFixed(2)} L`;
        } else if (amount >= 1000) {
            return `₹${(amount / 1000).toFixed(1)} K`;
        }
        return `₹${amount.toLocaleString('en-IN')}`;
    };

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
            fetchLeads(false, '');
            return;
        }

        // Debounce the search API call (300ms)
        searchTimeoutRef.current = setTimeout(() => {
            fetchLeads(false, searchQuery.trim());
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
        fetchLeads(true, '');
        isInitialLoadRef.current = false;
    }, []);

    // Fetch leads from API
    const fetchLeads = async (showLoader = false, search = '') => {
        try {
            // Only show loading spinner on initial load, not during search
            if (showLoader) {
                setLoading(true);
            }

            // Build params with search
            const params = { page: 1, limit: LIMIT };
            if (search) {
                params.search = search;
            }

            const response = await leadsAPI.getAll(params);

            console.log('Pipeline API Response:', response, 'Search:', search);

            // Check if this response is still relevant (search query hasn't changed)
            if (search !== currentSearchRef.current && search !== '') {
                console.log('Search query changed, discarding stale response');
                return;
            }

            if (response.success) {
                const leadsData = response.data?.data || response.data?.leads || response.data || [];
                const newLeads = Array.isArray(leadsData) ? leadsData : [];
                setLeads(newLeads);
            } else {
                console.error('Failed to fetch leads:', response.error);
                showError('Error', response.error || 'Failed to load pipeline');
            }
        } catch (error) {
            console.error('Error fetching leads:', error);
            showError('Error', 'Failed to load pipeline');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // Pull-to-refresh handler
    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchLeads(false, searchQuery.trim());
    }, [searchQuery]);

    // Navigation handlers
    const handleDealPress = (deal) => {
        navigation.navigate('LeadDetails', { lead: deal });
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
                placeholder="Search deals..."
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

    // Render section header with stats
    const renderSectionHeader = () => (
        <View style={styles.sectionHeader}>
            <View>
                <AppText size="lg" weight="semiBold">
                    Sales Pipeline
                </AppText>
                <AppText size="xs" color={Colors.textMuted}>
                    {leads.length} total deals • {formatAmount(leads.reduce((sum, l) => sum + (l.value || 0), 0))} value
                </AppText>
            </View>
            <AppButton
                title="Add Deal"
                onPress={() => navigation.navigate('AddLead')}
                fullWidth={false}
                size="small"
                icon="plus"
            />
        </View>
    );

    // Render stage tabs
    const renderStageTabs = () => (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.tabsContainer}
            contentContainerStyle={styles.tabsContent}
        >
            {PIPELINE_STAGES.map(stage => (
                <StageTab
                    key={stage.id}
                    stage={stage}
                    isActive={activeStage === stage.id}
                    count={stageCounts[stage.id]}
                    onPress={() => setActiveStage(stage.id)}
                />
            ))}
        </ScrollView>
    );

    // Render stage summary card
    const renderStageSummary = () => (
        <View style={[styles.stageSummary, { borderLeftColor: currentStage.color }]}>
            <View style={styles.stageSummaryHeader}>
                <AppText size="base" weight="bold" color={currentStage.color}>
                    {currentStage.name}
                </AppText>
                {currentStage.probability && (
                    <AppText size="xs" color={Colors.textMuted}>
                        ({currentStage.probability}% probability)
                    </AppText>
                )}
            </View>
            <View style={styles.stageSummaryStats}>
                <View style={styles.statItem}>
                    <AppText size="lg" weight="bold" color={Colors.textPrimary}>
                        {stageStats.count}
                    </AppText>
                    <AppText size="xs" color={Colors.textMuted}>Deals</AppText>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                    <AppText size="lg" weight="bold" color={Colors.success}>
                        {formatAmount(stageStats.totalValue)}
                    </AppText>
                    <AppText size="xs" color={Colors.textMuted}>Total Value</AppText>
                </View>
                {currentStage.probability && currentStage.id !== 'all' && (
                    <>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <AppText size="lg" weight="bold" color={Colors.info}>
                                {formatAmount(stageStats.weightedValue)}
                            </AppText>
                            <AppText size="xs" color={Colors.textMuted}>Weighted</AppText>
                        </View>
                    </>
                )}
            </View>
        </View>
    );

    // Render deal card
    const renderDealCard = ({ item }) => (
        <DealCard
            deal={item}
            onPress={() => handleDealPress(item)}
        />
    );

    // Render empty state
    const renderEmpty = () => (
        <View style={styles.emptyState}>
            <Icon name="chart-line" size={ms(50)} color={Colors.textMuted} />
            <AppText size="base" weight="semiBold" color={Colors.textSecondary} style={styles.emptyTitle}>
                No deals in {currentStage.name}
            </AppText>
            <AppText size="sm" color={Colors.textMuted} style={styles.emptySubtitle}>
                Deals in this stage will appear here
            </AppText>
        </View>
    );

    // Loading state
    if (loading) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <View style={styles.headerContainer}>
                    {renderHeader()}
                </View>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                    <AppText size="base" color={Colors.textMuted} style={styles.loadingText}>
                        Loading pipeline...
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

            {/* Stage Tabs */}
            {renderStageTabs()}

            {/* Stage Summary */}
            <View style={styles.summaryContainer}>
                {renderStageSummary()}
            </View>

            {/* Deals List */}
            <FlatList
                data={currentStageLeads}
                keyExtractor={(item) => item._id || item.id}
                renderItem={renderDealCard}
                ListEmptyComponent={renderEmpty}
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
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.lg,
        paddingHorizontal: Spacing.md,
        paddingVertical: vs(10),
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
        paddingVertical: 0,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: vs(12),
    },

    // Tabs Styles
    tabsContainer: {
        marginVertical: vs(12),
    },
    tabsContent: {
        paddingHorizontal: wp(4),
        gap: Spacing.sm,
    },
    stageTab: {
        paddingHorizontal: Spacing.md,
        paddingVertical: vs(10),
        borderRadius: BorderRadius.lg,
        justifyContent: 'center',
        alignItems: 'center',
        ...Shadow.sm,
    },
    stageTabActive: {
        transform: [{ scale: 1.02 }],
        ...Shadow.md,
    },
    stageTabContent: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: Spacing.sm,
    },
    countBadge: {
        minWidth: ms(26),
        height: ms(26),
        borderRadius: ms(13),
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: Spacing.xs,
    },
    countText: {
        textAlign: 'center',
    },

    // Summary Styles
    summaryContainer: {
        paddingHorizontal: wp(4),
        paddingVertical: vs(12),
    },
    stageSummary: {
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
        borderLeftWidth: 4,
        ...Shadow.sm,
    },
    stageSummaryHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        marginBottom: vs(12),
    },
    stageSummaryStats: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statDivider: {
        width: 1,
        height: vs(30),
        backgroundColor: Colors.border,
    },

    // List Styles
    listContent: {
        paddingHorizontal: wp(4),
        paddingBottom: vs(100),
    },

    // Deal Card Styles
    dealCard: {
        width: '100%',
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.lg,
        marginBottom: Spacing.md,
        overflow: 'hidden',
        flexDirection: 'row',
        ...Shadow.sm,
    },
    stageIndicator: {
        width: 4,
        height: '100%',
    },
    dealContent: {
        flex: 1,
        padding: Spacing.md,
    },
    dealTitle: {
        marginBottom: vs(8),
    },
    dealRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: vs(6),
    },
    dealRowText: {
        marginLeft: Spacing.sm,
        flex: 1,
    },

    // Empty & Loading States
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: Spacing.md,
    },
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: vs(60),
        width: SCREEN_WIDTH - wp(8),
    },
    emptyTitle: {
        marginTop: vs(16),
    },
    emptySubtitle: {
        marginTop: vs(8),
        textAlign: 'center',
    },
});

export default PipelineScreen;
