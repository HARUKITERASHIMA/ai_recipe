import React, { useState } from 'react';
import { ChevronLeft, Heart, Share2, Printer, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const RecipeDetail = () => {
  const [isFavorite, setIsFavorite] = useState(false);

  // 本来はAIから受け取るダミーデータ
  const recipe = {
    title: "トロトロたまごのキャベツ豚平焼き",
    description: "冷蔵庫に残ったキャベツと少しの豚肉で、大満足のメインおかずが完成します。",
    time: "10分",
    ingredients: [
      { name: "キャベツ", amount: "1/4玉" },
      { name: "豚バラ肉", amount: "100g" },
      { name: "卵", amount: "2個" },
      { name: "お好みソース・マヨネーズ", amount: "適量" }
    ],
    steps: [
      "キャベツを千切りにし、豚肉は一口大に切る。",
      "フライパンで豚肉を炒め、色が変わったらキャベツを加えてしんなりするまで炒める。",
      "一度取り出し、同じフライパンに溶き卵を広げる。",
      "卵の真ん中に具材を戻し、半分に畳んでお皿に盛る。ソースとマヨをかけて完成！"
    ]
  };

  return (
    <div className="min-h-screen bg-white pb-12">
      {/* 上部ナビゲーション */}
      <div className="max-w-2xl mx-auto px-4 py-6 flex justify-between items-center">
        <Link to="/home" className="p-2 hover:bg-orange-50 rounded-full transition-colors text-gray-600">
          <ChevronLeft size={28} />
        </Link>
        <div className="flex gap-2">
          <button className="p-2 hover:bg-orange-50 rounded-full text-gray-600"><Share2 size={24} /></button>
          <button 
            onClick={() => setIsFavorite(!isFavorite)}
            className={`p-2 rounded-full transition-all ${isFavorite ? 'text-red-500 bg-red-50' : 'text-gray-600 hover:bg-orange-50'}`}
          >
            <Heart size={24} fill={isFavorite ? "currentColor" : "none"} />
          </button>
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-6">
        {/* レシピヘッダー */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-800 mb-3">{recipe.title}</h1>
          <p className="text-gray-500 leading-relaxed">{recipe.description}</p>
          <div className="mt-4 inline-flex items-center px-3 py-1 bg-orange-100 text-orange-700 rounded-lg text-sm font-bold">
            ⏱ 調理時間: {recipe.time}
          </div>
        </div>

        {/* 材料リスト */}
        <section className="mb-10 bg-orange-50/50 p-6 rounded-3xl">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-700">
            <Utensils size={20} /> 材料
          </h3>
          <ul className="space-y-3">
            {recipe.ingredients.map((ing, index) => (
              <li key={index} className="flex justify-between border-b border-orange-100 pb-2">
                <span className="text-gray-700">{ing.name}</span>
                <span className="font-bold text-gray-900">{ing.amount}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* 作り方 */}
        <section>
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-gray-700">
            <CheckCircle2 size={20} className="text-orange-500" /> 作り方
          </h3>
          <div className="space-y-8">
            {recipe.steps.map((step, index) => (
              <div key={index} className="flex gap-4">
                <span className="flex-shrink-0 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold">
                  {index + 1}
                </span>
                <p className="text-gray-700 leading-7 pt-1">{step}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 完了ボタン（おまけ） */}
        <button className="w-full mt-12 py-4 bg-gray-900 text-white rounded-2xl font-bold text-lg hover:bg-black transition-all shadow-lg">
          おいしくできた！
        </button>
      </main>
    </div>
  );
};

// アイコン用のコンポーネント
const Utensils = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>
);

export default RecipeDetail;