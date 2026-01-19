import React, { useMemo, useRef, useState } from "react";
import { View, Text, TextInput, Pressable, Image, ScrollView } from "react-native";
import * as ImagePicker from "expo-image-picker";

import { useMomentsStore } from "../store/momentStore";
import { t } from "../i18n";
import MomentViewer from "../components/MomentViewer";

const dateKey = (ms: number) => {
  const d = new Date(ms);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const formatTime = (ms: number) => {
  const d = new Date(ms);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}`;
};

export default function MomentsScreen() {
  const moments = useMomentsStore((s) => s.moments);
  const addMoment = useMomentsStore((s) => s.addMoment);
  const removeMoment = useMomentsStore((s) => s.removeMoment);
  const toggleLike = useMomentsStore((s) => s.toggleLike);

  // ✅ 默认折叠：false
  const [composerOpen, setComposerOpen] = useState(false);

  const [text, setText] = useState("");
  const [imageUri, setImageUri] = useState<string | undefined>(undefined);

  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerUri, setViewerUri] = useState<string | undefined>(undefined);

  const today = dateKey(Date.now());

  const { pinnedToday, rest } = useMemo(() => {
    const pinned = moments.filter((m) => dateKey(m.createdAt) === today);
    const other = moments.filter((m) => dateKey(m.createdAt) !== today);
    return { pinnedToday: pinned, rest: other };
  }, [moments, today]);

  const lastTapRef = useRef<Record<string, number>>({});

  const handleDoubleTap = (id: string) => {
    const now = Date.now();
    const last = lastTapRef.current[id] || 0;
    if (now - last < 250) {
      toggleLike(id);
      lastTapRef.current[id] = 0;
      return;
    }
    lastTapRef.current[id] = now;
  };

  const pickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;

    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.9,
    });

    if (res.canceled) return;
    setImageUri(res.assets[0]?.uri);
  };

  const renderMomentCard = (m: (typeof moments)[number]) => {
    return (
      <Pressable
        key={m.id}
        onPress={() => handleDoubleTap(m.id)}
        style={{ borderWidth: 1, borderRadius: 14, padding: 12, gap: 10 }}
      >
        <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 12 }}>
          <Text style={{ opacity: 0.7 }}>{formatTime(m.createdAt)}</Text>

          <Pressable onPress={() => removeMoment(m.id)} hitSlop={10}>
            <Text style={{ fontWeight: "700" }}>{t.moments.remove}</Text>
          </Pressable>
        </View>

        {!!m.content && <Text style={{ fontSize: 16 }}>{m.content}</Text>}

        {!!m.imageUri && (
          <Pressable
            onPress={() => {
              setViewerUri(m.imageUri);
              setViewerOpen(true);
            }}
          >
            <Image source={{ uri: m.imageUri }} style={{ width: "100%", height: 220, borderRadius: 12 }} />
          </Pressable>
        )}

        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <Text style={{ fontSize: 16 }}>
            {m.likedByMe ? "❤️" : "🤍"} {m.likeCount}
          </Text>

          <Pressable onPress={() => toggleLike(m.id)}>
            <Text style={{ fontWeight: "700" }}>
              {m.likedByMe ? t.moments.liked : t.moments.like}
            </Text>
          </Pressable>

          <Text style={{ opacity: 0.6 }}>（双击卡片也可点赞）</Text>
        </View>
      </Pressable>
    );
  };

  return (
    <ScrollView
      contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 32 }}
      keyboardShouldPersistTaps="handled"
    >
      <MomentViewer
        visible={viewerOpen}
        imageUri={viewerUri}
        onClose={() => setViewerOpen(false)}
      />

      {/* ✅ Composer - collapsed by default */}
      <View style={{ borderWidth: 1, borderRadius: 14, padding: 12, gap: 10 }}>
        <Pressable
          onPress={() => setComposerOpen((v) => !v)}
          style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}
        >
          <Text style={{ fontWeight: "700" }}>{t.moments.addTitle}</Text>

          <View style={{ paddingVertical: 6, paddingHorizontal: 12, borderRadius: 999, borderWidth: 1 }}>
            <Text style={{ fontWeight: "700" }}>
              {composerOpen ? t.moments.collapseComposer : t.moments.expandComposer}
            </Text>
          </View>
        </Pressable>

        {!composerOpen ? (
          <Text style={{ opacity: 0.7 }}>{t.moments.textPlaceholder}</Text>
        ) : (
          <>
            <TextInput
              value={text}
              onChangeText={setText}
              placeholder={t.moments.textPlaceholder}
              multiline
              style={{
                borderWidth: 1,
                borderRadius: 12,
                padding: 12,
                minHeight: 90,
                textAlignVertical: "top",
              }}
            />

            {imageUri ? (
              <View style={{ gap: 8 }}>
                <Image source={{ uri: imageUri }} style={{ width: "100%", height: 180, borderRadius: 12 }} />
                <Pressable
                  onPress={() => setImageUri(undefined)}
                  style={{ padding: 10, borderRadius: 12, borderWidth: 1, alignItems: "center" }}
                >
                  <Text style={{ fontWeight: "700" }}>{t.moments.removeImage}</Text>
                </Pressable>
              </View>
            ) : (
              <Pressable
                onPress={pickImage}
                style={{ padding: 10, borderRadius: 12, borderWidth: 1, alignItems: "center" }}
              >
                <Text style={{ fontWeight: "700" }}>{t.moments.addImage}</Text>
              </Pressable>
            )}

            <Pressable
              onPress={() => {
                const content = text.trim();
                if (!content && !imageUri) return;

                addMoment(content || "（图片）", imageUri);

                setText("");
                setImageUri(undefined);
                setComposerOpen(false); // ✅ 发布后收起
              }}
              style={{ padding: 12, borderRadius: 12, borderWidth: 1, alignItems: "center" }}
            >
              <Text style={{ fontWeight: "700" }}>{t.moments.post}</Text>
            </Pressable>
          </>
        )}
      </View>

      {/* Today pinned */}
      <Text style={{ fontWeight: "700", opacity: 0.75 }}>{t.moments.todayPinned}</Text>
      {pinnedToday.length === 0 ? (
        <View style={{ borderWidth: 1, borderRadius: 14, padding: 12 }}>
          <Text style={{ opacity: 0.7 }}>{t.moments.todayEmpty ?? "今天还没有发布时光"}</Text>
        </View>
      ) : (
        pinnedToday.map(renderMomentCard)
      )}

      {/* All */}
      <Text style={{ fontWeight: "700", opacity: 0.75 }}>{t.moments.allMoments}</Text>
      {rest.length === 0 ? (
        <View style={{ borderWidth: 1, borderRadius: 14, padding: 12 }}>
          <Text style={{ fontWeight: "700" }}>{t.moments.emptyTitle}</Text>
          <Text style={{ opacity: 0.7, marginTop: 4 }}>{t.moments.emptyTip}</Text>
        </View>
      ) : (
        rest.map(renderMomentCard)
      )}
    </ScrollView>
  );
}