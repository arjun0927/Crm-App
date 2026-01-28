/**
 * Leads Screen
 * Display and manage leads list
 */

import React, { useState, useMemo } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors } from '../../constants/Colors';
import { Spacing, BorderRadius, Shadow } from '../../constants/Spacing';
import { ms, vs, wp } from '../../utils/Responsive';
import { formatCurrency, getInitials } from '../../utils/Helpers';
import { useLeads } from '../../context';
import { ScreenWrapper, AppText } from '../../components';

const STATUS_FILTERS = [
    { id: 'all', label: 'All' },
    { id: 'hot', label: 'Hot', color: Colors.leadHot },
    { id: 'warm', label: 'Warm', color: Colors.leadWarm },
    { id: 'cold', label: 'Cold', color: Colors.leadCold },
];

const LeadsScreen = ({ navigation }) => {
    const { leads, searchLeads, getLeadsByStatus } = useLeads();

    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('all');
    const [refreshing, setRefreshing] = useState(false);

    // Filter leads based on search and status
    const filteredLeads = useMemo(() => {
        let result = activeFilter === 'all' ? leads : getLeadsByStatus(activeFilter);

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter(lead =>
                lead.name.toLowerCase().includes(query) ||
                lead.company.toLowerCase().includes(query) ||
                lead.email.toLowerCase().includes(query)
            );
        }

        return result;
    }, [leads, activeFilter, searchQuery, getLeadsByStatus]);

    const onRefresh = async () => {
        setRefreshing(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        setRefreshing(false);
    };

    const getStatusColor = (status) => {
        const colors = {
            hot: Colors.leadHot,
            warm: Colors.leadWarm,
            cold: Colors.leadCold,
            qualified: Colors.success,
        };
        return colors[status] || Colors.textMuted;
    };

    const renderHeader = () => (
        <View style={styles.header}>
            <View style={styles.headerTop}>
                <AppText size="xl" weight="bold">
                    Leads
                </AppText>
                <View style={styles.headerActions}>
                    <TouchableOpacity style={styles.notificationButton}>
                        <Icon name="bell-outline" size={ms(20)} color={Colors.textPrimary} />
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
                        <Icon name="account-circle" size={ms(20)} color={Colors.textPrimary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => navigation.navigate('AddLead')}
                    >
                        <Icon name="plus" size={ms(24)} color={Colors.white} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <Icon name="magnify" size={ms(20)} color={Colors.textMuted} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search leads..."
                    placeholderTextColor={Colors.textMuted}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery('')}>
                        <Icon name="close-circle" size={ms(20)} color={Colors.textMuted} />
                    </TouchableOpacity>
                )}
            </View>

            {/* Filter Tabs */}
            <View style={styles.filterContainer}>
                {STATUS_FILTERS.map((filter) => (
                    <TouchableOpacity
                        key={filter.id}
                        style={[
                            styles.filterTab,
                            activeFilter === filter.id && styles.filterTabActive,
                            activeFilter === filter.id && filter.color && { backgroundColor: filter.color },
                        ]}
                        onPress={() => setActiveFilter(filter.id)}
                    >
                        <AppText
                            size="sm"
                            weight={activeFilter === filter.id ? 'semiBold' : 'regular'}
                            color={activeFilter === filter.id ? Colors.white : Colors.textSecondary}
                        >
                            {filter.label}
                        </AppText>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );

    const renderLeadCard = ({ item }) => (
        <TouchableOpacity
            style={styles.leadCard}
            onPress={() => navigation.navigate('LeadDetails', { lead: item })}
        >
            <View style={styles.leadAvatar}>
                <AppText size="lg" weight="semiBold" color={Colors.primary}>
                    {getInitials(item.name)}
                </AppText>
            </View>
            <View style={styles.leadInfo}>
                <AppText size="base" weight="semiBold">
                    {item.name}
                </AppText>
                <AppText size="sm" color={Colors.textSecondary}>
                    {item.company}
                </AppText>
                <View style={styles.leadMeta}>
                    <Icon name="email-outline" size={ms(14)} color={Colors.textMuted} />
                    <AppText size="xs" color={Colors.textMuted} style={styles.metaText}>
                        {item.email}
                    </AppText>
                </View>
            </View>
            <View style={styles.leadRight}>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                    <AppText size="xs" weight="semiBold" color={getStatusColor(item.status)}>
                        {item.status.toUpperCase()}
                    </AppText>
                </View>
                <AppText size="base" weight="bold" color={Colors.success}>
                    {formatCurrency(item.value)}
                </AppText>
            </View>
        </TouchableOpacity>
    );

    const renderEmptyState = () => (
        <View style={styles.emptyState}>
            <Icon name="account-search-outline" size={ms(60)} color={Colors.textMuted} />
            <AppText size="lg" weight="semiBold" color={Colors.textSecondary} style={styles.emptyTitle}>
                No Leads Found
            </AppText>
            <AppText size="sm" color={Colors.textMuted} style={styles.emptySubtitle}>
                {searchQuery
                    ? 'Try adjusting your search or filters'
                    : 'Start adding leads to see them here'}
            </AppText>
            {!searchQuery && (
                <TouchableOpacity
                    style={styles.emptyButton}
                    onPress={() => navigation.navigate('AddLead')}
                >
                    <Icon name="plus" size={ms(20)} color={Colors.white} />
                    <AppText size="sm" weight="semiBold" color={Colors.white} style={styles.emptyButtonText}>
                        Add First Lead
                    </AppText>
                </TouchableOpacity>
            )}
        </View>
    );

    return (
        <ScreenWrapper withPadding bottomSafeArea={false}>
            {renderHeader()}
            <FlatList
                data={filteredLeads}
                keyExtractor={(item) => item.id}
                renderItem={renderLeadCard}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                refreshing={refreshing}
                onRefresh={onRefresh}
                ListEmptyComponent={renderEmptyState}
            />
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    header: {
        marginBottom: vs(16),
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: vs(16),
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
    },
    notificationButton: {
        width: ms(38),
        height: ms(38),
        borderRadius: BorderRadius.round,
        backgroundColor: Colors.white,
        justifyContent: 'center',
        alignItems: 'center',
        ...Shadow.sm,
    },
    profileButton: {
        width: ms(38),
        height: ms(38),
        borderRadius: BorderRadius.round,
        backgroundColor: Colors.white,
        justifyContent: 'center',
        alignItems: 'center',
        ...Shadow.sm,
    },
    notificationBadge: {
        position: 'absolute',
        top: ms(6),
        right: ms(6),
        width: ms(14),
        height: ms(14),
        borderRadius: ms(7),
        backgroundColor: Colors.error,
        justifyContent: 'center',
        alignItems: 'center',
    },
    addButton: {
        width: ms(44),
        height: ms(44),
        borderRadius: BorderRadius.round,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        ...Shadow.md,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.button,
        paddingHorizontal: Spacing.md,
        height: vs(48),
        marginBottom: vs(12),
        ...Shadow.sm,
    },
    searchInput: {
        flex: 1,
        marginLeft: Spacing.sm,
        fontSize: ms(14),
        color: Colors.textPrimary,
    },
    filterContainer: {
        flexDirection: 'row',
        gap: Spacing.sm,
    },
    filterTab: {
        paddingHorizontal: Spacing.md,
        paddingVertical: vs(8),
        borderRadius: BorderRadius.round,
        backgroundColor: Colors.white,
        ...Shadow.xs,
    },
    filterTabActive: {
        backgroundColor: Colors.primary,
    },
    listContent: {
        paddingBottom: vs(100),
    },
    leadCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.card,
        padding: Spacing.md,
        marginBottom: Spacing.sm,
        ...Shadow.sm,
    },
    leadAvatar: {
        width: ms(50),
        height: ms(50),
        borderRadius: BorderRadius.round,
        backgroundColor: Colors.primaryBackground,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.md,
    },
    leadInfo: {
        flex: 1,
    },
    leadMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    metaText: {
        marginLeft: 4,
    },
    leadRight: {
        alignItems: 'flex-end',
    },
    statusBadge: {
        paddingHorizontal: Spacing.sm,
        paddingVertical: 4,
        borderRadius: BorderRadius.badge,
        marginBottom: Spacing.xs,
    },
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
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.primary,
        paddingHorizontal: Spacing.lg,
        paddingVertical: vs(12),
        borderRadius: BorderRadius.button,
        marginTop: vs(20),
    },
    emptyButtonText: {
        marginLeft: Spacing.sm,
    },
});

export default LeadsScreen;
