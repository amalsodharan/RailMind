import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { StationInput } from '../components/StationInput';
import { TrainCard } from '../components/TrainCard';
import { getTrainByNo, getTrainsBetweenStations, getTrainsOnDate } from '../api/trainApi';

const TABS = [
  { key: 'trainNo', label: 'Train No.', icon: 'barcode-outline' },
  { key: 'stations', label: 'Stations', icon: 'swap-horizontal-outline' },
  { key: 'date', label: 'By Date', icon: 'calendar-outline' },
];

export const SearchScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState('trainNo');
  const [trainNo, setTrainNo] = useState('');
  const [fromStation, setFromStation] = useState('');
  const [toStation, setToStation] = useState('');
  const [date, setDate] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (activeTab === 'trainNo' && !trainNo.trim()) {
      Alert.alert('Error', 'Please enter a train number');
      return;
    }
    if (activeTab !== 'trainNo' && (!fromStation.trim() || !toStation.trim())) {
      Alert.alert('Error', 'Please enter both from and to stations');
      return;
    }
    if (activeTab === 'date' && !date.trim()) {
      Alert.alert('Error', 'Please enter a date (DD-MM-YYYY)');
      return;
    }

    setLoading(true);
    setResults([]);
    try {
      let data;
      if (activeTab === 'trainNo') {
        data = await getTrainByNo(trainNo.trim());
        if (data?.success && data?.data) {
          setResults([{ train_base: data.data }]);
        } else {
          Alert.alert('Not Found', 'No train found with this number');
        }
      } else if (activeTab === 'stations') {
        data = await getTrainsBetweenStations(fromStation.trim(), toStation.trim());
        if (data?.success && data?.data) {
          setResults(data.data);
        } else {
          Alert.alert('Not Found', 'No trains found between these stations');
        }
      } else {
        data = await getTrainsOnDate(fromStation.trim(), toStation.trim(), date.trim());
        if (data?.success && data?.data) {
          setResults(data.data);
        } else {
          Alert.alert('Not Found', 'No trains found for the given criteria');
        }
      }
    } catch (e) {
      Alert.alert('Error', e?.message || 'Failed to fetch trains. Check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <Ionicons name="train" size={32} color={Colors.white} />
          <Text style={styles.headerTitle}>RailMind</Text>
          <Text style={styles.headerSub}>Search trains & set booking reminders</Text>
        </View>

        {/* Tab Switcher */}
        <View style={styles.tabContainer}>
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, activeTab === tab.key && styles.tabActive]}
              onPress={() => { setActiveTab(tab.key); setResults([]); }}
            >
              <Ionicons
                name={tab.icon}
                size={14}
                color={activeTab === tab.key ? Colors.white : Colors.primary}
              />
              <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Search Form */}
        <View style={styles.form}>
          {activeTab === 'trainNo' && (
            <View>
              <Text style={styles.label}>TRAIN NUMBER</Text>
              <TextInput
                style={styles.input}
                value={trainNo}
                onChangeText={setTrainNo}
                placeholder="e.g. 12301"
                placeholderTextColor={Colors.textSecondary}
                keyboardType="numeric"
                maxLength={6}
              />
            </View>
          )}

          {(activeTab === 'stations' || activeTab === 'date') && (
            <>
              <StationInput label="FROM Station" value={fromStation} onChangeText={setFromStation} placeholder="e.g. NDLS" />
              <StationInput label="TO Station" value={toStation} onChangeText={setToStation} placeholder="e.g. HWH" />
            </>
          )}

          {activeTab === 'date' && (
            <View>
              <Text style={styles.label}>DATE (DD-MM-YYYY)</Text>
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
          )}

          <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
            {loading ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <>
                <Ionicons name="search" size={18} color={Colors.white} />
                <Text style={styles.searchBtnText}>Search Trains</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Results */}
        {results.length > 0 && (
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
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.primary },
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    backgroundColor: Colors.primary,
    padding: 24,
    paddingTop: 24,
    paddingBottom: 32,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.white,
    marginTop: 8,
  },
  headerSub: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    margin: 16,
    borderRadius: 14,
    padding: 4,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 4,
  },
  tabActive: { backgroundColor: Colors.primary },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },
  tabTextActive: { color: Colors.white },
  form: {
    backgroundColor: Colors.card,
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: Colors.background,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.text,
    fontWeight: '600',
    marginBottom: 12,
  },
  searchBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  searchBtnText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
  results: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
  },
});
