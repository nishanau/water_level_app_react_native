# Water Tank Monitor

A React Native mobile app built with Expo that monitors water tank levels and manages automatic water ordering.

## Features

- **Real-time Water Level Monitoring**: View your current water level with intuitive visual indicators
- **Automatic Ordering**: Set thresholds for automatic water ordering when levels are low
- **Order Management**: Track, cancel or reschedule your water deliveries
- **Usage Statistics**: View historical water usage data with charts
- **Customizable Settings**: Configure tank size, usage patterns, and notification preferences

## Screens

- **Home**: View current water level, days remaining, and next delivery date
- **History**: View historical water level data and notifications
- **Orders**: Manage upcoming and past water deliveries
- **Settings**: Configure app settings, tank parameters, and notification preferences

## Technologies Used

- React Native
- Expo
- React Navigation
- Victory Native (for charts)
- Expo Notifications
- React Native Paper
- Async Storage

## Getting Started

### Prerequisites

- Node.js (v20.14 or later)
- Expo CLI
- iOS/Android Simulator or physical device

### Installation

1. Clone the repository:
```
git clone https://github.com/yourusername/water-tank-monitor.git
```

2. Navigate to the project directory:
```
cd water-tank-monitor
```

3. Install dependencies:
```
npm install
```

4. Start the Expo development server:
```
npx expo start
```

5. Open the app on your simulator or device using the Expo Go app or by pressing 'a' for Android or 'i' for iOS in the terminal.

## Usage

- On first launch, go to the Settings tab to configure your water tank size and preferences
- The Home screen will display your current water level and estimated days remaining
- Toggle auto-ordering on/off from the Home screen
- View your water usage history in the History tab
- Manage your water orders in the Orders tab

## Customization

You can customize various aspects of the app:

- Tank size and measurement units
- Low water threshold for automatic ordering
- Notification preferences
- Preferred water suppliers

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- This app was created as a demonstration project
- Uses mock data for demonstration purposes
