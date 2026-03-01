import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { getPNRStatus } from '../api/trainApi';

export const PNRScreen = () => {
  const insets = useSafeAreaInsets();
  const [pnr, setPnr] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  const handleCheck = async () => {
    if (pnr.length !== 10) {
      Alert.alert('Error', 'PNR number must be 10 digits');
      return;
    }
    setLoading(true);
    setStatus(null);
    try {
      const data = await getPNRStatus(pnr);
      setStatus(data);
    } catch (e) {
      Alert.alert('Error', e?.message || 'Failed to fetch PNR status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.container}>
        <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <Ionicons name="ticket" size={28} color={Colors.white} />
          <Text style={styles.headerTitle}>PNR Status</Text>
          <Text style={styles.headerSub}>Check your booking status</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>PNR NUMBER</Text>
          <TextInput
            style={styles.input}
            value={pnr}
            onChangeText={setPnr}
            placeholder="Enter 10-digit PNR"
            placeholderTextColor={Colors.textSecondary}
            keyboardType="numeric"
            maxLength={10}
          />
          <TouchableOpacity style={styles.checkBtn} onPress={handleCheck}>
            {loading ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <>
                <Ionicons name="search" size={18} color={Colors.white} />
                <Text style={styles.checkBtnText}>Check Status</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {status && (
          <View style={styles.result}>
            {status.success === false ? (
              <View style={styles.errorCard}>
                <Ionicons name="close-circle" size={40} color={Colors.danger} />
                <Text style={styles.errorText}>PNR not found or invalid</Text>
              </View>
            ) : (
              <>
                <View style={styles.resultHeader}>
                  <Text style={styles.resultTitle}>PNR: {pnr}</Text>
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusBadgeText}>
                      {status?.data?.BookingStatus || 'Active'}
                    </Text>
                  </View>
                </View>

                {status?.data && (
                  <>
                    {[
                      ['Train', status.data.TrainName || status.data.trainName],
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

                    {status.data.PassengerStatus?.length > 0 && (
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
                                Coach: {p.CurrentCoach || p.currentCoach || '—'} · Berth:{' '}
                                {p.CurrentBerth || p.currentBerth || '—'}
                              </Text>
                            </View>
                          </View>
                        ))}
                      </>
                    )}
                  </>
                )}
              </>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  container: { flex: 1 },
  header: {
    backgroundColor: Colors.primary,
    padding: 24,
    paddingTop: 24,
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
  form: {
    backgroundColor: Colors.card,
    margin: 16,
    borderRadius: 16,
    padding: 16,
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
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: Colors.background,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 18,
    color: Colors.text,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 2,
    marginBottom: 12,
  },
  checkBtn: {
    backgroundColor: Colors.primaryLight,
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  checkBtnText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
  result: {
    backgroundColor: Colors.card,
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    marginBottom: 32,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  errorCard: {
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: Colors.danger,
    fontSize: 15,
    fontWeight: '600',
    marginTop: 8,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.text,
  },
  statusBadge: {
    backgroundColor: Colors.success,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusBadgeText: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: '700',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.background,
  },
  infoLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text,
    maxWidth: 200,
    textAlign: 'right',
  },
  passengerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  passengerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.background,
    gap: 12,
  },
  passengerNo: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  passengerNoText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  passengerInfo: { flex: 1 },
  passengerStatus: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.success,
  },
  passengerCoach: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
});
