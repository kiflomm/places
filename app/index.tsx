import { View, Text, TextInput, FlatList, ActivityIndicator } from 'react-native'
import { useEffect, useState } from 'react'
import { useRouter } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Office } from '~/services/types'
import OfficeCard from '~/components/OfficeCard'
import { registerForPushNotificationsAsync } from '~/services/notifications';

const API_URL = 'https://allplace.online/api/offices';

const Index = () => {
  const [offices, setOffices] = useState<Office[]>([]);
  const [filtered, setFiltered] = useState<Office[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Register for push notifications when the app starts
    registerForPushNotificationsAsync()
      .then(token => {
        if (token) {
          // Optionally send token to backend here
          console.log('Expo Push Token:', token);
        }
      })
      .catch(err => {
        console.error('Failed to get push token:', err);
      });
  }, []);

  useEffect(() => {
    (async () => {
      const savedId = await AsyncStorage.getItem('selectedOfficeId');
      if (savedId) {
        router.replace({ pathname: '/place', params: { id: savedId } });
        return;
      }
    })();
  }, []);

  useEffect(() => {
    fetch(API_URL)
      .then(res => res.json())
      .then(data => {
        setOffices(data.data || []);
        setFiltered(data.data || []);
      })
      .catch(() => setOffices([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!search) setFiltered(offices);
    else setFiltered(offices.filter((o: Office) => o.name.toLowerCase().includes(search.toLowerCase())));
  }, [search, offices]);

  return (
    <View className="flex-1 bg-gray-50 px-4 pt-8">
      <View className="items-center">
        <Text className="text-2xl font-bold text-green-700 mb-1">Select an Office</Text>
        <Text className="text-gray-500 mb-4">Choose an office to view its items</Text>
      </View>
      <TextInput
        className="bg-white border border-gray-200 rounded-lg px-4 py-2 mb-4 text-base"
        placeholder="Search offices..."
        value={search}
        onChangeText={setSearch}
      />
      {loading ? (
        <ActivityIndicator size="large" color="#22c55e" className="mt-10" />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <OfficeCard
              office={item}
              onPress={async () => {
                await AsyncStorage.setItem('selectedOfficeId', item.id);
                router.push({ pathname: '/place', params: { id: item.id } });
              }}
            />
          )}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  )
}

export default Index