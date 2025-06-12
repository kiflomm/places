import '../global.css';
import { Stack } from 'expo-router';
export default function Layout() {
  return(
    <Stack>
        <Stack.Screen name="index" options={{
          title: 'welcome',
          headerShown: false
        }} 
        />

        <Stack.Screen name="place" options={{
          title: 'places',
          headerShown: false
        }} 
        />
    </Stack>
  )
}
