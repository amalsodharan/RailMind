import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ActivityIndicator, ScrollView, SafeAreaView, Keyboard,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { getPNRStatus } from '../api/trainApi';
import { getPNRHistory, savePNREntry, deletePNREntry } from '../utils/storage';

export const PNRScreen = () => {
  const insets = useSafeAreaInsets();
  const [pnr, setPnr] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [history, setHistory] = useState([]);

  useFocusEffect(
    useCallback(() => { getPNRHistory().then(setHistory); }, [])
  );

  const handleCheck = async (pnrToCheck = pnr) => {
    if (pnrToCheck.length !== 10) {
      return;
    }
    Keyboard.dismiss();
    setLoading(true);
    setStatus(null);
    try {
      const data = await getPNRStatus(pnrToCheck);
      setStatus(data);
      if (data?.success !== false) {
        const entry = {
          pnr: pnrToCheck,
          trainName: data?.data?.TrainName || data?.data?.trainName || '',
          checkedAt: new Date().toISOString(),
        };
        await savePNREntry(entry);
        setHistory(await getPNRHistory());
      }
    } catch (e) {
      // show inline error via setStatus
      setStatus({ success: false });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteHistory = async (pnrNo) => {
    await deletePNREntry(pnrNo);
    setHistory(await getPNRHistory());
  };

  const isValid = pnr.length === 10;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.container} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

        {/* ── Gradient Header ── */}
        <LinearGradient
          colors={[Colors.primary, Colors.primaryLight]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.header, { paddingTop: insets.top + 16 }]}
        >
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.headerTitle}>PNR Status</Text>
              <Text style={styles.headerSub}>Check your booking confirmation</Text>
            </View>
            <View style={styles.headerIcon}>
              <Ionicons name="ticket-outline" size={22} color={Colors.primary} />
            </View>
          </View>
        </LinearGradient>

        {/* ── Input Card ── */}
        <View style={styles.card}>
          <Text style={styles.inputLabel}>PNR NUMBER</Text>
          <View style={styles.inputBox}>
            <Ionicons name="barcode-outline" size={20} color={Colors.textSecondary} />
            <TextInput
              style={styles.input}
              value={pnr}
              onChangeText={setPnr}
              placeholder="Enter 10-digit PNR"
              placeholderTextColor={Colors.textSecondary}
              keyboardType="numeric"
              maxLength={10}
              onSubmitEditing={() => handleCheck(pnr)}
              returnKeyType="search"
            />
            {pnr.length > 0 && (
              <TouchableOpacity onPress={() => { setPnr(''); setStatus(null); }}>
                <Ionicons name="close-circle" size={18} color={Colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
          <Text style={styles.helperText}>
            {pnr.length}/10 digits entered
          </Text>

          {/* Recent PNRs */}
          {history.length > 0 && (
            <View style={styles.historySection}>
              <Text style={styles.historyLabel}>RECENT PNRs</Text>
              <View style={styles.historyChips}>
                {history.map((h) => (
                  <View key={h.pnr} style={styles.historyChip}>
                    <TouchableOpacity
                      style={styles.historyChipMain}
                      onPress={() => { setPnr(h.pnr); handleCheck(h.pnr); }}
                    >
                      <Ionicons name="time-outline" size={12} color={Colors.primary} />
                      <View>
                        <Text style={styles.historyChipText}>{h.pnr}</Text>
                        {h.trainName ? (
                          <Text style={styles.historyChipSub} numberOfLines={1}>{h.trainName}</Text>
                        ) : null}
                      </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleDeleteHistory(h.pnr)}
                      style={styles.historyChipDelete}
                    >
                      <Ionicons name="close" size={12} color={Colors.textSecondary} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Check Button */}
          <TouchableOpacity
            onPress={() => handleCheck(pnr)}
            disabled={loading || !isValid}
            activeOpacity={0.85}
            style={{ marginTop: 4 }}
          >
            <LinearGradient
              colors={isValid ? [Colors.primary, Colors.primaryLight] : [Colors.border, Colors.border]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.checkBtn}
            >
              {loading ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <>
                  <Ionicons name="search" size={18} color={Colors.white} />
                  <Text style={styles.checkBtnText}>Check Status</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* ── Result ── */}
        {status && (
          <View style={styles.result}>
            {status.success === false ? (
              <View style={styles.errorCard}>
                <View style={styles.errorIconWrap}>
                  <Ionicons name="close-circle-outline" size={36} color={Colors.danger} />
                </View>
                <Text style={styles.errorTitle}>PNR Not Found</Text>
                <Text style={styles.errorSub}>Please check the number and try again.</Text>
              </View>
            ) : (
              <>
                {/* Result header */}
                <View style={styles.resultHeader}>
                  <View>
                    <Text style={styles.resultPNR}>PNR: {pnr}</Text>
                    <Text style={styles.resultTrain}>
                      {status?.data?.TrainName || status?.data?.trainName || 'Train Details'}
                    </Text>
                  </View>
                  <View style={[styles.statusBadge, {
                    backgroundColor: (status?.data?.BookingStatus || '').toLowerCase().includes('confirm')
                      ? Colors.success + '20' : Colors.warning + '20',
                    borderColor: (status?.data?.BookingStatus || '').toLowerCase().includes('confirm')
                      ? Colors.success + '50' : Colors.warning + '50',
                  }]}>
                    <Text style={[styles.statusBadgeText, {
                      color: (status?.data?.BookingStatus || '').toLowerCase().includes('confirm')
                        ? Colors.success : Colors.warning,
                    }]}>
                      {status?.data?.BookingStatus || 'Active'}
                    </Text>
                  </View>
                </View>

                {/* Info rows */}
                {status?.data && (
                  <View style={styles.infoGrid}>
                    {[
                      ['Train No.', status.data.TrainNo || status.data.trainNo],
                      ['Date of Journey', status.data.Doj || status.data.dateOfJourney],
                      ['Boarding', status.data.BoardingPoint],
                      ['Destination', status.data.DestinationStation],
                      ['Class', status.data.Class],
                    ].map(([label, value]) =>
                      value ? (
                        <View key={label} style={styles.infoRow}>
                          <Text style={styles.infoLabel}>{label}</Text>
                          <Text style={styles.infoValue}>{value}</Text>
                        </View>
                      ) : null
                    )}
                  </View>
                )}

                {/* Passenger status */}
                {status?.data?.PassengerStatus?.length > 0 && (
                  <>
                    <Text style={styles.passengerTitle}>Passenger Status</Text>
                    {status.data.PassengerStatus.map((p, i) => (
                      <View key={i} style={styles.passengerRow}>
                        <View style={styles.passengerNo}>
                          <Text style={styles.passengerNoText}>{i + 1}</Text>
                        </View>
                        <View style={styles.passengerInfo}>
                          <Text style={styles.passengerStatus}>
                            {p.CurrentStatus || p.currentStatus || 'Unknown'}
                          </Text>
                          <Text style={styles.passengerCoach}>
                            Coach: {p.CurrentCoach || p.currentCoach || '—'} · Berth: {p.CurrentBerth || p.currentBerth || '—'}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </>
                )}
              </>
            )}
          </View>
        )}

        {/* ── Empty tip ── */}
        {!status && !loading && (
          <View style={styles.tip}>
            <Ionicons name="information-circle-outline" size={18} color={Colors.primary} />
            <Text style={styles.tipText}>
              Enter your 10-digit PNR number to check seat confirmation, coach, and berth details.
            </Text>
          </View>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.primary },
  container: { flex: 1, backgroundColor: Colors.background },

  // Header
  header: { paddingHorizontal: 20, paddingBottom: 28, paddingTop: 24 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 24, fontWeight: '800', color: Colors.white, letterSpacing: -0.5 },
  headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  headerIcon: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.white,
    justifyContent: 'center', alignItems: 'center',
  },

  // Card
  card: {
    backgroundColor: Colors.card,
    marginHorizontal: 16, marginTop: -16,
    borderRadius: 20, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 12, elevation: 5,
    marginBottom: 16,
  },
  inputLabel: { fontSize: 11, fontWeight: '700', color: Colors.textSecondary, letterSpacing: 0.5, marginBottom: 8 },
  inputBox: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: Colors.background,
    borderWidth: 1.5, borderColor: Colors.border,
    borderRadius: 12, paddingHorizontal: 12, paddingVertical: 14,
    marginBottom: 6,
  },
  input: { flex: 1, fontSize: 18, color: Colors.text, fontWeight: '700', letterSpacing: 2 },
  helperText: { fontSize: 12, color: Colors.textSecondary, marginBottom: 12 },

  // History
  historySection: { marginBottom: 16, borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: 12 },
  historyLabel: { fontSize: 11, fontWeight: '700', color: Colors.textSecondary, letterSpacing: 0.5, marginBottom: 8 },
  historyChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  historyChip: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.primary + '10',
    borderWidth: 1.5, borderColor: Colors.primary + '30',
    borderRadius: 20, overflow: 'hidden',
  },
  historyChipMain: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 6, paddingLeft: 10, paddingRight: 6 },
  historyChipText: { fontSize: 13, fontWeight: '700', color: Colors.primary, letterSpacing: 1 },
  historyChipSub: { fontSize: 10, color: Colors.textSecondary, maxWidth: 80 },
  historyChipDelete: { paddingVertical: 6, paddingHorizontal: 8, borderLeftWidth: 1, borderLeftColor: Colors.primary + '25' },

  // Button
  checkBtn: {
    borderRadius: 14, paddingVertical: 15,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8,
  },
  checkBtnText: { color: Colors.white, fontSize: 15, fontWeight: '700' },

  // Result
  result: {
    backgroundColor: Colors.card,
    marginHorizontal: 16, borderRadius: 20, padding: 16, marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  errorCard: { alignItems: 'center', padding: 24 },
  errorIconWrap: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: Colors.danger + '12',
    justifyContent: 'center', alignItems: 'center', marginBottom: 12,
  },
  errorTitle: { fontSize: 17, fontWeight: '800', color: Colors.text, marginBottom: 6 },
  errorSub: { fontSize: 13, color: Colors.textSecondary, textAlign: 'center' },

  resultHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    marginBottom: 16, paddingBottom: 12,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  resultPNR: { fontSize: 13, fontWeight: '700', color: Colors.textSecondary },
  resultTrain: { fontSize: 15, fontWeight: '800', color: Colors.text, marginTop: 2 },
  statusBadge: {
    borderWidth: 1, borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  statusBadgeText: { fontSize: 11, fontWeight: '700' },

  infoGrid: { marginBottom: 8 },
  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: Colors.background,
  },
  infoLabel: { fontSize: 13, color: Colors.textSecondary },
  infoValue: { fontSize: 13, fontWeight: '600', color: Colors.text, maxWidth: 200, textAlign: 'right' },

  passengerTitle: { fontSize: 13, fontWeight: '700', color: Colors.text, marginTop: 12, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  passengerRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: Colors.background, gap: 12 },
  passengerNo: { width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center' },
  passengerNoText: { color: Colors.white, fontSize: 12, fontWeight: '700' },
  passengerInfo: { flex: 1 },
  passengerStatus: { fontSize: 13, fontWeight: '700', color: Colors.success },
  passengerCoach: { fontSize: 12, color: Colors.textSecondary },

  // Tip
  tip: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    backgroundColor: Colors.primary + '0D',
    borderWidth: 1, borderColor: Colors.primary + '25',
    borderRadius: 14, padding: 14, marginHorizontal: 16,
  },
  tipText: { flex: 1, fontSize: 13, color: Colors.textSecondary, lineHeight: 20 },
});
