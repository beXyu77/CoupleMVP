// app/navigation/RootNavigator.tsx
import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { supabase } from "../lib/supabase";

import AuthStack from "./AuthStack";
import MainTabs from "./TabNavigator";

export default function RootNavigator() {
  const [session, setSession] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      // 1️⃣ 先拿 session
      const { data: s } = await supabase.auth.getSession();
      if (!mounted) return;

      setSession(s.session ?? null);

      // 2️⃣ 如果有 session，再明确拿 user（关键）
      if (s.session) {
        const { data: u } = await supabase.auth.getUser();
        if (!mounted) return;
        setUser(u.user ?? null);
      } else {
        setUser(null);
      }

      // ✅ 只有 session + user 都稳定后，才允许渲染
      setAuthReady(true);
    };

    init();

    const { data: sub } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        setAuthReady(false); // ⚠️ 每次状态变化先锁 UI

        setSession(newSession ?? null);

        if (newSession) {
          const { data: u } = await supabase.auth.getUser();
          if (!mounted) return;
          setUser(u.user ?? null);
        } else {
          setUser(null);
        }

        setAuthReady(true); // ✅ 再解锁
      }
    );

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  // 🚫 auth 未稳定前，永远只显示 loading
  if (!authReady) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  const needsPassword = !!user?.user_metadata?.needs_password;

  if (!session) {
    return <AuthStack initialRouteName="Login" />;
  }

  if (needsPassword) {
    return <AuthStack initialRouteName="SetPassword" />;
  }

  return <MainTabs />;
}