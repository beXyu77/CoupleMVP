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

export default function SetPasswordScreen({ navigation }: any) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    setError(null);
    const p = password.trim();
    const c = confirm.trim();

    if (p.length < 6) {
      setError(t.auth.passwordTooShort);
      return;
    }
    if (p !== c) {
      setError("两次密码不一致");
      return;
    }

    setLoading(true);
    try {
      const { data: u0, error: e0 } = await supabase.auth.getUser();
      if (e0 || !u0.user) {
        setError("登录状态异常，请重新注册");
        return;
      }

      const uid = u0.user.id;

      const nickname =
        (u0.user.user_metadata?.nickname as string | undefined)?.trim() ?? "";

      const { error: e1 } = await supabase.auth.updateUser({
        password: p,
        data: {
          needs_password: false,
        },
      });

      if (e1) {
        setError(e1.message);
        return;
      }

      if (nickname) {
        const { error: e2 } = await supabase.from("profiles").upsert(
          {
            user_id: uid,
            nickname,
            updated_at: new Date().toISOString(),
          } as any,
          { onConflict: "user_id" }
        );

        if (e2) {
          setError(e2.message);
          return;
        }
      }

      await supabase.auth.signOut();

      navigation.reset({
        index: 0,
        routes: [{ name: "Login" }],
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View
        style={{
          flex: 1,
          padding: 24,
          gap: 16,
          justifyContent: "center",
        }}
      >
        <Text style={{ fontSize: 24, fontWeight: "700" }}>
          {t.auth.setPasswordTitle}
        </Text>

        <View style={{ gap: 6 }}>
          <Text style={{ opacity: 0.7 }}>{t.auth.password}</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder={t.auth.passwordPlaceholder}
            secureTextEntry
            style={{
              borderWidth: 1,
              borderRadius: 12,
              padding: 12,
            }}
          />
        </View>

        <View style={{ gap: 6 }}>
          <Text style={{ opacity: 0.7 }}>确认密码</Text>
          <TextInput
            value={confirm}
            onChangeText={setConfirm}
            placeholder="再次输入密码"
            secureTextEntry
            style={{
              borderWidth: 1,
              borderRadius: 12,
              padding: 12,
            }}
          />
        </View>

        {error ? <Text style={{ color: "red" }}>{error}</Text> : null}

        <Pressable
          onPress={onSubmit}
          disabled={loading}
          style={{
            marginTop: 8,
            padding: 14,
            borderRadius: 14,
            borderWidth: 1,
            alignItems: "center",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? (
            <ActivityIndicator />
          ) : (
            <Text style={{ fontWeight: "700" }}>
              {t.auth.finishRegister}
            </Text>
          )}
        </Pressable>

        <Pressable
          onPress={() => navigation.replace("Login")}
          style={{ marginTop: 10, alignItems: "center" }}
        >
          <Text style={{ opacity: 0.7 }}>{t.auth.backToLogin}</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}