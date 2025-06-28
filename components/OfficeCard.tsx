import React from 'react';
import { TouchableOpacity, View, Text } from "react-native";
import { Office } from "~/services/types";

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

export default React.memo(OfficeCard);