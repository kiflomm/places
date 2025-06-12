import { WebView } from 'react-native-webview'; 
import { StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export default function Place() {
  const { id } = useLocalSearchParams();
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
