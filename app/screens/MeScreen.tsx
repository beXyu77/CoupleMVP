import React, { useState } from "react";
import { View, Text, ScrollView, TextInput, Pressable, Image } from "react-native";
import * as ImagePicker from "expo-image-picker";

import { useProfileStore } from "../store/profileStore";
import { t } from "../i18n";

export default function MeScreen() {
  const myName = useProfileStore((s) => s.myName);
  const myAvatarUri = useProfileStore((s) => s.myAvatarUri);
  const partnerName = useProfileStore((s) => s.partnerName);

  const setMyName = useProfileStore((s) => s.setMyName);
  const setMyAvatarUri = useProfileStore((s) => s.setMyAvatarUri);
  const bindPartner = useProfileStore((s) => s.bindPartner);
  const unbindPartner = useProfileStore((s) => s.unbindPartner);

  const [partnerInput, setPartnerInput] = useState("");

  const pickAvatar = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;

    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.9,
      aspect: [1, 1],
    });

    if (res.canceled) return;
    setMyAvatarUri(res.assets[0]?.uri);
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 32 }}>
      {/* Profile */}
      <View style={{ borderWidth: 1, borderRadius: 14, padding: 12, gap: 12 }}>
        <Text style={{ fontWeight: "700" }}>{t.me.myProfile}</Text>

        <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
          {/* Avatar */}
          <Pressable onPress={pickAvatar} style={{ width: 72, height: 72, borderRadius: 18, borderWidth: 1, overflow: "hidden", alignItems: "center", justifyContent: "center" }}>
            {myAvatarUri ? (
              <Image source={{ uri: myAvatarUri }} style={{ width: "100%", height: "100%" }} />
            ) : (
              <Text style={{ fontSize: 28 }}>🙂</Text>
            )}
          </Pressable>

          <View style={{ flex: 1, gap: 8 }}>
            <Text style={{ opacity: 0.7 }}>{t.me.nameLabel}</Text>
            <TextInput
              value={myName}
              onChangeText={setMyName}
              placeholder={t.me.namePlaceholder}
              style={{ borderWidth: 1, borderRadius: 12, padding: 12 }}
            />
            <Pressable
              onPress={pickAvatar}
              style={{ alignSelf: "flex-start", paddingVertical: 6, paddingHorizontal: 10, borderRadius: 999, borderWidth: 1 }}
            >
              <Text style={{ fontWeight: "700" }}>{t.me.avatarPick}</Text>
            </Pressable>
          </View>
        </View>
      </View>

      {/* Bind */}
      <View style={{ borderWidth: 1, borderRadius: 14, padding: 12, gap: 10 }}>
        <Text style={{ fontWeight: "700" }}>{t.me.partner}</Text>

        {partnerName ? (
          <>
            <View style={{ borderWidth: 1, borderRadius: 12, padding: 12, gap: 6 }}>
              <Text style={{ fontWeight: "700" }}>{t.me.boundTo(partnerName)}</Text>
              <Text style={{ opacity: 0.7 }}>✨</Text>
            </View>

            <Pressable
              onPress={unbindPartner}
              style={{ padding: 12, borderRadius: 12, borderWidth: 1, alignItems: "center" }}
            >
              <Text style={{ fontWeight: "700" }}>{t.me.unbindButton}</Text>
            </Pressable>
          </>
        ) : (
          <>
            <View style={{ borderWidth: 1, borderRadius: 12, padding: 12, gap: 6 }}>
              <Text style={{ fontWeight: "700" }}>{t.me.notBound}</Text>
              <Text style={{ opacity: 0.7 }}>输入对方昵称后绑定</Text>
            </View>

            <TextInput
              value={partnerInput}
              onChangeText={setPartnerInput}
              placeholder={t.me.partnerPlaceholder}
              style={{ borderWidth: 1, borderRadius: 12, padding: 12 }}
            />

            <Pressable
              onPress={() => {
                const name = partnerInput.trim();
                if (!name) return;
                bindPartner(name);
                setPartnerInput("");
              }}
              style={{ padding: 12, borderRadius: 12, borderWidth: 1, alignItems: "center" }}
            >
              <Text style={{ fontWeight: "700" }}>{t.me.bindButton}</Text>
            </Pressable>
          </>
        )}
      </View>
    </ScrollView>
  );
}
