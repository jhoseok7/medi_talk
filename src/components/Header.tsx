import React from "react";
import { useAuth } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const { isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogin = () => navigate("/login");
  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header>
      {/* ...로고, 메뉴 등... */}
      {isLoggedIn ? (
        <button onClick={handleLogout}>로그아웃</button>
      ) : (
        <button onClick={handleLogin}>로그인</button>
      )}
    </header>
  );
};

export default Header;
