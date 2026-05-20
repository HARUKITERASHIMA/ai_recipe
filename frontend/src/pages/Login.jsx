import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://127.0.0.1:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("ログイン成功！");
        localStorage.setItem("username", data.username);
        localStorage.setItem("user_id", data.user_id);
        localStorage.setItem("login_time", new Date().getTime().toString());
        navigate("/Home");
      } else {
        alert(data.message || "ログインに失敗しました");
      }
    } catch (error) {
      alert("サーバーに接続できませんでした。");
    }
  };

  return (
    <div className="min-h-screen bg-orange-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-10">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-800">おかえりなさい！</h2>
          <p className="text-gray-500 mt-2">ログインしてAIシェフに相談しましょう</p>
        </div>
        <form className="space-y-6" onSubmit={handleLogin}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">メールアドレス</label>
            <input
              type="email"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-orange-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">パスワード</label>
            <input
              type="password"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-orange-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-4 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 shadow-lg"
          >
            ログイン
          </button>
        </form>
        <div className="mt-8 text-center text-sm text-gray-500">
          アカウントをお持ちでないですか？{' '}
          <Link to="/signup" className="text-orange-500 font-bold hover:underline">新規登録</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;