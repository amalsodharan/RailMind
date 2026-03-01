import AsyncStorage from '@react-native-async-storage/async-storage';

const REMINDERS_KEY = 'railway_reminders';
const SETTINGS_KEY = 'railway_settings';

export const DEFAULT_SETTINGS = {
  notificationsEnabled: true,
  advanceNoticeMinutes: 60,
  soundEnabled: true,
};

// --- Reminders ---

export const getReminders = async () => {
  try {
    const data = await AsyncStorage.getItem(REMINDERS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const saveReminder = async (reminder) => {
  const reminders = await getReminders();
  reminders.push(reminder);
  await AsyncStorage.setItem(REMINDERS_KEY, JSON.stringify(reminders));
};

export const deleteReminder = async (id) => {
  const reminders = await getReminders();
  const updated = reminders.filter((r) => r.id !== id);
  await AsyncStorage.setItem(REMINDERS_KEY, JSON.stringify(updated));
};

export const clearAllReminders = async () => {
  await AsyncStorage.removeItem(REMINDERS_KEY);
};

// --- Settings ---

export const getSettings = async () => {
  try {
    const data = await AsyncStorage.getItem(SETTINGS_KEY);
    return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
};

export const saveSettings = async (settings) => {
  await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
};

// --- PNR History ---

const PNR_HISTORY_KEY = 'pnr_history';

export const getPNRHistory = async () => {
  try {
    const data = await AsyncStorage.getItem(PNR_HISTORY_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const savePNREntry = async (entry) => {
  const history = await getPNRHistory();
  // Remove existing entry for same PNR to avoid duplicates
  const filtered = history.filter((h) => h.pnr !== entry.pnr);
  // Add new at front (most recent first)
  filtered.unshift(entry);
  // Keep max 10 recent
  await AsyncStorage.setItem(PNR_HISTORY_KEY, JSON.stringify(filtered.slice(0, 10)));
};

export const deletePNREntry = async (pnr) => {
  const history = await getPNRHistory();
  const updated = history.filter((h) => h.pnr !== pnr);
  await AsyncStorage.setItem(PNR_HISTORY_KEY, JSON.stringify(updated));
};
