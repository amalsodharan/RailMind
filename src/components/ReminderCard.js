import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format, differenceInDays } from 'date-fns';
import { Colors } from '../theme/colors';

export const ReminderCard = ({ reminder, onDelete }) => {
  const handleDelete = () => {
    Alert.alert('Delete Reminder?', 'Are you sure you want to remove this booking alert?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => onDelete(reminder.id) },
    ]);
  };

  const reminderDate = new Date(reminder.reminderTime);
  const isPast = reminderDate < new Date();
  const daysLeft = differenceInDays(reminderDate, new Date());

  return (
    <View style={[styles.card, isPast && styles.pastCard]}>
      {/* Top row: train no + badge */}
      <View style={styles.topRow}>
        <View style={styles.trainNoChip}>
          <Ionicons name="train-outline" size={12} color={Colors.primary} />
          <Text style={styles.trainNoText}>#{reminder.trainNo}</Text>
        </View>
        {isPast ? (
          <View style={styles.badgePast}><Text style={styles.badgePastText}>Passed</Text></View>
        ) : (
          <View style={styles.badgeUpcoming}>
            <Text style={styles.badgeUpcomingText}>
              {daysLeft === 0 ? 'Today' : `In ${daysLeft} Day${daysLeft !== 1 ? 's' : ''}`}
            </Text>
          </View>
        )}
      </View>

      {/* Train name */}
      <Text style={[styles.trainName, isPast && styles.pastText]} numberOfLines={1}>
        {reminder.trainName}
      </Text>

      {/* FROM → TO */}
      <View style={styles.routeRow}>
        <View style={styles.stationBox}>
          <Text style={styles.stationLabel}>FROM</Text>
          <View style={styles.stationInner}>
            <Ionicons name="location-outline" size={11} color={Colors.primary} />
            <Text style={styles.stationText} numberOfLines={1}>{reminder.fromStation || '—'}</Text>
          </View>
        </View>
        <Ionicons name="arrow-forward" size={16} color={Colors.textSecondary} style={{ marginTop: 14 }} />
        <View style={styles.stationBox}>
          <Text style={styles.stationLabel}>TO</Text>
          <View style={styles.stationInner}>
            <Ionicons name="location-outline" size={11} color={Colors.success} />
            <Text style={styles.stationText} numberOfLines={1}>{reminder.toStation || '—'}</Text>
          </View>
        </View>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Bottom: date time + mode + delete */}
      <View style={styles.bottomRow}>
        <View style={styles.bottomLeft}>
          <View style={styles.metaItem}>
            <Ionicons name="calendar-outline" size={12} color={Colors.textSecondary} />
            <Text style={styles.metaText}>{format(reminderDate, 'dd MMM yyyy')}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={12} color={Colors.textSecondary} />
            <Text style={styles.metaText}>{format(reminderDate, 'hh:mm a')}</Text>
          </View>
          {reminder.bookingMode && (
            <View style={styles.modeChip}>
              <Text style={styles.modeChipText}>{reminder.bookingMode}</Text>
            </View>
          )}
        </View>
        <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
          <Ionicons name="trash-outline" size={18} color={Colors.danger} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  pastCard: {
    opacity: 0.65,
    borderColor: '#ECEFF1',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  trainNoChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.border,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  trainNoText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
  badgeUpcoming: {
    backgroundColor: Colors.success + '20',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: Colors.success + '50',
  },
  badgeUpcomingText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.success,
  },
  badgePast: {
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  badgePastText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  trainName: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 12,
  },
  pastText: { color: Colors.textSecondary },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 12,
  },
  stationBox: { flex: 1 },
  stationLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  stationInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 8,
  },
  stationText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text,
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginBottom: 10,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bottomLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    flex: 1,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  modeChip: {
    backgroundColor: Colors.primary + '15',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  modeChipText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.primary,
  },
  deleteBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.danger + '12',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
