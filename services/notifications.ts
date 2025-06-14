import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

/**
 * Registers the device for push notifications and returns the Expo push token.
 * Throws an error if registration fails or if not on a physical device.
 */
export async function registerForPushNotificationsAsync(): Promise<string | undefined> {
  // Android: set up notification channel
  if (Device.osName === 'Android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  // Only physical devices can receive push notifications
  if (!Device.isDevice) {
    throw new Error('Must use physical device for push notifications');
  }

  // Request permissions
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') {
    throw new Error('Permission not granted to get push token for push notification!');
  }

  // Get projectId for EAS builds
  const projectId =
    Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
  if (!projectId) {
    throw new Error('Project ID not found');
  }

  // Get Expo push token
  const pushTokenString = (
    await Notifications.getExpoPushTokenAsync({ projectId })
  ).data;
  return pushTokenString;
} 