import React from "react";
import { Modal, View, Text, Pressable, Image } from "react-native";
import { t } from "../i18n";

type Props = {
  visible: boolean;
  onClose: () => void;
  imageUri?: string;
};

export default function MomentViewer({ visible, onClose, imageUri }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.92)" }}>
        <View
          style={{
            paddingTop: 16,
            paddingHorizontal: 16,
            flexDirection: "row",
            justifyContent: "flex-end",
          }}
        >
          <Pressable
            onPress={onClose}
            style={{
              paddingVertical: 8,
              paddingHorizontal: 12,
              borderRadius: 999,
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.35)",
            }}
          >
            <Text style={{ color: "white", fontWeight: "700" }}>{t.moments.close}</Text>
          </Pressable>
        </View>

        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 16 }}>
          {imageUri ? (
            <Image
              source={{ uri: imageUri }}
              style={{ width: "100%", height: "100%", borderRadius: 16 }}
              resizeMode="contain"
            />
          ) : null}
        </View>
      </View>
    </Modal>
  );
}
