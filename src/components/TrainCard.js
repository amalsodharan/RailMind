import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DAY_KEYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export const TrainCard = ({ train, onPress }) => {
  const { train_base } = train;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.header}>
        <View>
          <Text style={styles.trainName}>{train_base.train_name}</Text>
          <Text style={styles.trainNo}>#{train_base.train_no}</Text>
        </View>
        <View style={styles.timeContainer}>
          <Text style={styles.time}>{train_base.from_time}</Text>
          <View style={styles.durationRow}>
            <View style={styles.line} />
            <Ionicons name="train" size={14} color={Colors.accent} />
            <View style={styles.line} />
          </View>
          <Text style={styles.time}>{train_base.to_time}</Text>
        </View>
      </View>

      <View style={styles.stationsRow}>
        <Text style={styles.station}>{train_base.from_stn_name}</Text>
        <Text style={styles.duration}>{train_base.travel_time}</Text>
        <Text style={styles.station}>{train_base.to_stn_name}</Text>
      </View>

      <View style={styles.daysRow}>
        {DAY_KEYS.map((key, i) => (
          <View
            key={key}
            style={[
              styles.dayBadge,
              train_base.running_days?.[key] === 1 && styles.dayBadgeActive,
            ]}
          >
            <Text
              style={[
                styles.dayText,
                train_base.running_days?.[key] === 1 && styles.dayTextActive,
              ]}
            >
              {DAYS[i]}
            </Text>
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  trainName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
    maxWidth: 180,
  },
  trainNo: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  timeContainer: { alignItems: 'center' },
  time: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
  },
  durationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
  },
  line: {
    width: 20,
    height: 1,
    backgroundColor: Colors.border,
  },
  stationsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  station: {
    fontSize: 12,
    color: Colors.textSecondary,
    maxWidth: 120,
  },
  duration: {
    fontSize: 11,
    color: Colors.accent,
    fontWeight: '600',
  },
  daysRow: {
    flexDirection: 'row',
    gap: 4,
    flexWrap: 'wrap',
  },
  dayBadge: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dayBadgeActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  dayText: {
    fontSize: 10,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  dayTextActive: {
    color: Colors.white,
  },
});
