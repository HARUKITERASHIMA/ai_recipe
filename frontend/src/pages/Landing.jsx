import React from 'react';
import { Utensils, Zap, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

const Landing = () => {
  return (
    <div className="min-h-screen bg-orange-50 flex flex-col items-center justify-center px-4 font-sans text-gray-800">
      
      {/* メインヒーローセクション */}
      <div className="max-w-4xl text-center">
        <h1 className="text-5xl md:text-7xl font-extrabold mb-8 leading-tight">
          冷蔵庫の「どうしよう」を<br />
          <span className="text-orange-500">AIが10秒で解決。</span>
        </h1>
        
        <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
          今あるものだけで、あなたの気分にぴったりの献立を提案します。
        </p>

        {/* アクションボタン */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center mb-20">
          <Link to="/signup">
            <button className="px-10 py-5 bg-orange-500 text-white rounded-2xl font-bold text-xl hover:bg-orange-600 transition-all shadow-xl hover:scale-105 cursor-pointer">
              新規登録
            </button>
          </Link>
          <Link to="/login">
            <button className="px-10 py-5 bg-white text-orange-500 border-2 border-orange-500 rounded-2xl font-bold text-xl hover:bg-orange-50 transition-all shadow-md cursor-pointer">
              ログイン
            </button>
          </Link>
        </div>
      </div>

      {/* 特徴紹介セクション */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl w-full">
        <FeatureCard 
          icon={<Zap className="text-orange-500" size={32} />}
          title="入力は一瞬"
          description="食材名を打ち込むだけ。AIがその場でレシピを考えます。"
        />
        <FeatureCard 
          icon={<Utensils className="text-orange-500" size={32} />}
          title="気分で選べる"
          description="「時短」「ガッツリ」「ヘルシー」など、今のわがままを叶えます。"
        />
        <FeatureCard 
          icon={<BookOpen className="text-orange-500" size={32} />}
          title="お気に入り保存"
          description="気に入った献立は保存して、あなただけのレシピ帳に。"
        />
      </div>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }) => (
  <div className="bg-white p-8 rounded-3xl shadow-sm border border-orange-100 flex flex-col items-center text-center hover:shadow-md transition-shadow">
    <div className="mb-4 p-3 bg-orange-50 rounded-2xl">{icon}</div>
    <h3 className="text-xl font-bold mb-2">{title}</h3>
    <p className="text-gray-500 text-sm leading-relaxed">{description}</p>
  </div>
);

export default Landing;