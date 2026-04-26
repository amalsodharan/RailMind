import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { ReminderCard } from '../components/ReminderCard';
import { getReminders, deleteReminder } from '../utils/storage';
import { cancelNotification } from '../utils/notifications';

export const RemindersScreen = () => {
  const insets = useSafeAreaInsets();
  const [reminders, setReminders] = useState([]);

  useFocusEffect(
    useCallback(() => { loadReminders(); }, [])
  );

  const loadReminders = async () => {
    const data = await getReminders();
    data.sort((a, b) => new Date(a.reminderTime) - new Date(b.reminderTime));
    setReminders(data);
  };

  const handleDelete = async (id) => {
    const reminder = reminders.find((r) => r.id === id);
    if (reminder?.notificationIds?.length) {
      for (const nid of reminder.notificationIds) await cancelNotification(nid);
    } else if (reminder?.notificationId) {
      await cancelNotification(reminder.notificationId);
    }
    await deleteReminder(id);
    await loadReminders();
  };

  const now = new Date();
  const upcoming = reminders.filter(r => new Date(r.reminderTime) >= now);
  const past = reminders.filter(r => new Date(r.reminderTime) < now);

  const renderSection = (title, data) => (
    data.length > 0 && (
      <>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{title}</Text>
          <View style={styles.sectionCount}>
            <Text style={styles.sectionCountText}>{data.length}</Text>
          </View>
        </View>
        {data.map(item => (
          <ReminderCard key={item.id} reminder={item} onDelete={handleDelete} />
        ))}
      </>
    )
  );

  return (
    <SafeAreaView style={styles.safe}>
      {/* Gradient header */}
      <LinearGradient
        colors={[Colors.primary, Colors.primaryLight]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: insets.top + 12 }]}
      >
        <View>
          <Text style={styles.headerTitle}>Reminders</Text>
          <Text style={styles.headerSub}>
            {reminders.length} booking alert{reminders.length !== 1 ? 's' : ''}
          </Text>
        </View>
      </LinearGradient>

      {reminders.length === 0 ? (
        <View style={styles.empty}>
          <View style={styles.emptyIcon}>
            <Ionicons name="notifications-off-outline" size={40} color={Colors.textSecondary} />
          </View>
          <Text style={styles.emptyTitle}>No Reminders Yet</Text>
          <Text style={styles.emptySub}>
            Your booking alerts will appear here. Search for a train and set your first reminder.
          </Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.list}>
            {renderSection(`Upcoming Alerts (${upcoming.length})`, upcoming)}
            {renderSection(`Past Reminders (${past.length})`, past)}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.white,
    letterSpacing: -0.5,
  },
  headerSub: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  list: { padding: 16 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  sectionCount: {
    backgroundColor: Colors.primary + '20',
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 1,
  },
  sectionCountText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 8,
  },
  emptySub: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});
