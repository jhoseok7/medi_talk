import React from "react";
import { AuthProvider } from "./auth/AuthContext";
import Header from "./components/Header";
import { Outlet } from "react-router-dom";

const App = () => (
  <AuthProvider>
    <Header />
    <Outlet />
  </AuthProvider>
);

export default App;
