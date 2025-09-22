# Vercelデプロイ500エラー修正ガイド

## 1. 完了した修正
✅ すべてのAPIルートハンドラーに動的実行設定を追加しました
- cookies()を使用するため静的プリレンダができないエラーを解決

## 2. Vercel環境変数チェックリスト

### 必須の環境変数
以下の環境変数をVercelのダッシュボードで設定してください：

1. **DATABASE_URL** (必須)
   - PostgreSQLの接続文字列
   - 例: `postgresql://user:password@host:5432/dbname?sslmode=require`
   - Supabase/Neonの無料プランでOK

2. **SESSION_SECRET** (必須)
   - ランダムな長い文字列（32文字以上推奨）
   - 未設定だとCookie署名でエラー→500エラーの原因
   - 生成例: `openssl rand -hex 32`

3. **APP_BASE_URL** (必須)
   - 本番環境のURL
   - 例: `https://your-app-name.vercel.app`
   - QRコード生成で使用

4. **GOOGLE_GEMINI_API_KEY** (必須)
   - Google AI StudioからGemini APIキーを取得
   - https://makersuite.google.com/app/apikey

5. **SESSION_MAX_AGE_SECONDS** (任意)
   - デフォルト: 86400 (24時間)

### 設定手順
1. Vercelダッシュボードへログイン
2. プロジェクトを選択
3. Settings → Environment Variables
4. 各環境変数を追加（Production/Preview/Development全てにチェック）
5. Save

## 3. データベースの初期化

### Supabaseを使用する場合：
```bash
# ローカルで実行
npx prisma db push
```

または、Vercelのビルドステップで自動実行されます（package.jsonのbuildスクリプト）

## 4. 再デプロイ
環境変数を設定したら、再デプロイを実行：
```bash
vercel --prod
```

## 5. 動作確認

### APIエンドポイントテスト
```bash
# サインアップテスト
curl -X POST https://your-app.vercel.app/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"userId":"test1","password":"password123"}'

# レスポンス例（成功）
# {"ok":true}
# Set-Cookie: sid=...
```

### ブラウザでの確認
1. `/auth/signup`でユーザー作成
2. `/home`で自分のQR表示確認
3. `/metrics`で実績表示確認

## 6. トラブルシューティング

### 500エラーが続く場合
- Vercelの Functions ログを確認
- 環境変数が正しく設定されているか再確認
- DATABASE_URLの接続文字列が正しいか確認

### "Dynamic server usage"エラーが出る場合
- すべてのAPIルートに`export const dynamic = 'force-dynamic'`があるか確認
- 再デプロイを実行

### favicon.ico 404エラー
- `/public/favicon.ico`を追加（任意）