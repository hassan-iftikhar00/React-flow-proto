import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { LogIn, User, Lock, AlertCircle } from "lucide-react";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Simulate network delay for realism
    setTimeout(() => {
      const result = login(username, password);
      if (!result.success) {
        setError(result.error);
      }
      setLoading(false);
    }, 500);
  };

  const quickLogin = (user) => {
    setUsername(user.username);
    setPassword(user.password);
  };

  return (
    <div className="login-container">
      <div className="login-background">
        <div className="login-gradient-orb orb-1"></div>
        <div className="login-gradient-orb orb-2"></div>
        <div className="login-gradient-orb orb-3"></div>
      </div>

      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">
            <LogIn size={40} />
          </div>
          <h1>Genesys Flow Builder</h1>
          <p>Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className="login-error">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <div className="login-input-group">
            <label>
              <User size={16} />
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
              autoFocus
            />
          </div>

          <div className="login-input-group">
            <label>
              <Lock size={16} />
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          <button type="submit" className="login-submit-btn" disabled={loading}>
            {loading ? (
              <>
                <div className="login-spinner"></div>
                Signing in...
              </>
            ) : (
              <>
                <LogIn size={18} />
                Sign In
              </>
            )}
          </button>
        </form>

        <div className="login-divider">
          <span>Quick Login</span>
        </div>

        <div className="login-quick-access">
          <button
            type="button"
            className="quick-login-btn admin"
            onClick={() =>
              quickLogin({
                username: "Hassan.Iftikhar",
                password: "password123",
              })
            }
          >
            <div className="quick-login-avatar">HI</div>
            <div className="quick-login-info">
              <strong>Hassan Iftikhar</strong>
              <span>Admin</span>
            </div>
          </button>

          <button
            type="button"
            className="quick-login-btn editor"
            onClick={() =>
              quickLogin({
                username: "Maarij.Sarfraz",
                password: "password123",
              })
            }
          >
            <div className="quick-login-avatar">MS</div>
            <div className="quick-login-info">
              <strong>Maarij Sarfraz</strong>
              <span>Editor</span>
            </div>
          </button>

          <button
            type="button"
            className="quick-login-btn viewer"
            onClick={() =>
              quickLogin({
                username: "Moazzam.Iliyas",
                password: "password123",
              })
            }
          >
            <div className="quick-login-avatar">MI</div>
            <div className="quick-login-info">
              <strong>Moazzam Iliyas</strong>
              <span>Viewer</span>
            </div>
          </button>
        </div>

        <div className="login-footer">
          <p>
            Demo credentials: Any user above with password{" "}
            <code>password123</code>
          </p>
        </div>
      </div>
    </div>
  );
}
