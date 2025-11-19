import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet } from 'react-native';

import { colors, sectionConfig } from '../theme';
import { RootStackParamList, MainTabParamList } from '../types';
import { FloatingActionButton } from '../components';

// Screens
import DashboardScreen from '../screens/DashboardScreen';
import PlanScreen from '../screens/PlanScreen';
import SectionScreen from '../screens/SectionScreen';
import NoteDetailScreen from '../screens/NoteDetailScreen';
import NoteEditorScreen from '../screens/NoteEditorScreen';
import CostsScreen from '../screens/CostsScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// Tab Icon Component
const TabIcon = ({
  color,
  focused,
  label
}: {
  color: string;
  focused: boolean;
  label: string;
}) => (
  <View style={[styles.tabIcon, focused && styles.tabIconFocused]}>
    <Text style={styles.tabIconText}>
      {label}
    </Text>
  </View>
);

// Main Tab Navigator
function MainTabs() {
  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.primary.main,
          tabBarInactiveTintColor: colors.text.tertiary,
          tabBarStyle: styles.tabBar,
          tabBarLabelStyle: styles.tabBarLabel,
        }}
      >
        <Tab.Screen
          name="Dashboard"
          component={DashboardScreen}
          options={{
            tabBarLabel: 'Home',
            tabBarIcon: ({ color, focused }) => (
              <TabIcon color={color} focused={focused} label="🏠" />
            ),
          }}
        />
        <Tab.Screen
          name="Plan"
          component={PlanScreen}
          initialParams={{ projectId: 'default' }}
          options={{
            tabBarLabel: 'Plan',
            tabBarIcon: ({ color, focused }) => (
              <TabIcon color={color} focused={focused} label="📋" />
            ),
          }}
        />
        <Tab.Screen
          name="Electrical"
          component={SectionScreen}
          initialParams={{ projectId: 'default' }}
          options={{
            tabBarLabel: 'Elektryka',
            tabBarIcon: ({ color, focused }) => (
              <TabIcon color={color} focused={focused} label="⚡" />
            ),
          }}
        />
        <Tab.Screen
          name="Plumbing"
          component={SectionScreen}
          initialParams={{ projectId: 'default' }}
          options={{
            tabBarLabel: 'Hydraul.',
            tabBarIcon: ({ color, focused }) => (
              <TabIcon color={color} focused={focused} label="💧" />
            ),
          }}
        />
        <Tab.Screen
          name="Costs"
          component={CostsScreen}
          initialParams={{ projectId: 'default' }}
          options={{
            tabBarLabel: 'Koszty',
            tabBarIcon: ({ color, focused }) => (
              <TabIcon color={color} focused={focused} label="💰" />
            ),
          }}
        />
      </Tab.Navigator>
      <FloatingActionButton />
    </View>
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary.main,
        tabBarInactiveTintColor: colors.text.tertiary,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon color={color} focused={focused} label="H" />
          ),
        }}
      />
      <Tab.Screen
        name="Plan"
        component={PlanScreen}
        initialParams={{ projectId: 'default' }}
        options={{
          tabBarLabel: 'Plan',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon color={color} focused={focused} label="P" />
          ),
        }}
      />
      <Tab.Screen
        name="Electrical"
        component={SectionScreen}
        initialParams={{ projectId: 'default' }}
        options={{
          tabBarLabel: 'Elektryka',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon color={color} focused={focused} label="E" />
          ),
        }}
      />
      <Tab.Screen
        name="Plumbing"
        component={SectionScreen}
        initialParams={{ projectId: 'default' }}
        options={{
          tabBarLabel: 'Hydraul.',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon color={color} focused={focused} label="H" />
          ),
        }}
      />
      <Tab.Screen
        name="Carpentry"
        component={SectionScreen}
        initialParams={{ projectId: 'default' }}
        options={{
          tabBarLabel: 'Stolarka',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon color={color} focused={focused} label="S" />
          ),
        }}
      />
      <Tab.Screen
        name="Finishing"
        component={SectionScreen}
        initialParams={{ projectId: 'default' }}
        options={{
          tabBarLabel: 'Wykończ.',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon color={color} focused={focused} label="W" />
          ),
        }}
      />
      <Tab.Screen
        name="Costs"
        component={CostsScreen}
        initialParams={{ projectId: 'default' }}
        options={{
          tabBarLabel: 'Koszty',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon color={color} focused={focused} label="K" />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// Root Stack Navigator
export default function Navigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background.primary },
        }}
      >
        <Stack.Screen name="Main" component={MainTabs} />
        <Stack.Screen
          name="NoteDetail"
          component={NoteDetailScreen}
          options={{
            headerShown: true,
            title: 'Szczegóły notatki',
            headerTintColor: colors.primary.main,
          }}
        />
        <Stack.Screen
          name="NoteEditor"
          component={NoteEditorScreen}
          options={{
            headerShown: true,
            title: 'Edycja notatki',
            headerTintColor: colors.primary.main,
            presentation: 'modal',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.surface.primary,
    borderTopColor: colors.border.light,
    borderTopWidth: 1,
    height: 60,
    paddingBottom: 8,
    paddingTop: 8,
  },
  tabBarLabel: {
    fontSize: 10,
    fontWeight: '500',
  },
  tabIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabIconFocused: {
    backgroundColor: colors.primary.light + '20',
  },
  tabIconText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
