import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, ChefHat, ShoppingCart, Star, RefreshCw, Loader2 } from 'lucide-react';

const Recipes = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState(location.state?.recipes || []);
  const ingredients = location.state?.ingredients || '';
  const [savedIndices, setSavedIndices] = useState([]);
  const [reloading, setReloading] = useState(false);

  // もう一度提案してもらう
  const handleReload = async () => {
    if (!ingredients) return;
    setReloading(true);
    setSavedIndices([]);
    try {
      const response = await fetch("http://127.0.0.1:5000/api/suggest-recipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ingredients }),
      });
      const data = await response.json();
      const parsedRecipes = typeof data === 'string' ? JSON.parse(data) : data;
      setRecipes(parsedRecipes);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      alert("AIシェフが席を外しているようです（通信エラー）");
    } finally {
      setReloading(false);
    }
  };

  // お気に入り保存処理
  const handleSaveFavorite = async (recipe, index) => {
    if (savedIndices.includes(index)) return;

    const user_id = localStorage.getItem("user_id");
    if (!user_id) {
      alert("ログインが必要です。");
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:5000/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...recipe, user_id }),
      });

      if (response.ok) {
        setSavedIndices([...savedIndices, index]);
        alert(`${recipe.title} をお気に入りに保存しました！`);
      } else if (response.status === 401) {
        alert("ログインが必要です。");
      } else {
        const errorData = await response.json();
        alert(`保存に失敗しました: ${errorData.message}`);
      }
    } catch (error) {
      alert("サーバーと通信できませんでした。");
    }
  };

  if (recipes.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-orange-50">
        <p className="text-gray-500 mb-4 text-lg">提案されたレシピが見つかりませんでした。</p>
        <button
          onClick={() => navigate('/home')}
          className="bg-orange-500 text-white px-6 py-2 rounded-full font-bold shadow-lg transition-transform active:scale-95"
        >
          食材入力に戻る
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-orange-50/30 pb-12">
      <header className="bg-white border-b border-orange-100 px-6 py-4 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <button
            onClick={() => navigate('/home')}
            className="p-2 hover:bg-orange-50 rounded-full text-orange-500 transition-colors outline-none"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold text-gray-800">AIシェフの提案メニュー</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 mt-8 space-y-8">
        <div className="flex flex-col items-center gap-4">
          <h2 className="text-center text-gray-500 font-medium">
            {recipes.length} つのレシピを提案しました
          </h2>

          {/* もう一度提案ボタン */}
          <button
            onClick={handleReload}
            disabled={reloading}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm shadow-md transition-all active:scale-95 ${
              reloading
                ? 'bg-gray-300 text-gray-500'
                : 'bg-white border-2 border-orange-400 text-orange-500 hover:bg-orange-50'
            }`}
          >
            {reloading ? (
              <><Loader2 size={18} className="animate-spin" /> AIシェフが考えています...</>
            ) : (
              <><RefreshCw size={18} /> 違うレシピを提案してもらう</>
            )}
          </button>
        </div>

        <div className="grid gap-10">
          {recipes.map((recipe, index) => (
            <div key={index} className="bg-white rounded-3xl shadow-xl overflow-hidden border border-orange-100 transition-all hover:shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">

              <div className="bg-orange-500 p-6 text-white relative">
                <div className="flex justify-between items-start pr-12">
                  <div>
                    <h3 className="text-2xl font-bold leading-tight">{recipe.title}</h3>
                    <div className="flex items-center gap-2 mt-2 bg-white/20 w-fit px-3 py-1 rounded-full text-sm">
                      <Clock size={16} />
                      <span>{recipe.time}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleSaveFavorite(recipe, index)}
                  className={`absolute top-6 right-6 p-3 rounded-full transition-all active:scale-90 shadow-md outline-none ${
                    savedIndices.includes(index)
                      ? 'bg-yellow-400 text-white'
                      : 'bg-white/20 hover:bg-white/40 text-white'
                  }`}
                  title="お気に入りに保存"
                >
                  <Star
                    size={24}
                    fill={savedIndices.includes(index) ? "currentColor" : "none"}
                    className={savedIndices.includes(index) ? "animate-pulse" : ""}
                  />
                </button>

                <p className="mt-4 text-orange-50 italic opacity-95 text-lg">
                  "{recipe.description}"
                </p>
              </div>

              <div className="p-8 grid md:grid-cols-5 gap-10">
                <div className="md:col-span-2">
                  <h4 className="flex items-center gap-2 font-bold text-gray-800 mb-4 pb-2 border-b-2 border-orange-100">
                    <ShoppingCart size={20} className="text-orange-500" />
                    <span>材料</span>
                  </h4>
                  <ul className="space-y-3">
                    {recipe.ingredients.map((ing, i) => (
                      <li key={i} className="text-gray-600 flex items-center gap-2">
                        <span className="w-2 h-2 bg-orange-300 rounded-full flex-shrink-0" />
                        <span className="text-base">{ing}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="md:col-span-3">
                  <h4 className="flex items-center gap-2 font-bold text-gray-800 mb-4 pb-2 border-b-2 border-orange-100">
                    <ChefHat size={20} className="text-orange-500" />
                    <span>作り方</span>
                  </h4>
                  <ol className="space-y-6">
                    {recipe.steps.map((step, i) => (
                      <li key={i} className="flex gap-4">
                        <span className="flex-shrink-0 w-7 h-7 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-bold text-sm">
                          {i + 1}
                        </span>
                        <p className="text-gray-600 leading-relaxed pt-0.5">{step}</p>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center pt-8">
          <button
            onClick={() => navigate('/home')}
            className="text-gray-400 hover:text-orange-600 font-medium transition-colors border-b border-transparent hover:border-orange-600"
          >
            別の食材で相談する
          </button>
        </div>
      </main>
    </div>
  );
};

export default Recipes;