import os
import json
from flask import Flask, request, jsonify, session
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from google import genai
from werkzeug.security import generate_password_hash, check_password_hash
from dotenv import load_dotenv
import traceback

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=api_key)
print("API KEY CHECK:", "OK" if api_key else "NG (Key not found)")

app = Flask(__name__)

app.config['SECRET_KEY'] = 'your-secret-key-123'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///kitchen.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

CORS(app, supports_credentials=True, origins=["http://localhost:5173", "http://127.0.0.1:5173"])

db = SQLAlchemy(app)

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    favorites = db.relationship('Favorite', backref='user', lazy=True)

class Favorite(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    time = db.Column(db.String(20))
    ingredients = db.Column(db.Text)
    steps = db.Column(db.Text)

with app.app_context():
    db.create_all()

@app.route('/api/signup', methods=['POST'])
def signup():
    try:
        data = request.json
        if User.query.filter_by(email=data['email']).first():
            return jsonify({"message": "このメールアドレスは既に登録されています"}), 400
        hashed_pw = generate_password_hash(data['password'])
        new_user = User(username=data['username'], email=data['email'], password_hash=hashed_pw)
        db.session.add(new_user)
        db.session.commit()
        return jsonify({"message": "ユーザー登録が完了しました！"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/login', methods=['POST'])
def login():
    try:
        data = request.json
        user = User.query.filter_by(email=data['email']).first()
        if user and check_password_hash(user.password_hash, data['password']):
            return jsonify({"message": "ログイン成功！", "username": user.username, "user_id": user.id}), 200
        return jsonify({"message": "メールアドレスかパスワードが違います"}), 401
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/logout', methods=['POST'])
def logout():
    return jsonify({"message": "ログアウトしました"}), 200

@app.route('/api/me', methods=['GET'])
def get_me():
    user_id = request.args.get('user_id')
    if not user_id:
        return jsonify({"logged_in": False}), 401
    user = db.session.get(User, int(user_id))
    if not user:
        return jsonify({"logged_in": False}), 401
    return jsonify({"logged_in": True, "username": user.username, "email": user.email})

@app.route('/api/suggest-recipes', methods=['POST'])
def suggest_recipes():
    data = request.json
    ingredients = data.get('ingredients', '')
    print(f"DEBUG: 届いた食材 -> {ingredients}")
    try:
        prompt = f"""
        あなたはプロの料理研究家です。
        以下の入力をもとにレシピを3つ提案してください。

        入力: {ingredients}

        【重要なルール】
        1. 入力が「デザート作って」「簡単な料理」のようなリクエスト文の場合は、それに合ったレシピを提案してください。
        2. 入力が食材リストの場合は、その食材を使ったレシピを提案してください。
        3. 食べられないもの（時計、石など）が含まれている場合は無視してください。
        4. すべて食べられないものだった場合は {{ "message": "error_invalid_ingredients" }} のみ返してください。
        出力は必ず以下のJSON形式のみで返してください：
        [
        {{
            "title": "料理名",
            "description": "料理の簡単な説明",
            "time": "調理時間",
            "ingredients": ["材料1", "材料2"],
            "steps": ["手順1", "手順2"]
        }}
        ]
        """
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt
        )
        clean_text = response.text.replace('```json', '').replace('```', '').strip()
        parsed = json.loads(clean_text)

        # 食べられない食材のみだった場合
        if isinstance(parsed, dict) and parsed.get('message') == 'error_invalid_ingredients':
            return jsonify({"error": "食べられる食材が見つかりませんでした。食材を入力し直してください。"}), 400

        print("DEBUG: AIからの回答取得に成功しました！")
        return jsonify(parsed)

    except Exception as e:
        print("!!!!!!!! ERROR発生 !!!!!!!!")
        traceback.print_exc()
        error_msg = str(e)
        if "429" in error_msg:
            return jsonify({"error": "AIが混み合っています。少し待ってから再試行してください。"}), 429
        return jsonify({"error": error_msg}), 500

@app.route('/api/favorites', methods=['POST'])
def add_favorite():
    try:
        data = request.json
        user_id = data.get('user_id')
        if not user_id:
            return jsonify({"message": "ログインが必要です"}), 401
        new_fav = Favorite(
            user_id=user_id,
            title=data['title'],
            description=data.get('description', ''),
            time=data.get('time', ''),
            ingredients=json.dumps(data.get('ingredients', [])),
            steps=json.dumps(data.get('steps', []))
        )
        db.session.add(new_fav)
        db.session.commit()
        return jsonify({"message": "お気に入りに保存しました！"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/favorites', methods=['GET'])
def get_favorites():
    try:
        user_id = request.args.get('user_id')
        if not user_id:
            return jsonify({"message": "ログインが必要です"}), 401
        favs = Favorite.query.filter_by(user_id=int(user_id)).all()
        result = [{
            "id": f.id,
            "title": f.title,
            "description": f.description,
            "time": f.time,
            "ingredients": json.loads(f.ingredients),
            "steps": json.loads(f.steps)
        } for f in favs]
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/favorites/<int:fav_id>', methods=['DELETE'])
def delete_favorite(fav_id):
    try:
        data = request.json
        user_id = data.get('user_id')
        if not user_id:
            return jsonify({"message": "ログインが必要です"}), 401
        fav = Favorite.query.filter_by(id=fav_id, user_id=user_id).first()
        if not fav:
            return jsonify({"message": "見つかりませんでした"}), 404
        db.session.delete(fav)
        db.session.commit()
        return jsonify({"message": "削除しました"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/')
def index():
    return jsonify({"status": "running", "database": "sqlite"})

if __name__ == '__main__':
    app.run(debug=True, port=5000)