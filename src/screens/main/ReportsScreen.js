/**
 * Reports Screen
 * View detailed reports and analytics — UI matched to Expo ReportsScreen
 */

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import IonIcon from 'react-native-vector-icons/Ionicons';
import { Colors } from '../../constants/Colors';
import { Spacing, BorderRadius, Shadow } from '../../constants/Spacing';
import { ms, vs, wp } from '../../utils/Responsive';

function formatValue(val) {
    if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
    if (val >= 1000) return `₹${(val / 1000).toFixed(0)}K`;
    return `₹${val}`;
}

function StatBox({ label, value, color, icon }) {
    return (
        <View style={styles.statBox}>
            <IonIcon name={icon} size={22} color={color} />
            <Text style={[styles.statValue, { color }]}>{value}</Text>
            <Text style={styles.statLabel}>{label}</Text>
        </View>
    );
}

const ReportsScreen = ({ navigation }) => {
    // Placeholder data — will be replaced with real API data
    const total = 0;
    const qualified = 0;
    const converted = 0;
    const lost = 0;
    const totalValue = 0;
    const convRate = 0;

    return (
        <View style={styles.container}>
            <SafeAreaView edges={['top']} style={{ flex: 1 }}>
                {/* Header — matching Expo */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <IonIcon name="arrow-back" size={22} color={Colors.textPrimary} />
                    </TouchableOpacity>
                    <Text style={styles.title}>Reports</Text>
                    <View style={{ width: 22 }} />
                </View>

                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.content}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Hero Card — solid color approximating gradient */}
                    <View style={styles.heroCard}>
                        <Text style={styles.heroLabel}>Total Pipeline Value</Text>
                        <Text style={styles.heroValue}>{formatValue(totalValue)}</Text>
                        <Text style={styles.heroSub}>{total} total leads</Text>
                    </View>

                    {/* Stats Grid */}
                    <View style={styles.grid}>
                        <StatBox label="Qualified" value={qualified} color="#4D8733" icon="checkmark-circle" />
                        <StatBox label="Converted" value={converted} color="#10B981" icon="trophy" />
                        <StatBox label="Lost" value={lost} color="#EF4444" icon="close-circle" />
                        <StatBox label="Conv. Rate" value={`${convRate}%`} color="#3B82F6" icon="trending-up" />
                    </View>

                    {/* Note */}
                    <View style={styles.note}>
                        <IonIcon name="information-circle-outline" size={16} color={Colors.textTertiary} />
                        <Text style={styles.noteText}>Detailed reports and charts coming soon</Text>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    scrollView: { flex: 1 },

    // Header — matching Expo
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
    },
    backBtn: {
        width: ms(40),
        height: ms(40),
        borderRadius: ms(20),
        backgroundColor: Colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
        ...Shadow.sm,
    },
    title: { fontSize: ms(20), fontWeight: '700', color: Colors.textPrimary },

    content: { paddingHorizontal: Spacing.lg },

    // Hero Card
    heroCard: {
        borderRadius: BorderRadius.xl,
        padding: Spacing.xl,
        alignItems: 'center',
        marginBottom: Spacing.lg,
        backgroundColor: '#4D8733',
    },
    heroLabel: { fontSize: ms(12), color: 'rgba(255,255,255,0.7)', fontWeight: '500' },
    heroValue: { fontSize: ms(34), fontWeight: '800', color: '#fff', marginVertical: 4 },
    heroSub: { fontSize: ms(13), color: 'rgba(255,255,255,0.7)' },

    // Grid
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md },
    statBox: {
        width: '47%',
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.xl,
        padding: Spacing.lg,
        alignItems: 'center',
        ...Shadow.sm,
    },
    statValue: { fontSize: ms(24), fontWeight: '800', marginVertical: 4 },
    statLabel: { fontSize: ms(12), color: Colors.textTertiary, fontWeight: '500' },

    // Note
    note: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: Spacing.xl,
        justifyContent: 'center',
    },
    noteText: { fontSize: ms(13), color: Colors.textTertiary },
});

export default ReportsScreen;
