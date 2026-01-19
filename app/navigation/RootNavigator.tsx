import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import TabNavigator from "./TabNavigator";
import LoginScreen from "../screens/auth/LoginScreen";
import RegisterEmailScreen from "../screens/auth/RegisterEmailScreen";
import VerifyCodeScreen from "../screens/auth/VerifyCodeScreen";
import SetPasswordScreen from "../screens/auth/SetPasswordScreen";
import RegisterSuccessScreen from "../screens/auth/RegisterSuccessScreen";

import { useAuthStore } from "../store/authStore";
import { t } from "../i18n";

export type RootStackParamList = {
  App: undefined;

  Login: undefined;
  RegisterEmail: undefined;
  VerifyCode: { email: string };
  SetPassword: { email: string };
  RegisterSuccess: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const currentUserEmail = useAuthStore((s) => s.currentUserEmail);

  return (
    <Stack.Navigator screenOptions={{ headerTitleAlign: "center" }}>
      {currentUserEmail ? (
        <Stack.Screen name="App" component={TabNavigator} options={{ headerShown: false }} />
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} options={{ title: t.auth.loginTitle }} />
          <Stack.Screen name="RegisterEmail" component={RegisterEmailScreen} options={{ title: t.auth.registerTitle }} />
          <Stack.Screen name="VerifyCode" component={VerifyCodeScreen} options={{ title: t.auth.verifyTitle }} />
          <Stack.Screen name="SetPassword" component={SetPasswordScreen} options={{ title: t.auth.setPasswordTitle }} />
          <Stack.Screen name="RegisterSuccess" component={RegisterSuccessScreen} options={{ title: t.auth.successTitle }} />
        </>
      )}
    </Stack.Navigator>
  );
}
