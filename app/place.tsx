import { WebView } from 'react-native-webview'; 
import { StyleSheet, BackHandler } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';

export default function Place() {
  const { id } = useLocalSearchParams();

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => backHandler.remove();
  }, []);

  return (
    <WebView
      style={styles.container}
      source={{ uri: `https://allplace.online/en/items-list/${id}?mobile=true` }}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
});
