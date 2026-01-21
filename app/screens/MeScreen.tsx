import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Pressable,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import type { User } from "@supabase/supabase-js";

import { supabase } from "../lib/supabase";
import { publicAvatarUrl } from "../lib/storage";
import { t } from "../i18n";
import { useProfileStore } from "../store/profileStore";
import { useDaysStore } from "../store/dayStore";
import { daysBetween, todayStr } from "../utils/date";

type PublicProfile = {
  user_id: string;
  nickname: string | null;
  avatar_url: string | null;
};

export default function MeScreen() {
  /* ========= Local profile ========= */
  const myName = useProfileStore((s) => s.myName);
  const setMyName = useProfileStore((s) => s.setMyName);

  /* ========= Supabase user ========= */
  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  /* ========= Pairing ========= */
  const [pairingRow, setPairingRow] = useState<any>(null);
  const [myCode, setMyCode] = useState<string | null>(null);
  const [codeInput, setCodeInput] = useState("");
  const [bindErr, setBindErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  /* ========= Profiles ========= */
  const [myProfile, setMyProfile] = useState<PublicProfile | null>(null);
  const [partnerProfile, setPartnerProfile] = useState<PublicProfile | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const myUid = user?.id ?? null;

  const gen6 = () => String(Math.floor(100000 + Math.random() * 900000));
  const startDate = useDaysStore((s) => s.startDate);
  const togetherDays = startDate ? Math.max(1, daysBetween(startDate, todayStr()) + 1) : 0;


  const loadUser = async () => {
    setLoadingUser(true);
    const { data } = await supabase.auth.getUser();
    setUser(data.user ?? null);
    setLoadingUser(false);
  };

  const loadMyProfile = async () => {
    if (!myUid) return;
    const { data } = await supabase
      .from("profiles")
      .select("user_id,nickname,avatar_url")
      .eq("user_id", myUid)
      .limit(1);

    setMyProfile(data?.[0] ?? null);
  };

  const loadPairing = async () => {
    const { data: u } = await supabase.auth.getUser();
    const uid = u.user?.id;
    if (!uid) return;

    const { data, error } = await supabase
      .from("pairings")
      .select("*")
      .or(`owner_id.eq.${uid},requester_id.eq.${uid},partner_id.eq.${uid}`)
      .order("created_at", { ascending: false })
      .limit(1);

    if (error) return;

    const row = data?.[0] ?? null;
    setPairingRow(row);
    setMyCode(row && row.owner_id === uid ? row.code : null);
  };

  const partnerUid = useMemo(() => {
    if (!pairingRow || !myUid) return null;
    if (pairingRow.status !== "bound") return null;
    if (pairingRow.owner_id === myUid) return pairingRow.partner_id ?? null;
    return pairingRow.owner_id ?? null;
  }, [pairingRow, myUid]);

  const loadPartnerProfile = async () => {
    if (!partnerUid) {
      setPartnerProfile(null);
      return;
    }
    const { data } = await supabase
      .from("profiles")
      .select("user_id,nickname,avatar_url")
      .eq("user_id", partnerUid)
      .limit(1);

    setPartnerProfile(data?.[0] ?? null);
  };

  /* ========= Init ========= */
  useEffect(() => {
    loadUser();
    loadPairing();

    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!myUid) return;
    loadMyProfile();
  }, [myUid]);

  useEffect(() => {
    loadPartnerProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [partnerUid]);

  /* ========= Upsert my nickname to profiles (debounced) ========= */
  useEffect(() => {
    if (!myUid) return;

    const name = (myName ?? "").trim();
    const timer = setTimeout(async () => {
      await supabase.from("profiles").upsert(
        {
          user_id: myUid,
          nickname: name,
          updated_at: new Date().toISOString(),
        } as any,
        { onConflict: "user_id" }
      );
      await loadMyProfile();
    }, 600);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myUid, myName]);

  /* ========= Avatar upload ========= */
  const pickAndUploadAvatar = async () => {
    if (!myUid) {
      Alert.alert("未登录");
      return;
    }

    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;

    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.9,
    });

    if (res.canceled) return;

    const uri = res.assets[0]?.uri;
    if (!uri) return;

    setUploadingAvatar(true);
    try {
      // Convert to ArrayBuffer
      const r = await fetch(uri);
      const ab = await r.arrayBuffer();

      const path = `${myUid}.jpg`;

      const { error: upErr } = await supabase.storage
        .from("avatars")
        .upload(path, ab, { contentType: "image/jpeg", upsert: true });

      if (upErr) {
        Alert.alert("上传失败", upErr.message);
        setUploadingAvatar(false);
        return;
      }

      // Save path into profiles
      const { error: profErr } = await supabase.from("profiles").upsert(
        {
          user_id: myUid,
          avatar_url: path,
          updated_at: new Date().toISOString(),
        } as any,
        { onConflict: "user_id" }
      );

      if (profErr) {
        Alert.alert("保存失败", profErr.message);
        setUploadingAvatar(false);
        return;
      }

      await loadMyProfile();
    } finally {
      setUploadingAvatar(false);
    }
  };

  /* ========= Binding actions ========= */
  const onLogout = async () => {
    setLoggingOut(true);
    await supabase.auth.signOut();
    setLoggingOut(false);
  };

  const onGenerateCode = async () => {
    setBindErr(null);
    setBusy(true);
    try {
      const { data: u } = await supabase.auth.getUser();
      const uid = u.user?.id;
      if (!uid) {
        setBindErr(t.me.bind.errNoUser);
        return;
      }

      const code = gen6();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

      const { error } = await supabase.from("pairings").insert({
        owner_id: uid,
        code,
        status: "open",
        expires_at: expiresAt,
      });

      if (error) {
        setBindErr(error.message);
        return;
      }

      await loadPairing();
    } finally {
      setBusy(false);
    }
  };

  const onRequestBind = async () => {
    setBindErr(null);
    setBusy(true);
    try {
      const code = codeInput.trim();
      if (code.length !== 6) {
        setBindErr(t.me.bind.errInvalidCode);
        return;
      }

      const { data: u } = await supabase.auth.getUser();
      const uid = u.user?.id;
      if (!uid) {
        setBindErr(t.me.bind.errNoUser);
        return;
      }

      const { data, error } = await supabase.from("pairings").select("*").eq("code", code).limit(1);
      if (error || !data?.[0]) {
        setBindErr(t.me.bind.errInvalidCode);
        return;
      }

      const row = data[0];
      if (row.status !== "open") {
        setBindErr(t.me.bind.errUsed);
        return;
      }
      if (Date.now() > new Date(row.expires_at).getTime()) {
        setBindErr(t.me.bind.errExpired);
        return;
      }

      const { error: upErr } = await supabase
        .from("pairings")
        .update({ status: "pending", requester_id: uid, updated_at: new Date().toISOString() })
        .eq("id", row.id);

      if (upErr) {
        setBindErr(upErr.message);
        return;
      }

      setCodeInput("");
      await loadPairing();
    } finally {
      setBusy(false);
    }
  };

  const onApproveBind = async () => {
    setBindErr(null);
    setBusy(true);
    try {
      if (!pairingRow) return;

      const { data: u } = await supabase.auth.getUser();
      const uid = u.user?.id;

      if (pairingRow.owner_id !== uid) {
        setBindErr(t.me.bind.errNotOwner);
        return;
      }

      const { error } = await supabase
        .from("pairings")
        .update({
          status: "bound",
          partner_id: pairingRow.requester_id,
          updated_at: new Date().toISOString(),
        })
        .eq("id", pairingRow.id);

      if (error) {
        setBindErr(error.message);
        return;
      }

      await loadPairing();
      await loadPartnerProfile();
    } finally {
      setBusy(false);
    }
  };

  const onRejectBind = async () => {
    setBindErr(null);
    setBusy(true);
    try {
      if (!pairingRow) return;

      await supabase
        .from("pairings")
        .update({ status: "closed", updated_at: new Date().toISOString() })
        .eq("id", pairingRow.id);

      await loadPairing();
    } finally {
      setBusy(false);
    }
  };

  const onUnbind = async () => {
    if (!pairingRow) return;

    Alert.alert("解除绑定", "确定要解除绑定吗？", [
      { text: "取消", style: "cancel" },
      {
        text: "确定",
        style: "destructive",
        onPress: async () => {
          setBusy(true);
          setBindErr(null);
          try {
            const { error } = await supabase
              .from("pairings")
              .update({ status: "closed", updated_at: new Date().toISOString() })
              .eq("id", pairingRow.id);

            if (error) {
              setBindErr(error.message);
              return;
            }

            setPartnerProfile(null);
            setMyCode(null);
            await loadPairing();
          } finally {
            setBusy(false);
          }
        },
      },
    ]);
  };

  const isBound = pairingRow?.status === "bound";
  const isPending = pairingRow?.status === "pending";
  const isOpen = pairingRow?.status === "open";
  const amOwner = !!(myUid && pairingRow?.owner_id === myUid);

  const myAvatar = publicAvatarUrl(myProfile?.avatar_url ?? null);
  const partnerAvatar = publicAvatarUrl(partnerProfile?.avatar_url ?? null);

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 40 }}>
      {/* ===== 情侣名片（已绑定时显示） ===== */}
{isBound && (
  <View
    style={{
      borderWidth: 1,
      borderRadius: 18,
      padding: 16,
      gap: 10,
      alignItems: "center",
    }}
  >
    {/* 昵称行 */}
    <Text style={{ fontSize: 18, fontWeight: "700" }}>
      {myName || "我"}{" "}
      <Text style={{ fontSize: 18 }}>×</Text>{" "}
      {partnerProfile?.nickname || "对方"}
    </Text>

    {/* 在一起天数 */}
    <Text style={{ opacity: 0.7 }}>
      在一起第 {togetherDays} 天
    </Text>

    {/* ❤️ 装饰 */}
    <Text style={{ fontSize: 20, letterSpacing: 6 }}>
      ❤️ ❤️ ❤️
    </Text>
  </View>
)}

      {/* ===== 我的资料 ===== */}
      <View style={{ borderWidth: 1, borderRadius: 14, padding: 12, gap: 12 }}>
        <Text style={{ fontWeight: "700" }}>{t.me.myProfile}</Text>

        <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
          <Pressable
            onPress={pickAndUploadAvatar}
            style={{
              width: 72,
              height: 72,
              borderRadius: 18,
              borderWidth: 1,
              overflow: "hidden",
              alignItems: "center",
              justifyContent: "center",
              opacity: uploadingAvatar ? 0.6 : 1,
            }}
          >
            {uploadingAvatar ? (
              <ActivityIndicator />
            ) : myAvatar ? (
              <Image source={{ uri: myAvatar }} style={{ width: "100%", height: "100%" }} />
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
            <Text style={{ opacity: 0.6 }}>点击头像可上传</Text>
          </View>
        </View>
      </View>

      {/* ===== 账号 ===== */}
      <View style={{ borderWidth: 1, borderRadius: 14, padding: 12, gap: 10 }}>
        <Text style={{ fontWeight: "700" }}>{t.me.account}</Text>

        {loadingUser ? (
          <ActivityIndicator />
        ) : user ? (
          <>
            <Text>
              {t.me.email}: {user.email}
            </Text>
            <Text>
              {t.me.uid}: {user.id}
            </Text>

            <Pressable
              onPress={onLogout}
              style={{
                padding: 12,
                borderRadius: 12,
                borderWidth: 1,
                alignItems: "center",
                opacity: loggingOut ? 0.6 : 1,
              }}
            >
              {loggingOut ? <ActivityIndicator /> : <Text>{t.me.logout}</Text>}
            </Pressable>
          </>
        ) : (
          <Text>{t.me.notLoggedIn}</Text>
        )}
      </View>

      {/* ===== 情侣绑定 + 对方头像 ===== */}
      <View style={{ borderWidth: 1, borderRadius: 14, padding: 12, gap: 12 }}>
        <Text style={{ fontWeight: "700" }}>{t.me.bind.title}</Text>
        {bindErr ? <Text style={{ fontWeight: "700" }}>{bindErr}</Text> : null}

        {/* 已绑定：对方头像 + 昵称 + 解绑 */}
        {isBound ? (
          <View style={{ borderWidth: 1, borderRadius: 12, padding: 12, gap: 10 }}>
            <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
              <View
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 16,
                  borderWidth: 1,
                  overflow: "hidden",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {partnerAvatar ? (
                  <Image source={{ uri: partnerAvatar }} style={{ width: "100%", height: "100%" }} />
                ) : (
                  <Text style={{ fontSize: 26 }}>🫶</Text>
                )}
              </View>

              <View style={{ flex: 1, gap: 4 }}>
                <Text style={{ fontWeight: "700", fontSize: 16 }}>
                  {partnerProfile?.nickname?.trim()
                    ? t.me.boundTo(partnerProfile.nickname.trim())
                    : t.me.boundTo("对方")}
                </Text>
                <Text style={{ opacity: 0.7 }}>{partnerUid}</Text>
              </View>
            </View>

            <View style={{ flexDirection: "row", gap: 10 }}>
              <Pressable
                onPress={async () => {
                  await loadPairing();
                  await loadPartnerProfile();
                }}
                style={{ flex: 1, padding: 12, borderRadius: 12, borderWidth: 1, alignItems: "center" }}
              >
                <Text style={{ fontWeight: "700" }}>刷新</Text>
              </Pressable>

              <Pressable
                onPress={onUnbind}
                disabled={busy}
                style={{
                  flex: 1,
                  padding: 12,
                  borderRadius: 12,
                  borderWidth: 1,
                  alignItems: "center",
                  opacity: busy ? 0.6 : 1,
                }}
              >
                <Text style={{ fontWeight: "700" }}>{t.me.unbindButton}</Text>
              </Pressable>
            </View>
          </View>
        ) : null}

        {/* pending */}
        {!isBound && isPending ? (
          amOwner ? (
            <View style={{ borderWidth: 1, borderRadius: 12, padding: 12, gap: 10 }}>
              <Text style={{ fontWeight: "700" }}>{t.me.bind.statusPending}</Text>
              <Text style={{ opacity: 0.7 }}>requester_id: {pairingRow?.requester_id}</Text>

              <View style={{ flexDirection: "row", gap: 10 }}>
                <Pressable
                  onPress={onApproveBind}
                  disabled={busy}
                  style={{
                    flex: 1,
                    padding: 12,
                    borderRadius: 12,
                    borderWidth: 1,
                    alignItems: "center",
                    opacity: busy ? 0.6 : 1,
                  }}
                >
                  <Text style={{ fontWeight: "700" }}>{t.me.bind.approve}</Text>
                </Pressable>

                <Pressable
                  onPress={onRejectBind}
                  disabled={busy}
                  style={{
                    flex: 1,
                    padding: 12,
                    borderRadius: 12,
                    borderWidth: 1,
                    alignItems: "center",
                    opacity: busy ? 0.6 : 1,
                  }}
                >
                  <Text style={{ fontWeight: "700" }}>{t.me.bind.reject}</Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <View style={{ borderWidth: 1, borderRadius: 12, padding: 12, gap: 8 }}>
              <Text style={{ fontWeight: "700" }}>已发送绑定请求</Text>
              <Text style={{ opacity: 0.7 }}>等待对方确认…</Text>
              <Pressable
                onPress={loadPairing}
                style={{ padding: 12, borderRadius: 12, borderWidth: 1, alignItems: "center" }}
              >
                <Text style={{ fontWeight: "700" }}>刷新状态</Text>
              </Pressable>
            </View>
          )
        ) : null}

        {/* 未绑定：显示生成/输入 */}
        {!isBound && !isPending ? (
          <>
            <View style={{ borderWidth: 1, borderRadius: 12, padding: 12, gap: 10 }}>
              <Text style={{ opacity: 0.7 }}>{t.me.bind.myCode}</Text>
              <Text style={{ fontSize: 20, fontWeight: "700", letterSpacing: 4 }}>
                {myCode ?? "—"}
              </Text>

              <Pressable
                onPress={onGenerateCode}
                disabled={busy}
                style={{
                  padding: 12,
                  borderRadius: 12,
                  borderWidth: 1,
                  alignItems: "center",
                  opacity: busy ? 0.6 : 1,
                }}
              >
                <Text style={{ fontWeight: "700" }}>
                  {busy ? t.me.bind.generating : t.me.bind.generate}
                </Text>
              </Pressable>

              {isOpen && amOwner ? (
                <Text style={{ opacity: 0.6 }}>{t.me.bind.codeHint}</Text>
              ) : null}
            </View>

            <View style={{ borderWidth: 1, borderRadius: 12, padding: 12, gap: 10 }}>
              <Text style={{ opacity: 0.7 }}>{t.me.bind.enterCode}</Text>

              <TextInput
                value={codeInput}
                onChangeText={(v) => setCodeInput(v.replace(/\D/g, "").slice(0, 6))}
                keyboardType="number-pad"
                maxLength={6}
                placeholder={t.me.bind.codePlaceholder}
                style={{
                  borderWidth: 1,
                  borderRadius: 12,
                  padding: 12,
                  letterSpacing: 6,
                  fontSize: 18,
                }}
              />

              <Pressable
                onPress={onRequestBind}
                disabled={busy}
                style={{
                  padding: 12,
                  borderRadius: 12,
                  borderWidth: 1,
                  alignItems: "center",
                  opacity: busy ? 0.6 : 1,
                }}
              >
                <Text style={{ fontWeight: "700" }}>
                  {busy ? t.me.bind.requesting : t.me.bind.requestBind}
                </Text>
              </Pressable>

              <Pressable
                onPress={loadPairing}
                style={{ padding: 12, borderRadius: 12, borderWidth: 1, alignItems: "center" }}
              >
                <Text style={{ fontWeight: "700" }}>刷新状态</Text>
              </Pressable>
            </View>
          </>
        ) : null}
      </View>
    </ScrollView>
  );
}