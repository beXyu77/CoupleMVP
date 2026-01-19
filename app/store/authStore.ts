import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

type User = {
  email: string;
  password: string;
};

type Pending = {
  email: string;
  code: string;
  expiresAt: number;
  verified: boolean;
};

type AuthState = {
  currentUserEmail?: string;

  users: Record<string, User>;
  pending?: Pending;

  startRegister: (email: string) => { ok: boolean; error?: "exists" | "invalid" };
  resendCode: () => { ok: boolean; error?: "no_pending" };
  verifyCode: (code: string) => { ok: boolean; error?: "wrong" | "expired" | "no_pending" };
  setPassword: (password: string) => { ok: boolean; error?: "no_pending" | "not_verified" | "short" };

  login: (email: string, password: string) => boolean;
  logout: () => void;

  // 可选：调试/清空
  clearAuthLocal: () => void;
};

const isValidEmail = (email: string) => /\S+@\S+\.\S+/.test(email);

const gen6 = () => String(Math.floor(100000 + Math.random() * 900000));

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      currentUserEmail: undefined,

      users: {},
      pending: undefined,

      startRegister: (emailRaw) => {
        const email = emailRaw.trim().toLowerCase();
        if (!isValidEmail(email)) return { ok: false, error: "invalid" };
        if (get().users[email]) return { ok: false, error: "exists" };

        const code = gen6();
        const expiresAt = Date.now() + 10 * 60 * 1000; // 10 min

        // MVP：模拟发邮件（打印到 Metro 控制台）
        console.log(`[OTP] send to ${email}: ${code}`);

        set({ pending: { email, code, expiresAt, verified: false } });
        return { ok: true };
      },

      resendCode: () => {
        const p = get().pending;
        if (!p) return { ok: false, error: "no_pending" };

        const code = gen6();
        const expiresAt = Date.now() + 10 * 60 * 1000;

        console.log(`[OTP] resend to ${p.email}: ${code}`);
        set({ pending: { ...p, code, expiresAt, verified: false } });
        return { ok: true };
      },

      verifyCode: (codeRaw) => {
        const p = get().pending;
        if (!p) return { ok: false, error: "no_pending" };
        if (Date.now() > p.expiresAt) return { ok: false, error: "expired" };

        const code = codeRaw.trim();
        if (code !== p.code) return { ok: false, error: "wrong" };

        set({ pending: { ...p, verified: true } });
        return { ok: true };
      },

      setPassword: (password) => {
        const p = get().pending;
        if (!p) return { ok: false, error: "no_pending" };
        if (!p.verified) return { ok: false, error: "not_verified" };

        const pwd = password.trim();
        if (pwd.length < 6) return { ok: false, error: "short" };

        set((s) => ({
          users: {
            ...s.users,
            [p.email]: { email: p.email, password: pwd },
          },
          pending: undefined,
        }));

        return { ok: true };
      },

      login: (emailRaw, passwordRaw) => {
        const email = emailRaw.trim().toLowerCase();
        const u = get().users[email];
        if (!u) return false;
        if (u.password !== passwordRaw) return false;
        set({ currentUserEmail: email });
        return true;
      },

      logout: () => set({ currentUserEmail: undefined }),

      clearAuthLocal: () => set({ currentUserEmail: undefined, users: {}, pending: undefined }),
    }),
    {
      name: "couple_app_auth_v1",
      storage: createJSONStorage(() => AsyncStorage),

      // 只持久化这些字段；方法不用存
      partialize: (s) => ({
        currentUserEmail: s.currentUserEmail,
        users: s.users,
        pending: s.pending,
      }),
    }
  )
);