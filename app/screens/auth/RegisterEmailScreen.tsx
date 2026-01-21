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
import type { AuthStackParamList } from "../../navigation/types";

export default function RegisterEmailScreen({ navigation, route }: any) {
  const [email, setEmail] = useState("");
  const [nickname, setNickname] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isValidEmail = (v: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

  const onSendCode = async () => {
    setError(null);

    const safeEmail = email.trim().toLowerCase();
    const safeName = nickname.trim();

    if (!isValidEmail(safeEmail)) {
      setError(t.auth.emailInvalid);
      return;
    }

    if (!safeName) {
      // 你如果想更严，可以加 i18n 文案
      setError("请填写昵称");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: safeEmail,
        options: {
          shouldCreateUser: true,
        },
      });

      if (error) {
        // 常见：邮箱已注册但未验证 / 被限流
        setError(error.message);
        return;
      }

      navigation.replace("VerifyCode", {
        email: safeEmail,
        nickname: safeName,
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
      <View style={{ flex: 1, padding: 24, gap: 16, justifyContent: "center" }}>
        <Text style={{ fontSize: 24, fontWeight: "700" }}>
          {t.auth.registerTitle}
        </Text>

        {/* 昵称 */}
        <View style={{ gap: 6 }}>
          <Text style={{ opacity: 0.7 }}>昵称</Text>
          <TextInput
            value={nickname}
            onChangeText={setNickname}
            placeholder={t.me.namePlaceholder}
            autoCapitalize="none"
            style={{
              borderWidth: 1,
              borderRadius: 12,
              padding: 12,
            }}
          />
        </View>

        {/* 邮箱 */}
        <View style={{ gap: 6 }}>
          <Text style={{ opacity: 0.7 }}>{t.auth.email}</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder={t.auth.enterEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            style={{
              borderWidth: 1,
              borderRadius: 12,
              padding: 12,
            }}
          />
        </View>

        {/* 错误提示 */}
        {error ? (
          <Text style={{ color: "red", marginTop: 4 }}>{error}</Text>
        ) : null}

        {/* 发送验证码 */}
        <Pressable
          onPress={onSendCode}
          disabled={loading}
          style={{
            marginTop: 12,
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
              {t.auth.sendCode}
            </Text>
          )}
        </Pressable>

        {/* 返回登录 */}
        <Pressable
          onPress={() => navigation.replace("Login")}
          style={{ marginTop: 12, alignItems: "center" }}
        >
          <Text style={{ opacity: 0.7 }}>{t.auth.backToLogin}</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}