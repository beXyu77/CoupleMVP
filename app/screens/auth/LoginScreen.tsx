import React, { useState } from "react";
import { View, Text, TextInput, Pressable } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/RootNavigator";
import { useAuthStore } from "../../store/authStore";
import { t } from "../../i18n";

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

export default function LoginScreen({ navigation }: Props) {
  const login = useAuthStore((s) => s.login);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);

  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
      {err ? <Text style={{ fontWeight: "700" }}>{err}</Text> : null}

      <Text style={{ opacity: 0.7 }}>{t.auth.email}</Text>
      <TextInput value={email} onChangeText={setEmail} style={{ borderWidth: 1, borderRadius: 12, padding: 12 }} />

      <Text style={{ opacity: 0.7 }}>{t.auth.password}</Text>
      <TextInput
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{ borderWidth: 1, borderRadius: 12, padding: 12 }}
      />

      <Pressable
        onPress={() => {
          const ok = login(email, password);
          setErr(ok ? null : t.auth.invalidLogin);
        }}
        style={{ padding: 12, borderRadius: 12, borderWidth: 1, alignItems: "center" }}
      >
        <Text style={{ fontWeight: "700" }}>{t.auth.login}</Text>
      </Pressable>

      <Pressable onPress={() => navigation.navigate("RegisterEmail")} style={{ padding: 12, alignItems: "center" }}>
        <Text style={{ fontWeight: "700" }}>{t.auth.toRegister}</Text>
      </Pressable>
    </View>
  );
}