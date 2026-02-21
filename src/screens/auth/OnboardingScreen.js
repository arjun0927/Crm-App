/**
 * OnboardingScreen
 * Ported from the Expo project (crmapp) to React Native CLI (Crm-App).
 *
 * Expo dependencies replaced:
 *  - expo-linear-gradient      → react-native-linear-gradient
 *  - @expo/vector-icons        → react-native-vector-icons/Ionicons
 *  - expo theme (wp/hp/moderateScale) → src/utils/Responsive (wp, hp, ms)
 *  - Expo SafeAreaView         → react-native-safe-area-context (already installed)
 */

import React, { useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    FlatList,
    Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import IonIcon from 'react-native-vector-icons/Ionicons';

import { wp, hp, ms } from '../../utils/Responsive';
import { setOnboardingCompleted } from '../../storage';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── Color palette (mirrors Expo theme) ───────────────────────────────────────
const C = {
    primary: '#4D8733',
    primaryDark: '#3A6B27',
    primaryLight: '#A0C040',
    primaryBg: '#EEF5E6',
    background: '#F6F8FA',
    surface: '#FFFFFF',
    text: '#1A1D21',
    textSecondary: '#6B7280',
};

// ─── Slide data ───────────────────────────────────────────────────────────────
const slides = [
    {
        id: '1',
        icon: 'people',
        title: 'Manage Your\nLeads Smarter',
        subtitle:
            'Capture, track, and convert leads seamlessly. Stay on top of every opportunity with an intelligent CRM.',
        accentIcon: 'trending-up',
        gradient: ['#4D8733', '#6BA344'],
    },
    {
        id: '2',
        icon: 'analytics',
        title: 'Real-Time\nPipeline Insights',
        subtitle:
            'Visualize your sales pipeline, track deal progress, and make data-driven decisions from your phone.',
        accentIcon: 'bar-chart',
        gradient: ['#3A6B27', '#4D8733'],
    },
    {
        id: '3',
        icon: 'alarm',
        title: 'Follow-Up\nReminders',
        subtitle:
            'Never miss a follow-up again. Get timely reminders, schedule calls, and keep your leads engaged at every stage.',
        accentIcon: 'notifications',
        gradient: ['#4D8733', '#A0C040'],
    },
];

// ─── Component ────────────────────────────────────────────────────────────────
const OnboardingScreen = ({ navigation }) => {
    const flatListRef = useRef(null);
    const scrollX = useRef(new Animated.Value(0)).current;
    const [currentIndex, setCurrentIndex] = useState(0);
    const [slideHeight, setSlideHeight] = useState(0);

    // ── Handlers ────────────────────────────────────────────────────────────────
    const handleFinish = async () => {
        await setOnboardingCompleted(true);
        navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
    };

    const handleNext = () => {
        if (currentIndex < slides.length - 1) {
            const nextIndex = currentIndex + 1;
            flatListRef.current?.scrollToOffset({
                offset: nextIndex * SCREEN_WIDTH,
                animated: true,
            });
            setCurrentIndex(nextIndex);
        } else {
            handleFinish();
        }
    };

    const handleSkip = () => handleFinish();

    // ── Slide renderer ──────────────────────────────────────────────────────────
    const renderSlide = ({ item }) => (
        <View style={[slideStyles.slide, { width: SCREEN_WIDTH, height: slideHeight }]}>
            {/* Illustration area */}
            <View style={slideStyles.illustrationArea}>
                {/* Main gradient circle */}
                <LinearGradient
                    colors={item.gradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={slideStyles.mainCircle}
                >
                    <IonIcon name={item.icon} size={ms(64)} color="rgba(255,255,255,0.95)" />
                </LinearGradient>

                {/* Floating decorative dots */}
                <View
                    style={[
                        slideStyles.floatingDot,
                        slideStyles.dot1,
                        { backgroundColor: C.primaryLight + '40' },
                    ]}
                />
                <View
                    style={[
                        slideStyles.floatingDot,
                        slideStyles.dot2,
                        { backgroundColor: C.primary + '25' },
                    ]}
                />
                <View
                    style={[
                        slideStyles.floatingDot,
                        slideStyles.dot3,
                        { backgroundColor: C.primaryLight + '30' },
                    ]}
                />

                {/* Accent badge */}
                <View style={slideStyles.accentBadge}>
                    <IonIcon name={item.accentIcon} size={ms(20)} color={C.primary} />
                </View>
            </View>

            {/* Text area */}
            <View style={slideStyles.textArea}>
                <Text style={slideStyles.title}>{item.title}</Text>
                <Text style={slideStyles.subtitle}>{item.subtitle}</Text>
            </View>
        </View>
    );

    // ── Render ──────────────────────────────────────────────────────────────────
    return (
        <View style={styles.container}>
            <SafeAreaView style={{ flex: 1 }}>
                {/* Top bar – Skip button */}
                <View style={styles.topBar}>
                    <View />
                    {currentIndex < slides.length - 1 ? (
                        <TouchableOpacity onPress={handleSkip} style={styles.skipBtn}>
                            <Text style={styles.skipText}>Skip</Text>
                            <IonIcon name="chevron-forward" size={16} color={C.textSecondary} />
                        </TouchableOpacity>
                    ) : (
                        <View />
                    )}
                </View>

                {/* Slides */}
                <View
                    style={{ flex: 1 }}
                    onLayout={e => setSlideHeight(e.nativeEvent.layout.height)}
                >
                    <FlatList
                        ref={flatListRef}
                        data={slides}
                        keyExtractor={item => item.id}
                        renderItem={renderSlide}
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        bounces={false}
                        scrollEventThrottle={16}
                        getItemLayout={(_, index) => ({
                            length: SCREEN_WIDTH,
                            offset: SCREEN_WIDTH * index,
                            index,
                        })}
                        onScroll={Animated.event(
                            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                            { useNativeDriver: false },
                        )}
                        onMomentumScrollEnd={e => {
                            const index = Math.round(
                                e.nativeEvent.contentOffset.x / SCREEN_WIDTH,
                            );
                            setCurrentIndex(index);
                        }}
                    />
                </View>

                {/* Bottom controls */}
                <View style={styles.bottomArea}>
                    {/* Animated pagination dots */}
                    <View style={styles.dotsRow}>
                        {slides.map((_, i) => {
                            const inputRange = [
                                (i - 1) * SCREEN_WIDTH,
                                i * SCREEN_WIDTH,
                                (i + 1) * SCREEN_WIDTH,
                            ];
                            const dotWidth = scrollX.interpolate({
                                inputRange,
                                outputRange: [8, 28, 8],
                                extrapolate: 'clamp',
                            });
                            const dotOpacity = scrollX.interpolate({
                                inputRange,
                                outputRange: [0.3, 1, 0.3],
                                extrapolate: 'clamp',
                            });
                            return (
                                <Animated.View
                                    key={i}
                                    style={[
                                        styles.dot,
                                        { width: dotWidth, opacity: dotOpacity, backgroundColor: C.primary },
                                    ]}
                                />
                            );
                        })}
                    </View>

                    {/* Next / Get Started button */}
                    <TouchableOpacity onPress={handleNext} activeOpacity={0.85}>
                        <LinearGradient
                            colors={['#4D8733', '#6BA344']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.nextBtn}
                        >
                            <Text style={styles.nextBtnText}>
                                {currentIndex === slides.length - 1 ? 'Get Started' : 'Next'}
                            </Text>
                            <IonIcon
                                name={
                                    currentIndex === slides.length - 1 ? 'rocket' : 'arrow-forward'
                                }
                                size={ms(18)}
                                color="#fff"
                            />
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </View>
    );
};

// ─── Slide Styles ─────────────────────────────────────────────────────────────
const slideStyles = StyleSheet.create({
    slide: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: wp(6),
    },
    illustrationArea: {
        alignItems: 'center',
        justifyContent: 'center',
        height: hp(38),
        position: 'relative',
    },
    mainCircle: {
        width: ms(160),
        height: ms(160),
        borderRadius: ms(80),
        justifyContent: 'center',
        alignItems: 'center',
    },
    floatingDot: {
        position: 'absolute',
        borderRadius: 999,
    },
    dot1: {
        width: ms(50),
        height: ms(50),
        top: hp(3),
        right: wp(12),
    },
    dot2: {
        width: ms(30),
        height: ms(30),
        bottom: hp(4),
        left: wp(10),
    },
    dot3: {
        width: ms(18),
        height: ms(18),
        top: hp(12),
        left: wp(15),
    },
    accentBadge: {
        position: 'absolute',
        bottom: hp(6),
        right: wp(18),
        width: ms(48),
        height: ms(48),
        borderRadius: ms(16),
        backgroundColor: C.primaryBg,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    textArea: {
        paddingHorizontal: wp(4),
        marginTop: hp(2),
    },
    title: {
        fontSize: ms(32),
        fontWeight: '800',
        color: C.text,
        letterSpacing: -1,
        lineHeight: ms(38),
    },
    subtitle: {
        fontSize: ms(15),
        fontWeight: '400',
        color: C.textSecondary,
        lineHeight: ms(22),
        marginTop: ms(12),
    },
});

// ─── Screen Styles ────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: C.background,
    },
    topBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: wp(5),
        paddingTop: ms(8),
    },
    skipBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: ms(8),
        paddingHorizontal: ms(12),
        borderRadius: ms(20),
        backgroundColor: C.surface,
    },
    skipText: {
        fontSize: ms(14),
        fontWeight: '600',
        color: C.textSecondary,
        marginRight: 4,
    },
    bottomArea: {
        paddingHorizontal: wp(6),
        paddingBottom: hp(3),
        gap: ms(24),
    },
    dotsRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: ms(6),
    },
    dot: {
        height: ms(8),
        borderRadius: ms(4),
    },
    nextBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: ms(56),
        borderRadius: ms(16),
        gap: ms(8),
    },
    nextBtnText: {
        fontSize: ms(17),
        fontWeight: '700',
        color: '#fff',
    },
});

export default OnboardingScreen;
