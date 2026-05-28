import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import apiClient from "../api/client";
import useAuth from "../store/useAuth";

export default function Register() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const strength = password.length === 0 ? 0
    : password.length < 6 ? 1
    : password.length < 10 ? 2 : 3;
  const strengthColor = ["transparent","#ef4444","#f59e0b","#22c55e"][strength];
  const strengthLabel = ["","Too short","Good","Strong"][strength];
  const passwordMatch = confirm.length > 0 && password !== confirm;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password !== confirm) { setError("Passwords do not match"); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters"); return; }
    setLoading(true);
    try {
      const res = await apiClient.post("/auth/register", {
        email,
        password,
        full_name: fullName,
      });
      const { access_token } = res.data;

      const meRes = await apiClient.get("/auth/me", {
        headers: { Authorization: `Bearer ${access_token}` },
      });

      login(access_token, meRes.data);
      navigate("/onboarding");
    } catch (err) {
      setError(err.response?.data?.detail || "Registration failed. Please try again.");
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

  const card = {
    background: "rgba(19,21,30,0.92)",
    border: "1px solid #1f2235", borderRadius: "16px",
    padding: "32px",
    boxShadow: "0 8px 48px rgba(0,0,0,0.55)",
    backdropFilter: "blur(12px)",
  };

  const labelS = {
    display: "block", fontSize: "11px", fontWeight: "600",
    color: "#8b8fa8", letterSpacing: "0.9px",
    textTransform: "uppercase", marginBottom: "7px",
  };

  const inputS = (name) => ({
    width: "100%", background: "#0a0b10",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: focused === name ? "#7c6af7" : "#2a2d3e",
    borderRadius: "8px", padding: "12px 14px 12px 42px",
    color: "#e8e9f0", fontSize: "14px", outline: "none",
    boxSizing: "border-box", fontFamily: "inherit",
    boxShadow: focused === name ? "0 0 0 3px rgba(124,106,247,0.13)" : "none",
    transition: "border-color 0.15s, box-shadow 0.15s",
  });

  const iconStyle = (name) => ({
    position: "absolute", left: "13px",
    top: "50%", transform: "translateY(-50%)",
    width: "16px", height: "16px",
    color: focused === name ? "#7c6af7" : "#4a4d62",
    transition: "color 0.15s", pointerEvents: "none",
  });

  return (
    <div style={wrap}>
      <div style={{
        position:"absolute",top:"-100px",right:"-100px",
        width:"380px",height:"380px",borderRadius:"50%",
        background:"radial-gradient(circle,rgba(124,106,247,0.1) 0%,transparent 70%)",
        pointerEvents:"none",
      }}/>
      <div style={{
        position:"absolute",bottom:"-80px",left:"-80px",
        width:"300px",height:"300px",borderRadius:"50%",
        background:"radial-gradient(circle,rgba(34,197,94,0.07) 0%,transparent 70%)",
        pointerEvents:"none",
      }}/>

      <div style={{ width:"100%", maxWidth:"440px", position:"relative", zIndex:1 }}>

        {/* Logo */}
        <div style={{ textAlign:"center", marginBottom:"28px" }}>
          <div style={{
            width:"62px",height:"62px",borderRadius:"16px",
            background:"#13151e",
            border:"1px solid rgba(124,106,247,0.35)",
            display:"flex",alignItems:"center",justifyContent:"center",
            margin:"0 auto 14px",
            boxShadow:"0 0 32px rgba(124,106,247,0.14)",
          }}>
            <div style={{
              width:"28px",height:"28px",borderRadius:"50%",
              border:"2.5px solid #7c6af7",
              display:"flex",alignItems:"center",justifyContent:"center",
            }}>
              <div style={{width:"9px",height:"9px",borderRadius:"50%",background:"#7c6af7"}}/>
            </div>
          </div>
          <div style={{fontSize:"28px",fontWeight:"700",color:"#e8e9f0",letterSpacing:"-0.5px"}}>
            AroMi
          </div>
          <div style={{fontSize:"13px",color:"#6b7280",marginTop:"6px"}}>
            Start your personalized wellness journey today
          </div>
        </div>

        <div style={card}>
          <h1 style={{fontSize:"22px",fontWeight:"700",color:"#e8e9f0",margin:"0 0 4px"}}>
            Create account
          </h1>
          <p style={{fontSize:"13px",color:"#6b7280",margin:"0 0 24px"}}>
            Join and start your fitness journey
          </p>

          {error && (
            <div style={{
              background:"rgba(239,68,68,0.09)",
              border:"1px solid rgba(239,68,68,0.22)",
              borderRadius:"8px",padding:"11px 14px",
              marginBottom:"20px",fontSize:"13px",color:"#fca5a5",
              display:"flex",alignItems:"center",gap:"8px",
            }}>⚠️ {error}</div>
          )}

          <form onSubmit={handleSubmit}>

            {/* Full Name */}
            <div style={{marginBottom:"14px"}}>
              <label style={labelS}>Full name</label>
              <div style={{position:"relative"}}>
                <svg style={iconStyle("name")} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                <input type="text" value={fullName} required
                  onChange={e => setFullName(e.target.value)}
                  placeholder="Your full name"
                  style={inputS("name")}
                  onFocus={() => setFocused("name")}
                  onBlur={() => setFocused("")}
                />
              </div>
            </div>

            {/* Email */}
            <div style={{marginBottom:"14px"}}>
              <label style={labelS}>Email address</label>
              <div style={{position:"relative"}}>
                <svg style={iconStyle("email")} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                <input type="email" value={email} required
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  style={inputS("email")}
                  onFocus={() => setFocused("email")}
                  onBlur={() => setFocused("")}
                />
              </div>
            </div>

            {/* Password */}
            <div style={{marginBottom: strength > 0 ? "6px" : "14px"}}>
              <label style={labelS}>Password</label>
              <div style={{position:"relative"}}>
                <svg style={iconStyle("pass")} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <input
                  type={showPass ? "text" : "password"}
                  value={password} required
                  onChange={e => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  style={{...inputS("pass"), paddingRight:"44px"}}
                  onFocus={() => setFocused("pass")}
                  onBlur={() => setFocused("")}
                />
                <button type="button" onClick={() => setShowPass(p => !p)} style={{
                  position:"absolute",right:"12px",top:"50%",
                  transform:"translateY(-50%)",
                  background:"none",border:"none",
                  color:"#4a4d62",cursor:"pointer",padding:"2px",
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

            {/* Strength meter */}
            {strength > 0 && (
              <div style={{marginBottom:"14px"}}>
                <div style={{display:"flex",gap:"4px",marginBottom:"4px"}}>
                  {[1,2,3].map(i => (
                    <div key={i} style={{
                      flex:1,height:"3px",borderRadius:"3px",
                      background: i <= strength ? strengthColor : "#2a2d3e",
                      transition:"background 0.2s",
                    }}/>
                  ))}
                </div>
                <span style={{fontSize:"11px",color:strengthColor}}>{strengthLabel}</span>
              </div>
            )}

            {/* Confirm Password */}
            <div style={{marginBottom:"24px"}}>
              <label style={labelS}>Confirm password</label>
              <div style={{position:"relative"}}>
                <svg style={iconStyle("confirm")} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <input type="password" value={confirm} required
                  onChange={e => setConfirm(e.target.value)}
                  placeholder="Repeat your password"
                  style={{
                    ...inputS("confirm"),
                    borderColor: passwordMatch
                      ? "#ef4444"
                      : focused === "confirm" ? "#7c6af7" : "#2a2d3e",
                  }}
                  onFocus={() => setFocused("confirm")}
                  onBlur={() => setFocused("")}
                />
                {confirm.length > 0 && !passwordMatch && (
                  <span style={{
                    position:"absolute",right:"13px",
                    top:"50%",transform:"translateY(-50%)",
                    fontSize:"15px",
                  }}>✅</span>
                )}
              </div>
              {passwordMatch && (
                <div style={{fontSize:"12px",color:"#ef4444",marginTop:"5px"}}>
                  Passwords do not match
                </div>
              )}
            </div>

            <button type="submit" disabled={loading} style={{
              width:"100%",
              background: loading
                ? "#4a3d8f"
                : "linear-gradient(135deg,#7c6af7 0%,#6b5ce7 100%)",
              color:"white",border:"none",borderRadius:"8px",
              padding:"13px",fontSize:"15px",fontWeight:"600",
              cursor: loading ? "not-allowed" : "pointer",
              fontFamily:"inherit",
              display:"flex",alignItems:"center",
              justifyContent:"center",gap:"8px",
              boxShadow: loading ? "none" : "0 4px 22px rgba(124,106,247,0.38)",
              transition:"all 0.2s",
            }}>
              {loading ? (
                <>
                  <span style={{
                    width:"16px",height:"16px",
                    border:"2px solid rgba(255,255,255,0.3)",
                    borderTopColor:"white",borderRadius:"50%",
                    display:"inline-block",
                    animation:"aromi-spin 0.7s linear infinite",
                  }}/>
                  Creating account...
                </>
              ) : <><span>Create account</span><span style={{fontSize:"17px"}}>→</span></>}
            </button>
          </form>

          <div style={{
            textAlign:"center",marginTop:"20px",
            fontSize:"13px",color:"#6b7280",
          }}>
            Already have an account?{" "}
            <Link to="/login" style={{
              color:"#a89cf7",fontWeight:"600",textDecoration:"none",
            }}>Sign in</Link>
          </div>
        </div>

        <div style={{
          textAlign:"center",marginTop:"18px",
          fontSize:"12px",color:"#3a3d52",
        }}>🔒 Protected by AroMi • Your data stays private</div>
      </div>

      <style>{`
        @keyframes aromi-spin { to { transform: rotate(360deg); } }
        input::placeholder { color: #3a3d52 !important; }
      `}</style>
    </div>
  );
}
