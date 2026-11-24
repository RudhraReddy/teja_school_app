import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { api, DEFAULT_API_URL, request, type User } from "./api";
import { storage } from "./storage";

const TOKEN_KEY = "teja.token";
const USER_KEY = "teja.user";
const SERVER_KEY = "teja.server";

interface AuthState {
  ready: boolean;
  user: User | null;
  serverUrl: string;
  signIn: (email: string, password: string, serverUrl: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [serverUrl, setServerUrl] = useState(DEFAULT_API_URL);

  const signOut = useCallback(async () => {
    api.setToken(null);
    setUser(null);
    await Promise.all([storage.remove(TOKEN_KEY), storage.remove(USER_KEY)]);
  }, []);

  useEffect(() => {
    api.setOnUnauthorized(() => void signOut());
    (async () => {
      const [token, savedUser, savedServer] = await Promise.all([storage.get(TOKEN_KEY), storage.get(USER_KEY), storage.get(SERVER_KEY)]);
      if (savedServer) {
        api.setBaseUrl(savedServer);
        setServerUrl(savedServer);
      }
      if (token && savedUser) {
        api.setToken(token);
        setUser(JSON.parse(savedUser));
        // Refresh profile in the background; a 401 signs the user out.
        request<{ user: User }>("/me").then((r) => setUser(r.user)).catch(() => {});
      }
      setReady(true);
    })();
    return () => {
      api.setOnUnauthorized(null);
    };
  }, [signOut]);

  const signIn = useCallback(async (email: string, password: string, server: string) => {
    api.setBaseUrl(server);
    const res = await request<{ token: string; user: User }>("/auth/login", { method: "POST", body: { email, password } });
    api.setToken(res.token);
    await Promise.all([storage.set(TOKEN_KEY, res.token), storage.set(USER_KEY, JSON.stringify(res.user)), storage.set(SERVER_KEY, api.getBaseUrl())]);
    setServerUrl(api.getBaseUrl());
    setUser(res.user);
  }, []);

  const value = useMemo(() => ({ ready, user, serverUrl, signIn, signOut }), [ready, user, serverUrl, signIn, signOut]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
