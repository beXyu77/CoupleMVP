import React, { useState } from "react";
import { View, Text, TextInput, Pressable } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/RootNavigator";
import { useAuthStore } from "../../store/authStore";
import { t } from "../../i18n";

type Props = NativeStackScreenProps<RootStackParamList, "VerifyCode">;

export default function VerifyCodeScreen({ navigation, route }: Props) {
  const verifyCode = useAuthStore((s) => s.verifyCode);
  const resendCode = useAuthStore((s) => s.resendCode);

  const [code, setCode] = useState("");
  const [err, setErr] = useState<string | null>(null);

  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
      <Text style={{ opacity: 0.7 }}>{t.auth.codeHint(route.params.email)}</Text>
      {err ? <Text style={{ fontWeight: "700" }}>{err}</Text> : null}

      <TextInput
        value={code}
        onChangeText={setCode}
        keyboardType="number-pad"
        maxLength={6}
        placeholder={t.auth.codePlaceholder}
        style={{ borderWidth: 1, borderRadius: 12, padding: 12 }}
      />

      <Pressable
        onPress={() => {
          const r = verifyCode(code);
          if (!r.ok) {
            setErr(r.error === "expired" ? t.auth.codeExpired : t.auth.codeWrong);
            return;
          }
          setErr(null);
          navigation.navigate("SetPassword", { email: route.params.email });
        }}
        style={{ padding: 12, borderRadius: 12, borderWidth: 1, alignItems: "center" }}
      >
        <Text style={{ fontWeight: "700" }}>{t.auth.verify}</Text>
      </Pressable>

      <Pressable
        onPress={() => {
          const r = resendCode();
          if (!r.ok) return;
          setErr(null);
        }}
        style={{ padding: 12, alignItems: "center" }}
      >
        <Text style={{ fontWeight: "700" }}>{t.auth.resend}</Text>
      </Pressable>
    </View>
  );
}