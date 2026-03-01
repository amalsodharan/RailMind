# 🚂 RailMind

A React Native mobile app for Indian Railways — search trains, check PNR status, and set smart booking reminders.

---

## ✨ Features

- **Train Search** — Search trains by source and destination with live results
- **Train Details** — View schedules, seat availability, and fare information
- **PNR Status** — Check PNR status with history of previously checked PNRs for quick access
- **Reminders** — Set booking reminders and Tatkal booking alerts for your trains
- **Settings** — Customize notification preferences and reminder times

---

## 📱 Screenshots

> _Coming soon_

---

## 🛠 Tech Stack

| Category        | Technology                          |
|----------------|--------------------------------------|
| Framework       | React Native (Expo)                 |
| Navigation      | React Navigation (Bottom Tabs + Stack) |
| Notifications   | Expo Notifications                  |
| Local Storage   | AsyncStorage                        |
| HTTP Client     | Axios                               |
| Date Utilities  | date-fns                            |
| Icons           | @expo/vector-icons                  |

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- [Expo Go](https://expo.dev/client) app on your phone (for quick testing), **or** a development build

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd remainder

# Install dependencies
npm install
```

### Running the App

```bash
# Start the Expo development server
npm start

# Run directly on Android (requires device/emulator)
npm run android

# Run directly on iOS (macOS only)
npm run ios
```

After running `npm start`, scan the QR code with:
- **Android**: Expo Go app
- **iOS**: Camera app → tap the notification

> **Note:** Push notifications require a [development build](https://docs.expo.dev/develop/development-builds/introduction/) — they do not work in Expo Go.

---

## 📁 Project Structure

```
src/
├── api/            # API calls (train search, PNR status)
├── components/     # Reusable UI components
├── navigation/     # App navigation setup
├── screens/        # App screens
│   ├── SearchScreen.js       # Train search
│   ├── TrainDetailScreen.js  # Train details & availability
│   ├── PNRScreen.js          # PNR status checker
│   ├── RemindersScreen.js    # Active reminders
│   └── SettingsScreen.js     # App settings
├── theme/          # Colors, fonts, and shared styles
└── utils/          # Helper utilities & notification logic
```

---

## 🔔 Notifications

RailMind supports the following notification types:

- **Booking Reminder** — Get notified before the booking window opens for your train
- **Tatkal Reminder** — Get alerted when Tatkal bookings open (typically 1 day before travel)

> Notifications are scheduled locally on-device using `expo-notifications`.

---

## 📦 Building for Production

This project uses [EAS Build](https://docs.expo.dev/build/introduction/) for creating production-ready APKs/IPAs.

```bash
# Install EAS CLI
npm install -g eas-cli

# Log in to Expo
eas login

# Build for Android
eas build --platform android

# Build for iOS
eas build --platform ios
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add your feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

---

## 📄 License

This project is private and not licensed for public distribution.
