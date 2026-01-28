/**
 * TasksContext - Global Tasks State Management
 * Manages tasks data and operations across the app
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import { generateId } from '../utils/Helpers';

// Dummy initial tasks data
const INITIAL_TASKS = [
    { id: '1', title: 'Follow up with John Smith', description: 'Discuss proposal details', type: 'call', priority: 'high', status: 'pending', dueDate: new Date(), leadId: '1', leadName: 'John Smith', createdAt: new Date(Date.now() - 3600000) },
    { id: '2', title: 'Send proposal to Sarah', description: 'Include pricing options', type: 'email', priority: 'medium', status: 'pending', dueDate: new Date(Date.now() + 86400000), leadId: '2', leadName: 'Sarah Johnson', createdAt: new Date(Date.now() - 7200000) },
    { id: '3', title: 'Schedule demo with Mike', description: 'Product demonstration', type: 'meeting', priority: 'low', status: 'pending', dueDate: new Date(Date.now() + 172800000), leadId: '3', leadName: 'Mike Chen', createdAt: new Date(Date.now() - 86400000) },
    { id: '4', title: 'Prepare contract for Emily', description: 'Final agreement', type: 'document', priority: 'high', status: 'in_progress', dueDate: new Date(Date.now() + 259200000), leadId: '4', leadName: 'Emily Davis', createdAt: new Date(Date.now() - 172800000) },
    { id: '5', title: 'Review requirements', description: 'Client requirements analysis', type: 'review', priority: 'medium', status: 'completed', dueDate: new Date(Date.now() - 86400000), leadId: '5', leadName: 'Robert Wilson', createdAt: new Date(Date.now() - 259200000) },
];

// Create the context
const TasksContext = createContext(null);

/**
 * TasksProvider Component
 */
export const TasksProvider = ({ children }) => {
    const [tasks, setTasks] = useState(INITIAL_TASKS);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);

    /**
     * Get all tasks
     */
    const getTasks = useCallback(() => {
        return tasks;
    }, [tasks]);

    /**
     * Get task by ID
     */
    const getTaskById = useCallback((id) => {
        return tasks.find(task => task.id === id);
    }, [tasks]);

    /**
     * Add a new task
     */
    const addTask = useCallback(async (taskData) => {
        try {
            setIsLoading(true);
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 500));

            const newTask = {
                id: generateId(),
                ...taskData,
                status: 'pending',
                createdAt: new Date(),
            };

            setTasks(prev => [newTask, ...prev]);
            return { success: true, task: newTask };
        } catch (error) {
            console.error('Error adding task:', error);
            return { success: false, error: 'Failed to add task' };
        } finally {
            setIsLoading(false);
        }
    }, []);

    /**
     * Update an existing task
     */
    const updateTask = useCallback(async (id, updates) => {
        try {
            setIsLoading(true);
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 500));

            setTasks(prev => prev.map(task =>
                task.id === id ? { ...task, ...updates, updatedAt: new Date() } : task
            ));

            return { success: true };
        } catch (error) {
            console.error('Error updating task:', error);
            return { success: false, error: 'Failed to update task' };
        } finally {
            setIsLoading(false);
        }
    }, []);

    /**
     * Delete a task
     */
    const deleteTask = useCallback(async (id) => {
        try {
            setIsLoading(true);
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 500));

            setTasks(prev => prev.filter(task => task.id !== id));
            return { success: true };
        } catch (error) {
            console.error('Error deleting task:', error);
            return { success: false, error: 'Failed to delete task' };
        } finally {
            setIsLoading(false);
        }
    }, []);

    /**
     * Toggle task completion status
     */
    const toggleTaskStatus = useCallback(async (id) => {
        const task = tasks.find(t => t.id === id);
        if (!task) return { success: false, error: 'Task not found' };

        const newStatus = task.status === 'completed' ? 'pending' : 'completed';
        return await updateTask(id, {
            status: newStatus,
            completedAt: newStatus === 'completed' ? new Date() : null,
        });
    }, [tasks, updateTask]);

    /**
     * Get tasks by status
     */
    const getTasksByStatus = useCallback((status) => {
        if (status === 'all') return tasks;
        return tasks.filter(task => task.status === status);
    }, [tasks]);

    /**
     * Get tasks by priority
     */
    const getTasksByPriority = useCallback((priority) => {
        return tasks.filter(task => task.priority === priority);
    }, [tasks]);

    /**
     * Get tasks for a specific lead
     */
    const getTasksByLead = useCallback((leadId) => {
        return tasks.filter(task => task.leadId === leadId);
    }, [tasks]);

    /**
     * Get overdue tasks
     */
    const getOverdueTasks = useCallback(() => {
        const now = new Date();
        return tasks.filter(task =>
            task.status !== 'completed' &&
            new Date(task.dueDate) < now
        );
    }, [tasks]);

    /**
     * Get today's tasks
     */
    const getTodaysTasks = useCallback(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        return tasks.filter(task => {
            const dueDate = new Date(task.dueDate);
            return dueDate >= today && dueDate < tomorrow;
        });
    }, [tasks]);

    /**
     * Get tasks statistics
     */
    const getTasksStats = useCallback(() => {
        const pending = tasks.filter(t => t.status === 'pending').length;
        const inProgress = tasks.filter(t => t.status === 'in_progress').length;
        const completed = tasks.filter(t => t.status === 'completed').length;
        const overdue = getOverdueTasks().length;

        return {
            total: tasks.length,
            pending,
            inProgress,
            completed,
            overdue,
        };
    }, [tasks, getOverdueTasks]);

    const value = {
        // State
        tasks,
        isLoading,
        selectedTask,
        setSelectedTask,

        // Methods
        getTasks,
        getTaskById,
        addTask,
        updateTask,
        deleteTask,
        toggleTaskStatus,
        getTasksByStatus,
        getTasksByPriority,
        getTasksByLead,
        getOverdueTasks,
        getTodaysTasks,
        getTasksStats,
    };

    return (
        <TasksContext.Provider value={value}>
            {children}
        </TasksContext.Provider>
    );
};

/**
 * useTasks Hook
 */
export const useTasks = () => {
    const context = useContext(TasksContext);
    if (!context) {
        throw new Error('useTasks must be used within a TasksProvider');
    }
    return context;
};

export default TasksContext;
