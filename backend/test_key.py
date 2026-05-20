import os
from dotenv import load_dotenv

# .envファイルを読み込む
load_dotenv()

# キーを取り出す
key = os.getenv("GEMINI_API_KEY")

if key:
    print("✅ 成功!APIキーを読み込めました。")
    print(f"キーの冒頭部分: {key[:8]}...") 
else:
    print("❌ 失敗。 .envファイルが見つからないか、中身が空です。")