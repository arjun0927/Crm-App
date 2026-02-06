/**
 * Reports Screen
 * View detailed reports and analytics
 */

import React from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors } from '../../constants/Colors';
import { Spacing, BorderRadius, Shadow } from '../../constants/Spacing';
import { ms, vs, wp } from '../../utils/Responsive';
import { AppText } from '../../components';

const ReportsScreen = ({ navigation }) => {
    const renderHeader = () => (
        <View style={styles.header}>
            <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
            >
                <Icon name="arrow-left" size={ms(24)} color={Colors.textPrimary} />
            </TouchableOpacity>
            <AppText size="lg" weight="bold">
                Reports
            </AppText>
            <View style={styles.headerSpacer} />
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {renderHeader()}
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.emptyState}>
                    <Icon name="chart-bar" size={ms(80)} color={Colors.textMuted} />
                    <AppText size="lg" weight="semiBold" color={Colors.textSecondary} style={styles.emptyTitle}>
                        Reports Coming Soon
                    </AppText>
                    <AppText size="sm" color={Colors.textMuted} style={styles.emptySubtitle}>
                        View detailed analytics and reports about your CRM data
                    </AppText>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: wp(4),
        paddingBottom: vs(100),
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: wp(4),
        paddingVertical: vs(16),
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
    headerSpacer: {
        width: ms(44),
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: vs(80),
    },
    emptyTitle: {
        marginTop: vs(16),
    },
    emptySubtitle: {
        marginTop: vs(8),
        textAlign: 'center',
    },
});

export default ReportsScreen;
