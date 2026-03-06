import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from './src/types';
import OverviewScreen from './src/screens/OverviewScreen';
import AddScreen from './src/screens/AddScreen';
import StatsScreen from './src/screens/StatsScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import MobileFrame from './src/components/MobileFrame';

type TabName = '概覽' | '新增' | '統計' | '紀錄' | '設定';
type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

const ICONS: Record<TabName, [IoniconsName, IoniconsName]> = {
  '概覽': ['home', 'home-outline'],
  '新增': ['add-circle', 'add-circle-outline'],
  '統計': ['bar-chart', 'bar-chart-outline'],
  '紀錄': ['list', 'list-outline'],
  '設定': ['settings', 'settings-outline'],
};

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <MobileFrame>
      <NavigationContainer>
        <StatusBar style="dark" />
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarStyle: {
              position: 'absolute',
              bottom: 20,
              left: 20,
              right: 20,
              borderRadius: 28,
              height: 64,
              backgroundColor: 'rgba(255, 252, 247, 0.97)',
              borderTopWidth: 0,
              borderWidth: 1,
              borderColor: '#E8E0D6',
              shadowColor: '#292524',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.08,
              shadowRadius: 20,
              elevation: 10,
            },
            tabBarActiveTintColor: '#B45309',
            tabBarInactiveTintColor: '#A39280',
            tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
            tabBarIcon: ({ focused, color, size }) => {
              const name = route.name as TabName;
              const [active, inactive] = ICONS[name];
              return <Ionicons name={focused ? active : inactive} size={size} color={color} />;
            },
          })}
        >
          <Tab.Screen name="概覽" component={OverviewScreen} />
          <Tab.Screen name="新增" component={AddScreen} />
          <Tab.Screen name="統計" component={StatsScreen} />
          <Tab.Screen name="紀錄" component={HistoryScreen} />
          <Tab.Screen name="設定" component={SettingsScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    </MobileFrame>
  );
}
