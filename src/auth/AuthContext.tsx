import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";

type User = { id: string; name: string } | null;

interface AuthContextProps {
  user: User;
  login: (userInfo: { id: string; name: string }) => void;
  logout: () => void;
  isLoggedIn: boolean;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User>(null);

  useEffect(() => {
    const stored = localStorage.getItem("authUser");
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const login = (userInfo: { id: string; name: string }) => {
    setUser(userInfo);
    localStorage.setItem("authUser", JSON.stringify(userInfo));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("authUser");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoggedIn: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
