import { WebView } from 'react-native-webview'; 
import { StyleSheet } from 'react-native';

export default function App() {
  return (
    <WebView
      style={styles.container}
      source={{ uri: 'https://allplace.online/en/items-list/b0c6a535-1c11-4e15-9bc1-246fdb700216?mobile=true' }}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
});
