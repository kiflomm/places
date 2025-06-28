import { View, Text, TextInput, FlatList, ActivityIndicator, Alert, TouchableOpacity, ScrollView } from 'react-native'
import { useEffect, useState } from 'react'
import { useRouter } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Office } from '~/services/types'
import OfficeCard from '~/components/OfficeCard'
import { registerForPushNotificationsAsync } from '~/services/notifications'
import * as Notifications from 'expo-notifications'

const API_URL = 'https://allplace.online/api/offices';
const LOCATIONS_API_URL = 'https://tugza.tech/api/locations';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const Index = () => {
  const [offices, setOffices] = useState<Office[]>([]);
  const [filtered, setFiltered] = useState<Office[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [pushToken, setPushToken] = useState<string | undefined>();
  const router = useRouter();
  // Location hierarchy state
  const [locations, setLocations] = useState<any[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<any | null>(null);
  const [selectedState, setSelectedState] = useState<any | null>(null);
  const [selectedCity, setSelectedCity] = useState<any | null>(null);
  const [locationLoading, setLocationLoading] = useState(true);
  const [locationError, setLocationError] = useState<string | null>(null);
  // Add search state for country, state, city
  const [countrySearch, setCountrySearch] = useState('');
  const [stateSearch, setStateSearch] = useState('');
  const [citySearch, setCitySearch] = useState('');

  useEffect(() => {
    // Register for push notifications when the app starts
    registerForPushNotificationsAsync()
      .then(token => {
        if (token) {
          setPushToken(token);
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
        setOffices(data || []);
        setFiltered(data || []);
      })
      .catch(() => setOffices([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!search) setFiltered(offices);
    else setFiltered(offices.filter((o: Office) => o.name.toLowerCase().includes(search.toLowerCase())));
  }, [search, offices]);

  useEffect(() => {
    // Fetch location hierarchy
    setLocationLoading(true);
    fetch(LOCATIONS_API_URL)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setLocations(data);
        } else if (Array.isArray(data?.countries)) {
          setLocations(data.countries);
        } else {
          setLocations([]);
        }
        setLocationError(null);
      })
      .catch(() => setLocationError('Failed to load locations'))
      .finally(() => setLocationLoading(false));
  }, []);

  // Define the office selection handler outside the JSX
  const handleOfficePress = (item: Office) => {
    Alert.alert(
      'Confirm Office',
      `Are you sure you want to select "${item.name}"?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Yes',
          onPress: async () => {
            await AsyncStorage.setItem('selectedOfficeId', item.id);
            if (pushToken) {
              try {
                await fetch('https://staff.tugza.tech/api/notifications', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ officeId: item.id, pushToken }),
                });
                console.log('Push token registered');
              } catch (err) {
                console.error('Failed to register push token:', err);
              }
            }
            router.push({ pathname: '/place', params: { id: item.id } });
          },
        },
      ]
    );
  };

  return (
    <View className="flex-1 bg-gray-50 px-2 pt-8">
      <View className="items-center">
        <Text className="text-3xl font-extrabold text-green-700 mb-1">Select an Office</Text>
        <Text className="text-gray-500 mb-4">Choose an office to view its items</Text>
      </View>
      {/* Multi-step filtering UI */}
      {locationLoading ? (
        <ActivityIndicator size="large" color="#22c55e" className="mt-10" />
      ) : locationError ? (
        <Text className="text-red-500 text-center">{locationError}</Text>
      ) : !selectedCountry ? (
        <View className="bg-white rounded-2xl p-4 my-4 shadow flex-1 min-h-[300px]">
          {/* Country selection */}
          <TextInput
            className="bg-gray-100 rounded-lg px-3 py-2 mb-3 text-base border border-gray-200"
            placeholder="Search countries..."
            value={countrySearch}
            onChangeText={setCountrySearch}
          />
          <FlatList
            data={locations.filter((country: any) => country.name.toLowerCase().includes(countrySearch.toLowerCase()))}
            keyExtractor={item => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                className="flex-row items-center py-3 px-2 border-b border-gray-100 rounded-lg active:bg-gray-100"
                activeOpacity={0.7}
                onPress={() => {
                  setSelectedCountry(item);
                  setSelectedState(null);
                  setSelectedCity(null);
                  setCountrySearch('');
                  setStateSearch('');
                  setCitySearch('');
                }}
              >
                <Text className="text-lg text-gray-900">{item.emoji} {item.name}</Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={<Text className="text-gray-400 text-center mt-4">No countries found.</Text>}
            className="flex-1"
            contentContainerStyle={{ flexGrow: 1 }}
          />
        </View>
      ) : !selectedState ? (
        <View className="bg-white rounded-2xl p-4 my-4 shadow flex-1 min-h-[300px]">
          {/* State selection */}
          <TouchableOpacity onPress={() => setSelectedCountry(null)}>
            <Text className="text-blue-600 font-semibold mb-2 text-center">← Change Country</Text>
          </TouchableOpacity>
          <TextInput
            className="bg-gray-100 rounded-lg px-3 py-2 mb-3 text-base border border-gray-200"
            placeholder="Search states/provinces..."
            value={stateSearch}
            onChangeText={setStateSearch}
          />
          <FlatList
            data={selectedCountry.states.filter((state: any) => state.name.toLowerCase().includes(stateSearch.toLowerCase()))}
            keyExtractor={item => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                className="flex-row items-center py-3 px-2 border-b border-gray-100 rounded-lg active:bg-gray-100"
                activeOpacity={0.7}
                onPress={() => {
                  setSelectedState(item);
                  setSelectedCity(null);
                  setStateSearch('');
                  setCitySearch('');
                }}
              >
                <Text className="text-lg text-gray-900">{item.name}</Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={<Text className="text-gray-400 text-center mt-4">No states found for this country.</Text>}
            className="flex-1"
            contentContainerStyle={{ flexGrow: 1 }}
          />
        </View>
      ) : !selectedCity ? (
        <View className="bg-white rounded-2xl p-4 my-4 shadow flex-1 min-h-[300px]">
          {/* City selection */}
          <TouchableOpacity onPress={() => setSelectedState(null)}>
            <Text className="text-blue-600 font-semibold mb-2 text-center">← Change State</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setSelectedCountry(null)}>
            <Text className="text-blue-600 font-semibold mb-2 text-center">← Change Country</Text>
          </TouchableOpacity>
          <TextInput
            className="bg-gray-100 rounded-lg px-3 py-2 mb-3 text-base border border-gray-200"
            placeholder="Search cities..."
            value={citySearch}
            onChangeText={setCitySearch}
          />
          <FlatList
            data={selectedState.cities.filter((city: any) => city.name.toLowerCase().includes(citySearch.toLowerCase()))}
            keyExtractor={item => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                className="flex-row items-center py-3 px-2 border-b border-gray-100 rounded-lg active:bg-gray-100"
                activeOpacity={0.7}
                onPress={() => {
                  setSelectedCity(item);
                  setCitySearch('');
                }}
              >
                <Text className="text-lg text-gray-900">{item.name}</Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={<Text className="text-gray-400 text-center mt-4">No cities found for this state.</Text>}
            className="flex-1"
            contentContainerStyle={{ flexGrow: 1 }}
          />
        </View>
      ) : (
        <View className="bg-white rounded-2xl p-4 my-4 shadow flex-1 min-h-[300px]">
          {/* Office selection */}
          <View className="flex-row mb-2 space-x-2">
            <TouchableOpacity className="flex-row items-center bg-gray-100 rounded-full px-4 py-2 mr-2 mb-2" onPress={() => setSelectedCity(null)}>
              <Text className="text-blue-600 font-semibold mr-1">←</Text>
              <Text className="text-blue-600 font-semibold">Change City</Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-row items-center bg-gray-100 rounded-full px-4 py-2 mr-2 mb-2" onPress={() => setSelectedState(null)}>
              <Text className="text-blue-600 font-semibold mr-1">←</Text>
              <Text className="text-blue-600 font-semibold">Change State</Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-row items-center bg-gray-100 rounded-full px-4 py-2 mb-2" onPress={() => setSelectedCountry(null)}>
              <Text className="text-blue-600 font-semibold mr-1">←</Text>
              <Text className="text-blue-600 font-semibold">Change Country</Text>
            </TouchableOpacity>
          </View>
          {/* Filter offices by selected city */}
          {loading ? (
        <ActivityIndicator size="large" color="#22c55e" className="mt-10" />
      ) : (
        <FlatList
              data={filtered.filter((o: Office) => o.cityId == selectedCity.id)}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <OfficeCard
              office={item}
              onPress={() => handleOfficePress(item)}
            />
          )}
              ListEmptyComponent={
                <View className="flex-1 justify-center items-center py-10">
                  <Text className="text-5xl text-gray-300 mb-3">🏢</Text>
                  <Text className="text-gray-400 text-base text-center">No offices available in this city yet.{"\n"}Try another city or go back.</Text>
                </View>
              }
          showsVerticalScrollIndicator={false}
              className="flex-1"
              contentContainerStyle={{ flexGrow: 1 }}
        />
          )}
        </View>
      )}
    </View>
  )
}

export default Index