// app/screens/auth/RegisterEmailScreen.tsx
import React, { useState } from "react";
import { View, Text, TextInput, Pressable, ActivityIndicator } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { RootStackParamList } from "../../navigation/RootNavigator";
import { supabase } from "../../lib/supabase";
import { t } from "../../i18n";

type Props = NativeStackScreenProps<RootStackParamList, "RegisterEmail">;

const isValidEmail = (email: string) => /\S+@\S+\.\S+/.test(email);

export default function RegisterEmailScreen({ navigation }: Props) {
  const [email, setEmail] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSend = async () => {
    const e = email.trim().toLowerCase();

    if (!isValidEmail(e)) {
      setErr(t.auth.emailInvalid);
      return;
    }

    setLoading(true);
    setErr(null);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: e,
        options: {
          shouldCreateUser: true,
        },
      });

      if (error) {
        // Supabase errors vary by config; keep a clean user message
        setErr(error.message || "发送失败");
        setLoading(false);
        return;
      }

      setLoading(false);
      navigation.navigate("VerifyCode", { email: e });
    } catch (ex: any) {
      setErr(ex?.message || "发送失败");
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
      {err ? <Text style={{ fontWeight: "700" }}>{err}</Text> : null}

      <Text style={{ opacity: 0.7 }}>{t.auth.enterEmail}</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        placeholder="example@email.com"
        style={{ borderWidth: 1, borderRadius: 12, padding: 12 }}
      />

      <Pressable
        onPress={onSend}
        disabled={loading}
        style={{
          padding: 12,
          borderRadius: 12,
          borderWidth: 1,
          alignItems: "center",
          opacity: loading ? 0.7 : 1,
        }}
      >
        {loading ? (
          <ActivityIndicator />
        ) : (
          <Text style={{ fontWeight: "700" }}>{t.auth.sendCode}</Text>
        )}
      </Pressable>

      <Text style={{ opacity: 0.6 }}>
        （提示：请在 Supabase 的 Email Template 里使用 Token 模板，这样邮件里会包含 6 位验证码）
      </Text>

      <Pressable
        onPress={() => navigation.goBack()}
        style={{ padding: 12, alignItems: "center" }}
      >
        <Text style={{ fontWeight: "700" }}>{t.auth.backToLogin}</Text>
      </Pressable>
    </View>
  );
}
