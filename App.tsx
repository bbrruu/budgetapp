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
import MobileFrame from './src/components/MobileFrame';

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
    <MobileFrame>
      <NavigationContainer>
        <StatusBar style="light" />
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
              backgroundColor: 'rgba(15, 23, 42, 0.95)',
              borderTopWidth: 0,
              borderWidth: 1,
              borderColor: 'rgba(148, 163, 184, 0.12)',
              shadowColor: '#818CF8',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.15,
              shadowRadius: 20,
              elevation: 10,
            },
            tabBarActiveTintColor: '#818CF8',
            tabBarInactiveTintColor: '#64748B',
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
    </MobileFrame>
  );
}
