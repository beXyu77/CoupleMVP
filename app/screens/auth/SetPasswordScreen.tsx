import React, { useState } from "react";
import { View, Text, TextInput, Pressable } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/RootNavigator";
import { useAuthStore } from "../../store/authStore";
import { t } from "../../i18n";

type Props = NativeStackScreenProps<RootStackParamList, "SetPassword">;

export default function SetPasswordScreen({ navigation }: Props) {
  const setPassword = useAuthStore((s) => s.setPassword);

  const [password, setPwd] = useState("");
  const [err, setErr] = useState<string | null>(null);

  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
      {err ? <Text style={{ fontWeight: "700" }}>{err}</Text> : null}

      <TextInput
        value={password}
        onChangeText={setPwd}
        secureTextEntry
        placeholder={t.auth.passwordPlaceholder}
        style={{ borderWidth: 1, borderRadius: 12, padding: 12 }}
      />

      <Pressable
        onPress={() => {
          const r = setPassword(password);
          if (!r.ok) {
            setErr(t.auth.passwordTooShort);
            return;
          }
          setErr(null);
          navigation.replace("RegisterSuccess");
        }}
        style={{ padding: 12, borderRadius: 12, borderWidth: 1, alignItems: "center" }}
      >
        <Text style={{ fontWeight: "700" }}>{t.auth.finishRegister}</Text>
      </Pressable>
    </View>
  );
}