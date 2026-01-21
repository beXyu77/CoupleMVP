// app/screens/auth/LoginScreen.tsx
import React, { useMemo, useState } from "react";
import { View, Text, TextInput, Pressable, ActivityIndicator } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { supabase } from "../../lib/supabase";
import { t } from "../../i18n";

export default function LoginScreen({ navigation, route }: any) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const canLogin = useMemo(
    () => email.trim().length > 0 && password.length > 0 && !loading,
    [email, password, loading]
  );

  const onLogin = async () => {
    const e = email.trim().toLowerCase();
    const p = password;

    setErr(null);
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({ email: e, password: p });

      if (error) {
        setErr(t.auth.invalidLogin);
        setLoading(false);
        return;
      }

      setLoading(false);
      // ✅ RootNavigator will switch to App when session becomes available
    } catch {
      setErr(t.auth.invalidLogin);
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, padding: 16, gap: 12, justifyContent: "center" }}>
      {err ? <Text style={{ fontWeight: "700" }}>{err}</Text> : null}
      
      <Text style={{ opacity: 0.7 }}>{t.auth.email}</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        placeholder="example@email.com"
        style={{ borderWidth: 1, borderRadius: 12, padding: 12 }}
      />

      <Text style={{ opacity: 0.7 }}>{t.auth.password}</Text>
      <TextInput
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{ borderWidth: 1, borderRadius: 12, padding: 12 }}
      />

      <Pressable
        onPress={onLogin}
        disabled={!canLogin}
        style={{
          padding: 12,
          borderRadius: 12,
          borderWidth: 1,
          alignItems: "center",
          opacity: canLogin ? 1 : 0.6,
        }}
      >
        {loading ? <ActivityIndicator /> : <Text style={{ fontWeight: "700" }}>{t.auth.login}</Text>}
      </Pressable>

      <Pressable
        onPress={() => navigation.navigate("RegisterEmail")}
        style={{ padding: 12, alignItems: "center" }}
      >
        <Text style={{ fontWeight: "700" }}>{t.auth.toRegister}</Text>
      </Pressable>
    </View>
  );
}