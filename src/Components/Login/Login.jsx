
import { useState } from "react";
import { authenticateUser } from "../../Utils/userStorage";
import "./Login.css";

function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    const user = authenticateUser(username, password);

    if (user) {
      setError("");
      onLogin(user);
    } else {
      setError("Invalid username or password, or account is inactive.");
    }
  };

  return (
    <div className="login-container">
      <div className="login-wrapper">
        <div className="login-left">
          <img
            src="/sarvanamlogo.png"
            alt="Sarvanam Logo"
            className="login-logo"
          />

          <div className="login-support">
            <h2>Support via call &amp; email</h2>

            <div className="support-contact">
              <span>+977-985-136-5390</span>
              <span className="support-divider">|</span>
              <a href="mailto:support@sarvanam.com">
                support@sarvanam.com
              </a>
            </div>
          </div>
        </div>

        <div className="login-right">
          <form className="login-card" onSubmit={handleLogin}>
            <h1>Welcome Back</h1>

            <p className="login-subtitle">
              Sign in to access Sarvanam Learning
            </p>

            <div className="login-input-group">
              <label>Username</label>
              <input
                type="text"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="login-input-group">
              <label>Password</label>
              <input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && <p className="login-error">{error}</p>}

            <button type="submit" className="login-button">
              Login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
