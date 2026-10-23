
import { useState } from "react";
import { loginUser, registerUser } from "../services/authService";

function Auth({ onLogin, onShowMessage }) {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    onShowMessage("");

    if (!isLogin && password !== confirmPassword) {
      onShowMessage("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        const data = await loginUser(email, password);

        if (!data.token) {
          throw new Error("Login succeeded, but no token was returned.");
        }

        localStorage.setItem("token", data.token);
        onLogin(data);
        onShowMessage("Login successful! Welcome back.");
      } else {
        await registerUser(name, email, password);
        onShowMessage("Account created successfully! You can now log in.");

        setIsLogin(true);
        setName("");
        setPassword("");
        setConfirmPassword("");
      }
    } catch (error) {
      onShowMessage(error.message || "Authentication failed.");
    } finally {
      setLoading(false);
    }
  }

  function switchMode() {
    setIsLogin((current) => !current);
    setName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    onShowMessage("");
  }

  return (
    <section className="auth-section" id="auth">
      <div className="auth-card">
        <p className="eyebrow">
          {isLogin ? "WELCOME BACK" : "JOIN LUNATICCART"}
        </p>

        <h2>{isLogin ? "Login" : "Create Account"}</h2>

        <p className="auth-description">
          {isLogin
            ? "Sign in to continue your shopping journey."
            : "Create an account to start shopping with us."}
        </p>

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <label className="auth-field">
              Full Name
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Enter your full name"
                autoComplete="name"
                required
              />
            </label>
          )}

          <label className="auth-field">
            Email Address
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </label>

          <label className="auth-field">
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              autoComplete={isLogin ? "current-password" : "new-password"}
              minLength={8}
              required
            />
          </label>

          {!isLogin && (
            <label className="auth-field">
              Confirm Password
              <input
                type="password"
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(event.target.value)
                }
                placeholder="Re-enter your password"
                autoComplete="new-password"
                minLength={8}
                required
              />
            </label>
          )}

          <button
            className="auth-submit"
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Please wait..."
              : isLogin
                ? "Login"
                : "Create Account"}
          </button>
        </form>

        <p className="auth-switch">
          {isLogin
            ? "Don't have an account?"
            : "Already have an account?"}{" "}
          <button type="button" onClick={switchMode} disabled={loading}>
            {isLogin ? "Register" : "Login"}
          </button>
        </p>
      </div>
    </section>
  );
}

export default Auth;
