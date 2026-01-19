import React, { useState } from "react";
import { View, Text, TextInput, Pressable } from "react-native";
import { useAuthStore } from "../../store/authStore";

export default function CoupleBindScreen() {
  const setCoupleBound = useAuthStore((s) => s.setCoupleBound);
  const [code, setCode] = useState("");

  return (
    <View style={{ flex: 1, padding: 16, justifyContent: "center", gap: 12 }}>
      <Text style={{ fontSize: 24, fontWeight: "700" }}>Bind as a couple</Text>

      <TextInput
        value={code}
        onChangeText={setCode}
        placeholder="Invite code (demo)"
        autoCapitalize="characters"
        style={{ borderWidth: 1, borderRadius: 12, padding: 12 }}
      />

      <Pressable
        onPress={() => setCoupleBound(true)}
        style={{ padding: 12, borderRadius: 12, borderWidth: 1, alignItems: "center" }}
      >
        <Text style={{ fontWeight: "700" }}>Demo Bind</Text>
      </Pressable>

      <Text style={{ opacity: 0.7 }}>
        现在是演示：下一步接后端 invite/join 接口
      </Text>
    </View>
  );
}
 