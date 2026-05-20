import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Clock, Utensils, History, Star, LogOut, User, Loader2, Heart } from 'lucide-react';

const Home = () => {
  const [ingredients, setIngredients] = useState('');
  const [loading, setLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [username, setUsername] = useState('Guest');
  const [history, setHistory] = useState([]);
  const navigate = useNavigate();

  // user_idごとの履歴キーを生成
  const getHistoryKey = () => {
    const user_id = localStorage.getItem("user_id");
    return `recipeHistory_${user_id}`;
  };

  useEffect(() => {
    // セッション切れチェック（30分）
    const loginTime = localStorage.getItem("login_time");
    if (loginTime) {
      const elapsed = Date.now() - parseInt(loginTime);
      const thirtyMinutes = 30 * 60 * 1000;
      if (elapsed > thirtyMinutes) {
        localStorage.removeItem("username");
        localStorage.removeItem("user_id");
        localStorage.removeItem("login_time");
        alert("セッションが切れました。再度ログインしてください。");
        navigate("/login");
        return;
      }
    } else {
      navigate("/login");
      return;
    }

    const savedName = localStorage.getItem("username");
    if (savedName) setUsername(savedName);

    // user_idごとの履歴を読み込む
    const savedHistory = JSON.parse(localStorage.getItem(getHistoryKey()) || "[]");
    setHistory(savedHistory);
  }, []);

  const handleAskAI = async () => {
    if (!ingredients) return alert("食材を入力してください！");

    setLoading(true);
    try {
      const response = await fetch("http://127.0.0.1:5000/api/suggest-recipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ingredients: ingredients }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "エラーが発生しました。食材を入力し直してください。");
        return;
      }

      const parsedRecipes = typeof data === 'string' ? JSON.parse(data) : data;

      // user_idごとに履歴保存
      if (Array.isArray(parsedRecipes) && parsedRecipes.length > 0) {
        const historyItem = {
          id: Date.now(),
          title: parsedRecipes[0].title + " など",
          date: new Date().toLocaleDateString(),
          recipes: parsedRecipes,
          ingredients: ingredients,
        };
        const existingHistory = JSON.parse(localStorage.getItem(getHistoryKey()) || "[]");
        const updatedHistory = [historyItem, ...existingHistory].slice(0, 5);
        localStorage.setItem(getHistoryKey(), JSON.stringify(updatedHistory));
        setHistory(updatedHistory);
      }

      navigate('/Recipes', { state: { recipes: parsedRecipes, ingredients: ingredients } });

    } catch (error) {
      console.error("AI通信エラー:", error);
      alert("AIシェフが席を外しているようです（通信エラー）");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("username");
    localStorage.removeItem("user_id");
    localStorage.removeItem("login_time");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-orange-50/50 pb-12">
      <header className="bg-white border-b border-orange-100 px-6 py-4 flex justify-between items-center sticky top-0 z-50">
        <h1 className="text-2xl font-bold text-orange-500 cursor-pointer" onClick={() => navigate('/home')}>AI Kitchen</h1>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/favorites')}
            className="p-2 hover:bg-orange-50 rounded-full text-gray-600 transition-colors"
            title="お気に入り"
          >
            <Heart size={24} />
          </button>

          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="w-10 h-10 bg-orange-200 rounded-full flex items-center justify-center font-bold text-orange-700 hover:ring-2 hover:ring-orange-400 transition-all outline-none"
            >
              {username[0].toUpperCase()}
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-2xl border border-orange-50 py-2 z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-50">
                  <p className="font-bold text-gray-800">{username} さん</p>
                </div>
                <button className="w-full text-left px-4 py-3 text-sm text-gray-600 hover:bg-orange-50 flex items-center gap-2">
                  <User size={16} /> ユーザー情報
                </button>
                <button
                  onClick={() => navigate('/favorites')}
                  className="w-full text-left px-4 py-3 text-sm text-gray-600 hover:bg-orange-50 flex items-center gap-2"
                >
                  <Star size={16} className="text-yellow-500" fill="currentColor" /> お気に入りレシピ
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 text-sm text-red-500 hover:bg-red-50 flex items-center gap-2 border-t border-gray-50"
                >
                  <LogOut size={16} /> ログアウト
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {showMenu && <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)}></div>}

      <main className="max-w-2xl mx-auto px-4 mt-8">
        <section className="bg-white rounded-3xl shadow-xl p-8 mb-8">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Utensils className="text-orange-500" /> 何を作りますか？
          </h2>
          <div className="space-y-6">
            <textarea
              className="w-full px-4 py-3 rounded-2xl border border-gray-100 bg-gray-50 focus:ring-2 focus:ring-orange-500 outline-none transition-all h-32 resize-none text-lg"
              placeholder="例：キャベツ、豚肉、卵"
              value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
            />
            <button
              onClick={handleAskAI}
              disabled={loading}
              className={`w-full py-4 rounded-2xl font-bold text-lg transition-all shadow-lg flex items-center justify-center gap-2 ${
                loading ? 'bg-gray-400 text-white' : 'bg-orange-500 hover:bg-orange-600 text-white active:scale-95'
              }`}
            >
              {loading ? <Loader2 className="animate-spin" /> : <Search size={20} />}
              {loading ? "AIシェフが考えています..." : "AIシェフにメニューを考えてもらう"}
            </button>
          </div>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-4 text-gray-600 font-bold">
            <History size={20} />
            <h3>最近提案した献立</h3>
          </div>
          <div className="space-y-3">
            {history.length === 0 ? (
              <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-gray-200 text-gray-400 text-sm">
                履歴はまだありません
              </div>
            ) : (
              history.map((item) => (
                <div
                  key={item.id}
                  className="bg-white p-4 rounded-2xl shadow-sm border border-orange-50 flex justify-between items-center cursor-pointer hover:bg-orange-50 transition-colors"
                  onClick={() => navigate('/Recipes', { state: { recipes: item.recipes, ingredients: item.ingredients } })}
                >
                  <div>
                    <h4 className="font-bold text-gray-800">{item.title}</h4>
                    <p className="text-xs text-gray-400 mt-1 flex items-center gap-1"><Clock size={12} /> {item.date}</p>
                  </div>
                  <span className="text-orange-300">→</span>
                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Home;