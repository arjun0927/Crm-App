/**
 * Contacts Screen
 * Screen for managing contacts with API integration
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    View,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    LayoutAnimation,
    Platform,
    UIManager,
    TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors } from '../../constants/Colors';
import { Spacing, BorderRadius, Shadow } from '../../constants/Spacing';
import { ms, vs, wp } from '../../utils/Responsive';
import { AppText, AppButton } from '../../components';
import { useAuth } from '../../context';
import { contactsAPI } from '../../api';
import { showError } from '../../utils';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const LIMIT = 50;

// Contact Card Component with expandable section
const ContactCard = ({ contact, onPress, onEdit, onDelete }) => {
    const [expanded, setExpanded] = useState(false);

    const toggleExpand = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpanded(!expanded);
    };

    // Helper to get value or N/A
    const getValue = (value) => {
        if (value === undefined || value === null || value === '') {
            return 'N/A';
        }
        return value;
    };

    // Helper to format location
    const formatLocation = () => {
        const parts = [contact.city, contact.state, contact.country].filter(Boolean);
        return parts.length > 0 ? parts.join(', ') : 'N/A';
    };

    // Format date helper
    const formatDateValue = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });
        } catch {
            return 'N/A';
        }
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

    // Get display name for contact
    const getDisplayName = () => {
        const firstName = contact.firstName || contact.first_name || '';
        const lastName = contact.lastName || contact.last_name || '';
        const fullName = `${firstName} ${lastName}`.trim();
        return fullName || contact.name || contact.email || 'Unknown Contact';
    };

    return (
        <View style={styles.contactCard}>
            {/* Card Header */}
            <View style={styles.cardHeader}>
                <TouchableOpacity
                    style={styles.cardHeaderContent}
                    onPress={onPress}
                    activeOpacity={0.7}
                >
                    <View style={styles.iconContainer}>
                        <Icon name="account" size={ms(20)} color={Colors.primary} />
                    </View>
                    <View style={styles.contactTitleContainer}>
                        <AppText size="base" weight="bold" numberOfLines={1}>
                            {getDisplayName()}
                        </AppText>
                    </View>
                </TouchableOpacity>

                {/* Edit & Delete Icons */}
                <View style={styles.headerActions}>
                    <TouchableOpacity
                        style={styles.actionIconButton}
                        onPress={() => onEdit?.(contact)}
                        activeOpacity={0.7}
                    >
                        <Icon name="pencil" size={ms(18)} color={Colors.info} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.actionIconButton}
                        onPress={() => onDelete?.(contact)}
                        activeOpacity={0.7}
                    >
                        <Icon name="delete" size={ms(18)} color={Colors.error} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Card Body - Main Fields in Key-Value Layout */}
            <TouchableOpacity
                style={styles.cardBody}
                onPress={onPress}
                activeOpacity={0.8}
            >
                <KeyValueRow label="Email" value={getValue(contact.email)} valueColor={contact.email ? Colors.info : Colors.textSecondary} />
                <KeyValueRow label="Phone" value={getValue(contact.phone || contact.mobile)} />
                <KeyValueRow label="Company" value={getValue(contact.company || contact.companyName)} />
                <KeyValueRow label="Designation" value={getValue(contact.designation || contact.title)} isLast />
            </TouchableOpacity>

            {/* Expandable Content */}
            {expanded && (
                <View style={styles.expandedContent}>
                    <KeyValueRow label="Location" value={formatLocation()} />
                    <KeyValueRow label="Address" value={getValue(contact.address)} />
                    <KeyValueRow
                        label="Website"
                        value={getValue(contact.website)}
                        valueColor={contact.website ? Colors.info : Colors.textSecondary}
                    />
                    <KeyValueRow label="Source" value={getValue(contact.source)} />
                    <KeyValueRow label="Status" value={getValue(contact.status)} />
                    <KeyValueRow label="Created At" value={formatDateValue(contact.createdAt)} />
                    <KeyValueRow label="Updated At" value={formatDateValue(contact.updatedAt)} isLast />
                </View>
            )}

            {/* Expandable Section Toggle */}
            <TouchableOpacity
                style={styles.expandToggle}
                onPress={toggleExpand}
                activeOpacity={0.7}
            >
                <AppText size="sm" weight="medium" color={Colors.primary}>
                    {expanded ? 'View Less' : 'View More'}
                </AppText>
                <Icon
                    name={expanded ? 'chevron-up' : 'chevron-down'}
                    size={ms(18)}
                    color={Colors.primary}
                />
            </TouchableOpacity>
        </View>
    );
};

const ContactsScreen = ({ navigation }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [contacts, setContacts] = useState([]);
    const { user } = useAuth();
    const searchTimeoutRef = useRef(null);
    const currentSearchRef = useRef('');
    const isInitialLoadRef = useRef(true);

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

        // If search query is empty, fetch all contacts immediately
        if (!searchQuery.trim()) {
            fetchContacts(1, false, '');
            return;
        }

        // Debounce the search API call (300ms)
        searchTimeoutRef.current = setTimeout(() => {
            fetchContacts(1, false, searchQuery.trim());
        }, 300);

        // Cleanup timeout on unmount or query change
        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, [searchQuery]);

    // Fetch contacts on mount (initial load only)
    useEffect(() => {
        fetchContacts(1, true, '');
        isInitialLoadRef.current = false;
    }, []);

    const fetchContacts = async (pageNum = 1, showLoader = false, search = '') => {
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

            const response = await contactsAPI.getAll(params);

            console.log('Contacts API Response:', response, 'Search:', search);

            // Check if this response is still relevant (search query hasn't changed)
            if (search !== currentSearchRef.current && search !== '') {
                console.log('Search query changed, discarding stale response');
                return;
            }

            if (response.success) {
                const contactsData = response.data?.data || response.data?.contacts || response.data || [];
                const newContacts = Array.isArray(contactsData) ? contactsData : [];

                if (pageNum === 1) {
                    setContacts(newContacts);
                } else {
                    setContacts(prev => [...prev, ...newContacts]);
                }

                // Check if there are more pages
                setHasMore(newContacts.length === LIMIT);
                setPage(pageNum);
            } else {
                console.error('Failed to fetch contacts:', response.error);
                showError('Error', response.error || 'Failed to load contacts');
            }
        } catch (error) {
            console.error('Error fetching contacts:', error);
            showError('Error', 'Failed to load contacts');
        } finally {
            setLoading(false);
            setLoadingMore(false);
            setRefreshing(false);
        }
    };

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        setHasMore(true);
        fetchContacts(1, false, searchQuery.trim());
    }, [searchQuery]);

    const loadMore = useCallback(() => {
        if (!loadingMore && hasMore && !loading) {
            fetchContacts(page + 1, false, searchQuery.trim());
        }
    }, [loadingMore, hasMore, loading, page, searchQuery]);

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
                    <Icon name="account-circle" size={ms(24)} color={Colors.textPrimary} />
                </TouchableOpacity>
            </View>
        </View>
    );

    // Search Bar Component
    const renderSearchBar = () => (
        <View style={styles.searchContainer}>
            <Icon name="magnify" size={ms(20)} color={Colors.textMuted} style={styles.searchIcon} />
            <TextInput
                style={styles.searchInput}
                placeholder="Search contacts..."
                placeholderTextColor={Colors.textMuted}
                value={searchQuery}
                onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                    <Icon name="close-circle" size={ms(18)} color={Colors.textMuted} />
                </TouchableOpacity>
            )}
        </View>
    );

    const renderSectionHeader = () => (
        <View style={styles.sectionHeader}>
            <View>
                <AppText size="lg" weight="semiBold">
                    Contacts
                </AppText>
                <AppText size="xs" color={Colors.textMuted}>
                    {contacts.length} {searchQuery ? 'found' : 'contacts'}
                </AppText>
            </View>
            <AppButton
                title="Add Contact"
                onPress={() => console.log('Add Contact')}
                fullWidth={false}
                size="small"
                icon="plus"
                style={styles.addButton}
            />
        </View>
    );

    const handleEditContact = (contact) => {
        console.log('Edit contact:', contact._id);
        // TODO: Navigate to edit contact screen
        // navigation.navigate('EditContact', { contact });
    };

    const handleDeleteContact = (contact) => {
        console.log('Delete contact:', contact._id);
        // TODO: Implement delete confirmation
    };

    const renderContactCard = ({ item: contact }) => (
        <ContactCard
            contact={contact}
            onPress={() => console.log('Contact details:', contact._id)}
            onEdit={handleEditContact}
            onDelete={handleDeleteContact}
        />
    );

    const renderFooter = () => {
        if (!loadingMore) return null;

        return (
            <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color={Colors.primary} />
                <AppText size="sm" color={Colors.textMuted} style={styles.footerText}>
                    Loading more contacts...
                </AppText>
            </View>
        );
    };

    const renderEmpty = () => {
        if (loading) return null;

        return (
            <View style={styles.emptyState}>
                <Icon name="account-multiple" size={ms(60)} color={Colors.textMuted} />
                <AppText size="lg" weight="semiBold" color={Colors.textSecondary} style={styles.emptyTitle}>
                    No Contacts Found
                </AppText>
                <AppText size="sm" color={Colors.textMuted} style={styles.emptySubtitle}>
                    {searchQuery ? 'Try adjusting your search' : 'Start by adding your first contact'}
                </AppText>
                <AppButton
                    title="Add Contact"
                    onPress={() => console.log('Add Contact')}
                    icon="plus"
                    style={styles.emptyButton}
                />
            </View>
        );
    };

    const renderListHeader = () => (
        <View style={styles.listHeader}>
            {renderHeader()}
            {renderSearchBar()}
            {renderSectionHeader()}
        </View>
    );

    if (loading) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <View style={styles.loadingHeaderContainer}>
                    {renderHeader()}
                </View>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                    <AppText size="base" color={Colors.textMuted} style={styles.loadingText}>
                        Loading contacts...
                    </AppText>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.headerContainer}>
                {renderListHeader()}
            </View>
            <FlatList
                data={contacts}
                keyExtractor={(item) => item._id || item.id || String(Math.random())}
                renderItem={renderContactCard}
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
        paddingTop: vs(5),
        paddingBottom: vs(20),
    },
    listHeader: {
        marginBottom: vs(16),
    },
    loadingHeaderContainer: {
        paddingHorizontal: wp(4),
    },
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
    notificationBadge: {
        position: 'absolute',
        top: ms(8),
        right: ms(8),
        width: ms(16),
        height: ms(16),
        borderRadius: ms(8),
        backgroundColor: Colors.error,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    addButton: {
        paddingHorizontal: Spacing.md,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: Spacing.md,
    },

    // Contact Card Styles
    contactCard: {
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.lg,
        marginBottom: vs(12),
        ...Shadow.md,
        overflow: 'hidden',
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.md,
        backgroundColor: Colors.background,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    cardHeaderContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    iconContainer: {
        marginRight: ms(10),
    },
    contactTitleContainer: {
        flex: 1,
    },
    actionIconButton: {
        width: ms(36),
        height: ms(36),
        borderRadius: BorderRadius.md,
        backgroundColor: Colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.border,
    },
    cardBody: {
        padding: Spacing.md,
    },

    // Key-Value Row Styles
    keyValueRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: vs(8),
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    keyValueRowLast: {
        borderBottomWidth: 0,
    },
    keyText: {
        flex: 0.4,
    },
    valueText: {
        flex: 0.6,
        textAlign: 'right',
    },

    // Expand Toggle Styles
    expandToggle: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: Spacing.sm,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
        backgroundColor: Colors.background,
        gap: Spacing.xs,
    },

    // Expanded Content Styles
    expandedContent: {
        paddingHorizontal: Spacing.md,
        paddingTop: Spacing.sm,
        backgroundColor: Colors.white,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
    },

    // Footer & Empty Styles
    footerLoader: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: vs(20),
    },
    footerText: {
        marginLeft: Spacing.sm,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
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

    // Search Bar Styles
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.lg,
        paddingHorizontal: Spacing.md,
        height: vs(48),
        marginBottom: vs(16),
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
});

export default ContactsScreen;
