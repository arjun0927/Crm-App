/**
 * Follow Up Engine Screen
 * Configure follow-up automation
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useFocusEffect } from '@react-navigation/native';
import { Colors } from '../../constants/Colors';
import { Spacing, BorderRadius, Shadow } from '../../constants/Spacing';
import { ms, vs, wp } from '../../utils/Responsive';
import { AppText } from '../../components';
import CommonHeader from '../../components/CommonHeader';
import API from '../../api/services';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const TAB_DUE_TODAY = 'due_today';
const TAB_OVERDUE = 'overdue';
const TAB_RULE_GENERATED = 'rule_generated';

// Reusing LeadCard component logic for consistency
const LeadCard = ({ lead, onPress }) => {
    const [expanded, setExpanded] = useState(false);

    const toggleExpand = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpanded(!expanded);
    };

    const getContactName = () => {
        if (!lead.contact) return 'N/A';
        const firstName = lead.contact.firstName || '';
        const lastName = lead.contact.lastName || '';
        const fullName = `${firstName} ${lastName}`.trim();
        return fullName || lead.contact.name || 'N/A';
    };

    const getCompanyName = () => lead.company?.name || 'N/A';

    // Helper to get value or N/A
    const getValue = (value) => {
        if (value === undefined || value === null || value === '') return 'N/A';
        if (typeof value === 'object') return value.name || 'N/A';
        return value;
    };

    const formatDateValue = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString('en-IN', {
                day: '2-digit', month: 'short', year: 'numeric'
            });
        } catch { return 'N/A'; }
    };

    const getDaysOverdue = (dateString) => {
        if (!dateString) return 'N/A';

        try {
            const today = new Date();
            const dueDate = new Date(dateString);

            // Remove time part for accurate day difference
            today.setHours(0, 0, 0, 0);
            dueDate.setHours(0, 0, 0, 0);

            const diffTime = today.getTime() - dueDate.getTime();
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays > 0) {
                return `${diffDays} days overdue`;
            }

            if (diffDays === 0) {
                return 'Due today';
            }

            return `${Math.abs(diffDays)} days left`;
        } catch (error) {
            return 'N/A';
        }
    };


    const KeyValueRow = ({ label, value, valueColor, isLast }) => (
        <View style={[styles.keyValueRow, isLast && styles.keyValueRowLast]}>
            <AppText numberOfLines={1} size="sm" color={Colors.textMuted} style={styles.keyText}>{label}</AppText>
            <AppText numberOfLines={1} size="sm" weight="medium" color={valueColor || Colors.textPrimary} style={styles.valueText}>
                {value}
            </AppText>
        </View>
    );

    return (
        <View style={styles.leadCard}>
            <View style={styles.cardHeader}>
                <TouchableOpacity style={styles.cardHeaderContent} onPress={onPress} activeOpacity={0.7}>
                    <View style={styles.iconContainer}>
                        <Icon name="account-tie" size={ms(20)} color={Colors.primary} />
                    </View>
                    <View style={styles.leadTitleContainer}>
                        <AppText size="base" weight="bold" numberOfLines={1}>
                            {getContactName() || 'Untitled Lead'}
                        </AppText>
                    </View>
                </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.cardBody} onPress={onPress} activeOpacity={0.8}>
                {/* <KeyValueRow label="Contact" value={getContactName()} /> */}
                <KeyValueRow label="email" value={getValue(lead?.contact?.email) || 'N/A'} />
                <KeyValueRow label="phone" value={getValue(lead?.contact?.phone) || 'N/A'} />
                <KeyValueRow label="Last Communication" value={formatDateValue(lead?.lastCommunication) || 'N/A'} />


                {expanded && (
                    <View style={styles.expandedContent}>
                        <KeyValueRow label="Company" value={getCompanyName()} />
                        <KeyValueRow label="Days Overdue" value={getDaysOverdue(lead.dueDate)} isLast={!expanded} />
                        <KeyValueRow label="Assigned To" value={getValue(lead.assignedTo)} />
                        {/* <KeyValueRow label="Source" value={getValue(lead.source)} />
                        <KeyValueRow label="Created At" value={formatDateValue(lead.createdAt)} isLast /> */}
                    </View>
                )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.expandToggle} onPress={toggleExpand} activeOpacity={0.7}>
                <AppText size="sm" weight="medium" color={Colors.primary}>
                    {expanded ? 'View Less' : 'View More'}
                </AppText>
                <Icon name={expanded ? 'chevron-up' : 'chevron-down'} size={ms(18)} color={Colors.primary} />
            </TouchableOpacity>
        </View>
    );
};

const FollowUpEngineScreen = ({ navigation }) => {
    const [activeTab, setActiveTab] = useState(TAB_OVERDUE); // Default to Overdue as it usually has data
    const [data, setData] = useState({
        [TAB_DUE_TODAY]: [],
        [TAB_OVERDUE]: [],
        [TAB_RULE_GENERATED]: []
    });
    const [loading, setLoading] = useState({
        [TAB_DUE_TODAY]: true,
        [TAB_OVERDUE]: true,
        [TAB_RULE_GENERATED]: true
    });
    const [refreshing, setRefreshing] = useState(false);

    const fetchAllData = async () => {
        try {
            const [dueTodayRes, overdueRes, ruleGeneratedRes] = await Promise.all([
                API.followUp.getDueToday({ page: 1, limit: 10 }),
                API.followUp.getOverdue({ page: 1, limit: 10 }),
                API.followUp.getRuleGenerated({ status: 'open', page: 1, limit: 10 })
            ]);

            console.log("dueTodayRes", dueTodayRes);
            console.log("overdueRes", overdueRes);
            console.log("ruleGeneratedRes", ruleGeneratedRes);

            setData(prev => ({
                [TAB_DUE_TODAY]: dueTodayRes.success ? (dueTodayRes.data || []) : [],
                [TAB_OVERDUE]: overdueRes.success ? (overdueRes.data || []) : [],
                [TAB_RULE_GENERATED]: ruleGeneratedRes.success ? (ruleGeneratedRes.data || []) : []
            }));
        } catch (error) {
            console.error('Error fetching follow-up data:', error);
        } finally {
            setLoading({
                [TAB_DUE_TODAY]: false,
                [TAB_OVERDUE]: false,
                [TAB_RULE_GENERATED]: false
            });
        }
    };

    console.log("data", data);


    // Use focus effect to fetch data when screen is focused
    useFocusEffect(
        useCallback(() => {
            setLoading({
                [TAB_DUE_TODAY]: true,
                [TAB_OVERDUE]: true,
                [TAB_RULE_GENERATED]: true
            });
            fetchAllData();
        }, [])
    );

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        setLoading({
            [TAB_DUE_TODAY]: true,
            [TAB_OVERDUE]: true,
            [TAB_RULE_GENERATED]: true
        });
        fetchAllData().then(() => setRefreshing(false));
    }, []);

    // Helper to get list from data (handles array or paginated object)
    const getListData = (tabData) => {
        if (!tabData) return [];
        if (Array.isArray(tabData)) return tabData;
        return tabData.data || tabData.leads || [];
    };

    const renderTabs = () => (
        <View style={styles.tabsRow}>
            <TouchableOpacity
                style={[styles.tab, activeTab === TAB_DUE_TODAY && styles.tabActive]}
                onPress={() => setActiveTab(TAB_DUE_TODAY)}
                activeOpacity={0.7}
            >
                <Icon name="clock-outline" size={ms(18)} color={activeTab === TAB_DUE_TODAY ? Colors.primary : Colors.textMuted} />
                <AppText size="xs" weight={activeTab === TAB_DUE_TODAY ? 'semiBold' : 'normal'} color={activeTab === TAB_DUE_TODAY ? Colors.primary : Colors.textMuted} style={styles.tabLabel}>
                    Due Today
                </AppText>
                {getListData(data[TAB_DUE_TODAY]).length > 0 && (
                    <View style={styles.tabBadge}>
                        <AppText size="xs" weight="bold" color={Colors.white}>{data?.due_today?.pagination?.totalItems}</AppText>
                    </View>
                )}
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.tab, activeTab === TAB_OVERDUE && styles.tabActive]}
                onPress={() => setActiveTab(TAB_OVERDUE)}
                activeOpacity={0.7}
            >
                <Icon name="alert-circle-outline" size={ms(18)} color={activeTab === TAB_OVERDUE ? Colors.primary : Colors.textMuted} />
                <AppText size="xs" weight={activeTab === TAB_OVERDUE ? 'semiBold' : 'normal'} color={activeTab === TAB_OVERDUE ? Colors.primary : Colors.textMuted} style={styles.tabLabel}>
                    Overdue
                </AppText>
                {getListData(data[TAB_OVERDUE]).length > 0 && (
                    <View style={styles.tabBadge}>
                        <AppText size="xs" weight="bold" color={Colors.white}>{data?.overdue?.pagination?.totalItems}</AppText>
                    </View>
                )}
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.tab, activeTab === TAB_RULE_GENERATED && styles.tabActive]}
                onPress={() => setActiveTab(TAB_RULE_GENERATED)}
                activeOpacity={0.7}
            >
                <Icon name="flash-outline" size={ms(18)} color={activeTab === TAB_RULE_GENERATED ? Colors.primary : Colors.textMuted} />
                <AppText size="xs" weight={activeTab === TAB_RULE_GENERATED ? 'semiBold' : 'normal'} color={activeTab === TAB_RULE_GENERATED ? Colors.primary : Colors.textMuted} style={styles.tabLabel}>
                    Rule-Generated
                </AppText>
                {getListData(data[TAB_RULE_GENERATED]).length > 0 && (
                    <View style={styles.tabBadge}>
                        <AppText size="xs" weight="bold" color={Colors.white}>{data?.rule_generated?.pagination?.totalItems}</AppText>
                    </View>
                )}
            </TouchableOpacity>
        </View>
    );

    const renderEmptyState = () => {
        if (loading[activeTab]) return <View />; // Don't show empty state while loading

        return (
            <View style={styles.emptyState}>
                <Icon name="clipboard-check-outline" size={ms(60)} color={Colors.textMuted} />
                {/* <AppText size="lg" weight="semiBold" color={Colors.textSecondary} style={styles.emptyTitle}>
                    No Follow-ups Found
                </AppText> */}
                <AppText size="lg" weight="semiBold" color={Colors.textMuted} style={styles.emptySubtitle}>
                    There are no {activeTab.replace('_', ' ')} items.
                </AppText>
            </View>
        );
    };

    const handlePress = (item) => {
        if (item._id || item.id) {
            navigation.navigate('LeadDetails', { lead: item, id: item._id || item.id });
        }
    };

    const currentList = getListData(data[activeTab]);

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <CommonHeader navigation={navigation} />
            {renderTabs()}

            {loading[activeTab] && currentList.length === 0 ? (
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={currentList}
                    keyExtractor={(item) => (item._id || item.id || Math.random().toString())}
                    renderItem={({ item }) => <LeadCard lead={item} onPress={() => handlePress(item)} />}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={renderEmptyState}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />
                    }
                    showsVerticalScrollIndicator={false}
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    titleContainer: {
        paddingHorizontal: wp(4),
        paddingVertical: vs(8),
        backgroundColor: Colors.background,
    },
    tabsRow: {
        flexDirection: 'row',
        alignItems: 'stretch',
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
        paddingHorizontal: Spacing.xs,
        paddingVertical: Spacing.xs,
        backgroundColor: Colors.background,
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.xs,
        borderRadius: 8,
    },
    tabActive: {
        backgroundColor: Colors.primary + '18',
    },
    tabLabel: {
        marginLeft: 4,
    },
    tabBadge: {
        marginLeft: 4,
        minWidth: ms(18),
        height: ms(18),
        borderRadius: ms(9),
        backgroundColor: Colors.error,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 4,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        paddingHorizontal: wp(4),
        paddingVertical: vs(16),
        paddingBottom: vs(100),
    },
    leadCard: {
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.card,
        marginBottom: Spacing.md,
        ...Shadow.sm,
    },
    cardHeader: {
        padding: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    cardHeaderContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: ms(40),
        height: ms(40),
        borderRadius: BorderRadius.round,
        backgroundColor: Colors.primary + '20',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.sm,
    },
    leadTitleContainer: {
        flex: 1,
    },
    cardBody: {
        padding: Spacing.md,
    },
    keyValueRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: vs(4),
    },
    keyValueRowLast: {
        paddingBottom: 0,
    },
    keyText: {
        flex: 1,
    },
    valueText: {
        flex: 2,
        textAlign: 'right',
    },
    expandedContent: {
        // marginTop: Spacing.sm,
        // paddingTop: Spacing.sm,
        // borderTopWidth: 1,
        // borderTopColor: Colors.border,
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
    emptyState: {
        alignItems: 'center',
        paddingVertical: vs(80),
    },
    emptyTitle: {
        marginTop: vs(16),
    },
    emptySubtitle: {
        marginTop: vs(8),
        textAlign: 'center',
    },
});

export default FollowUpEngineScreen;
