import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Ionicons from "@expo/vector-icons/Ionicons";

import HomeScreen from "../screens/HomeScreen";
import TasksScreen from "../screens/TasksScreen";
import DaysScreen from "../screens/DaysScreen";
import MomentsScreen from "../screens/MomentsScreen";
import MeScreen from "../screens/MeScreen";

import { t } from "../i18n";

export type TabParamList = {
  Home: undefined;
  Tasks: undefined;
  Days: undefined;
  Moments: undefined;
  Me: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: true, // ✅ 顶部保留
        tabBarLabelStyle: { fontSize: 12 },

        tabBarIcon: ({ focused, size, color }) => {
          // Couple vibe icons
          let iconName: keyof typeof Ionicons.glyphMap = "home";

          if (route.name === "Home") {
            iconName = focused ? "heart" : "heart-outline";
          } else if (route.name === "Tasks") {
            iconName = focused ? "checkbox" : "checkbox-outline";
          } else if (route.name === "Days") {
            iconName = focused ? "calendar" : "calendar-outline";
          } else if (route.name === "Moments") {
            iconName = focused ? "images" : "images-outline";
          } else if (route.name === "Me") {
            iconName = focused ? "person" : "person-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: t.tabs.home, tabBarLabel: t.tabs.home }}
      />
      <Tab.Screen
        name="Tasks"
        component={TasksScreen}
        options={{ title: t.tabs.tasks, tabBarLabel: t.tabs.tasks }}
      />
      <Tab.Screen
        name="Days"
        component={DaysScreen}
        options={{ title: t.tabs.days, tabBarLabel: t.tabs.days }}
      />
      <Tab.Screen
        name="Moments"
        component={MomentsScreen}
        options={{ title: t.tabs.moments, tabBarLabel: t.tabs.moments }}
      />
      <Tab.Screen
        name="Me"
        component={MeScreen}
        options={{ title: t.tabs.me, tabBarLabel: t.tabs.me }}
      />
    </Tab.Navigator>
  );
}
