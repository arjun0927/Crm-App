/**
 * Tasks Screen
 * Display and manage tasks in a list view with pagination (similar to Leads screen)
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
import { tasksAPI } from '../../api';
import { showError } from '../../utils';
import { useAuth } from '../../context';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const LIMIT = 50;

// Task Card Component (clean card view)
const TaskCard = ({ task, onPress, onEdit, onDelete }) => {
    // Helper to get priority color
    const getPriorityColor = () => {
        const priorityColors = {
            high: Colors.error,
            medium: '#f97316',
            low: Colors.success,
            urgent: '#dc2626',
        };
        return priorityColors[task.priority?.toLowerCase()] || Colors.textMuted;
    };

    // Helper to get status color
    const getStatusColor = () => {
        const statusColors = {
            open: '#f97316',
            pending: '#f97316',
            in_progress: Colors.info,
            'in progress': Colors.info,
            completed: Colors.success,
            cancelled: Colors.textMuted,
        };
        return statusColors[task.status?.toLowerCase()] || Colors.textMuted;
    };

    // Helper to get status display name
    const getStatusName = () => {
        const statusNames = {
            open: 'Pending',
            pending: 'Pending',
            in_progress: 'In Progress',
            'in progress': 'In Progress',
            completed: 'Completed',
            cancelled: 'Cancelled',
        };
        return statusNames[task.status?.toLowerCase()] || task.status || 'Pending';
    };

    // Helper to get value or N/A
    const getValue = (value) => {
        if (value === undefined || value === null || value === '') {
            return 'N/A';
        }
        if (typeof value === 'object') {
            return value.name || value.title || 'N/A';
        }
        return value;
    };

    // Format date helper - matches web format "Jan 22, 2026"
    const formatDateValue = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
            });
        } catch {
            return 'N/A';
        }
    };

    // Get assigned to name
    const getAssignedTo = () => {
        if (task.assignedTo) {
            if (typeof task.assignedTo === 'object') {
                return task.assignedTo.name || task.assignedTo.firstName || 'N/A';
            }
            return task.assignedTo;
        }
        return 'N/A';
    };

    // Get related to (lead/deal)
    const getRelatedTo = () => {
        if (task.lead) {
            if (typeof task.lead === 'object') {
                return task.lead.title || task.lead.name || 'N/A';
            }
            return task.lead;
        }
        if (task.relatedTo) {
            return typeof task.relatedTo === 'object' ? task.relatedTo.name : task.relatedTo;
        }
        return 'N/A';
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
        <View style={styles.taskCard}>
            {/* Card Header */}
            <View style={styles.cardHeader}>
                <TouchableOpacity
                    style={styles.cardHeaderContent}
                    onPress={onPress}
                    activeOpacity={0.7}
                >
                    <View style={styles.iconContainer}>
                        <Icon name="clipboard-check" size={ms(20)} color={Colors.primary} />
                    </View>
                    <View style={styles.taskTitleContainer}>
                        <AppText size="base" weight="bold" numberOfLines={1}>
                            {getValue(task.title) || 'Untitled Task'}
                        </AppText>
                    </View>
                </TouchableOpacity>

                {/* Edit & Delete Icons */}
                <View style={styles.headerActions}>
                    <TouchableOpacity
                        style={styles.actionIconButton}
                        onPress={() => onEdit?.(task)}
                        activeOpacity={0.7}
                    >
                        <Icon name="pencil" size={ms(18)} color={Colors.info} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.actionIconButton}
                        onPress={() => onDelete?.(task)}
                        activeOpacity={0.7}
                    >
                        <Icon name="delete" size={ms(18)} color={Colors.error} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Card Body - Only 5 Fields */}
            <TouchableOpacity
                style={styles.cardBody}
                onPress={onPress}
                activeOpacity={0.8}
            >
                <KeyValueRow label="Due Date" value={formatDateValue(task.dueDate)} />
                <KeyValueRow
                    label="Priority"
                    value={getValue(task.priority)?.charAt(0).toUpperCase() + getValue(task.priority)?.slice(1).toLowerCase()}
                    valueColor={getPriorityColor()}
                />
                <KeyValueRow
                    label="Status"
                    value={getStatusName()}
                    valueColor={getStatusColor()}
                />
                <KeyValueRow label="Assigned To" value={getAssignedTo()} />
                <KeyValueRow label="Related To" value={getRelatedTo()} isLast />
            </TouchableOpacity>
        </View>
    );
};

const TasksScreen = ({ navigation }) => {
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
    const [tasks, setTasks] = useState([]);

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

        // If search query is empty, fetch all tasks immediately
        if (!searchQuery.trim()) {
            fetchTasks(1, false, '');
            return;
        }

        // Debounce the search API call (300ms)
        searchTimeoutRef.current = setTimeout(() => {
            fetchTasks(1, false, searchQuery.trim());
        }, 300);

        // Cleanup timeout on unmount or query change
        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, [searchQuery]);

    // Fetch tasks on mount (initial load only)
    useEffect(() => {
        fetchTasks(1, true, '');
        isInitialLoadRef.current = false;
    }, []);

    const fetchTasks = async (pageNum = 1, showLoader = false, search = '') => {
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

            const response = await tasksAPI.getAll(params);

            // Check if this response is still relevant (search query hasn't changed)
            if (search !== currentSearchRef.current && search !== '') {
                return;
            }

            if (response.success) {
                const tasksData = response.data?.data?.items || [];
                const newTasks = Array.isArray(tasksData) ? tasksData : [];

                if (pageNum === 1) {
                    setTasks(newTasks);
                } else {
                    setTasks(prev => [...prev, ...newTasks]);
                }

                // Check if there are more pages
                setHasMore(newTasks.length === LIMIT);
                setPage(pageNum);
            } else {
                console.error('Failed to fetch tasks:', response.error);
                showError('Error', response.error || 'Failed to load tasks');
            }
        } catch (error) {
            console.error('Error fetching tasks:', error);
            showError('Error', 'Failed to load tasks');
        } finally {
            setLoading(false);
            setLoadingMore(false);
            setRefreshing(false);
        }
    };

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        setHasMore(true);
        fetchTasks(1, false, searchQuery.trim());
    }, [searchQuery]);

    const loadMore = useCallback(() => {
        if (!loadingMore && hasMore && !loading) {
            fetchTasks(page + 1, false, searchQuery.trim());
        }
    }, [loadingMore, hasMore, loading, page, searchQuery]);

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
                placeholder="Search tasks..."
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

    // Section Header with Add Button
    const renderSectionHeader = () => (
        <View style={styles.sectionHeader}>
            <View>
                <AppText size="lg" weight="semiBold">
                    Tasks
                </AppText>
                <AppText size="xs" color={Colors.textMuted}>
                    {tasks.length} {searchQuery ? 'found' : 'tasks'}
                </AppText>
            </View>
            <AppButton
                title="Add Task"
                onPress={() => navigation.navigate('AddTask')}
                fullWidth={false}
                size="small"
                icon="plus"
            />
        </View>
    );

    const handleEditTask = (task) => {
        nav.navigate('EditTask', { task });
    };

    const handleDeleteTask = (task) => {
        console.log('Delete task:', task._id);
        // TODO: Implement delete confirmation
    };

    const handleTaskPress = (task) => {
        navigation.navigate('TaskDetails', { task });
    };

    const renderTaskCard = ({ item: task }) => (
        <TaskCard
            task={task}
            onPress={() => handleTaskPress(task)}
            onEdit={handleEditTask}
            onDelete={handleDeleteTask}
        />
    );

    const renderFooter = () => {
        if (!loadingMore) return null;

        return (
            <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color={Colors.primary} />
                <AppText size="sm" color={Colors.textMuted} style={styles.footerText}>
                    Loading more tasks...
                </AppText>
            </View>
        );
    };

    const renderEmpty = () => {
        if (loading) return null;

        return (
            <View style={styles.emptyState}>
                <Icon name="clipboard-text-outline" size={ms(60)} color={Colors.textMuted} />
                <AppText size="lg" weight="semiBold" color={Colors.textSecondary} style={styles.emptyTitle}>
                    No Tasks Found
                </AppText>
                <AppText size="sm" color={Colors.textMuted} style={styles.emptySubtitle}>
                    {searchQuery ? 'Try adjusting your search' : 'Start by adding your first task'}
                </AppText>
                {!searchQuery && (
                    <AppButton
                        title="Add Task"
                        onPress={() => navigation.navigate('AddTask')}
                        icon="plus"
                        style={styles.emptyButton}
                    />
                )}
            </View>
        );
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <View style={styles.headerContainer}>
                    {renderHeader()}
                </View>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                    <AppText size="base" color={Colors.textMuted} style={styles.loadingText}>
                        Loading tasks...
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
                data={tasks}
                keyExtractor={(item) => item._id || item.id || String(Math.random())}
                renderItem={renderTaskCard}
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

    // Task Card Styles (matching Lead Card)
    taskCard: {
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
    taskTitleContainer: {
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

export default TasksScreen;
