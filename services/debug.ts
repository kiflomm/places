import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Clears all AsyncStorage data. Useful for development/debugging.
 */
export async function resetAsyncStorage() {
  try {
    await AsyncStorage.clear();
    // Optionally, you can log or alert for confirmation
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.log('AsyncStorage has been reset.');
    }
  } catch (e) {
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.error('Failed to reset AsyncStorage:', e);
    }
  }
}

// Expose to dev tools (e.g., React Native Debugger, Chrome console)
if (__DEV__ && typeof global !== 'undefined') {
  // @ts-ignore
  global.resetAsyncStorage = resetAsyncStorage;
}

declare global {
  // eslint-disable-next-line no-var
  var resetAsyncStorage: () => Promise<void>;
}
