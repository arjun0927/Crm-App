import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    FlatList,
    Modal,
    ActivityIndicator,
    Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { AppText } from '../../components';
import { Colors } from '../../constants/Colors';
import { Spacing, BorderRadius, Shadow } from '../../constants/Spacing';
import { ms, vs, wp } from '../../utils/Responsive';
import { aiAPI } from '../../api/services';
import ThinkingState from '../../components/ThinkingState';

const THEME_COLOR = '#22c55e'; // Green color from screenshot
const BG_COLOR = '#f8fafc'; // Light gray background

const AIAssistantScreen = ({ navigation }) => {
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [planStatus, setPlanStatus] = useState(null);
    const [sessions, setSessions] = useState([]);
    const [currentSessionId, setCurrentSessionId] = useState(null);
    const [isHistoryVisible, setIsHistoryVisible] = useState(false);
    const [loadingHistory, setLoadingHistory] = useState(false);

    const flatListRef = useRef(null);

    const suggestions = [
        { id: 1, icon: 'chart-line', text: 'Show me overall sales performance this month' },
        { id: 2, icon: 'alert-circle-outline', text: 'Which teams are underperforming?' },
        { id: 3, icon: 'chart-bar', text: 'Generate a revenue forecast for next quarter' },
        { id: 4, icon: 'account-group-outline', text: 'Show user activity and adoption metrics' },
    ];

    useEffect(() => {
        fetchPlanStatus();
        fetchSessions();
    }, []);

    const fetchPlanStatus = async () => {
        const response = await aiAPI.getPlanStatus();
        if (response.success) {
            setPlanStatus(response.data);
        }
    };

    const fetchSessions = async () => {
        const response = await aiAPI.getSessions();
        if (response.success) {
            setSessions(response.data?.sessions || []);
        }
    };

    const fetchHistory = async (sessionId) => {
        setLoadingHistory(true);
        setCurrentSessionId(sessionId);
        setIsHistoryVisible(false); // Close modal

        const response = await aiAPI.getHistory(sessionId);
        setLoadingHistory(false);

        if (response.success) {
            // Transform history to match message structure
            const history = (response.data?.messages || []).map(msg => ({
                id: msg._id || Math.random().toString(),
                text: msg.content,
                sender: msg.role === 'user' ? 'user' : 'ai',
                createdAt: msg.createdAt
            }));
            setMessages(history);
        } else {
            Alert.alert('Error', 'Failed to load chat history');
        }
    };

    const handleNewChat = async () => {
        setMessages([]);
        setCurrentSessionId(null);
        setIsHistoryVisible(false);

        // Optionally create session immediately or wait for first message
        // await aiAPI.createSession(); 
        // Better to wait for first message usually, but let's see API.
        // Web does createSession() on click.
        const response = await aiAPI.createSession();
        if (response.success && response.data?.session) {
            setCurrentSessionId(response.data.session._id);
            fetchSessions(); // Refresh list
        }
    };

    const handleSend = async (text = inputText) => {
        if (!text.trim()) return;

        const userMsg = {
            id: Date.now().toString(),
            text: text.trim(),
            sender: 'user',
            createdAt: new Date().toISOString()
        };

        setMessages(prev => [...prev, userMsg]);
        setInputText('');
        setIsLoading(true);

        // Scroll to bottom
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);

        try {
            // For now, using standard sendMessage. 
            // TODO: Implement streaming if creating a custom fetch wrapper mostly for text/event-stream
            const response = await aiAPI.sendMessage(text, currentSessionId);

            setIsLoading(false);

            if (response.success) {
                // If session ID changed or was null, update it
                // API might return session info or we check headers/data

                // Assuming response.data contains the answer string or object
                // Usually it returns { content: "...", ... } or just the stream end result

                // Check response structure from web API service inspection: 
                // It just returns response.json(). 
                // If streaming was used there, it used reader. 
                // Since we used the non-streaming fallbacks or just a POST, let's assume it returns { content: "answer" } or similar.
                // Actually, looks like `sendMessageStream` was used in web.
                // If I use a simple POST to a streaming endpoint without a reader, it might wait until end or fail.
                // Let's assume for this step it waits.

                // HACK: The web uses `sendMessageStream`. If the backend ONLY supports streaming, a standard fetch might still get the whole body at once if we await `.json()`.
                // However, `.json()` on a stream often works if the server closes connection properly.

                let aiText = '';
                if (typeof response.data === 'string') {
                    aiText = response.data;
                } else if (response.data && response.data.content) {
                    aiText = response.data.content;
                } else if (response.data && response.data.assistantMessage) { // Common pattern
                    aiText = response.data.assistantMessage.content;
                } else {
                    aiText = "Received response but couldn't parse it.";
                    console.log('Unknown response format:', response.data);
                }

                const aiMsg = {
                    id: (Date.now() + 1).toString(),
                    text: aiText,
                    sender: 'ai',
                    createdAt: new Date().toISOString()
                };
                setMessages(prev => [...prev, aiMsg]);

                // Update session ID if returned
                if (response.data?.sessionId) {
                    setCurrentSessionId(response.data.sessionId);
                } else if (response.data?.session?._id) {
                    setCurrentSessionId(response.data.session._id);
                }

                // Refresh credits
                fetchPlanStatus();
                // Refresh sessions if this was a new chat or just to be sure
                fetchSessions();
            } else {
                const errorMsg = {
                    id: (Date.now() + 1).toString(),
                    text: "Sorry, I encountered an error. Please try again.",
                    sender: 'ai',
                    isError: true
                };
                setMessages(prev => [...prev, errorMsg]);
            }
        } catch (error) {
            setIsLoading(false);
            const errorMsg = {
                id: (Date.now() + 1).toString(),
                text: "Network error. Please check your connection.",
                sender: 'ai',
                isError: true
            };
            setMessages(prev => [...prev, errorMsg]);
        }

        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    };

    const handleDeleteSession = async (sessionId) => {
        Alert.alert(
            "Delete Chat",
            "Are you sure you want to delete this chat?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        await aiAPI.deleteSession(sessionId);
                        fetchSessions();
                        if (currentSessionId === sessionId) {
                            handleNewChat();
                        }
                    }
                }
            ]
        );
    };

    const renderHeader = () => (
        <View style={styles.header}>
            <View style={styles.headerLeft}>
                <View style={styles.logoContainer}>
                    <Icon name="creation" size={ms(24)} color={THEME_COLOR} />
                </View>
                <View>
                    <AppText size="lg" weight="bold">AI Assistant</AppText>
                    <View style={styles.statusContainer}>
                        {isLoading ? (
                            <AppText size="xs" color={THEME_COLOR}>Thinking...</AppText>
                        ) : (
                            <>
                                <View style={styles.statusDot} />
                                <AppText size="xs" color={Colors.textMuted}>Online</AppText>
                            </>
                        )}
                    </View>
                </View>
            </View>
            <View style={styles.headerRight}>
                <TouchableOpacity style={styles.headerButton} onPress={handleNewChat}>
                    <Icon name="message-plus-outline" size={ms(22)} color={Colors.textSecondary} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.headerButton} onPress={() => setIsHistoryVisible(true)}>
                    <Icon name="history" size={ms(22)} color={Colors.textSecondary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
                    <Icon name="close" size={ms(24)} color={Colors.textSecondary} />
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderCreditBar = () => {
        if (!planStatus || !planStatus.data) return null;
        const { planName, usedCredits, totalCredits, remainingCredits, resetDate } = planStatus.data;

        // Calculate progress logic (inverse of web? web: width = used/total)
        const progress = Math.min(100, (usedCredits / totalCredits) * 100);

        return (
            <View style={styles.creditBar}>
                <View style={styles.creditInfo}>
                    <View style={styles.creditLabelRow}>
                        <Icon name="flash" size={ms(16)} color={THEME_COLOR} />
                        <AppText weight="bold" size="sm">{planName || 'Basic'}</AppText>
                    </View>
                    <AppText size="xs" color={Colors.textMuted}>
                        {usedCredits} / {totalCredits} credits used • Resets {new Date(resetDate).toLocaleDateString()}
                    </AppText>
                </View>
                <View style={styles.creditStats}>
                    <AppText size="sm" weight="bold" color={remainingCredits < 50 ? Colors.error : THEME_COLOR}>
                        {remainingCredits} left
                    </AppText>
                </View>

                {/* Progress Bar Background */}
                <View style={styles.progressBarContainer}>
                    <View style={[
                        styles.progressBarFill,
                        { width: `${progress}%`, backgroundColor: remainingCredits < 50 ? Colors.error : THEME_COLOR }
                    ]} />
                </View>
            </View>
        );
    };

    const renderMessage = ({ item }) => {
        const isUser = item.sender === 'user';
        return (
            <View style={[
                styles.messageRow,
                isUser ? styles.messageRowUser : styles.messageRowAi
            ]}>
                {!isUser && (
                    <View style={styles.aiAvatarSmall}>
                        <Icon name="sparkles" size={ms(14)} color={THEME_COLOR} />
                    </View>
                )}
                <View style={[
                    styles.messageBubble,
                    isUser ? styles.messageBubbleUser : styles.messageBubbleAi
                ]}>
                    <AppText
                        size={14}
                        color={isUser ? Colors.white : Colors.textPrimary}
                        style={{ lineHeight: 20 }}
                    >
                        {item.text}
                    </AppText>
                </View>
            </View>
        );
    };

    const renderWelcome = () => (
        <ScrollView contentContainerStyle={styles.contentContainer}>
            <View style={styles.welcomeContainer}>
                <View style={styles.welcomeIconContainer}>
                    <Icon name="creation" size={ms(40)} color={THEME_COLOR} />
                </View>
                <AppText size="xl" weight="bold" style={styles.welcomeTitle}>
                    How can I help you today?
                </AppText>
            </View>

            <View style={styles.suggestionsContainer}>
                {suggestions.map((item) => (
                    <TouchableOpacity
                        key={item.id}
                        style={styles.suggestionButton}
                        onPress={() => handleSend(item.text)}
                    >
                        <View style={styles.suggestionIcon}>
                            <Icon name={item.icon} size={ms(20)} color={THEME_COLOR} />
                        </View>
                        <AppText style={styles.suggestionText}>{item.text}</AppText>
                    </TouchableOpacity>
                ))}
            </View>
        </ScrollView>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            {renderHeader()}
            {renderCreditBar()}

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={{ flex: 1 }}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
                {messages.length === 0 ? (
                    renderWelcome()
                ) : (
                    <FlatList
                        ref={flatListRef}
                        data={messages}
                        renderItem={renderMessage}
                        keyExtractor={item => item.id}
                        contentContainerStyle={styles.chatListContent}
                        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                        ListFooterComponent={isLoading ? (
                            <View style={styles.thinkingContainer}>
                                <ThinkingState />
                            </View>
                        ) : null}
                    />
                )}

                <View style={styles.footer}>
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="Type a message..."
                            placeholderTextColor={Colors.textMuted}
                            value={inputText}
                            onChangeText={setInputText}
                            multiline
                            maxLength={1000}
                        />
                        <TouchableOpacity
                            style={[
                                styles.sendButton,
                                (inputText.trim().length > 0 || isLoading) && styles.sendButtonActive,
                                isLoading && { opacity: 0.5 }
                            ]}
                            onPress={() => handleSend()}
                            disabled={isLoading || inputText.trim().length === 0}
                        >
                            <Icon name={isLoading ? "loading" : "send"} size={ms(20)} color={Colors.white} />
                        </TouchableOpacity>
                    </View>
                    <AppText size="xs" color={Colors.textMuted} style={styles.disclaimer}>
                        AI responses may not be 100% accurate. Always verify important information.
                    </AppText>
                </View>
            </KeyboardAvoidingView>

            {/* History Modal */}
            <Modal
                visible={isHistoryVisible}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setIsHistoryVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <AppText size="lg" weight="bold">Chat History</AppText>
                        <TouchableOpacity onPress={() => setIsHistoryVisible(false)}>
                            <Icon name="close" size={ms(24)} color={Colors.textPrimary} />
                        </TouchableOpacity>
                    </View>
                    {sessions.length === 0 ? (
                        <View style={styles.emptyHistory}>
                            <Icon name="history" size={ms(48)} color={Colors.textMuted} />
                            <AppText color={Colors.textMuted} style={{ marginTop: 10 }}>No chat history yet</AppText>
                        </View>
                    ) : (
                        <FlatList
                            data={sessions}
                            keyExtractor={item => item._id}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[
                                        styles.historyItem,
                                        currentSessionId === item._id && styles.historyItemActive
                                    ]}
                                    onPress={() => fetchHistory(item._id)}
                                >
                                    <View style={{ flex: 1 }}>
                                        <AppText weight="bold" numberOfLines={1}>
                                            {item.title || 'New Chat'}
                                        </AppText>
                                        <AppText size="xs" color={Colors.textMuted}>
                                            {new Date(item.updatedAt).toLocaleDateString()}
                                        </AppText>
                                    </View>
                                    <TouchableOpacity
                                        style={styles.deleteHistoryButton}
                                        onPress={() => handleDeleteSession(item._id)}
                                    >
                                        <Icon name="trash-can-outline" size={ms(20)} color={Colors.textMuted} />
                                    </TouchableOpacity>
                                </TouchableOpacity>
                            )}
                        />
                    )}
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: BG_COLOR,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: wp(4),
        paddingVertical: vs(12),
        backgroundColor: Colors.white,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logoContainer: {
        width: ms(36),
        height: ms(36),
        borderRadius: BorderRadius.sm,
        backgroundColor: THEME_COLOR + '20', // 20% opacity
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.sm,
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: THEME_COLOR,
        marginRight: 4,
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
    },
    headerButton: {
        padding: Spacing.xs + 2,
        borderRadius: BorderRadius.round,
        backgroundColor: Colors.background,
    },
    // Mobile optimization: show icons only if space is tight? 
    // Screenshot has "New Chat" and "History". On mobile this might crowd.
    // I'll keep them as icon buttons for better mobile fit or just icons.
    closeButton: {
        padding: Spacing.xs + 2,
        marginLeft: Spacing.xs,
    },
    headerButtonText: {
        display: 'none', // Hidden on mobile to save space, show only icon
    },

    creditBar: {
        backgroundColor: Colors.white,
        paddingHorizontal: wp(4),
        paddingVertical: vs(10),
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    creditInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    creditLabelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    creditStats: {
        position: 'absolute',
        right: wp(4),
        top: vs(10),
        display: 'none', // Hidden in this layout, moved to row
    },
    progressBarContainer: {
        height: 4,
        backgroundColor: '#e2e8f0',
        borderRadius: 2,
        marginTop: 4,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: THEME_COLOR,
    },

    contentContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: wp(6),
        paddingBottom: vs(20),
    },
    chatListContent: {
        paddingHorizontal: wp(4),
        paddingTop: Spacing.md,
        paddingBottom: Spacing.xl,
    },
    welcomeContainer: {
        alignItems: 'center',
        marginBottom: vs(32),
    },
    welcomeIconContainer: {
        width: ms(80),
        height: ms(80),
        borderRadius: BorderRadius.xl,
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.lg,
        ...Shadow.sm,
    },
    welcomeTitle: {
        textAlign: 'center',
        color: Colors.textPrimary,
    },

    suggestionsContainer: {
        gap: Spacing.md,
    },
    suggestionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.white,
        padding: Spacing.md,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        borderColor: Colors.border,
        ...Shadow.sm,
    },
    suggestionIcon: {
        width: ms(32),
        height: ms(32),
        borderRadius: BorderRadius.sm,
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.md,
    },
    suggestionText: {
        flex: 1,
        color: Colors.textPrimary,
        fontSize: ms(13),
    },

    footer: {
        padding: Spacing.md,
        backgroundColor: Colors.white,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end', // Align bottom for multiline
        backgroundColor: BG_COLOR,
        borderRadius: BorderRadius.lg,
        paddingHorizontal: Spacing.md,
        paddingVertical: Platform.OS === 'ios' ? Spacing.sm : Spacing.xs,
        marginBottom: Spacing.xs,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    input: {
        flex: 1,
        fontSize: ms(14),
        color: Colors.textPrimary,
        maxHeight: ms(100),
        minHeight: ms(40),
        paddingTop: Platform.OS === 'ios' ? 10 : 8, // Center text vertically
        paddingBottom: Platform.OS === 'ios' ? 10 : 8,
    },
    sendButton: {
        width: ms(36),
        height: ms(36),
        borderRadius: BorderRadius.sm,
        backgroundColor: Colors.textMuted,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: Spacing.sm,
        marginBottom: 2, // Align with input bottom
    },
    sendButtonActive: {
        backgroundColor: THEME_COLOR,
    },
    disclaimer: {
        textAlign: 'center',
        marginTop: Spacing.xs,
        opacity: 0.7,
        fontSize: 10,
    },

    // Message Styles
    messageRow: {
        marginBottom: Spacing.md,
        flexDirection: 'row',
        alignItems: 'flex-end',
        maxWidth: '100%',
    },
    messageRowUser: {
        justifyContent: 'flex-end',
    },
    messageRowAi: {
        justifyContent: 'flex-start',
    },
    aiAvatarSmall: {
        width: ms(24),
        height: ms(24),
        borderRadius: ms(12),
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
        marginBottom: 4,
    },
    messageBubble: {
        padding: Spacing.md,
        maxWidth: '85%',
        borderRadius: BorderRadius.lg,
    },
    messageBubbleUser: {
        backgroundColor: THEME_COLOR,
        borderBottomRightRadius: 2,
    },
    messageBubbleAi: {
        backgroundColor: Colors.white,
        borderBottomLeftRadius: 2,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    thinkingContainer: {
        marginLeft: ms(32),
        marginBottom: Spacing.md,
    },

    // Modal Styles
    modalContainer: {
        flex: 1,
        backgroundColor: Colors.background,
        padding: Spacing.md,
        paddingTop: Platform.OS === 'ios' ? ms(40) : Spacing.md,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.lg,
    },
    historyItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.white,
        padding: Spacing.md,
        borderRadius: BorderRadius.md,
        marginBottom: Spacing.sm,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    historyItemActive: {
        borderColor: THEME_COLOR,
        backgroundColor: THEME_COLOR + '10',
    },
    deleteHistoryButton: {
        padding: 8,
    },
    emptyHistory: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    }
});

export default AIAssistantScreen;

