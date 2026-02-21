/**
 * Add Task Screen
 * Form to create a new task — UI matched to Expo AddTaskScreen
 */

import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Keyboard,
    Alert,
} from 'react-native';
import IonIcon from 'react-native-vector-icons/Ionicons';
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

// Task types — matching Expo AddTaskScreen
const TASK_TYPES = [
    { id: 'Call', icon: 'call', color: '#4D8733', bg: '#EEF5E6' },
    { id: 'Email', icon: 'mail', color: '#3B82F6', bg: '#EFF6FF' },
    { id: 'Meeting', icon: 'calendar', color: '#8B5CF6', bg: '#F3F0FF' },
    { id: 'Document', icon: 'document-text', color: '#F59E0B', bg: '#FFFBEB' },
];

const TASK_PRIORITIES = [
    { id: 'Low', color: '#3B82F6', bg: '#EFF6FF' },
    { id: 'Medium', color: '#F59E0B', bg: '#FFFBEB' },
    { id: 'High', color: '#EF4444', bg: '#FEF2F2' },
];

const DUE_DATE_OPTIONS = [
    { id: 'today', label: 'Today', days: 0 },
    { id: 'tomorrow', label: 'Tomorrow', days: 1 },
    { id: 'in3days', label: 'In 3 Days', days: 3 },
    { id: 'inweek', label: 'In 1 Week', days: 7 },
];

const AddTaskScreen = ({ navigation }) => {
    const { addTask } = useTasks();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        type: 'Call',
        priority: 'Medium',
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
        const opt = DUE_DATE_OPTIONS.find(o => o.id === option);
        const days = opt ? opt.days : 0;
        return new Date(today.getTime() + 86400000 * days);
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.title.trim()) newErrors.title = 'Task title is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        Keyboard.dismiss();
        if (!validateForm()) return;
        setLoading(true);
        const taskData = { ...formData, dueDate: getDueDate(formData.dueOption) };
        const result = await addTask(taskData);
        setLoading(false);
        if (result.success) {
            Alert.alert('Success', 'Task created successfully!', [{ text: 'OK', onPress: () => navigation.goBack() }]);
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
                <IonIcon name="close" size={22} color={Colors.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>New Task</Text>
            <View style={{ width: ms(40) }} />
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
                {/* Task Type — Expo chip row */}
                <Text style={styles.sectionLabel}>TASK TYPE</Text>
                <View style={styles.typeRow}>
                    {TASK_TYPES.map((t) => {
                        const active = formData.type === t.id;
                        return (
                            <TouchableOpacity
                                key={t.id}
                                style={[
                                    styles.typeChip,
                                    active && { backgroundColor: t.bg, borderColor: t.color },
                                ]}
                                onPress={() => updateField('type', t.id)}
                            >
                                <View style={[styles.typeChipIcon, { backgroundColor: active ? t.color : Colors.background }]}>
                                    <IonIcon name={t.icon} size={18} color={active ? '#fff' : Colors.textTertiary} />
                                </View>
                                <Text style={[styles.typeChipText, active && { color: t.color, fontWeight: '700' }]}>
                                    {t.id}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {/* Task Details */}
                <Text style={styles.sectionLabel}>TASK DETAILS</Text>
                <View style={styles.sectionCard}>
                    <AppInput
                        label="Task Title"
                        placeholder="What needs to be done?"
                        value={formData.title}
                        onChangeText={(text) => updateField('title', text)}
                        leftIcon="clipboard-outline"
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
                        leftIcon="person-outline"
                    />
                </View>

                {/* Priority — Expo pill row */}
                <Text style={styles.sectionLabel}>PRIORITY</Text>
                <View style={styles.pillRow}>
                    {TASK_PRIORITIES.map((p) => {
                        const active = formData.priority === p.id;
                        return (
                            <TouchableOpacity
                                key={p.id}
                                style={[
                                    styles.pill,
                                    active && { backgroundColor: p.color, borderColor: p.color },
                                ]}
                                onPress={() => updateField('priority', p.id)}
                            >
                                <IonIcon name="flag" size={13} color={active ? '#fff' : p.color} />
                                <Text style={[styles.pillText, active && { color: '#fff' }]}>{p.id}</Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {/* Due Date — Expo pill row */}
                <Text style={styles.sectionLabel}>DUE DATE</Text>
                <View style={styles.pillRow}>
                    {DUE_DATE_OPTIONS.map((opt) => {
                        const active = formData.dueOption === opt.id;
                        return (
                            <TouchableOpacity
                                key={opt.id}
                                style={[
                                    styles.pill,
                                    active && { backgroundColor: Colors.primary, borderColor: Colors.primary },
                                ]}
                                onPress={() => updateField('dueOption', opt.id)}
                            >
                                <Text style={[styles.pillText, active && { color: '#fff' }]}>{opt.label}</Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {/* Selected date indicator */}
                <View style={styles.selectedDateContainer}>
                    <IonIcon name="calendar" size={ms(18)} color={Colors.primary} />
                    <Text style={styles.selectedDate}>
                        Due: {formatDate(getDueDate(formData.dueOption), 'long')}
                    </Text>
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
    // Header — matching Expo AddTaskScreen
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: vs(16),
    },
    backButton: {
        width: ms(40),
        height: ms(40),
        borderRadius: ms(20),
        backgroundColor: Colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
        ...Shadow.sm,
    },
    headerTitle: {
        fontSize: ms(20),
        fontWeight: '700',
        color: Colors.textPrimary,
    },

    formContainer: {
        flex: 1,
    },

    // Section labels — uppercase Expo style
    sectionLabel: {
        fontSize: ms(11),
        fontWeight: '700',
        color: Colors.textTertiary,
        letterSpacing: 0.8,
        marginTop: Spacing.xl,
        marginBottom: Spacing.sm,
        paddingLeft: 2,
    },
    sectionCard: {
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.lg,
        overflow: 'hidden',
        padding: Spacing.md,
        ...Shadow.sm,
    },

    // Task type chips — matching Expo
    typeRow: {
        flexDirection: 'row',
        gap: Spacing.sm,
    },
    typeChip: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: vs(14),
        borderRadius: BorderRadius.md,
        borderWidth: 1.5,
        borderColor: Colors.surfaceBorder,
        backgroundColor: Colors.surface,
    },
    typeChipIcon: {
        width: ms(36),
        height: ms(36),
        borderRadius: ms(18),
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.xs,
    },
    typeChipText: {
        fontSize: ms(12),
        fontWeight: '600',
        color: Colors.textSecondary,
    },

    // Pill row — matching Expo
    pillRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.sm,
    },
    pill: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: ms(14),
        paddingVertical: ms(10),
        borderRadius: BorderRadius.round,
        backgroundColor: Colors.surface,
        borderWidth: 1.5,
        borderColor: Colors.surfaceBorder,
        gap: 5,
    },
    pillText: {
        fontSize: ms(13),
        fontWeight: '600',
        color: Colors.textSecondary,
    },

    // Selected date
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
        fontSize: ms(13),
        fontWeight: '600',
        color: Colors.primary,
    },

    saveButton: {
        marginTop: Spacing.xl,
    },
    bottomSpacer: {
        height: vs(40),
    },
});

export default AddTaskScreen;
