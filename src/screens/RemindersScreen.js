import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView } from 'react-native';
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
    useCallback(() => {
      loadReminders();
    }, [])
  );

  const loadReminders = async () => {
    const data = await getReminders();
    data.sort((a, b) => new Date(a.reminderTime) - new Date(b.reminderTime));
    setReminders(data);
  };

  const handleDelete = async (id) => {
    const reminder = reminders.find((r) => r.id === id);
    if (reminder?.notificationId) {
      await cancelNotification(reminder.notificationId);
    }
    await deleteReminder(id);
    await loadReminders();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Text style={styles.headerTitle}>Reminders</Text>
        <Text style={styles.headerSub}>
          {reminders.length} reminder{reminders.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {reminders.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="alarm-outline" size={64} color={Colors.border} />
          <Text style={styles.emptyTitle}>No Reminders Yet</Text>
          <Text style={styles.emptySub}>
            Search for a train and tap "Set Booking Reminder" to get notified before booking opens
          </Text>
        </View>
      ) : (
        <FlatList
          data={reminders}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <ReminderCard reminder={item} onDelete={handleDelete} />
          )}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    backgroundColor: Colors.primary,
    padding: 20,
    paddingTop: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.white,
  },
  headerSub: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 4,
  },
  list: { padding: 16 },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySub: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});
