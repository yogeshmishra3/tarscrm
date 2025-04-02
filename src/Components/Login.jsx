import { useState } from "react";

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Static credentials
  const VALID_EMAIL = "yogibaba1207@gmail.com";
  const VALID_PASSWORD = "TARS@123";

  const handleLogin = (e) => {
    e.preventDefault();

    // Check if credentials match the static values
    if (email === VALID_EMAIL && password === VALID_PASSWORD) {
      onLogin(email); // Pass email to parent component
    } else {
      setError("Invalid email or password. Please try again.");
    }
  };

  return (
    <div className="flex items-center justify-center w-full min-h-screen bg-gradient-to-r from-blue-50 to-purple-50">
      <div
        className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 transform transition-all hover:scale-105"
        style={{ width: "500px", height: "400px" }}
      >
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Welcome to CRM
          </h2>
          <p className="text-gray-500 text-sm">Sign in to continue</p>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="mt-6 space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-600"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 mt-1 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              required
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-600"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 mt-1 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-2 rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-300"
          >
            Sign In
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-500 text-sm"></p>
        </div>
      </div>
    </div>
  );
}

export default Login;
