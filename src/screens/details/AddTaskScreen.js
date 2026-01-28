/**
 * Add Task Screen
 * Form to create a new task
 */

import React, { useState, useRef } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    Keyboard,
    Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors } from '../../constants/Colors';
import { Spacing, BorderRadius, Shadow } from '../../constants/Spacing';
import { ms, vs } from '../../utils/Responsive';
import { formatDate } from '../../utils/Helpers';
import { useTasks } from '../../context';
import {
    ScreenWrapper,
    AppText,
    AppButton,
    AppInput,
    ModalLoader,
} from '../../components';

const TASK_TYPES = [
    { id: 'call', label: 'Call', icon: 'phone', color: Colors.success },
    { id: 'email', label: 'Email', icon: 'email', color: Colors.info },
    { id: 'meeting', label: 'Meeting', icon: 'calendar', color: Colors.primary },
    { id: 'document', label: 'Document', icon: 'file-document', color: Colors.accent },
];

const TASK_PRIORITIES = [
    { id: 'low', label: 'Low', color: Colors.success },
    { id: 'medium', label: 'Medium', color: Colors.warning },
    { id: 'high', label: 'High', color: Colors.error },
];

const DUE_DATE_OPTIONS = [
    { id: 'today', label: 'Today' },
    { id: 'tomorrow', label: 'Tomorrow' },
    { id: 'in_3_days', label: 'In 3 Days' },
    { id: 'in_1_week', label: 'In 1 Week' },
];

const AddTaskScreen = ({ navigation }) => {
    const { addTask } = useTasks();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        type: 'call',
        priority: 'medium',
        dueOption: 'today',
        leadName: '',
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const descriptionRef = useRef(null);
    const leadRef = useRef(null);

    const updateField = (field, value) => {
        setFormData({ ...formData, [field]: value });
        if (errors[field]) {
            setErrors({ ...errors, [field]: null });
        }
    };

    const getDueDate = (option) => {
        const today = new Date();
        switch (option) {
            case 'today':
                return today;
            case 'tomorrow':
                return new Date(today.getTime() + 86400000);
            case 'in_3_days':
                return new Date(today.getTime() + 86400000 * 3);
            case 'in_1_week':
                return new Date(today.getTime() + 86400000 * 7);
            default:
                return today;
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.title.trim()) {
            newErrors.title = 'Task title is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        Keyboard.dismiss();

        if (!validateForm()) return;

        setLoading(true);

        const taskData = {
            ...formData,
            dueDate: getDueDate(formData.dueOption),
        };

        const result = await addTask(taskData);

        setLoading(false);

        if (result.success) {
            Alert.alert(
                'Success',
                'Task created successfully!',
                [{ text: 'OK', onPress: () => navigation.goBack() }]
            );
        } else {
            Alert.alert('Error', result.error || 'Failed to create task');
        }
    };

    const renderHeader = () => (
        <View style={styles.header}>
            <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
            >
                <Icon name="close" size={ms(24)} color={Colors.textPrimary} />
            </TouchableOpacity>
            <AppText size="lg" weight="semiBold">
                Add New Task
            </AppText>
            <View style={styles.placeholder} />
        </View>
    );

    return (
        <ScreenWrapper
            withScrollView
            withPadding
            backgroundColor={Colors.background}
        >
            {renderHeader()}

            <View style={styles.formContainer}>
                {/* Task Type */}
                <View style={styles.section}>
                    <AppText size="base" weight="semiBold" style={styles.sectionTitle}>
                        Task Type
                    </AppText>
                    <View style={styles.typeContainer}>
                        {TASK_TYPES.map((type) => (
                            <TouchableOpacity
                                key={type.id}
                                style={[
                                    styles.typeCard,
                                    formData.type === type.id && {
                                        borderColor: type.color,
                                        backgroundColor: type.color + '15',
                                    },
                                ]}
                                onPress={() => updateField('type', type.id)}
                            >
                                <View style={[
                                    styles.typeIcon,
                                    { backgroundColor: formData.type === type.id ? type.color : Colors.border }
                                ]}>
                                    <Icon
                                        name={type.icon}
                                        size={ms(20)}
                                        color={Colors.white}
                                    />
                                </View>
                                <AppText
                                    size="sm"
                                    weight={formData.type === type.id ? 'semiBold' : 'regular'}
                                    color={formData.type === type.id ? type.color : Colors.textSecondary}
                                >
                                    {type.label}
                                </AppText>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Task Details */}
                <View style={styles.section}>
                    <AppText size="base" weight="semiBold" style={styles.sectionTitle}>
                        Task Details
                    </AppText>

                    <AppInput
                        label="Task Title"
                        placeholder="What needs to be done?"
                        value={formData.title}
                        onChangeText={(text) => updateField('title', text)}
                        leftIcon="clipboard-text-outline"
                        error={!!errors.title}
                        errorMessage={errors.title}
                        returnKeyType="next"
                        onSubmitEditing={() => descriptionRef.current?.focus()}
                        required
                    />

                    <AppInput
                        ref={descriptionRef}
                        label="Description"
                        placeholder="Add more details..."
                        value={formData.description}
                        onChangeText={(text) => updateField('description', text)}
                        multiline
                        numberOfLines={3}
                    />

                    <AppInput
                        ref={leadRef}
                        label="Related Lead"
                        placeholder="Enter lead name (optional)"
                        value={formData.leadName}
                        onChangeText={(text) => updateField('leadName', text)}
                        leftIcon="account-outline"
                    />
                </View>

                {/* Priority */}
                <View style={styles.section}>
                    <AppText size="base" weight="semiBold" style={styles.sectionTitle}>
                        Priority
                    </AppText>
                    <View style={styles.priorityContainer}>
                        {TASK_PRIORITIES.map((priority) => (
                            <TouchableOpacity
                                key={priority.id}
                                style={[
                                    styles.priorityButton,
                                    formData.priority === priority.id && { backgroundColor: priority.color },
                                ]}
                                onPress={() => updateField('priority', priority.id)}
                            >
                                <Icon
                                    name="flag"
                                    size={ms(16)}
                                    color={formData.priority === priority.id ? Colors.white : priority.color}
                                />
                                <AppText
                                    size="sm"
                                    weight="semiBold"
                                    color={formData.priority === priority.id ? Colors.white : priority.color}
                                    style={styles.priorityLabel}
                                >
                                    {priority.label}
                                </AppText>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Due Date */}
                <View style={styles.section}>
                    <AppText size="base" weight="semiBold" style={styles.sectionTitle}>
                        Due Date
                    </AppText>
                    <View style={styles.dueDateContainer}>
                        {DUE_DATE_OPTIONS.map((option) => (
                            <TouchableOpacity
                                key={option.id}
                                style={[
                                    styles.dueDateButton,
                                    formData.dueOption === option.id && styles.dueDateButtonActive,
                                ]}
                                onPress={() => updateField('dueOption', option.id)}
                            >
                                <AppText
                                    size="sm"
                                    weight={formData.dueOption === option.id ? 'semiBold' : 'regular'}
                                    color={formData.dueOption === option.id ? Colors.white : Colors.textSecondary}
                                >
                                    {option.label}
                                </AppText>
                            </TouchableOpacity>
                        ))}
                    </View>
                    <View style={styles.selectedDateContainer}>
                        <Icon name="calendar-check" size={ms(18)} color={Colors.primary} />
                        <AppText size="sm" color={Colors.primary} style={styles.selectedDate}>
                            Due: {formatDate(getDueDate(formData.dueOption), 'long')}
                        </AppText>
                    </View>
                </View>

                {/* Save Button */}
                <AppButton
                    title="Create Task"
                    onPress={handleSave}
                    loading={loading}
                    icon="check"
                    style={styles.saveButton}
                />
            </View>

            <View style={styles.bottomSpacer} />
            <ModalLoader visible={loading} text="Creating task..." />
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: vs(24),
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
    placeholder: {
        width: ms(44),
    },
    formContainer: {
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.card,
        padding: Spacing.lg,
        ...Shadow.sm,
    },
    section: {
        marginBottom: vs(24),
    },
    sectionTitle: {
        marginBottom: Spacing.md,
    },
    typeContainer: {
        flexDirection: 'row',
        gap: Spacing.sm,
    },
    typeCard: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: vs(14),
        borderRadius: BorderRadius.md,
        borderWidth: 1.5,
        borderColor: Colors.border,
        backgroundColor: Colors.background,
    },
    typeIcon: {
        width: ms(40),
        height: ms(40),
        borderRadius: BorderRadius.round,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.xs,
    },
    priorityContainer: {
        flexDirection: 'row',
        gap: Spacing.sm,
    },
    priorityButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: vs(12),
        borderRadius: BorderRadius.button,
        borderWidth: 1.5,
        borderColor: Colors.border,
        backgroundColor: Colors.background,
    },
    priorityLabel: {
        marginLeft: Spacing.xs,
    },
    dueDateContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.sm,
    },
    dueDateButton: {
        paddingHorizontal: Spacing.md,
        paddingVertical: vs(10),
        borderRadius: BorderRadius.round,
        borderWidth: 1.5,
        borderColor: Colors.border,
        backgroundColor: Colors.background,
    },
    dueDateButtonActive: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
    },
    selectedDateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: Spacing.md,
        padding: Spacing.md,
        backgroundColor: Colors.primaryBackground,
        borderRadius: BorderRadius.sm,
    },
    selectedDate: {
        marginLeft: Spacing.sm,
    },
    saveButton: {
        marginTop: Spacing.md,
    },
    bottomSpacer: {
        height: vs(40),
    },
});

export default AddTaskScreen;
