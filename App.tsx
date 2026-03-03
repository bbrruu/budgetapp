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

type TabName = '概覽' | '新增' | '統計' | '紀錄';
type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

const ICONS: Record<TabName, [IoniconsName, IoniconsName]> = {
  '概覽': ['home', 'home-outline'],
  '新增': ['add-circle', 'add-circle-outline'],
  '統計': ['bar-chart', 'bar-chart-outline'],
  '紀錄': ['list', 'list-outline'],
};

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: {
            backgroundColor: COLORS.card,
            borderTopColor: COLORS.border,
            borderTopWidth: 1,
            paddingBottom: 8,
            paddingTop: 4,
            height: 64,
          },
          tabBarActiveTintColor: COLORS.accent,
          tabBarInactiveTintColor: COLORS.muted,
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
      </Tab.Navigator>
    </NavigationContainer>
  );
}
