import React, { useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [id, setId] = useState("");
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login({ id, name });
    navigate("/");
  };

  return (
    <form onSubmit={handleSubmit}>
      <input value={id} onChange={e => setId(e.target.value)} placeholder="ID" required />
      <input value={name} onChange={e => setName(e.target.value)} placeholder="이름" required />
      <button type="submit">로그인</button>
    </form>
  );
};

export default Login;
