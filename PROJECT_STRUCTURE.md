# 📚 プロジェクト構成・機能配置 解説書

## 🎯 プロジェクト概要

本プロジェクトは「**高校生向けQRプロフィール×話題提示アプリ**」です。
QRコードを通じて相手と繋がり、AI（Google Gemini）が共通点を見つけて会話のきっかけとなる話題を提案します。

### 主要な技術スタック
- **フレームワーク**: Next.js 14（App Router）
- **言語**: TypeScript
- **データベース**: PostgreSQL（Supabase）+ Prisma ORM
- **AI**: Google Gemini 1.5 Flash
- **認証**: 署名付きCookie（HMAC）
- **デプロイ**: Vercel
- **スタイリング**: Tailwind CSS

---

## 📁 フォルダ構成の全体像

```
proposeConversationTopic/
├── 📂 src/                    # ソースコード本体
│   ├── 📂 app/                # Next.js App Router（ページとAPI）
│   │   ├── 📂 api/           # APIエンドポイント
│   │   ├── 📂 auth/          # 認証関連ページ
│   │   ├── 📂 home/          # ホーム画面
│   │   ├── 📂 profile/       # プロフィール画面
│   │   ├── 📂 metrics/       # 実績画面
│   │   ├── 📂 scan/          # QRスキャン画面
│   │   └── layout.tsx        # 共通レイアウト
│   │
│   ├── 📂 components/         # 再利用可能なUIコンポーネント
│   │
│   └── 📂 lib/               # ビジネスロジック・ユーティリティ
│       └── 📂 repos/         # データベース操作層
│
├── 📂 prisma/                 # データベース定義
├── 📂 public/                 # 静的ファイル
├── 📄 .env                    # 環境変数
└── 📄 各種設定ファイル        # package.json, tsconfig.json等
```

---

## 🗂️ 詳細なフォルダ・ファイル解説

### 1️⃣ `/src/app/` - アプリケーションの中核

#### **ページファイル（画面）**

| ファイル | 機能説明 | アクセスURL |
|---------|---------|------------|
| `page.tsx` | トップページ（ホームへリダイレクト） | `/` |
| `not-found.tsx` | 404エラーページ | 存在しないURL |
| `layout.tsx` | 全ページ共通のレイアウト<br>- Google Analytics設定<br>- 基本的なスタイル適用 | - |

#### **認証関連（`/auth/`）**

| ファイル | 機能説明 | 特徴 |
|---------|---------|------|
| `auth/signup/page.tsx` | 新規登録画面 | ・ユーザーID/パスワード入力<br>・登録後は自動ログイン→ホームへ |
| `auth/login/page.tsx` | ログイン画面 | ・既存ユーザーの認証<br>・成功後ホームへリダイレクト |

#### **メイン機能画面**

| ファイル | 機能説明 | 主な要素 |
|---------|---------|----------|
| `home/page.tsx` | ホーム画面（メイン） | ・自分のQRコード大きく表示<br>・「相手のQRを読み取る」ボタン<br>・話題モーダル表示 |
| `profile/page.tsx` | プロフィール編集 | ・趣味・興味をチェックボックスで選択<br>・詳細テキスト入力<br>・保存ボタン |
| `metrics/page.tsx` | 実績表示 | ・読み取った回数（scanOut）<br>・読み取られた回数（scanIn） |
| `scan/page.tsx` | QRスキャン画面 | ・カメラでQR読み取り<br>・URLパラメータ経由でも処理可能 |

---

### 2️⃣ `/src/app/api/` - バックエンドAPI

#### **認証API（`/api/auth/`）**

| エンドポイント | メソッド | 機能 | レスポンス例 |
|--------------|---------|------|-------------|
| `/api/auth/signup` | POST | 新規ユーザー登録 | `{ok: true}` + Cookie設定 |
| `/api/auth/login` | POST | ログイン認証 | `{ok: true}` + Cookie設定 |
| `/api/auth/logout` | POST | ログアウト | Cookie削除 |

#### **ユーザーデータAPI**

| エンドポイント | メソッド | 機能 | 認証 |
|--------------|---------|------|------|
| `/api/me` | GET | ユーザー情報取得 | 必須 |
| `/api/profile/me` | GET/PUT | プロフィール取得・更新 | 必須 |
| `/api/qr/me` | GET | QRコード生成（URL+SVG） | 必須 |
| `/api/metrics/me` | GET | 実績数値取得 | 必須 |

#### **コア機能API**

| エンドポイント | メソッド | 機能 | 特殊処理 |
|--------------|---------|------|----------|
| `/api/scan` | POST | QRスキャン処理 | ・30秒クールダウン<br>・Gemini AI話題生成<br>・カウンター更新 |

---

### 3️⃣ `/src/components/` - UIコンポーネント

| コンポーネント | 役割 | 使用場所 |
|--------------|------|----------|
| `Navigation.tsx` | 3タブナビゲーション<br>（ホーム/プロフィール/実績） | 各メイン画面 |
| `TopicModal.tsx` | 話題表示モーダル<br>・ローディング表示<br>・話題テキスト表示 | ホーム画面 |
| `Toast.tsx` | 通知トースト表示<br>（エラー・成功メッセージ） | 全画面 |
| `CameraScanner.tsx` | QRカメラスキャナー<br>・カメラ起動<br>・QR検出 | スキャン画面 |
| `GoogleAnalytics.tsx` | Google Analytics設定<br>（サーバーコンポーネント） | layout.tsx |
| `ClientAnalytics.tsx` | SPA遷移トラッキング<br>（クライアントコンポーネント） | layout.tsx |

---

### 4️⃣ `/src/lib/` - ビジネスロジック層

#### **コア機能**

| ファイル | 機能 | 主要な関数/処理 |
|---------|------|----------------|
| `session.ts` | 認証セッション管理 | ・`issueTicket()`: Cookie発行<br>・`requireSession()`: 認証確認 |
| `llm.ts` | AI話題生成 | ・Gemini API連携<br>・プロンプト生成<br>・フォールバック処理 |
| `qr.ts` | QRコード生成 | SVG形式のQRコード作成 |
| `cooldown.ts` | クールダウン制御 | 30秒間の重複スキャン防止 |
| `db.ts` | データベース接続 | Prisma Client初期化 |

#### **データ定義**

| ファイル | 内容 |
|---------|------|
| `topics.ts` | プロフィール選択肢の定義<br>（音楽、スポーツ、趣味等） |
| `profile-shape.ts` | プロフィールのデータ構造定義 |

#### **データベース操作（`/lib/repos/`）**

| ファイル | 対象テーブル | 主要メソッド |
|---------|------------|-------------|
| `users.ts` | User | ・`createUser()`: ユーザー作成<br>・`verifyPassword()`: パスワード確認 |
| `profile.ts` | Profile | ・`getProfile()`: 取得<br>・`saveProfile()`: 保存 |
| `counters.ts` | Counters | ・`incrScanOutIn()`: カウント増加<br>・`getCounters()`: 取得 |

---

### 5️⃣ `/prisma/` - データベース定義

#### **スキーマ構造**

```prisma
📊 データベーステーブル構成

User（ユーザー基本情報）
├── id: UUID（主キー）
├── userId: ユーザーID（一意）
├── passwordHash: ハッシュ化パスワード
└── timestamps

Profile（プロフィール情報）
├── userId: 外部キー → User.id
├── profileJson: JSON形式のプロフィールデータ
└── updatedAt

Counters（実績カウンター）
├── userId: 外部キー → User.id
├── scanOutCount: 読み取った回数
├── scanInCount: 読み取られた回数
└── updatedAt
```

---

## 🔄 データフローと処理の流れ

### **1. 新規登録フロー**
```
ユーザー入力
    ↓
[signup/page.tsx]
    ↓
POST /api/auth/signup
    ↓
[users.ts] createUser()
    ↓
Cookie発行 → ホーム画面へ
```

### **2. QRスキャン・話題生成フロー**
```
QRコード読み取り
    ↓
[CameraScanner.tsx]
    ↓
POST /api/scan
    ↓
[cooldown.ts] 30秒チェック
    ↓
[profile.ts] 両者のプロフィール取得
    ↓
[llm.ts] Gemini AIで話題生成
    ↓
[counters.ts] カウンター更新
    ↓
[TopicModal.tsx] 話題表示
```

### **3. プロフィール編集フロー**
```
プロフィール画面表示
    ↓
GET /api/profile/me
    ↓
ユーザー編集
    ↓
PUT /api/profile/me
    ↓
[profile.ts] saveProfile()
    ↓
DB更新完了
```

---

## 🔐 セキュリティ設計

### **認証・セッション**
- **HMAC署名付きCookie**: 改ざん防止
- **有効期限管理**: デフォルト24時間
- **HTTPOnly属性**: XSS対策
- **Secure属性**: HTTPS通信時のみ（本番環境）

### **API保護**
- 全ての個人データAPIで`requireSession()`による認証チェック
- 自己スキャン防止
- クールダウンによるスパム防止

---

## 🚀 デプロイ・環境設定

### **必要な環境変数**
```env
# データベース
DATABASE_URL=postgresql://...

# セッション
SESSION_SECRET=ランダムな長い文字列
SESSION_MAX_AGE_SECONDS=86400

# AI
GOOGLE_GEMINI_API_KEY=AIza...

# アプリケーション
APP_BASE_URL=https://your-app.vercel.app

# アナリティクス
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

### **Vercel固有の設定**
- 全APIルートに`export const dynamic = 'force-dynamic'`設定
- Edge Runtimeではなく Node.js Runtimeを使用
- Suspenseバウンダリで`useSearchParams()`をラップ

---

## 📈 パフォーマンス最適化

### **実装済みの最適化**
1. **プロフィールデータ軽量化**: 選択された項目のみLLMに送信
2. **エラーハンドリング**: Gemini API失敗時のフォールバック
3. **クライアント側キャッシュ**: QRコードのSVGキャッシュ
4. **サーバーコンポーネント活用**: 不要なクライアントJSを削減

### **今後の改善ポイント**
- Vercel KVでのクールダウン管理（現在はin-memory）
- プロフィールデータのさらなる圧縮
- リトライロジックの実装

---

## 🎨 UI/UXの特徴

### **デザインコンセプト**
- **シンプル**: 高校生が直感的に使える
- **モバイルファースト**: スマートフォン最適化
- **レスポンシブ**: 各種画面サイズ対応

### **ナビゲーション設計**
- **3タブ構成**: ホーム・プロフィール・実績
- **モーダル活用**: 話題表示は画面遷移なし
- **トースト通知**: エラーを控えめに表示

---

## 📝 開発者向けメモ

### **よく使うコマンド**
```bash
# 開発サーバー起動
npm run dev

# データベースマイグレーション
npx prisma db push

# Prismaクライアント生成
npx prisma generate

# 本番ビルドテスト
npm run build
```

### **トラブルシューティング**
- **Gemini API 503エラー**: フォールバック処理で対応中
- **ビルドエラー**: `useSearchParams()`はSuspenseバウンダリ必須
- **Cookie問題**: SameSite属性の確認

---

## 🏁 まとめ

このアプリケーションは、**技術的にはシンプルながら実用的**な構成となっています。
Next.js 14の最新機能を活用し、TypeScriptによる型安全性を保ちながら、
高校生が気軽に使えるソーシャルツールとして設計されています。

各フォルダ・ファイルが明確な役割を持ち、保守性の高い構造となっているため、
今後の機能拡張も容易に行えるアーキテクチャとなっています。

---

*最終更新: 2024年12月*