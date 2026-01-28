/**
 * Task Details Screen
 * Detailed view of a single task with actions
 */

import React, { useState, useEffect } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors } from '../../constants/Colors';
import { Spacing, BorderRadius, Shadow } from '../../constants/Spacing';
import { ms, vs } from '../../utils/Responsive';
import { formatDate } from '../../utils/Helpers';
import { useTasks } from '../../context';
import { ScreenWrapper, AppText, AppButton } from '../../components';

const TaskDetailsScreen = ({ route, navigation }) => {
    const { task } = route.params || {};
    const { toggleTaskStatus, deleteTask, getTaskById } = useTasks();
    const [isCompleted, setIsCompleted] = useState(task?.status === 'completed');
    const [currentTask, setCurrentTask] = useState(task);

    useEffect(() => {
        // Sync with context
        if (task?.id) {
            const latestTask = getTaskById(task.id);
            if (latestTask) {
                setCurrentTask(latestTask);
                setIsCompleted(latestTask.status === 'completed');
            }
        }
    }, [task?.id, getTaskById]);

    if (!currentTask) {
        return (
            <ScreenWrapper withPadding>
                <View style={styles.errorContainer}>
                    <AppText color={Colors.error}>Task not found</AppText>
                </View>
            </ScreenWrapper>
        );
    }

    const getPriorityColor = (priority) => {
        const colors = {
            high: Colors.error,
            medium: Colors.warning,
            low: Colors.success,
        };
        return colors[priority] || Colors.textMuted;
    };

    const getTypeIcon = (type) => {
        const icons = {
            call: 'phone',
            email: 'email',
            meeting: 'calendar',
            document: 'file-document',
            review: 'text-box-check',
        };
        return icons[type] || 'checkbox-marked-outline';
    };

    const getTypeLabel = (type) => {
        const labels = {
            call: 'Phone Call',
            email: 'Email',
            meeting: 'Meeting',
            document: 'Document',
            review: 'Review',
        };
        return labels[type] || 'Task';
    };

    const getTypeColor = (type) => {
        const colors = {
            call: Colors.success,
            email: Colors.info,
            meeting: Colors.primary,
            document: Colors.accent,
            review: Colors.secondary,
        };
        return colors[type] || Colors.textMuted;
    };

    const handleComplete = async () => {
        const result = await toggleTaskStatus(currentTask.id);
        if (result.success) {
            setIsCompleted(!isCompleted);
        }
    };

    const handleDelete = () => {
        Alert.alert(
            'Delete Task',
            'Are you sure you want to delete this task?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        const result = await deleteTask(currentTask.id);
                        if (result.success) {
                            navigation.goBack();
                        } else {
                            Alert.alert('Error', 'Failed to delete task');
                        }
                    },
                },
            ]
        );
    };

    const renderHeader = () => (
        <View style={styles.header}>
            <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
            >
                <Icon name="arrow-left" size={ms(24)} color={Colors.textPrimary} />
            </TouchableOpacity>
            <AppText size="lg" weight="semiBold">
                Task Details
            </AppText>
            <TouchableOpacity
                style={styles.headerButton}
                onPress={() => { }}
            >
                <Icon name="dots-vertical" size={ms(22)} color={Colors.textPrimary} />
            </TouchableOpacity>
        </View>
    );

    const renderTaskCard = () => (
        <View style={styles.taskCard}>
            <View style={styles.taskHeader}>
                <View style={[styles.typeIcon, { backgroundColor: getTypeColor(currentTask.type) + '20' }]}>
                    <Icon name={getTypeIcon(currentTask.type)} size={ms(24)} color={getTypeColor(currentTask.type)} />
                </View>
                <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(currentTask.priority) + '20' }]}>
                    <Icon name="flag" size={ms(14)} color={getPriorityColor(currentTask.priority)} />
                    <AppText size="xs" weight="semiBold" color={getPriorityColor(currentTask.priority)} style={styles.priorityText}>
                        {currentTask.priority?.toUpperCase()} PRIORITY
                    </AppText>
                </View>
            </View>

            <AppText size="xl" weight="bold" style={styles.taskTitle}>
                {currentTask.title}
            </AppText>

            {currentTask.description && (
                <AppText size="base" color={Colors.textSecondary} style={styles.taskDescription}>
                    {currentTask.description}
                </AppText>
            )}

            {/* Complete Button */}
            <TouchableOpacity
                style={[
                    styles.completeButton,
                    isCompleted && styles.completeButtonActive,
                ]}
                onPress={handleComplete}
            >
                <Icon
                    name={isCompleted ? 'check-circle' : 'circle-outline'}
                    size={ms(24)}
                    color={isCompleted ? Colors.white : Colors.success}
                />
                <AppText
                    size="base"
                    weight="semiBold"
                    color={isCompleted ? Colors.white : Colors.success}
                    style={styles.completeText}
                >
                    {isCompleted ? 'Completed' : 'Mark as Complete'}
                </AppText>
            </TouchableOpacity>
        </View>
    );

    const renderDetails = () => (
        <View style={styles.section}>
            <AppText size="lg" weight="semiBold" style={styles.sectionTitle}>
                Details
            </AppText>
            <View style={styles.detailsCard}>
                <View style={styles.detailRow}>
                    <View style={styles.detailIcon}>
                        <Icon name="clipboard-text-outline" size={ms(20)} color={Colors.primary} />
                    </View>
                    <View style={styles.detailContent}>
                        <AppText size="xs" color={Colors.textMuted}>
                            Type
                        </AppText>
                        <AppText size="base" weight="medium">
                            {getTypeLabel(currentTask.type)}
                        </AppText>
                    </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.detailRow}>
                    <View style={styles.detailIcon}>
                        <Icon name="account" size={ms(20)} color={Colors.primary} />
                    </View>
                    <View style={styles.detailContent}>
                        <AppText size="xs" color={Colors.textMuted}>
                            Related Lead
                        </AppText>
                        <AppText size="base" weight="medium">
                            {currentTask.leadName || 'No lead assigned'}
                        </AppText>
                    </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.detailRow}>
                    <View style={styles.detailIcon}>
                        <Icon name="calendar" size={ms(20)} color={Colors.primary} />
                    </View>
                    <View style={styles.detailContent}>
                        <AppText size="xs" color={Colors.textMuted}>
                            Due Date
                        </AppText>
                        <AppText size="base" weight="medium">
                            {currentTask.dueDate ? formatDate(currentTask.dueDate, 'long') : 'No due date'}
                        </AppText>
                    </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.detailRow}>
                    <View style={styles.detailIcon}>
                        <Icon name="clock-outline" size={ms(20)} color={Colors.primary} />
                    </View>
                    <View style={styles.detailContent}>
                        <AppText size="xs" color={Colors.textMuted}>
                            Created
                        </AppText>
                        <AppText size="base" weight="medium">
                            {currentTask.createdAt ? formatDate(currentTask.createdAt, 'datetime') : 'Unknown'}
                        </AppText>
                    </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.detailRow}>
                    <View style={styles.detailIcon}>
                        <Icon name="information-outline" size={ms(20)} color={Colors.primary} />
                    </View>
                    <View style={styles.detailContent}>
                        <AppText size="xs" color={Colors.textMuted}>
                            Status
                        </AppText>
                        <View style={[
                            styles.statusBadge,
                            { backgroundColor: isCompleted ? Colors.successLight : Colors.warningLight }
                        ]}>
                            <AppText size="sm" weight="semiBold" color={isCompleted ? Colors.success : Colors.warning}>
                                {isCompleted ? 'Completed' : currentTask.status?.replace('_', ' ').toUpperCase()}
                            </AppText>
                        </View>
                    </View>
                </View>
            </View>
        </View>
    );

    const renderActions = () => (
        <View style={styles.actionsContainer}>
            <AppButton
                title="Edit Task"
                variant="primary"
                icon="pencil"
                onPress={() => { }}
                style={styles.editButton}
            />
            <AppButton
                title="Delete"
                variant="outline"
                icon="delete"
                onPress={handleDelete}
                style={styles.deleteButton}
                textStyle={{ color: Colors.error }}
            />
        </View>
    );

    return (
        <ScreenWrapper withPadding backgroundColor={Colors.background}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {renderHeader()}
                {renderTaskCard()}
                {renderDetails()}
                {renderActions()}
                <View style={styles.bottomSpacer} />
            </ScrollView>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: vs(16),
    },
    backButton: {
        width: ms(44),
        height: ms(44),
        borderRadius: BorderRadius.round,
        backgroundColor: Colors.white,
        justifyContent: 'center',
        alignItems: 'center',
        ...Shadow.sm,
    },
    headerButton: {
        width: ms(44),
        height: ms(44),
        borderRadius: BorderRadius.round,
        backgroundColor: Colors.white,
        justifyContent: 'center',
        alignItems: 'center',
        ...Shadow.sm,
    },
    taskCard: {
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.card,
        padding: Spacing.lg,
        marginBottom: vs(24),
        ...Shadow.md,
    },
    taskHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    typeIcon: {
        width: ms(48),
        height: ms(48),
        borderRadius: BorderRadius.md,
        justifyContent: 'center',
        alignItems: 'center',
    },
    priorityBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.sm,
        paddingVertical: 6,
        borderRadius: BorderRadius.round,
    },
    priorityText: {
        marginLeft: 4,
    },
    taskTitle: {
        marginBottom: Spacing.sm,
    },
    taskDescription: {
        marginBottom: Spacing.lg,
    },
    completeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: vs(14),
        borderRadius: BorderRadius.button,
        borderWidth: 2,
        borderColor: Colors.success,
    },
    completeButtonActive: {
        backgroundColor: Colors.success,
        borderColor: Colors.success,
    },
    completeText: {
        marginLeft: Spacing.sm,
    },
    section: {
        marginBottom: vs(24),
    },
    sectionTitle: {
        marginBottom: Spacing.md,
    },
    detailsCard: {
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.card,
        padding: Spacing.md,
        ...Shadow.sm,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: Spacing.sm,
    },
    detailIcon: {
        width: ms(40),
        height: ms(40),
        borderRadius: BorderRadius.sm,
        backgroundColor: Colors.primaryBackground,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.md,
    },
    detailContent: {
        flex: 1,
    },
    divider: {
        height: 1,
        backgroundColor: Colors.borderLight,
    },
    statusBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: Spacing.sm,
        paddingVertical: 4,
        borderRadius: BorderRadius.badge,
        marginTop: 4,
    },
    actionsContainer: {
        flexDirection: 'row',
        gap: Spacing.md,
    },
    editButton: {
        flex: 2,
    },
    deleteButton: {
        flex: 1,
        borderColor: Colors.error,
    },
    bottomSpacer: {
        height: vs(40),
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default TaskDetailsScreen;
