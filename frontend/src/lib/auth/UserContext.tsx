"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api, type UserProfile } from "@/lib/api";
import { DEMO_SOURCE_LABEL, demoUsers, type AppRole } from "@/lib/data/demo";
import { getCurrentUser, getDemoUser, type DataSource } from "@/lib/services/domain";

interface UserContextValue {
  user: UserProfile | null;
  loading: boolean;
  source: DataSource;
  setUser: (user: UserProfile | null, source?: DataSource) => void;
  switchDemoRole: (role: AppRole) => void;
  logout: () => void;
}

const UserContext = createContext<UserContextValue | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<UserProfile | null>(null);
  const [source, setSource] = useState<DataSource>("api");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
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
    setUser: (nextUser, nextSource = "api") => {
      setUserState(nextUser);
      setSource(nextSource);
      if (nextUser) {
        api.setCurrentUser(nextUser);
        if (!api.getToken()) {
          api.setToken(`demo_token_${nextUser.role || "user"}`);
        }
      } else {
        api.clearToken();
      }
    },
    switchDemoRole: (role) => {
      const result = getDemoUser(role);
      setUserState(result.data);
      setSource("demo");
      api.setCurrentUser(result.data);
      api.setToken(`demo_token_${role}`);
      if (typeof window !== "undefined") window.localStorage.setItem("farmnex_demo_role", role);
    },
    logout: () => {
      api.clearToken();
      if (typeof window !== "undefined") window.localStorage.removeItem("farmnex_demo_role");
      setUserState(null);
      setSource("api");
    },
  }), [loading, source, user]);

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
