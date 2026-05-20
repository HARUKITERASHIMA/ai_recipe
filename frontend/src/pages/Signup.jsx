import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Signup = () => {
  // 入力内容を管理するための状態（ステート）
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault(); // 画面リロードを防ぐ

    try {
      const response = await fetch("http://127.0.0.1:5000/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username,
          email: email,
          password: password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("登録成功！ログインしてください。");
        navigate("/login"); // ログイン画面へ移動
      } else {
        alert(data.message || "エラーが発生しました");
      }
    } catch (error) {
      alert("サーバーに接続できませんでした。");
    }
  };

  return (
    <div className="min-h-screen bg-orange-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-10">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-800">アカウント作成</h2>
          <p className="text-gray-500 mt-2">AIシェフがあなたの料理をサポートします</p>
        </div>

        {/* フォームに onSubmit を追加 */}
        <form className="space-y-6" onSubmit={handleSignup}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">ユーザー名</label>
            <input 
              type="text" 
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
              value={username}
              onChange={(e) => setUsername(e.target.value)} // 入力を反映
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">メールアドレス</label>
            <input 
              type="email" 
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)} // 入力を反映
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">パスワード</label>
            <input 
              type="password" 
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)} // 入力を反映
              required
            />
          </div>

          <button 
            type="submit" 
            className="w-full py-4 bg-orange-500 text-white rounded-xl font-bold text-lg hover:bg-orange-600 transition-all shadow-lg mt-4"
          >
            登録する
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-500">
          すでにアカウントをお持ちの方はこちら{' '}
          <Link to="/login" className="text-orange-500 font-bold hover:underline">ログイン</Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;