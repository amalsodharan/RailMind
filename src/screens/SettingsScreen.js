import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, Switch, TouchableOpacity,
  Alert, ScrollView, SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { getSettings, saveSettings, clearAllReminders } from '../utils/storage';
import { cancelAllNotifications } from '../utils/notifications';

const ADVANCE_OPTIONS = [
  { label: '30 minutes', value: 30 },
  { label: '1 hour',     value: 60 },
  { label: '6 hours',    value: 360 },
  { label: '12 hours',   value: 720 },
  { label: '1 day',      value: 1440 },
];

const SettingRow = ({ icon, label, sub, children }) => (
  <View style={styles.row}>
    <View style={styles.rowIcon}>
      <Ionicons name={icon} size={18} color={Colors.primary} />
    </View>
    <View style={styles.rowText}>
      <Text style={styles.rowLabel}>{label}</Text>
      {sub ? <Text style={styles.rowSub}>{sub}</Text> : null}
    </View>
    {children}
  </View>
);

export const SettingsScreen = () => {
  const insets = useSafeAreaInsets();
  const [settings, setSettings] = useState({
    notificationsEnabled: true,
    advanceNoticeMinutes: 60,
    soundEnabled: true,
  });

  useFocusEffect(useCallback(() => { loadSettings(); }, []));

  const loadSettings = async () => {
    const s = await getSettings();
    setSettings(s);
  };

  const updateSetting = async (key, value) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    await saveSettings(updated);
  };

  const handleClearAll = () => {
    Alert.alert(
      'Clear All Reminders',
      'This will delete all saved reminders and cancel all notifications. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            await cancelAllNotifications();
            await clearAllReminders();
            Alert.alert('Done', 'All reminders have been cleared');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

        {/* ── Gradient Header ── */}
        <LinearGradient
          colors={[Colors.primary, Colors.primaryLight]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.header, { paddingTop: insets.top + 16 }]}
        >
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.headerTitle}>Settings</Text>
              <Text style={styles.headerSub}>Notifications & preferences</Text>
            </View>
            <View style={styles.headerIcon}>
              <Ionicons name="settings-outline" size={22} color={Colors.primary} />
            </View>
          </View>
        </LinearGradient>

        {/* ── Notifications ── */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>NOTIFICATIONS</Text>

          <SettingRow
            icon="notifications-outline"
            label="Enable Notifications"
            sub="Receive booking reminders"
          >
            <Switch
              value={settings.notificationsEnabled}
              onValueChange={(v) => updateSetting('notificationsEnabled', v)}
              trackColor={{ false: Colors.border, true: Colors.primaryLight }}
              thumbColor={settings.notificationsEnabled ? Colors.primary : Colors.white}
            />
          </SettingRow>

          <View style={styles.divider} />

          <SettingRow
            icon="volume-high-outline"
            label="Sound"
            sub="Play sound with notifications"
          >
            <Switch
              value={settings.soundEnabled}
              onValueChange={(v) => updateSetting('soundEnabled', v)}
              trackColor={{ false: Colors.border, true: Colors.primaryLight }}
              thumbColor={settings.soundEnabled ? Colors.primary : Colors.white}
              disabled={!settings.notificationsEnabled}
            />
          </SettingRow>
        </View>

        {/* ── Advance Notice ── */}
        <View style={[styles.section, { marginTop: 12 }]}>
          <Text style={styles.sectionLabel}>ADVANCE NOTICE</Text>
          <Text style={styles.sectionSub}>How early to remind you before booking opens</Text>
          {ADVANCE_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              style={styles.optionRow}
              onPress={() => updateSetting('advanceNoticeMinutes', opt.value)}
              activeOpacity={0.7}
            >
              <View style={styles.optionLeft}>
                <View style={[styles.optionRadio, settings.advanceNoticeMinutes === opt.value && styles.optionRadioActive]}>
                  {settings.advanceNoticeMinutes === opt.value && <View style={styles.optionRadioDot} />}
                </View>
                <Text style={[styles.optionLabel, settings.advanceNoticeMinutes === opt.value && styles.optionLabelActive]}>
                  {opt.label}
                </Text>
              </View>
              {settings.advanceNoticeMinutes === opt.value && (
                <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* ── About ── */}
        <View style={[styles.section, { marginTop: 12 }]}>
          <Text style={styles.sectionLabel}>ABOUT</Text>
          <SettingRow icon="train-outline" label="RailMind" sub="Indian Railway Booking Reminder" />
          <View style={styles.divider} />
          <SettingRow icon="code-slash-outline" label="Version" sub="1.0.0 — Production Build" />
        </View>

        {/* ── Danger Zone ── */}
        <View style={[styles.section, { marginTop: 12, marginBottom: 24 }]}>
          <Text style={[styles.sectionLabel, { color: Colors.danger }]}>DANGER ZONE</Text>
          <TouchableOpacity style={styles.dangerBtn} onPress={handleClearAll} activeOpacity={0.8}>
            <View style={styles.dangerIcon}>
              <Ionicons name="trash-outline" size={18} color={Colors.danger} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.dangerBtnText}>Clear All Reminders</Text>
              <Text style={styles.dangerBtnSub}>Delete all saved booking reminders</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={Colors.danger} />
          </TouchableOpacity>
        </View>

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
  headerIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.white, justifyContent: 'center', alignItems: 'center' },

  // Section
  section: {
    backgroundColor: Colors.card,
    marginHorizontal: 16, marginTop: -16,
    borderRadius: 20, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
    marginBottom: 0,
  },
  sectionLabel: { fontSize: 11, fontWeight: '800', color: Colors.textSecondary, letterSpacing: 1, marginBottom: 12 },
  sectionSub: { fontSize: 12, color: Colors.textSecondary, marginBottom: 12, marginTop: -8 },
  divider: { height: 1, backgroundColor: Colors.background, marginVertical: 2 },

  // Row
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: 12 },
  rowIcon: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: Colors.primary + '12',
    justifyContent: 'center', alignItems: 'center',
  },
  rowText: { flex: 1 },
  rowLabel: { fontSize: 14, fontWeight: '600', color: Colors.text },
  rowSub: { fontSize: 12, color: Colors.textSecondary, marginTop: 1 },

  // Options
  optionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.background },
  optionLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  optionRadio: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: Colors.border, justifyContent: 'center', alignItems: 'center' },
  optionRadioActive: { borderColor: Colors.primary },
  optionRadioDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primary },
  optionLabel: { fontSize: 14, color: Colors.textSecondary },
  optionLabelActive: { color: Colors.text, fontWeight: '600' },

  // Danger
  dangerBtn: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 4 },
  dangerIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: Colors.danger + '12', justifyContent: 'center', alignItems: 'center' },
  dangerBtnText: { fontSize: 14, fontWeight: '700', color: Colors.danger },
  dangerBtnSub: { fontSize: 12, color: Colors.danger + 'AA', marginTop: 1 },
});
