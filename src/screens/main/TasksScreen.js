/**
 * Tasks Screen
 * Display and manage tasks in a list view with pagination — UI matched to Expo
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    View,
    Text,
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
import IonIcon from 'react-native-vector-icons/Ionicons';
import { Colors } from '../../constants/Colors';
import { Spacing, BorderRadius, Shadow } from '../../constants/Spacing';
import { ms, vs, wp } from '../../utils/Responsive';
import { AppText, AppButton } from '../../components';
import { tasksAPI } from '../../api';
import { showError } from '../../utils';
import { useAuth } from '../../context';
import CommonHeader from '../../components/CommonHeader';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const LIMIT = 50;

// Type icon configs matching Expo
const TYPE_ICONS = {
    Call: { icon: 'call', color: '#4D8733', bg: '#EEF5E6' },
    Email: { icon: 'mail', color: '#3B82F6', bg: '#EFF6FF' },
    Meeting: { icon: 'calendar', color: '#8B5CF6', bg: '#F3F0FF' },
    Document: { icon: 'document-text', color: '#F59E0B', bg: '#FFFBEB' },
};

const PRIORITY_CONFIG = {
    High: { color: '#EF4444', bg: '#FEF2F2' },
    Medium: { color: '#F59E0B', bg: '#FFFBEB' },
    Low: { color: '#3B82F6', bg: '#EFF6FF' },
    Urgent: { color: '#dc2626', bg: '#FEF2F2' },
    high: { color: '#EF4444', bg: '#FEF2F2' },
    medium: { color: '#F59E0B', bg: '#FFFBEB' },
    low: { color: '#3B82F6', bg: '#EFF6FF' },
    urgent: { color: '#dc2626', bg: '#FEF2F2' },
};

const FILTERS = ['All', 'Pending', 'Completed'];

// Format due date helper matching Expo
function formatDueDate(dateStr) {
    if (!dateStr) return 'No date';
    try {
        const now = new Date();
        const due = new Date(dateStr);
        const diffMs = due.getTime() - now.getTime();
        const diffDays = Math.floor(diffMs / 86400000);
        if (diffDays < -1) return `${Math.abs(diffDays)}d overdue`;
        if (diffDays === -1) return 'Yesterday';
        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Tomorrow';
        return due.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
    } catch {
        return 'N/A';
    }
}

function isDueOrOverdue(dateStr) {
    if (!dateStr) return false;
    return new Date(dateStr).getTime() < Date.now();
}

// Task Card Component — matching Expo design
const TaskCard = ({ task, onPress, onEdit, onDelete, onToggleComplete }) => {
    const status = task.status?.toLowerCase() || 'pending';
    const isDone = status === 'completed';
    const taskType = task.taskType || task.type || 'Call';
    const typeConfig = TYPE_ICONS[taskType] || TYPE_ICONS.Call;
    const priority = task.priority || 'Medium';
    const prioConfig = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.Medium;
    const isOverdue = !isDone && isDueOrOverdue(task.dueDate);

    const getRelatedTo = () => {
        if (task.lead) {
            if (typeof task.lead === 'object') return task.lead.title || task.lead.name || null;
            return task.lead;
        }
        if (task.relatedTo) {
            return typeof task.relatedTo === 'object' ? task.relatedTo.name : task.relatedTo;
        }
        return null;
    };

    const getAssignedTo = () => {
        if (task.assignedTo) {
            if (typeof task.assignedTo === 'object') return task.assignedTo.name || task.assignedTo.firstName || null;
            return task.assignedTo;
        }
        return null;
    };

    const relatedTo = getRelatedTo();
    const assignedTo = getAssignedTo();

    return (
        <View style={[styles.taskCard, isDone && styles.taskCardDone]}>
            {/* Left accent */}
            <View style={[styles.taskAccent, { backgroundColor: isDone ? Colors.success : typeConfig.color }]} />

            <View style={styles.taskContent}>
                {/* Top row: checkbox + title + type icon */}
                <View style={styles.taskTopRow}>
                    <TouchableOpacity
                        style={[styles.checkbox, isDone && styles.checkboxDone]}
                        onPress={() => onToggleComplete?.(task)}
                    >
                        {isDone ? <IonIcon name="checkmark" size={14} color="#fff" /> : null}
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.taskTitleWrap} onPress={onPress} activeOpacity={0.7}>
                        <Text style={[styles.taskTitle, isDone && styles.taskTitleDone]} numberOfLines={2}>
                            {task.title || 'Untitled Task'}
                        </Text>
                        {relatedTo ? (
                            <Text style={styles.taskRelated} numberOfLines={1}>
                                <IonIcon name="person-outline" size={11} color={Colors.textTertiary} /> {relatedTo}
                            </Text>
                        ) : null}
                    </TouchableOpacity>
                    <View style={[styles.typeIcon, { backgroundColor: typeConfig.bg }]}>
                        <IonIcon name={typeConfig.icon} size={16} color={typeConfig.color} />
                    </View>
                </View>

                {/* Tags row */}
                <View style={styles.tagsRow}>
                    <View style={[styles.tag, { backgroundColor: prioConfig.bg }]}>
                        <IonIcon name="flag" size={10} color={prioConfig.color} />
                        <Text style={[styles.tagText, { color: prioConfig.color }]}>
                            {typeof priority === 'string' ? priority.charAt(0).toUpperCase() + priority.slice(1).toLowerCase() : priority}
                        </Text>
                    </View>
                    <View style={[styles.tag, { backgroundColor: isOverdue ? Colors.dangerBg : Colors.background }]}>
                        <IonIcon name="time-outline" size={10} color={isOverdue ? Colors.danger : Colors.textSecondary} />
                        <Text style={[styles.tagText, { color: isOverdue ? Colors.danger : Colors.textSecondary }]}>
                            {formatDueDate(task.dueDate)}
                        </Text>
                    </View>
                    {assignedTo ? (
                        <View style={[styles.tag, { backgroundColor: Colors.background }]}>
                            <IonIcon name="person-outline" size={10} color={Colors.textTertiary} />
                            <Text style={[styles.tagText, { color: Colors.textTertiary }]}>{assignedTo}</Text>
                        </View>
                    ) : null}
                </View>

                {/* Actions */}
                <View style={styles.actionRow}>
                    <TouchableOpacity
                        style={styles.actionBtn}
                        onPress={() => onEdit?.(task)}
                    >
                        <IonIcon name="create-outline" size={15} color={Colors.info} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.actionBtn}
                        onPress={() => onDelete?.(task)}
                    >
                        <IonIcon name="trash-outline" size={15} color={Colors.danger} />
                    </TouchableOpacity>
                </View>
            </View>
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
    const [filter, setFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchOpen, setSearchOpen] = useState(false);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [tasks, setTasks] = useState([]);

    // Filter tasks by status
    const filtered = tasks.filter((t) => {
        if (filter === 'Pending') return t.status?.toLowerCase() !== 'completed';
        if (filter === 'Completed') return t.status?.toLowerCase() === 'completed';
        return true;
    });

    const pendingCount = tasks.filter((t) => t.status?.toLowerCase() !== 'completed').length;

    // Debounced search effect
    useEffect(() => {
        if (isInitialLoadRef.current) return;
        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
        currentSearchRef.current = searchQuery;
        if (!searchQuery.trim()) {
            fetchTasks(1, false, '');
            return;
        }
        searchTimeoutRef.current = setTimeout(() => {
            fetchTasks(1, false, searchQuery.trim());
        }, 300);
        return () => {
            if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
        };
    }, [searchQuery]);

    // Fetch tasks on mount (initial load only)
    useEffect(() => {
        fetchTasks(1, true, '');
        isInitialLoadRef.current = false;
    }, []);

    const fetchTasks = async (pageNum = 1, showLoader = false, search = '') => {
        try {
            if (showLoader) {
                setLoading(true);
            } else if (pageNum > 1) {
                setLoadingMore(true);
            }
            const params = { page: pageNum, limit: LIMIT };
            if (search) params.search = search;
            const response = await tasksAPI.getAll(params);
            if (search !== currentSearchRef.current && search !== '') return;
            if (response.success) {
                const tasksData = response.data?.data?.items || [];
                const newTasks = Array.isArray(tasksData) ? tasksData : [];
                if (pageNum === 1) {
                    setTasks(newTasks);
                } else {
                    setTasks(prev => [...prev, ...newTasks]);
                }
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

    const handleToggleComplete = (task) => {
        // Toggle logic can be implemented here
        console.log('Toggle complete:', task._id);
    };

    const renderTaskCard = ({ item: task }) => (
        <TaskCard
            task={task}
            onPress={() => handleTaskPress(task)}
            onEdit={handleEditTask}
            onDelete={handleDeleteTask}
            onToggleComplete={handleToggleComplete}
        />
    );

    const renderFooter = () => {
        if (!loadingMore) return null;
        return (
            <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color={Colors.primary} />
                <Text style={styles.footerText}>Loading more tasks...</Text>
            </View>
        );
    };

    const renderEmpty = () => {
        if (loading) return null;
        return (
            <View style={styles.emptyState}>
                <View style={styles.emptyCircle}>
                    <IonIcon name="checkbox-outline" size={ms(40)} color={Colors.primary} />
                </View>
                <Text style={styles.emptyTitle}>No tasks yet</Text>
                <Text style={styles.emptySubtitle}>
                    {searchQuery ? 'Try adjusting your search' : 'Tap + Add Task to get started'}
                </Text>
            </View>
        );
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <CommonHeader navigation={navigation} />
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <CommonHeader navigation={navigation} />

            {/* Search bar (toggle) */}
            {searchOpen ? (
                <View style={styles.searchWrap}>
                    <View style={styles.searchBar}>
                        <IonIcon name="search" size={17} color={Colors.textTertiary} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search tasks..."
                            placeholderTextColor={Colors.textTertiary}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            autoFocus
                        />
                        <TouchableOpacity onPress={() => { setSearchOpen(false); setSearchQuery(''); }}>
                            <IonIcon name="close-circle" size={17} color={Colors.textTertiary} />
                        </TouchableOpacity>
                    </View>
                </View>
            ) : null}

            {/* Title + Actions row */}
            <View style={styles.titleRow}>
                <View>
                    <Text style={styles.sectionTitle}>Tasks</Text>
                    <Text style={styles.subtitleText}>{pendingCount} pending</Text>
                </View>
                <View style={styles.titleActions}>
                    <TouchableOpacity style={styles.iconBtn} onPress={() => setSearchOpen(!searchOpen)}>
                        <IonIcon name="search" size={18} color={Colors.textPrimary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.addBtn}
                        onPress={() => navigation.navigate('AddTask')}
                    >
                        <IonIcon name="add" size={18} color="#fff" />
                        <Text style={styles.addBtnText}>Add Task</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Filter pills */}
            <View style={styles.filterRow}>
                {FILTERS.map((f) => {
                    const count = f === 'All' ? tasks.length :
                        f === 'Pending' ? pendingCount :
                            tasks.length - pendingCount;
                    const isActive = filter === f;
                    return (
                        <TouchableOpacity
                            key={f}
                            style={[styles.filterPill, isActive && styles.filterPillActive]}
                            onPress={() => setFilter(f)}
                        >
                            <Text style={[styles.filterPillText, isActive && styles.filterPillTextActive]}>
                                {f}
                            </Text>
                            <View style={[styles.filterCount, isActive && styles.filterCountActive]}>
                                <Text style={[styles.filterCountText, isActive && { color: '#fff' }]}>{count}</Text>
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </View>

            <FlatList
                data={filtered}
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
    container: { flex: 1, backgroundColor: Colors.background },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },

    // Search
    searchWrap: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.sm },
    searchBar: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: Colors.surface, borderRadius: BorderRadius.md,
        paddingHorizontal: Spacing.md, height: ms(42),
        borderWidth: 1, borderColor: Colors.surfaceBorder,
    },
    searchInput: { flex: 1, marginLeft: Spacing.sm, fontSize: ms(14), color: Colors.textPrimary },

    // Title row
    titleRow: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: Spacing.lg, paddingBottom: Spacing.sm,
    },
    sectionTitle: { fontSize: ms(24), fontWeight: '800', color: Colors.textPrimary },
    subtitleText: { fontSize: ms(12), color: Colors.textTertiary, marginTop: 1 },
    titleActions: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
    iconBtn: {
        width: ms(38), height: ms(38), borderRadius: ms(12),
        backgroundColor: Colors.surface, justifyContent: 'center', alignItems: 'center', ...Shadow.sm,
    },
    addBtn: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: Colors.primary, paddingHorizontal: ms(14),
        paddingVertical: ms(10), borderRadius: ms(14), gap: 4,
    },
    addBtnText: { fontSize: ms(13), fontWeight: '700', color: '#fff' },

    // Filter pills
    filterRow: {
        flexDirection: 'row', paddingHorizontal: Spacing.lg,
        gap: Spacing.sm, marginBottom: Spacing.md,
    },
    filterPill: {
        flexDirection: 'row', alignItems: 'center', paddingHorizontal: ms(14),
        paddingVertical: ms(8), borderRadius: 999,
        backgroundColor: Colors.surface, borderWidth: 1.5, borderColor: Colors.surfaceBorder, gap: 6,
    },
    filterPillActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
    filterPillText: { fontSize: ms(12), fontWeight: '600', color: Colors.textSecondary },
    filterPillTextActive: { color: '#fff' },
    filterCount: { backgroundColor: Colors.background, borderRadius: 8, paddingHorizontal: 5, paddingVertical: 1 },
    filterCountActive: { backgroundColor: 'rgba(255,255,255,0.3)' },
    filterCountText: { fontSize: ms(10), fontWeight: '700', color: Colors.textSecondary },

    listContent: { paddingHorizontal: Spacing.lg, paddingBottom: ms(100) },

    // Task card — Expo style
    taskCard: {
        flexDirection: 'row', backgroundColor: Colors.surface,
        borderRadius: BorderRadius.lg, marginBottom: Spacing.md,
        overflow: 'hidden', ...Shadow.sm,
    },
    taskCardDone: { opacity: 0.7 },
    taskAccent: { width: ms(4) },
    taskContent: { flex: 1, padding: ms(14) },
    taskTopRow: { flexDirection: 'row', alignItems: 'flex-start' },
    checkbox: {
        width: ms(22), height: ms(22), borderRadius: ms(7),
        borderWidth: 2, borderColor: Colors.surfaceBorder,
        justifyContent: 'center', alignItems: 'center', marginTop: 2,
    },
    checkboxDone: { backgroundColor: Colors.success, borderColor: Colors.success },
    taskTitleWrap: { flex: 1, marginLeft: Spacing.sm },
    taskTitle: { fontSize: ms(15), fontWeight: '600', color: Colors.textPrimary, lineHeight: ms(20) },
    taskTitleDone: { textDecorationLine: 'line-through', color: Colors.textTertiary },
    taskRelated: { fontSize: ms(11), color: Colors.textTertiary, marginTop: 3 },
    typeIcon: {
        width: ms(32), height: ms(32), borderRadius: ms(10),
        justifyContent: 'center', alignItems: 'center', marginLeft: 8,
    },
    tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: Spacing.sm, paddingLeft: ms(30) },
    tag: {
        flexDirection: 'row', alignItems: 'center', gap: 3,
        paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6,
    },
    tagText: { fontSize: ms(10), fontWeight: '600' },
    actionRow: {
        flexDirection: 'row', justifyContent: 'flex-end', gap: Spacing.sm,
        marginTop: Spacing.sm, paddingTop: Spacing.sm,
        borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: Colors.divider,
    },
    actionBtn: {
        width: ms(32), height: ms(32), borderRadius: ms(8),
        backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center',
    },

    // Footer
    footerLoader: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        paddingVertical: vs(16), gap: Spacing.sm,
    },
    footerText: { fontSize: ms(13), color: Colors.textTertiary, marginLeft: Spacing.sm },

    // Empty State
    emptyState: { alignItems: 'center', paddingTop: ms(80) },
    emptyCircle: {
        width: ms(80), height: ms(80), borderRadius: 40,
        backgroundColor: Colors.primaryBackground, justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.lg,
    },
    emptyTitle: { fontSize: ms(18), fontWeight: '700', color: Colors.textPrimary },
    emptySubtitle: { fontSize: ms(13), color: Colors.textTertiary, marginTop: 4 },
});

export default TasksScreen;
