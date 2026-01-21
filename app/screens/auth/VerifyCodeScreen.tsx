// app/screens/auth/VerifyCodeScreen.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

import { supabase } from "../../lib/supabase";
import { t } from "../../i18n";

export default function VerifyCodeScreen({ navigation, route }: any) {
  const email: string = route?.params?.email ?? "";
  const nickname: string = route?.params?.nickname ?? "";

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onVerify = async () => {
    setError(null);
    const token = code.trim();

    if (!email) {
      setError("缺少邮箱参数");
      return;
    }
    if (token.length < 6) {
      setError(t.auth.codeWrong);
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: "email",
      });

      if (error) {
        if (error.message.toLowerCase().includes("expired")) {
          setError(t.auth.codeExpired);
        } else {
          setError(t.auth.codeWrong);
        }
        return;
      }

      await supabase.auth.updateUser({
        data: {
          needs_password: true,
          nickname: nickname.trim(),
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const onResend = async () => {
    setError(null);
    if (!email) {
      setError("缺少邮箱参数");
      return;
    }

    setResending(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: true },
      });

      if (error) setError(error.message);
    } finally {
      setResending(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={{ flex: 1, padding: 24, gap: 16, justifyContent: "center" }}>
        <Text style={{ fontSize: 24, fontWeight: "700" }}>{t.auth.verifyTitle}</Text>
        <Text style={{ opacity: 0.7 }}>{t.auth.codeHint(email)}</Text>

        <TextInput
          value={code}
          onChangeText={(v) => setCode(v.replace(/\D/g, "").slice(0, 8))}
          placeholder={t.auth.codePlaceholder}
          keyboardType="number-pad"
          maxLength={8}
          style={{
            borderWidth: 1,
            borderRadius: 12,
            padding: 12,
            fontSize: 18,
            letterSpacing: 6,
          }}
        />

        {error ? <Text style={{ color: "red" }}>{error}</Text> : null}

        <Pressable
          onPress={onVerify}
          disabled={loading}
          style={{
            marginTop: 6,
            padding: 14,
            borderRadius: 14,
            borderWidth: 1,
            alignItems: "center",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? <ActivityIndicator /> : <Text style={{ fontWeight: "700" }}>{t.auth.verify}</Text>}
        </Pressable>

        <Pressable
          onPress={onResend}
          disabled={resending}
          style={{
            marginTop: 6,
            padding: 12,
            borderRadius: 14,
            borderWidth: 1,
            alignItems: "center",
            opacity: resending ? 0.7 : 1,
          }}
        >
          {resending ? <ActivityIndicator /> : <Text style={{ fontWeight: "700" }}>{t.auth.resend}</Text>}
        </Pressable>

        <Pressable onPress={() => navigation.replace("Login")} style={{ marginTop: 10, alignItems: "center" }}>
          <Text style={{ opacity: 0.7 }}>{t.auth.backToLogin}</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}