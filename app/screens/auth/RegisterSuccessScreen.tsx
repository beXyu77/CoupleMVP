import React from "react";
import { View, Text, Pressable } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/RootNavigator";
import { t } from "../../i18n";

type Props = NativeStackScreenProps<RootStackParamList, "RegisterSuccess">;

export default function RegisterSuccessScreen({ navigation }: Props) {
  return (
    <View style={{ flex: 1, padding: 16, gap: 12, justifyContent: "center" }}>
      <Text style={{ fontSize: 22, fontWeight: "700", textAlign: "center" }}>{t.auth.successTitle}</Text>
      <Text style={{ opacity: 0.7, textAlign: "center" }}>{t.auth.successDesc}</Text>

      <Pressable
        onPress={() => navigation.popToTop()}
        style={{ padding: 12, borderRadius: 12, borderWidth: 1, alignItems: "center", marginTop: 12 }}
      >
        <Text style={{ fontWeight: "700" }}>{t.auth.backToLogin}</Text>
      </Pressable>
    </View>
  );
}