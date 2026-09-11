"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api, type UserProfile } from "@/lib/api";
import { DEMO_SOURCE_LABEL, demoUsers, type AppRole } from "@/lib/data/demo";
import { getCurrentUser, getDemoUser, type DataSource } from "@/lib/services/domain";
import { authenticateWithCredentials, convertAccountToUserProfile } from "@/lib/data/userDirectory";

interface UserContextValue {
  user: UserProfile | null;
  loading: boolean;
  source: DataSource;
  isDeveloper: boolean;
  setUser: (user: UserProfile | null, source?: DataSource) => void;
  switchDemoRole: (roleOrId: string) => void;
  loginAsAccount: (accountId: string) => void;
  loginWithCredentials: (identifier: string, passwordAttempt: string) => { success: boolean; user?: UserProfile; error?: string };
  devSwitchAccount: (userId: string) => Promise<void>;
  logout: () => void;
}

const UserContext = createContext<UserContextValue | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<UserProfile | null>(null);
  const [source, setSource] = useState<DataSource>("api");
  const [loading, setLoading] = useState(true);
  const [isDeveloper, setIsDeveloper] = useState(() => {
    if (typeof window !== "undefined") {
      return window.localStorage.getItem("farmnex_dev_mode") === "true";
    }
    return false;
  });

  useEffect(() => {
    let active = true;

    // Load token from localStorage on initial mount before requesting current user
    if (typeof window !== "undefined") {
      const storedToken = window.localStorage.getItem("farmnex_token");
      if (storedToken) {
        api.setToken(storedToken);
      }
    }

    getCurrentUser()
      .then((result) => {
        if (!active) return;
        setUserState(result.data);
        setSource(result.source);
      })
      .catch(() => {
        if (!active) return;
        setUserState(null);
        setSource("api");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const value = useMemo<UserContextValue>(() => ({
    user,
    loading,
    source,
    isDeveloper,
    setUser: (nextUser, nextSource = "api") => {
      setUserState(nextUser);
      setSource(nextSource);
      if (nextUser) {
        api.setCurrentUser(nextUser);
        if (typeof window !== "undefined") {
          window.localStorage.setItem("user_role", nextUser.role || "user");
        }
        if (!api.getToken()) {
          api.setToken(`demo_token_${nextUser.role || "user"}`);
        }
      } else {
        api.clearToken();
        if (typeof window !== "undefined") {
          window.localStorage.removeItem("user_role");
        }
      }
    },
    switchDemoRole: (roleOrId) => {
      const result = getDemoUser(roleOrId);
      setUserState(result.data);
      setSource("demo");
      api.setCurrentUser(result.data);
      api.setToken(`demo_token_${result.data.id || roleOrId}`);
      if (typeof window !== "undefined") {
        window.localStorage.setItem("farmnex_demo_role", result.data.role || "farmer");
        window.localStorage.setItem("user_role", result.data.role || "farmer");
        window.localStorage.setItem("farmnex_user_id", result.data.id);
      }
    },
    loginAsAccount: (accountId) => {
      const result = getDemoUser(accountId);
      setUserState(result.data);
      setSource("demo");
      api.setCurrentUser(result.data);
      api.setToken(`demo_token_${result.data.id}`);
      if (typeof window !== "undefined") {
        window.localStorage.setItem("farmnex_demo_role", result.data.role || "farmer");
        window.localStorage.setItem("user_role", result.data.role || "farmer");
        window.localStorage.setItem("farmnex_user_id", result.data.id);
      }
    },
    loginWithCredentials: (identifier: string, passwordAttempt: string) => {
      const auth = authenticateWithCredentials(identifier, passwordAttempt);
      if (!auth.success || !auth.account) {
        return { success: false, error: auth.error || "Invalid Profile ID or password." };
      }
      const userProfile = convertAccountToUserProfile(auth.account);
      setUserState(userProfile);
      setSource("demo");
      api.setCurrentUser(userProfile);
      api.setToken(`secure_token_${userProfile.id}`);
      if (typeof window !== "undefined") {
        window.localStorage.setItem("farmnex_demo_role", userProfile.role || "farmer");
        window.localStorage.setItem("user_role", userProfile.role || "farmer");
        window.localStorage.setItem("farmnex_user_id", userProfile.id);
      }
      return { success: true, user: userProfile };
    },
    devSwitchAccount: async (userId: string) => {
      const res = await api.request<{ access_token: string; refresh_token: string; token_type: string; user: UserProfile }>(
        "/auth/dev/switch-account",
        { method: "POST", body: JSON.stringify({ user_id: userId }) }
      );
      api.setToken(res.access_token);
      api.setCurrentUser(res.user);
      setUserState(res.user);
      setSource("api");
      if (typeof window !== "undefined") {
        window.localStorage.setItem("user_role", res.user.role || "user");
        window.localStorage.setItem("farmnex_user_id", res.user.id);
      }
    },
    logout: () => {
      api.clearToken();
      if (typeof window !== "undefined") {
        window.localStorage.removeItem("farmnex_demo_role");
        window.localStorage.removeItem("user_role");
        window.localStorage.removeItem("farmnex_dev_mode");
      }
      setUserState(null);
      setSource("api");
      setIsDeveloper(false);
    },
  }), [isDeveloper, loading, source, user]);

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used within a UserProvider");
  return context;
}

export function getRoleLabel(role?: UserProfile["role"]) {
  if (!role) return "User";
  const labels: Record<string, string> = {
    farmer: "Farmer",
    fpo: "FPO",
    buyer: "Bulk buyer",
    consumer: "Consumer",
    admin: "Admin",
    expert: "Expert",
  };
  return labels[role] || "User";
}

export { DEMO_SOURCE_LABEL, demoUsers };
