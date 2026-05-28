import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import apiClient from "../api/client";
import useAuth from "../store/useAuth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passFocused, setPassFocused] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await apiClient.post("/auth/login", {
        email,
        password,
      });
      const { access_token } = res.data;

      const meRes = await apiClient.get("/auth/me", {
        headers: { Authorization: `Bearer ${access_token}` },
      });

      login(access_token, meRes.data);

      const profileRes = await apiClient.get("/profile", {
        headers: { Authorization: `Bearer ${access_token}` },
      });
      const profile = profileRes.data;

      if (!profile.primary_goal || profile.primary_goal === "") {
        navigate("/onboarding");
      } else {
        navigate("/chat");
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const wrap = {
    position: "fixed",
    inset: 0,
    background: "#0a0b10",
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "center",
    padding: "20px",
    overflowY: "auto",
    zIndex: 50,
    fontFamily: "'Inter', -apple-system, sans-serif",
  };

  const orb1 = {
    position: "absolute", top: "-120px", left: "-120px",
    width: "400px", height: "400px", borderRadius: "50%",
    background: "radial-gradient(circle, rgba(124,106,247,0.12) 0%, transparent 70%)",
    pointerEvents: "none",
  };

  const orb2 = {
    position: "absolute", bottom: "-100px", right: "-100px",
    width: "350px", height: "350px", borderRadius: "50%",
    background: "radial-gradient(circle, rgba(99,179,237,0.08) 0%, transparent 70%)",
    pointerEvents: "none",
  };

  const center = {
    width: "100%", maxWidth: "420px",
    position: "relative", zIndex: 1,
  };

  const logoBox = {
    width: "62px", height: "62px", borderRadius: "16px",
    background: "#13151e",
    border: "1px solid rgba(124,106,247,0.35)",
    display: "flex", alignItems: "center", justifyContent: "center",
    margin: "0 auto 14px",
    boxShadow: "0 0 32px rgba(124,106,247,0.14)",
  };

  const ring = {
    width: "28px", height: "28px", borderRadius: "50%",
    border: "2.5px solid #7c6af7",
    display: "flex", alignItems: "center", justifyContent: "center",
  };

  const dot = {
    width: "9px", height: "9px", borderRadius: "50%",
    background: "#7c6af7",
  };

  const card = {
    background: "rgba(19,21,30,0.92)",
    border: "1px solid #1f2235",
    borderRadius: "16px",
    padding: "32px",
    boxShadow: "0 8px 48px rgba(0,0,0,0.55)",
    backdropFilter: "blur(12px)",
  };

  const labelS = {
    display: "block",
    fontSize: "11px", fontWeight: "600",
    color: "#8b8fa8", letterSpacing: "0.9px",
    textTransform: "uppercase", marginBottom: "7px",
  };

  const inputS = (focused) => ({
    width: "100%", background: "#0a0b10",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: focused ? "#7c6af7" : "#2a2d3e",
    borderRadius: "8px", padding: "12px 14px 12px 42px",
    color: "#e8e9f0", fontSize: "14px", outline: "none",
    boxSizing: "border-box", fontFamily: "inherit",
    boxShadow: focused ? "0 0 0 3px rgba(124,106,247,0.13)" : "none",
    transition: "border-color 0.15s, box-shadow 0.15s",
  });

  const btnS = {
    width: "100%",
    background: loading
      ? "#4a3d8f"
      : "linear-gradient(135deg, #7c6af7 0%, #6b5ce7 100%)",
    color: "white", border: "none", borderRadius: "8px",
    padding: "13px", fontSize: "15px", fontWeight: "600",
    cursor: loading ? "not-allowed" : "pointer",
    fontFamily: "inherit",
    display: "flex", alignItems: "center",
    justifyContent: "center", gap: "8px",
    boxShadow: loading ? "none" : "0 4px 22px rgba(124,106,247,0.38)",
    marginTop: "24px",
    transition: "all 0.2s",
  };

  const iconColor = (focused) => ({
    position: "absolute", left: "13px",
    top: "50%", transform: "translateY(-50%)",
    width: "16px", height: "16px",
    color: focused ? "#7c6af7" : "#4a4d62",
    transition: "color 0.15s", pointerEvents: "none",
  });

  return (
    <div style={wrap}>
      <div style={orb1} />
      <div style={orb2} />
      <div style={center}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <div style={logoBox}>
            <div style={ring}><div style={dot} /></div>
          </div>
          <div style={{
            fontSize: "28px", fontWeight: "700", color: "#e8e9f0",
            letterSpacing: "-0.5px", lineHeight: 1.2,
          }}>AroMi</div>
          <div style={{ fontSize: "13px", color: "#6b7280", marginTop: "6px" }}>
            Your AI wellness coach, personalized just for you
          </div>
        </div>

        {/* Card */}
        <div style={card}>
          <h1 style={{
            fontSize: "22px", fontWeight: "700",
            color: "#e8e9f0", margin: "0 0 4px",
          }}>Welcome back</h1>
          <p style={{
            fontSize: "13px", color: "#6b7280", margin: "0 0 24px",
          }}>Sign in to continue your fitness journey</p>

          {error && (
            <div style={{
              background: "rgba(239,68,68,0.09)",
              border: "1px solid rgba(239,68,68,0.22)",
              borderRadius: "8px", padding: "11px 14px",
              marginBottom: "20px", fontSize: "13px", color: "#fca5a5",
              display: "flex", alignItems: "center", gap: "8px",
            }}>⚠️ {error}</div>
          )}

          <form onSubmit={handleSubmit}>

            {/* Email */}
            <div style={{ marginBottom: "16px" }}>
              <label style={labelS}>Email address</label>
              <div style={{ position: "relative" }}>
                <svg style={iconColor(emailFocused)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                <input
                  type="email" value={email} required
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  style={inputS(emailFocused)}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={labelS}>Password</label>
              <div style={{ position: "relative" }}>
                <svg style={iconColor(passFocused)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <input
                  type={showPass ? "text" : "password"}
                  value={password} required
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Your password"
                  style={{ ...inputS(passFocused), paddingRight: "44px" }}
                  onFocus={() => setPassFocused(true)}
                  onBlur={() => setPassFocused(false)}
                />
                <button type="button" onClick={() => setShowPass(p => !p)} style={{
                  position: "absolute", right: "12px",
                  top: "50%", transform: "translateY(-50%)",
                  background: "none", border: "none",
                  color: "#4a4d62", cursor: "pointer", padding: "2px",
                }}>
                  {showPass ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button type="submit" style={btnS} disabled={loading}>
              {loading ? (
                <>
                  <span style={{
                    width: "16px", height: "16px",
                    border: "2px solid rgba(255,255,255,0.3)",
                    borderTopColor: "white", borderRadius: "50%",
                    display: "inline-block",
                    animation: "aromi-spin 0.7s linear infinite",
                  }}/>
                  Signing in...
                </>
              ) : <><span>Sign in</span><span style={{ fontSize: "17px" }}>→</span></>}
            </button>
          </form>

          <div style={{
            textAlign: "center", marginTop: "20px",
            fontSize: "13px", color: "#6b7280",
          }}>
            Don't have an account?{" "}
            <Link to="/register" style={{
              color: "#a89cf7", fontWeight: "600", textDecoration: "none",
            }}>Create one free</Link>
          </div>
        </div>

        <div style={{
          textAlign: "center", marginTop: "18px",
          fontSize: "12px", color: "#3a3d52",
        }}>🔒 Protected by AroMi • Your data stays private</div>
      </div>

      <style>{`
        @keyframes aromi-spin { to { transform: rotate(360deg); } }
        input::placeholder { color: #3a3d52 !important; }
      `}</style>
    </div>
  );
}
