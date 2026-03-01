import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format, addDays } from 'date-fns';
import { Colors } from '../theme/colors';
import { getTrainRoute } from '../api/trainApi';
import { saveReminder, getSettings } from '../utils/storage';
import { scheduleNotification, requestNotificationPermission } from '../utils/notifications';

export const TrainDetailScreen = ({ route, navigation }) => {
  const { train } = route.params;
  const trainBase = train.train_base;

  const [routeData, setRouteData] = useState([]);
  const [loadingRoute, setLoadingRoute] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);

  // Segmented date/time state
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [hour, setHour] = useState('');
  const [minute, setMinute] = useState('');
  const [ampm, setAmpm] = useState('AM');

  // Refs for auto-advancing focus
  const monthRef = useRef();
  const yearRef = useRef();
  const hourRef = useRef();
  const minuteRef = useRef();

  useEffect(() => { fetchRoute(); }, []);

  const fetchRoute = async () => {
    try {
      const data = await getTrainRoute(trainBase.train_no);
      if (data?.success && Array.isArray(data?.data)) setRouteData(data.data);
    } catch (e) {
      console.log('Route fetch error', e);
    } finally {
      setLoadingRoute(false);
    }
  };

  const applyQuickSelect = (daysFromNow) => {
    const d = addDays(new Date(), daysFromNow);
    setDay(String(d.getDate()).padStart(2, '0'));
    setMonth(String(d.getMonth() + 1).padStart(2, '0'));
    setYear(String(d.getFullYear()));
  };

  const getReminderDateTime = () => {
    const d = parseInt(day);
    const mo = parseInt(month);
    const y = parseInt(year);
    let h = parseInt(hour);
    const mi = parseInt(minute);
    if (!d || !mo || !y || isNaN(h) || isNaN(mi)) return null;
    if (ampm === 'PM' && h < 12) h += 12;
    if (ampm === 'AM' && h === 12) h = 0;
    return new Date(y, mo - 1, d, h, mi, 0);
  };

  const isDateComplete = () => day.length === 2 && month.length === 2 && year.length === 4;
  const isTimeComplete = () => hour.length >= 1 && minute.length === 2;
  const isFormValid = () => isDateComplete() && isTimeComplete();

  const resetModal = () => {
    setDay(''); setMonth(''); setYear('');
    setHour(''); setMinute(''); setAmpm('AM');
    setModalVisible(false);
  };

  const handleSetReminder = async () => {
    const reminderDateTime = getReminderDateTime();
    if (!reminderDateTime) {
      Alert.alert('Missing Info', 'Please fill in all date and time fields.');
      return;
    }
    if (isNaN(reminderDateTime.getTime())) {
      Alert.alert('Invalid Date', 'The date or time you entered is not valid.');
      return;
    }
    if (reminderDateTime <= new Date()) {
      Alert.alert('Invalid Time', 'Please choose a future date and time.');
      return;
    }
    setSaving(true);
    try {
      const hasPermission = await requestNotificationPermission();
      const settings = await getSettings();
      let notificationId = '';
      if (hasPermission && settings.notificationsEnabled) {
        notificationId = await scheduleNotification(
          '🚂 Train Booking Reminder',
          `Book your ticket for ${trainBase.train_name} (${trainBase.from_stn_name} → ${trainBase.to_stn_name})`,
          reminderDateTime,
          settings.soundEnabled
        );
      }
      const reminder = {
        id: Date.now().toString(),
        trainNo: trainBase.train_no,
        trainName: trainBase.train_name,
        fromStation: trainBase.from_stn_name,
        toStation: trainBase.to_stn_name,
        reminderTime: reminderDateTime.toISOString(),
        notificationId,
        createdAt: new Date().toISOString(),
      };
      await saveReminder(reminder);
      resetModal();
      Alert.alert(
        '✅ Reminder Set!',
        `You'll be reminded on ${format(reminderDateTime, "MMM dd, yyyy 'at' hh:mm a")}`,
        [
          { text: 'View Reminders', onPress: () => navigation.navigate('Reminders') },
          { text: 'OK' },
        ]
      );
    } catch (e) {
      Alert.alert('Error', e?.message || 'Failed to set reminder');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.container}>
        {/* Train Header */}
        <View style={styles.trainHeader}>
          <View style={styles.trainHeaderInner}>
            <Ionicons name="train" size={28} color={Colors.white} />
            <View style={{ marginLeft: 12 }}>
              <Text style={styles.trainName}>{trainBase.train_name}</Text>
              <Text style={styles.trainNo}>#{trainBase.train_no}</Text>
            </View>
          </View>
          <View style={styles.tripInfo}>
            <View style={styles.tripStation}>
              <Text style={styles.tripTime}>{trainBase.from_time}</Text>
              <Text style={styles.tripStationName}>{trainBase.from_stn_name}</Text>
            </View>
            <View style={styles.tripMiddle}>
              <View style={styles.tripLine} />
              <Ionicons name="arrow-forward-circle" size={24} color={Colors.accent} />
              <View style={styles.tripLine} />
            </View>
            <View style={styles.tripStation}>
              <Text style={styles.tripTime}>{trainBase.to_time}</Text>
              <Text style={styles.tripStationName}>{trainBase.to_stn_name}</Text>
            </View>
          </View>
          <Text style={styles.travelTime}>Journey: {trainBase.travel_time}</Text>
        </View>

        {/* Set Reminder Button */}
        <TouchableOpacity style={styles.reminderBtn} onPress={() => setModalVisible(true)}>
          <Ionicons name="alarm" size={20} color={Colors.white} />
          <Text style={styles.reminderBtnText}>Set Booking Reminder</Text>
        </TouchableOpacity>

        {/* Route */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Route</Text>

          {loadingRoute ? (
            <ActivityIndicator color={Colors.primary} style={{ marginTop: 20 }} />
          ) : routeData.length === 0 ? (
            <Text style={styles.noRoute}>Route data not available</Text>
          ) : (
            routeData.map((station, index) => (
              <View key={index} style={styles.stationRow}>
                <View style={styles.stationDot}>
                  <View
                    style={[
                      styles.dot,
                      (index === 0 || index === routeData.length - 1) && styles.dotHighlight,
                    ]}
                  />
                  {index < routeData.length - 1 && <View style={styles.connector} />}
                </View>
                <View style={styles.stationInfo}>
                  <Text style={styles.stationName}>{station.source_stn_name}</Text>
                  <Text style={styles.stationCode}>
                    {station.source_stn_code}
                    {station.day && station.day !== '1' ? `  · Day ${station.day}` : ''}
                  </Text>
                  <View style={styles.stationTimes}>
                    <Text style={styles.stationTime}>Arr: {station.arrive}</Text>
                    <Text style={styles.stationTimeSep}>·</Text>
                    <Text style={styles.stationTime}>Dep: {station.depart}</Text>
                    <Text style={styles.distance}>{station.distance} km</Text>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Reminder Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={resetModal}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />

            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>⏰ Set Reminder</Text>
                <Text style={styles.modalSub} numberOfLines={1}>{trainBase.train_name}</Text>
              </View>
              <TouchableOpacity onPress={resetModal} style={styles.closeBtn}>
                <Ionicons name="close" size={20} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Quick Select */}
            <Text style={styles.modalLabel}>QUICK SELECT</Text>
            <View style={styles.quickRow}>
              {[{ label: 'Tomorrow', days: 1 }, { label: '+3 Days', days: 3 }, { label: '+1 Week', days: 7 }].map(({ label, days }) => {
                const chipDate = addDays(new Date(), days);
                const isActive = day === String(chipDate.getDate()).padStart(2, '0')
                  && month === String(chipDate.getMonth() + 1).padStart(2, '0')
                  && year === String(chipDate.getFullYear());
                return (
                  <TouchableOpacity
                    key={label}
                    style={[styles.chip, isActive && styles.chipActive]}
                    onPress={() => applyQuickSelect(days)}
                  >
                    <Text style={[styles.chipText, isActive && styles.chipTextActive]}>{label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Date Segments */}
            <Text style={[styles.modalLabel, { marginTop: 16 }]}>📅 DATE</Text>
            <View style={styles.segmentRow}>
              <View style={styles.segmentBox}>
                <Text style={styles.segmentLabel}>DD</Text>
                <TextInput
                  style={styles.segmentInput}
                  value={day}
                  onChangeText={(v) => {
                    const clean = v.replace(/\D/g, '').slice(0, 2);
                    setDay(clean);
                    if (clean.length === 2) monthRef.current?.focus();
                  }}
                  placeholder="DD"
                  placeholderTextColor={Colors.textSecondary}
                  keyboardType="numeric"
                  maxLength={2}
                  returnKeyType="next"
                />
              </View>
              <Text style={styles.segmentSep}>/</Text>
              <View style={styles.segmentBox}>
                <Text style={styles.segmentLabel}>MM</Text>
                <TextInput
                  ref={monthRef}
                  style={styles.segmentInput}
                  value={month}
                  onChangeText={(v) => {
                    const clean = v.replace(/\D/g, '').slice(0, 2);
                    setMonth(clean);
                    if (clean.length === 2) yearRef.current?.focus();
                  }}
                  placeholder="MM"
                  placeholderTextColor={Colors.textSecondary}
                  keyboardType="numeric"
                  maxLength={2}
                  returnKeyType="next"
                />
              </View>
              <Text style={styles.segmentSep}>/</Text>
              <View style={[styles.segmentBox, { flex: 2 }]}>
                <Text style={styles.segmentLabel}>YYYY</Text>
                <TextInput
                  ref={yearRef}
                  style={styles.segmentInput}
                  value={year}
                  onChangeText={(v) => {
                    const clean = v.replace(/\D/g, '').slice(0, 4);
                    setYear(clean);
                    if (clean.length === 4) hourRef.current?.focus();
                  }}
                  placeholder="YYYY"
                  placeholderTextColor={Colors.textSecondary}
                  keyboardType="numeric"
                  maxLength={4}
                  returnKeyType="next"
                />
              </View>
            </View>

            {/* Time Segments */}
            <Text style={[styles.modalLabel, { marginTop: 16 }]}>⏱ TIME</Text>
            <View style={styles.segmentRow}>
              <View style={styles.segmentBox}>
                <Text style={styles.segmentLabel}>HH</Text>
                <TextInput
                  ref={hourRef}
                  style={styles.segmentInput}
                  value={hour}
                  onChangeText={(v) => {
                    const clean = v.replace(/\D/g, '').slice(0, 2);
                    setHour(clean);
                    if (clean.length === 2) minuteRef.current?.focus();
                  }}
                  placeholder="HH"
                  placeholderTextColor={Colors.textSecondary}
                  keyboardType="numeric"
                  maxLength={2}
                  returnKeyType="next"
                />
              </View>
              <Text style={styles.segmentSep}>:</Text>
              <View style={styles.segmentBox}>
                <Text style={styles.segmentLabel}>MM</Text>
                <TextInput
                  ref={minuteRef}
                  style={styles.segmentInput}
                  value={minute}
                  onChangeText={(v) => {
                    const clean = v.replace(/\D/g, '').slice(0, 2);
                    setMinute(clean);
                  }}
                  placeholder="MM"
                  placeholderTextColor={Colors.textSecondary}
                  keyboardType="numeric"
                  maxLength={2}
                  returnKeyType="done"
                />
              </View>
              {/* AM / PM Toggle */}
              <View style={styles.ampmRow}>
                {['AM', 'PM'].map((v) => (
                  <TouchableOpacity
                    key={v}
                    style={[styles.ampmBtn, ampm === v && styles.ampmBtnActive]}
                    onPress={() => setAmpm(v)}
                  >
                    <Text style={[styles.ampmText, ampm === v && styles.ampmTextActive]}>{v}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Preview */}
            {isFormValid() && (() => {
              const dt = getReminderDateTime();
              return dt && !isNaN(dt.getTime()) ? (
                <View style={styles.previewBox}>
                  <Ionicons name="notifications" size={16} color={Colors.primary} />
                  <Text style={styles.previewText}>
                    Reminder on {format(dt, "MMM dd, yyyy 'at' hh:mm a")}
                  </Text>
                </View>
              ) : null;
            })()}

            {/* Actions */}
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={resetModal}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmBtn, !isFormValid() && styles.confirmBtnDisabled]}
                onPress={handleSetReminder}
                disabled={saving || !isFormValid()}
              >
                {saving
                  ? <ActivityIndicator color={Colors.white} />
                  : <Text style={styles.confirmBtnText}>Set Reminder</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  container: { flex: 1 },
  trainHeader: {
    backgroundColor: Colors.primary,
    padding: 20,
  },
  trainHeaderInner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  trainName: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.white,
  },
  trainNo: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
  },
  tripInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tripStation: { alignItems: 'center' },
  tripMiddle: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tripLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  tripTime: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.white,
  },
  tripStationName: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 2,
  },
  travelTime: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
  },
  reminderBtn: {
    backgroundColor: Colors.success,
    margin: 16,
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    shadowColor: Colors.success,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  reminderBtnText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
  section: {
    backgroundColor: Colors.card,
    margin: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 16,
  },
  noRoute: {
    color: Colors.textSecondary,
    textAlign: 'center',
    padding: 20,
  },
  stationRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  stationDot: {
    alignItems: 'center',
    width: 24,
    marginRight: 12,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.border,
    marginTop: 4,
  },
  dotHighlight: {
    backgroundColor: Colors.primary,
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  connector: {
    width: 2,
    flex: 1,
    backgroundColor: Colors.border,
    marginVertical: 2,
    minHeight: 30,
  },
  stationInfo: {
    flex: 1,
    paddingBottom: 16,
  },
  stationName: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
  },
  stationCode: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  stationTimes: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  stationTime: {
    fontSize: 11,
    color: Colors.accent,
  },
  stationTimeSep: { color: Colors.border },
  distance: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginLeft: 'auto',
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 44,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 2,
  },
  modalSub: {
    fontSize: 13,
    color: Colors.textSecondary,
    maxWidth: 240,
  },
  modalLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  quickRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 4,
  },
  chip: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  chipTextActive: {
    color: Colors.white,
  },
  segmentRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
  },
  segmentBox: {
    flex: 1,
    alignItems: 'center',
  },
  segmentLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.primary,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  segmentInput: {
    width: '100%',
    backgroundColor: Colors.background,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingVertical: 10,
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
  },
  segmentSep: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textSecondary,
    paddingBottom: 8,
  },
  ampmRow: {
    flexDirection: 'column',
    gap: 4,
    marginLeft: 4,
  },
  ampmBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  ampmBtnActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  ampmText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  ampmTextActive: {
    color: Colors.white,
  },
  previewBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.primary + '15',
    borderRadius: 12,
    padding: 12,
    marginTop: 16,
  },
  previewText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  confirmBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: 'center',
  },
  confirmBtnDisabled: {
    backgroundColor: Colors.border,
  },
  confirmBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.white,
  },
});
