import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { Colors } from '../theme/colors';

export const ReminderCard = ({ reminder, onDelete }) => {
  const handleDelete = () => {
    Alert.alert('Delete Reminder', 'Are you sure you want to delete this reminder?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => onDelete(reminder.id) },
    ]);
  };

  const reminderDate = new Date(reminder.reminderTime);
  const isPast = reminderDate < new Date();

  return (
    <View style={[styles.card, isPast && styles.pastCard]}>
      <View style={styles.iconContainer}>
        <Ionicons name="alarm" size={24} color={isPast ? Colors.textSecondary : Colors.primary} />
      </View>
      <View style={styles.content}>
        <Text style={styles.trainName}>{reminder.trainName}</Text>
        <Text style={styles.trainNo}>#{reminder.trainNo}</Text>
        <View style={styles.routeRow}>
          <Text style={styles.station}>{reminder.fromStation}</Text>
          <Ionicons name="arrow-forward" size={12} color={Colors.textSecondary} />
          <Text style={styles.station}>{reminder.toStation}</Text>
        </View>
        <View style={styles.timeRow}>
          <Ionicons
            name="time-outline"
            size={13}
            color={isPast ? Colors.textSecondary : Colors.accent}
          />
          <Text style={[styles.time, isPast && styles.pastTime]}>
            {format(reminderDate, 'MMM dd, yyyy • hh:mm a')}
          </Text>
          {isPast && <Text style={styles.pastBadge}>Passed</Text>}
        </View>
      </View>
      <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
        <Ionicons name="trash-outline" size={20} color={Colors.danger} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  pastCard: {
    opacity: 0.6,
    borderColor: '#ECEFF1',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  content: { flex: 1 },
  trainName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
  },
  trainNo: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  station: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  time: {
    fontSize: 12,
    color: Colors.accent,
    fontWeight: '600',
  },
  pastTime: {
    color: Colors.textSecondary,
  },
  pastBadge: {
    fontSize: 10,
    color: Colors.danger,
    fontWeight: '700',
    backgroundColor: '#FFEBEE',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  deleteBtn: { padding: 8 },
});
