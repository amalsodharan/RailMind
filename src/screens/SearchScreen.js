import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, Alert, SafeAreaView, Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { StationInput } from '../components/StationInput';
import { TrainCard } from '../components/TrainCard';
import { getTrainByNo, getTrainsBetweenStations, getTrainsOnDate } from '../api/trainApi';
import { getRecentSearches, saveRecentSearch, clearRecentSearches } from '../utils/storage';

const TABS = [
  { key: 'trainNo',  label: 'Train No' },
  { key: 'stations', label: 'Stations' },
  { key: 'date',     label: 'By Date'  },
];

// ─── Skeleton block ───────────────────────────────────────────────────────────
const SkeletonBlock = ({ width = '100%', height = 16, radius = 8, style }) => {
  const opacity = useRef(new Animated.Value(0.3)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1,  duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 700, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  return (
    <Animated.View
      style={[{
        width, height,
        borderRadius: radius,
        backgroundColor: Colors.border,
        opacity,
      }, style]}
    />
  );
};

// ─── Search Skeleton ──────────────────────────────────────────────────────────
const SearchSkeleton = () => (
  <View style={sk.card}>
    <SkeletonBlock height={20} width="60%" style={{ marginBottom: 12 }} />
    <SkeletonBlock height={14} width="90%" style={{ marginBottom: 6 }} />
    <SkeletonBlock height={14} width="75%" style={{ marginBottom: 6 }} />
    <SkeletonBlock height={14} width="50%" style={{ marginBottom: 16 }} />
    <SkeletonBlock height={48} radius={12} />
  </View>
);

export const SearchScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab]       = useState('trainNo');
  const [trainNo, setTrainNo]           = useState('');
  const [fromStation, setFromStation]   = useState('');
  const [toStation, setToStation]       = useState('');
  const [date, setDate]                 = useState('');
  const [results, setResults]           = useState([]);
  const [loading, setLoading]           = useState(false);
  const [searched, setSearched]         = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);

  useEffect(() => {
    loadRecents();
  }, []);

  const loadRecents = async () => {
    const data = await getRecentSearches();
    setRecentSearches(data);
  };

  const handleClearRecents = async () => {
    await clearRecentSearches();
    setRecentSearches([]);
  };

  const handleSearch = async () => {
    if (activeTab === 'trainNo' && !trainNo.trim()) {
      Alert.alert('Error', 'Please enter a train number'); return;
    }
    if (activeTab !== 'trainNo' && (!fromStation.trim() || !toStation.trim())) {
      Alert.alert('Error', 'Please enter both from and to stations'); return;
    }
    if (activeTab === 'date' && !date.trim()) {
      Alert.alert('Error', 'Please enter a date (DD-MM-YYYY)'); return;
    }
    setLoading(true);
    setSearched(true);
    setResults([]);
    try {
      let data;
      if (activeTab === 'trainNo') {
        data = await getTrainByNo(trainNo.trim());
        if (data?.success && data?.data) {
          const found = [{ train_base: data.data }];
          setResults(found);
          // Save to recent searches
          await saveRecentSearch({
            trainNo: data.data.train_no,
            trainName: data.data.train_name,
          });
          await loadRecents();
        } else {
          setResults([]);
        }
      } else if (activeTab === 'stations') {
        data = await getTrainsBetweenStations(fromStation.trim(), toStation.trim());
        if (data?.success && data?.data) setResults(data.data);
        else setResults([]);
      } else {
        data = await getTrainsOnDate(fromStation.trim(), toStation.trim(), date.trim());
        if (data?.success && data?.data) setResults(data.data);
        else setResults([]);
      }
    } catch (e) {
      Alert.alert('Error', e?.message || 'Failed to fetch trains. Check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleRecentTap = (item) => {
    setActiveTab('trainNo');
    setTrainNo(item.trainNo);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── Gradient Header ── */}
        <LinearGradient
          colors={[Colors.primary, Colors.primaryLight]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.header, { paddingTop: insets.top + 16 }]}
        >
          <View style={styles.headerInner}>
            <View style={styles.logoCircle}>
              <Ionicons name="train" size={22} color={Colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.headerTitle}>RailMind</Text>
              <Text style={styles.headerSub}>Search trains &amp; set booking reminders</Text>
            </View>
          </View>
        </LinearGradient>

        {/* ── Floating Search Card ── */}
        <View style={styles.card}>
          {/* Tabs */}
          <View style={styles.tabRow}>
            {TABS.map((tab) => (
              <TouchableOpacity
                key={tab.key}
                style={styles.tab}
                onPress={() => { setActiveTab(tab.key); setResults([]); setSearched(false); }}
                activeOpacity={0.8}
              >
                <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
                  {tab.label}
                </Text>
                {activeTab === tab.key && <View style={styles.tabUnderline} />}
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.divider} />

          {/* ── Train No Tab ── */}
          {activeTab === 'trainNo' && (
            <>
              <View style={styles.labelRow}>
                <Text style={styles.inputLabel}>TRAIN NUMBER</Text>
                <View style={styles.liveChip}>
                  <View style={styles.liveDot} />
                  <Text style={styles.liveText}>Live Status</Text>
                </View>
              </View>
              <View style={styles.inputBox}>
                <Ionicons name="train-outline" size={18} color={Colors.textSecondary} />
                <TextInput
                  style={styles.input}
                  value={trainNo}
                  onChangeText={setTrainNo}
                  placeholder="e.g. 12621"
                  placeholderTextColor={Colors.textSecondary}
                  keyboardType="numeric"
                  maxLength={6}
                  onSubmitEditing={handleSearch}
                  returnKeyType="search"
                />
              </View>
              <Text style={styles.helperText}>
                Enter 5-digit train number for real-time tracking.
              </Text>
            </>
          )}

          {/* ── Stations Tab ── */}
          {activeTab === 'stations' && (
            <>
              <StationInput label="FROM STATION" value={fromStation} onChangeText={setFromStation} placeholder="e.g. NDLS" />
              <StationInput label="TO STATION" value={toStation} onChangeText={setToStation} placeholder="e.g. HWH" />
            </>
          )}

          {/* ── By Date Tab ── */}
          {activeTab === 'date' && (
            <>
              <StationInput label="FROM STATION" value={fromStation} onChangeText={setFromStation} placeholder="e.g. NDLS" />
              <StationInput label="TO STATION" value={toStation} onChangeText={setToStation} placeholder="e.g. HWH" />
              <View style={styles.labelRow}>
                <Text style={styles.inputLabel}>DATE (DD-MM-YYYY)</Text>
              </View>
              <View style={styles.inputBox}>
                <Ionicons name="calendar-outline" size={18} color={Colors.textSecondary} />
                <TextInput
                  style={styles.input}
                  value={date}
                  onChangeText={setDate}
                  placeholder="e.g. 25-12-2024"
                  placeholderTextColor={Colors.textSecondary}
                  keyboardType="numeric"
                  maxLength={10}
                />
              </View>
            </>
          )}

          {/* ── Search Button ── */}
          <TouchableOpacity onPress={handleSearch} activeOpacity={0.85} disabled={loading} style={{ marginTop: 16 }}>
            <LinearGradient
              colors={[Colors.primary, Colors.primaryLight]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.searchBtn}
            >
              <Text style={styles.searchBtnText}>Search Trains</Text>
              <Ionicons name="arrow-forward" size={18} color={Colors.white} />
            </LinearGradient>
          </TouchableOpacity>

          {/* ── Recent Searches (Train No tab only, before results) ── */}
          {activeTab === 'trainNo' && recentSearches.length > 0 && !loading && (
            <View style={styles.recentSection}>
              <View style={styles.recentHeader}>
                <Text style={styles.recentTitle}>Recent Searches</Text>
                <TouchableOpacity onPress={handleClearRecents}>
                  <Text style={styles.clearAll}>Clear All</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.recentChips}>
                {recentSearches.map((item) => (
                  <TouchableOpacity
                    key={item.trainNo}
                    style={styles.recentChip}
                    onPress={() => handleRecentTap(item)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="time-outline" size={13} color={Colors.textSecondary} />
                    <View>
                      <Text style={styles.recentChipNo}>{item.trainNo}</Text>
                      <Text style={styles.recentChipName} numberOfLines={1}>{item.trainName}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* ── Loading Skeleton ── */}
        {loading && (
          <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
            <SearchSkeleton />
            <SearchSkeleton />
            <SearchSkeleton />
          </View>
        )}

        {/* ── No Results Empty State ── */}
        {!loading && searched && results.length === 0 && (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconWrap}>
              <Ionicons name="search" size={32} color={Colors.primary} />
            </View>
            <Text style={styles.emptyTitle}>No Trains Found</Text>
            <Text style={styles.emptySub}>
              We couldn't find any trains matching your search criteria. Try another route.
            </Text>
            <TouchableOpacity
              style={styles.retryBtn}
              onPress={() => { setSearched(false); setResults([]); }}
            >
              <Ionicons name="refresh-outline" size={14} color={Colors.primary} />
              <Text style={styles.retryBtnText}>Search Again</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── Results ── */}
        {!loading && results.length > 0 && (
          <View style={styles.results}>
            <Text style={styles.resultsTitle}>
              {results.length} Train{results.length > 1 ? 's' : ''} Found
            </Text>
            {results.map((train, i) => (
              <TrainCard
                key={train.train_base?.train_no || i}
                train={train}
                onPress={() => navigation.navigate('TrainDetail', { train })}
              />
            ))}
          </View>
        )}

        {/* ── Info Card (Train No tab, no results) ── */}
        {activeTab === 'trainNo' && !loading && !searched && (
          <View style={styles.infoCard}>
            <View style={styles.infoIconWrap}>
              <Ionicons name="information-circle-outline" size={22} color={Colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.infoTitle}>Why Search by Number?</Text>
              <Text style={styles.infoDesc}>
                Searching by number is the fastest way to get accurate live platform info and delay status for specific trains.
              </Text>
            </View>
          </View>
        )}

        {/* ── Watermark ── */}
        {!loading && !searched && (
          <Text style={styles.watermark}>RAILMIND INTELLIGENT SEARCH</Text>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

// ─── Skeleton styles ──────────────────────────────────────────────────────────
const sk = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
});

// ─── Main styles ──────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.primary },
  container: { flex: 1, backgroundColor: Colors.background },

  // Header
  header: {
    paddingHorizontal: 20,
    paddingBottom: 28,
    paddingTop: 24,
  },
  headerInner: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  logoCircle: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.white,
    justifyContent: 'center', alignItems: 'center',
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: Colors.white, letterSpacing: -0.5 },
  headerSub: { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 1 },

  // Card
  card: {
    backgroundColor: Colors.card,
    marginHorizontal: 16,
    marginTop: -16,
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
    marginBottom: 16,
  },

  // Tabs (underline style)
  tabRow: { flexDirection: 'row', marginBottom: 0 },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 10 },
  tabText: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  tabTextActive: { color: Colors.primary, fontWeight: '700' },
  tabUnderline: {
    position: 'absolute', bottom: 0, left: '20%', right: '20%',
    height: 2, backgroundColor: Colors.primary, borderRadius: 2,
  },
  divider: { height: 1, backgroundColor: Colors.border, marginBottom: 16, marginTop: 0 },

  // Label row
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  inputLabel: { fontSize: 11, fontWeight: '700', color: Colors.textSecondary, letterSpacing: 0.5 },

  // Live Status badge
  liveChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: Colors.success + '18',
    borderWidth: 1, borderColor: Colors.success + '40',
    borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3,
  },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.success },
  liveText: { fontSize: 11, fontWeight: '700', color: Colors.success },

  // Input
  inputBox: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: Colors.background,
    borderWidth: 1.5, borderColor: Colors.border,
    borderRadius: 12, paddingHorizontal: 12, paddingVertical: 14,
    marginBottom: 6,
  },
  input: { flex: 1, fontSize: 16, color: Colors.text, fontWeight: '600' },
  helperText: { fontSize: 12, color: Colors.textSecondary, marginBottom: 4 },

  // Button
  searchBtn: {
    borderRadius: 14, paddingVertical: 16,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10,
  },
  searchBtnText: { color: Colors.white, fontSize: 16, fontWeight: '800' },

  // Recent Searches
  recentSection: { marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: Colors.border },
  recentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  recentTitle: { fontSize: 14, fontWeight: '800', color: Colors.text },
  clearAll: { fontSize: 13, fontWeight: '600', color: Colors.primary },
  recentChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  recentChip: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Colors.background,
    borderWidth: 1, borderColor: Colors.border,
    borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8,
  },
  recentChipNo: { fontSize: 13, fontWeight: '800', color: Colors.text },
  recentChipName: { fontSize: 11, color: Colors.textSecondary, maxWidth: 90 },

  // Empty state
  emptyState: { alignItems: 'center', padding: 32, paddingTop: 8 },
  emptyIconWrap: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: Colors.primary + '15',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: Colors.text, marginBottom: 8 },
  emptySub: { fontSize: 13, color: Colors.textSecondary, textAlign: 'center', lineHeight: 20, marginBottom: 16 },
  retryBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderWidth: 1.5, borderColor: Colors.primary,
    borderRadius: 10, paddingHorizontal: 20, paddingVertical: 10,
  },
  retryBtnText: { fontSize: 13, fontWeight: '700', color: Colors.primary },

  // Results
  results: { paddingHorizontal: 16, paddingBottom: 16 },
  resultsTitle: { fontSize: 14, fontWeight: '700', color: Colors.text, marginBottom: 12 },

  // Info Card
  infoCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    marginHorizontal: 16, marginBottom: 16,
    backgroundColor: Colors.primary + '0D',
    borderWidth: 1, borderColor: Colors.primary + '25',
    borderRadius: 14, padding: 14,
  },
  infoIconWrap: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.primary + '15',
    justifyContent: 'center', alignItems: 'center',
  },
  infoTitle: { fontSize: 14, fontWeight: '800', color: Colors.text, marginBottom: 4 },
  infoDesc: { fontSize: 12, color: Colors.textSecondary, lineHeight: 18 },

  // Watermark
  watermark: {
    textAlign: 'center', fontSize: 10, fontWeight: '700',
    color: Colors.textSecondary + '60', letterSpacing: 2,
    marginVertical: 8,
  },
});
