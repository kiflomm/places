import { View, Text, TextInput, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native'
import { useEffect, useState } from 'react'
import { useRouter } from 'expo-router'

const API_URL = 'https://allplace.online/api/offices';

type OfficeType = {
  id: string;
  name: string;
};

type Office = {
  id: string;
  name: string;
  type: OfficeType;
  status: string;
  isActive: boolean;
};

const statusStyles: Record<'active' | 'inactive', string> = {
  active: 'bg-green-100 text-green-700',
  inactive: 'bg-red-100 text-red-700',
};

const OfficeCard = ({ office, onPress }: { office: Office; onPress: () => void }) => {
  const isInactive = !office.isActive;
  return (
    <TouchableOpacity
      className={`bg-white rounded-xl p-4 mb-3 shadow border border-gray-100 ${isInactive ? 'opacity-60' : ''}`}
      onPress={isInactive ? undefined : onPress}
      activeOpacity={isInactive ? 1 : 0.8}
      disabled={isInactive}
    >
      <View className="flex-row items-center justify-between mb-2">
        <Text className="font-bold text-lg" numberOfLines={1}>{office.name}</Text>
        <View className={`px-2 py-1 rounded-full ml-2 ${statusStyles[isInactive ? 'inactive' : 'active']}`}> 
          <Text className="text-xs font-semibold" style={{textTransform: 'capitalize'}}>{office.type.name}</Text>
        </View>
      </View>
      <View className="flex-row items-center justify-between">
        <Text className="text-gray-500 text-xs">Click to Manage</Text>
      </View>
    </TouchableOpacity>
  );
};

const Index = () => {
  const [offices, setOffices] = useState<Office[]>([]);
  const [filtered, setFiltered] = useState<Office[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const router = useRouter();

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
              onPress={() => router.push({ pathname: '/place', params: { id: item.id } })}
            />
          )}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  )
}

export default Index