import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, Utensils, Clock, ChefHat, ShoppingCart, ChevronDown, ChevronUp } from 'lucide-react';

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedIds, setExpandedIds] = useState([]);
  const navigate = useNavigate();

  const fetchFavorites = async () => {
    try {
      const user_id = localStorage.getItem("user_id");
      if (!user_id) {
        setLoading(false);
        return;
      }
      const response = await fetch(`http://127.0.0.1:5000/api/favorites?user_id=${user_id}`);
      if (response.ok) {
        const data = await response.json();
        setFavorites(data);
      }
    } catch (error) {
      console.error("取得エラー:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFavorites(); }, []);

  const toggleExpand = (id) => {
    setExpandedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleDelete = async (id) => {
    if (!window.confirm("このレシピを削除しますか？")) return;
    try {
      const user_id = localStorage.getItem("user_id");
      const response = await fetch(`http://127.0.0.1:5000/api/favorites/${id}`, {
        method: 'DELETE',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id }),
      });
      if (response.ok) {
        setFavorites(favorites.filter(f => f.id !== id));
      }
    } catch (error) {
      alert("削除に失敗しました");
    }
  };

  return (
    <div className="min-h-screen bg-orange-50/30 pb-12">
      <header className="bg-white border-b border-orange-100 px-6 py-4 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <button onClick={() => navigate('/home')} className="p-2 hover:bg-orange-50 rounded-full text-orange-500">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold text-gray-800">お気に入りレシピ</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 mt-8 space-y-6">
        {loading ? (
          <p className="text-center text-gray-500">読み込み中...</p>
        ) : favorites.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-orange-100">
            <Utensils size={48} className="mx-auto mb-4 text-orange-200" />
            <p className="text-gray-400">お気に入りはまだありません</p>
          </div>
        ) : (
          favorites.map((recipe) => {
            const isExpanded = expandedIds.includes(recipe.id);
            return (
              <div key={recipe.id} className="bg-white rounded-2xl shadow-md overflow-hidden border border-orange-50">
                
                {/* ヘッダー部分 */}
                <div className="p-6 flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{recipe.title}</h3>
                    <div className="flex gap-4 text-sm text-gray-500 mb-3">
                      <span className="flex items-center gap-1"><Clock size={16} /> {recipe.time}</span>
                    </div>
                    <p className="text-gray-600 italic">"{recipe.description}"</p>
                  </div>
                  <button
                    onClick={() => handleDelete(recipe.id)}
                    className="p-2 text-red-400 hover:bg-red-50 rounded-full transition-colors ml-4"
                  >
                    <Trash2 size={24} />
                  </button>
                </div>

                {/* 展開ボタン */}
                <button
                  onClick={() => toggleExpand(recipe.id)}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-orange-50 text-orange-500 font-medium text-sm hover:bg-orange-100 transition-colors"
                >
                  {isExpanded ? (
                    <><ChevronUp size={18} /> 閉じる</>
                  ) : (
                    <><ChevronDown size={18} /> 材料・作り方を見る</>
                  )}
                </button>

                {/* 展開コンテンツ */}
                {isExpanded && (
                  <div className="p-6 border-t border-orange-50 grid md:grid-cols-5 gap-8">
                    
                    {/* 材料 */}
                    <div className="md:col-span-2">
                      <h4 className="flex items-center gap-2 font-bold text-gray-800 mb-4 pb-2 border-b-2 border-orange-100">
                        <ShoppingCart size={18} className="text-orange-500" />
                        材料
                      </h4>
                      <ul className="space-y-2">
                        {recipe.ingredients.map((ing, i) => (
                          <li key={i} className="text-gray-600 flex items-center gap-2 text-sm">
                            <span className="w-2 h-2 bg-orange-300 rounded-full flex-shrink-0" />
                            {ing}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* 作り方 */}
                    <div className="md:col-span-3">
                      <h4 className="flex items-center gap-2 font-bold text-gray-800 mb-4 pb-2 border-b-2 border-orange-100">
                        <ChefHat size={18} className="text-orange-500" />
                        作り方
                      </h4>
                      <ol className="space-y-4">
                        {recipe.steps.map((step, i) => (
                          <li key={i} className="flex gap-3">
                            <span className="flex-shrink-0 w-6 h-6 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-bold text-xs">
                              {i + 1}
                            </span>
                            <p className="text-gray-600 text-sm leading-relaxed pt-0.5">{step}</p>
                          </li>
                        ))}
                      </ol>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </main>
    </div>
  );
};

export default Favorites;