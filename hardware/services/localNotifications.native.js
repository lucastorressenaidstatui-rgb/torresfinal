// Import only local notification APIs. The package root registers push-token
// listeners during initialization, which Expo Go on Android does not support.
export { setNotificationHandler } from 'expo-notifications/build/NotificationsHandler';
export { requestPermissionsAsync } from 'expo-notifications/build/NotificationPermissions';
export { setNotificationChannelAsync } from 'expo-notifications/build/setNotificationChannelAsync';
export { scheduleNotificationAsync } from 'expo-notifications/build/scheduleNotificationAsync';
export { AndroidImportance } from 'expo-notifications/build/NotificationChannelManager.types';
export { SchedulableTriggerInputTypes } from 'expo-notifications/build/Notifications.types';
