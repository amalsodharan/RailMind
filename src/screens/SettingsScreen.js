import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  Alert,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { getSettings, saveSettings, clearAllReminders } from '../utils/storage';
import { cancelAllNotifications } from '../utils/notifications';

const ADVANCE_OPTIONS = [
  { label: '30 minutes', value: 30 },
  { label: '1 hour', value: 60 },
  { label: '6 hours', value: 360 },
  { label: '12 hours', value: 720 },
  { label: '1 day', value: 1440 },
];

export const SettingsScreen = () => {
  const insets = useSafeAreaInsets();
  const [settings, setSettings] = useState({
    notificationsEnabled: true,
    advanceNoticeMinutes: 60,
    soundEnabled: true,
  });

  useFocusEffect(
    useCallback(() => {
      loadSettings();
    }, [])
  );

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
      <ScrollView style={styles.container}>
        <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <Ionicons name="settings" size={28} color={Colors.white} />
          <Text style={styles.headerTitle}>Settings</Text>
        </View>

        {/* Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>

          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Ionicons name="notifications-outline" size={20} color={Colors.primary} />
              <View style={styles.rowText}>
                <Text style={styles.rowLabel}>Enable Notifications</Text>
                <Text style={styles.rowSub}>Receive booking reminders</Text>
              </View>
            </View>
            <Switch
              value={settings.notificationsEnabled}
              onValueChange={(v) => updateSetting('notificationsEnabled', v)}
              trackColor={{ false: Colors.border, true: Colors.primaryLight }}
              thumbColor={settings.notificationsEnabled ? Colors.primary : Colors.white}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Ionicons name="volume-high-outline" size={20} color={Colors.primary} />
              <View style={styles.rowText}>
                <Text style={styles.rowLabel}>Sound</Text>
                <Text style={styles.rowSub}>Play sound with notifications</Text>
              </View>
            </View>
            <Switch
              value={settings.soundEnabled}
              onValueChange={(v) => updateSetting('soundEnabled', v)}
              trackColor={{ false: Colors.border, true: Colors.primaryLight }}
              thumbColor={settings.soundEnabled ? Colors.primary : Colors.white}
              disabled={!settings.notificationsEnabled}
            />
          </View>
        </View>

        {/* Advance Notice */}
        <View style={[styles.section, { marginTop: 16 }]}>
          <Text style={styles.sectionTitle}>Advance Notice</Text>
          <Text style={styles.sectionSub}>How early to remind you before booking opens</Text>
          {ADVANCE_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              style={styles.optionRow}
              onPress={() => updateSetting('advanceNoticeMinutes', opt.value)}
            >
              <Text style={styles.optionLabel}>{opt.label}</Text>
              {settings.advanceNoticeMinutes === opt.value && (
                <Ionicons name="checkmark-circle" size={22} color={Colors.primary} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Danger Zone */}
        <View style={[styles.section, { marginTop: 16, marginBottom: 16 }]}>
          <Text style={styles.sectionTitle}>Data</Text>
          <TouchableOpacity style={styles.dangerBtn} onPress={handleClearAll}>
            <Ionicons name="trash-outline" size={18} color={Colors.danger} />
            <Text style={styles.dangerBtnText}>Clear All Reminders</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.version}>RailMind v1.0.0</Text>
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
    gap: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.white,
  },
  section: {
    backgroundColor: Colors.card,
    margin: 16,
    marginBottom: 0,
    borderRadius: 16,
    padding: 16,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  rowText: { flex: 1 },
  rowLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  rowSub: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.background,
    marginVertical: 4,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.background,
  },
  optionLabel: {
    fontSize: 14,
    color: Colors.text,
  },
  dangerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderColor: Colors.danger,
    borderRadius: 12,
    justifyContent: 'center',
    marginTop: 8,
  },
  dangerBtnText: {
    color: Colors.danger,
    fontSize: 14,
    fontWeight: '700',
  },
  version: {
    textAlign: 'center',
    color: Colors.textSecondary,
    fontSize: 12,
    marginVertical: 24,
  },
});
