/**
 * Tasks Screen
 * Display and manage tasks list
 */

import React, { useState, useMemo } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    FlatList,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors } from '../../constants/Colors';
import { Spacing, BorderRadius, Shadow } from '../../constants/Spacing';
import { ms, vs } from '../../utils/Responsive';
import { formatDate } from '../../utils/Helpers';
import { useTasks } from '../../context';
import { ScreenWrapper, AppText } from '../../components';

const TAB_FILTERS = [
    { id: 'pending', label: 'Pending' },
    { id: 'in_progress', label: 'In Progress' },
    { id: 'completed', label: 'Completed' },
];

const TasksScreen = ({ navigation }) => {
    const { tasks, toggleTaskStatus, getTasksByStatus } = useTasks();

    const [activeTab, setActiveTab] = useState('pending');
    const [refreshing, setRefreshing] = useState(false);

    // Filter tasks based on active tab
    const filteredTasks = useMemo(() => {
        return getTasksByStatus(activeTab);
    }, [tasks, activeTab, getTasksByStatus]);

    const onRefresh = async () => {
        setRefreshing(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        setRefreshing(false);
    };

    const getPriorityColor = (priority) => {
        const colors = {
            high: Colors.error,
            medium: Colors.warning,
            low: Colors.success,
        };
        return colors[priority] || Colors.textMuted;
    };

    const getTaskIcon = (type) => {
        const icons = {
            call: 'phone',
            email: 'email',
            meeting: 'calendar',
            document: 'file-document',
            review: 'text-box-check',
        };
        return icons[type] || 'checkbox-marked-outline';
    };

    const getDueDateStatus = (dueDate, status) => {
        if (status === 'completed') return { color: Colors.success, label: 'Completed' };

        const now = new Date();
        const due = new Date(dueDate);
        const diffDays = Math.ceil((due - now) / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return { color: Colors.error, label: 'Overdue' };
        if (diffDays === 0) return { color: Colors.warning, label: 'Today' };
        if (diffDays === 1) return { color: Colors.info, label: 'Tomorrow' };
        return { color: Colors.textMuted, label: formatDate(dueDate, 'short') };
    };

    const handleToggleTask = async (taskId) => {
        await toggleTaskStatus(taskId);
    };

    const renderHeader = () => (
        <View style={styles.header}>
            <View style={styles.headerTop}>
                <AppText size="xl" weight="bold">
                    Tasks
                </AppText>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => navigation.navigate('AddTask')}
                >
                    <Icon name="plus" size={ms(24)} color={Colors.white} />
                </TouchableOpacity>
            </View>

            {/* Tab Filters */}
            <View style={styles.tabContainer}>
                {TAB_FILTERS.map((tab) => (
                    <TouchableOpacity
                        key={tab.id}
                        style={[
                            styles.tab,
                            activeTab === tab.id && styles.tabActive,
                        ]}
                        onPress={() => setActiveTab(tab.id)}
                    >
                        <AppText
                            size="sm"
                            weight={activeTab === tab.id ? 'semiBold' : 'regular'}
                            color={activeTab === tab.id ? Colors.primary : Colors.textSecondary}
                        >
                            {tab.label}
                        </AppText>
                        <View style={[
                            styles.tabCount,
                            activeTab === tab.id && styles.tabCountActive,
                        ]}>
                            <AppText
                                size="xs"
                                weight="bold"
                                color={activeTab === tab.id ? Colors.white : Colors.textMuted}
                            >
                                {getTasksByStatus(tab.id).length}
                            </AppText>
                        </View>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );

    const renderTaskCard = ({ item }) => {
        const dueStatus = getDueDateStatus(item.dueDate, item.status);
        const isCompleted = item.status === 'completed';

        return (
            <TouchableOpacity
                style={styles.taskCard}
                onPress={() => navigation.navigate('TaskDetails', { task: item })}
            >
                {/* Checkbox */}
                <TouchableOpacity
                    style={styles.checkbox}
                    onPress={() => handleToggleTask(item.id)}
                >
                    <Icon
                        name={isCompleted ? 'checkbox-marked-circle' : 'checkbox-blank-circle-outline'}
                        size={ms(26)}
                        color={isCompleted ? Colors.success : Colors.textMuted}
                    />
                </TouchableOpacity>

                {/* Task Info */}
                <View style={styles.taskInfo}>
                    <View style={styles.taskHeader}>
                        <View style={[styles.taskType, { backgroundColor: getPriorityColor(item.priority) + '20' }]}>
                            <Icon name={getTaskIcon(item.type)} size={ms(14)} color={getPriorityColor(item.priority)} />
                        </View>
                        <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(item.priority) }]}>
                            <AppText size="tiny" weight="bold" color={Colors.white}>
                                {item.priority?.toUpperCase()}
                            </AppText>
                        </View>
                    </View>

                    <AppText
                        size="base"
                        weight="medium"
                        style={isCompleted && styles.completedText}
                    >
                        {item.title}
                    </AppText>

                    {item.leadName && (
                        <View style={styles.leadInfo}>
                            <Icon name="account" size={ms(14)} color={Colors.textMuted} />
                            <AppText size="xs" color={Colors.textMuted} style={styles.leadName}>
                                {item.leadName}
                            </AppText>
                        </View>
                    )}

                    <View style={styles.dueDateContainer}>
                        <Icon name="calendar-clock" size={ms(14)} color={dueStatus.color} />
                        <AppText size="xs" weight="medium" color={dueStatus.color} style={styles.dueDate}>
                            {dueStatus.label}
                        </AppText>
                    </View>
                </View>

                {/* Priority Indicator */}
                <View style={[styles.priorityLine, { backgroundColor: getPriorityColor(item.priority) }]} />
            </TouchableOpacity>
        );
    };

    const renderEmptyState = () => (
        <View style={styles.emptyState}>
            <Icon
                name={activeTab === 'completed' ? 'checkbox-marked-circle-outline' : 'clipboard-text-outline'}
                size={ms(60)}
                color={Colors.textMuted}
            />
            <AppText size="lg" weight="semiBold" color={Colors.textSecondary} style={styles.emptyTitle}>
                {activeTab === 'completed' ? 'No Completed Tasks' : 'No Tasks'}
            </AppText>
            <AppText size="sm" color={Colors.textMuted} style={styles.emptySubtitle}>
                {activeTab === 'completed'
                    ? 'Complete some tasks to see them here'
                    : 'Add tasks to stay organized'}
            </AppText>
            {activeTab !== 'completed' && (
                <TouchableOpacity
                    style={styles.emptyButton}
                    onPress={() => navigation.navigate('AddTask')}
                >
                    <Icon name="plus" size={ms(20)} color={Colors.white} />
                    <AppText size="sm" weight="semiBold" color={Colors.white} style={styles.emptyButtonText}>
                        Add Task
                    </AppText>
                </TouchableOpacity>
            )}
        </View>
    );

    return (
        <ScreenWrapper withPadding bottomSafeArea={false}>
            {renderHeader()}
            <FlatList
                data={filteredTasks}
                keyExtractor={(item) => item.id}
                renderItem={renderTaskCard}
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
    addButton: {
        width: ms(44),
        height: ms(44),
        borderRadius: BorderRadius.round,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        ...Shadow.md,
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.card,
        padding: 4,
        ...Shadow.sm,
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: vs(12),
        borderRadius: BorderRadius.md,
    },
    tabActive: {
        backgroundColor: Colors.primaryBackground,
    },
    tabCount: {
        marginLeft: Spacing.xs,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: BorderRadius.round,
        backgroundColor: Colors.border,
    },
    tabCountActive: {
        backgroundColor: Colors.primary,
    },
    listContent: {
        paddingBottom: vs(100),
    },
    taskCard: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.card,
        padding: Spacing.md,
        marginBottom: Spacing.sm,
        overflow: 'hidden',
        ...Shadow.sm,
    },
    checkbox: {
        marginRight: Spacing.md,
        marginTop: 2,
    },
    taskInfo: {
        flex: 1,
    },
    taskHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.xs,
    },
    taskType: {
        width: ms(24),
        height: ms(24),
        borderRadius: BorderRadius.sm,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.sm,
    },
    priorityBadge: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: BorderRadius.badge,
    },
    completedText: {
        textDecorationLine: 'line-through',
        color: Colors.textMuted,
    },
    leadInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    leadName: {
        marginLeft: 4,
    },
    dueDateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 6,
    },
    dueDate: {
        marginLeft: 4,
    },
    priorityLine: {
        position: 'absolute',
        right: 0,
        top: 0,
        bottom: 0,
        width: 4,
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

export default TasksScreen;
