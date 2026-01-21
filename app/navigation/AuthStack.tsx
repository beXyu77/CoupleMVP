// app/navigation/AuthStack.tsx
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import LoginScreen from "../screens/auth/LoginScreen";
import RegisterEmailScreen from "../screens/auth/RegisterEmailScreen";
import VerifyCodeScreen from "../screens/auth/VerifyCodeScreen";
import SetPasswordScreen from "../screens/auth/SetPasswordScreen";

const Stack = createNativeStackNavigator();

type Props = {
  initialRouteName?: "Login" | "RegisterEmail" | "VerifyCode" | "SetPassword";
};

export default function AuthStack({ initialRouteName = "Login" }: Props) {
  return (
    <Stack.Navigator
      initialRouteName={initialRouteName}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="RegisterEmail" component={RegisterEmailScreen} />
      <Stack.Screen name="VerifyCode" component={VerifyCodeScreen} />
      <Stack.Screen name="SetPassword" component={SetPasswordScreen} />
    </Stack.Navigator>
  );
}