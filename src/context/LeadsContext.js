/**
 * LeadsContext - Global Leads State Management
 * Manages leads data and operations across the app
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import { generateId } from '../utils/Helpers';

// Dummy initial leads data
const INITIAL_LEADS = [
    { id: '1', name: 'John Smith', company: 'Tech Corp', email: 'john@techcorp.com', phone: '+1 234 567 8901', status: 'hot', value: 15000, source: 'Website', createdAt: new Date(Date.now() - 3600000) },
    { id: '2', name: 'Sarah Johnson', company: 'Design Studio', email: 'sarah@design.com', phone: '+1 234 567 8902', status: 'warm', value: 8500, source: 'Referral', createdAt: new Date(Date.now() - 7200000) },
    { id: '3', name: 'Mike Chen', company: 'StartUp Inc', email: 'mike@startup.com', phone: '+1 234 567 8903', status: 'cold', value: 5000, source: 'LinkedIn', createdAt: new Date(Date.now() - 86400000) },
    { id: '4', name: 'Emily Davis', company: 'Creative Agency', email: 'emily@creative.com', phone: '+1 234 567 8904', status: 'hot', value: 22000, source: 'Website', createdAt: new Date(Date.now() - 172800000) },
    { id: '5', name: 'Robert Wilson', company: 'Consulting Co', email: 'robert@consulting.com', phone: '+1 234 567 8905', status: 'warm', value: 12000, source: 'Event', createdAt: new Date(Date.now() - 259200000) },
];

// Create the context
const LeadsContext = createContext(null);

/**
 * LeadsProvider Component
 */
export const LeadsProvider = ({ children }) => {
    const [leads, setLeads] = useState(INITIAL_LEADS);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedLead, setSelectedLead] = useState(null);

    /**
     * Get all leads
     */
    const getLeads = useCallback(() => {
        return leads;
    }, [leads]);

    /**
     * Get lead by ID
     */
    const getLeadById = useCallback((id) => {
        return leads.find(lead => lead.id === id);
    }, [leads]);

    /**
     * Add a new lead
     */
    const addLead = useCallback(async (leadData) => {
        try {
            setIsLoading(true);
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 500));

            const newLead = {
                id: generateId(),
                ...leadData,
                value: parseFloat(leadData.value) || 0,
                createdAt: new Date(),
            };

            setLeads(prev => [newLead, ...prev]);
            return { success: true, lead: newLead };
        } catch (error) {
            console.error('Error adding lead:', error);
            return { success: false, error: 'Failed to add lead' };
        } finally {
            setIsLoading(false);
        }
    }, []);

    /**
     * Update an existing lead
     */
    const updateLead = useCallback(async (id, updates) => {
        try {
            setIsLoading(true);
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 500));

            setLeads(prev => prev.map(lead =>
                lead.id === id ? { ...lead, ...updates, updatedAt: new Date() } : lead
            ));

            return { success: true };
        } catch (error) {
            console.error('Error updating lead:', error);
            return { success: false, error: 'Failed to update lead' };
        } finally {
            setIsLoading(false);
        }
    }, []);

    /**
     * Delete a lead
     */
    const deleteLead = useCallback(async (id) => {
        try {
            setIsLoading(true);
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 500));

            setLeads(prev => prev.filter(lead => lead.id !== id));
            return { success: true };
        } catch (error) {
            console.error('Error deleting lead:', error);
            return { success: false, error: 'Failed to delete lead' };
        } finally {
            setIsLoading(false);
        }
    }, []);

    /**
     * Update lead status
     */
    const updateLeadStatus = useCallback(async (id, status) => {
        return await updateLead(id, { status });
    }, [updateLead]);

    /**
     * Get leads by status
     */
    const getLeadsByStatus = useCallback((status) => {
        if (status === 'all') return leads;
        return leads.filter(lead => lead.status === status);
    }, [leads]);

    /**
     * Search leads
     */
    const searchLeads = useCallback((query) => {
        const lowerQuery = query.toLowerCase();
        return leads.filter(lead =>
            lead.name.toLowerCase().includes(lowerQuery) ||
            lead.company.toLowerCase().includes(lowerQuery) ||
            lead.email.toLowerCase().includes(lowerQuery)
        );
    }, [leads]);

    /**
     * Get leads statistics
     */
    const getLeadsStats = useCallback(() => {
        const totalValue = leads.reduce((sum, lead) => sum + (lead.value || 0), 0);
        const hotLeads = leads.filter(l => l.status === 'hot').length;
        const warmLeads = leads.filter(l => l.status === 'warm').length;
        const coldLeads = leads.filter(l => l.status === 'cold').length;

        return {
            total: leads.length,
            totalValue,
            hot: hotLeads,
            warm: warmLeads,
            cold: coldLeads,
        };
    }, [leads]);

    const value = {
        // State
        leads,
        isLoading,
        selectedLead,
        setSelectedLead,

        // Methods
        getLeads,
        getLeadById,
        addLead,
        updateLead,
        deleteLead,
        updateLeadStatus,
        getLeadsByStatus,
        searchLeads,
        getLeadsStats,
    };

    return (
        <LeadsContext.Provider value={value}>
            {children}
        </LeadsContext.Provider>
    );
};

/**
 * useLeads Hook
 */
export const useLeads = () => {
    const context = useContext(LeadsContext);
    if (!context) {
        throw new Error('useLeads must be used within a LeadsProvider');
    }
    return context;
};

export default LeadsContext;
