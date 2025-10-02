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
├── 📂 .claude/                # Claude Code設定
│   └── settings.local.json    # ローカル設定
│
├── 📂 .vscode/                # VS Code設定
│   └── settings.json
│
├── 📂 prisma/                 # データベース定義
│   └── schema.prisma         # Prismaスキーマ
│
├── 📂 src/                    # ソースコード本体
│   ├── 📂 app/               # Next.js App Router（ページとAPI）
│   │   ├── 📂 api/          # APIエンドポイント
│   │   │   ├── 📂 auth/     # 認証API
│   │   │   │   ├── login/route.ts
│   │   │   │   ├── logout/route.ts
│   │   │   │   └── signup/route.ts
│   │   │   ├── 📂 me/       # ユーザー情報API
│   │   │   │   └── route.ts
│   │   │   ├── 📂 metrics/  # 実績API
│   │   │   │   └── me/route.ts
│   │   │   ├── 📂 profile/  # プロフィールAPI
│   │   │   │   └── me/route.ts
│   │   │   ├── 📂 qr/       # QRコードAPI
│   │   │   │   └── me/route.ts
│   │   │   └── 📂 scan/     # スキャンAPI
│   │   │       └── route.ts
│   │   │
│   │   ├── 📂 auth/          # 認証関連ページ
│   │   │   ├── login/page.tsx
│   │   │   └── signup/page.tsx
│   │   │
│   │   ├── 📂 home/          # ホーム画面
│   │   │   └── page.tsx
│   │   │
│   │   ├── 📂 metrics/       # 実績画面
│   │   │   └── page.tsx
│   │   │
│   │   ├── 📂 profile/       # プロフィール画面
│   │   │   └── page.tsx
│   │   │
│   │   ├── 📂 scan/          # QRスキャン画面
│   │   │   └── page.tsx
│   │   │
│   │   ├── globals.css       # グローバルスタイル
│   │   ├── layout.tsx        # 共通レイアウト
│   │   ├── not-found.tsx     # 404ページ
│   │   └── page.tsx          # トップページ
│   │
│   ├── 📂 components/         # 再利用可能なUIコンポーネント
│   │   ├── CameraScanner.tsx # QRカメラスキャナー
│   │   ├── ClientAnalytics.tsx # クライアント側GA
│   │   ├── GoogleAnalytics.tsx # サーバー側GA
│   │   ├── LoadingScreen.tsx # ローディング画面
│   │   ├── Navigation.tsx    # 3タブナビゲーション
│   │   ├── PageShell.tsx     # ページ共通レイアウト
│   │   ├── Toast.tsx         # トースト通知（廃止予定）
│   │   └── TopicModal.tsx    # 話題表示モーダル
│   │
│   ├── 📂 hooks/             # カスタムフック
│   │   ├── useApi.ts         # API呼び出しフック
│   │   └── useToast.tsx      # トースト管理フック
│   │
│   └── 📂 lib/               # ビジネスロジック・ユーティリティ
│       ├── 📂 repos/         # データベース操作層
│       │   ├── counters.ts   # カウンター管理
│       │   ├── profile.ts    # プロフィール管理
│       │   └── users.ts      # ユーザー管理
│       │
│       ├── api-utils.ts      # API共通ユーティリティ
│       ├── cooldown.ts       # クールダウン制御
│       ├── db.ts             # Prismaクライアント
│       ├── env.ts            # 環境変数管理
│       ├── http.ts           # HTTPユーティリティ
│       ├── llm.ts            # Gemini AI連携
│       ├── profile-shape.ts  # プロフィール型定義
│       ├── qr.ts             # QRコード生成
│       ├── session.ts        # セッション管理
│       └── topics.ts         # トピック定義
│
├── 📄 設定ファイル群
│   ├── .env                  # 環境変数（Git除外）
│   ├── .env.local.example    # 環境変数サンプル
│   ├── .gitignore
│   ├── next.config.js        # Next.js設定
│   ├── next-env.d.ts         # TypeScript環境定義
│   ├── package.json          # 依存関係
│   ├── package-lock.json
│   ├── postcss.config.js     # PostCSS設定
│   ├── tailwind.config.js    # Tailwind設定
│   ├── tsconfig.json         # TypeScript設定
│   └── tsconfig.tsbuildinfo  # TSビルド情報
│
├── 📄 ドキュメント
│   ├── CLAUDE.md             # Claude Code実装ガイド
│   ├── DEPLOYMENT_FIX.md     # デプロイ修正記録
│   ├── PROJECT_STRUCTURE.md  # 本ファイル
│   └── UI_IMPROVEMENT_TODO.md # UI改善タスク
│
└── 📄 その他
    └── repomix-output.xml    # コード解析結果
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
| `globals.css` | グローバルCSS<br>- カラーパレット定義<br>- ガラスモーフィズム<br>- ネオン効果<br>- QRコードSVGスタイル<br>- QRスキャン用ユーティリティ | - |

#### **認証関連（`/auth/`）**

| ファイル | 機能説明 | 特徴 |
|---------|---------|------|
| `auth/signup/page.tsx` | 新規登録画面 | ・ユーザーID/パスワード入力<br>・登録後は自動ログイン→ホームへ |
| `auth/login/page.tsx` | ログイン画面 | ・既存ユーザーの認証<br>・成功後ホームへリダイレクト |

#### **メイン機能画面**

| ファイル | 機能説明 | 主な要素 |
|---------|---------|----------|
| `home/page.tsx` | ホーム画面（メイン） | ・自分のQRコード大きく表示<br>・「相手のQRを読み取る」ボタン<br>・話題モーダル表示<br>・QRカードのデザイン改善済み |
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

| コンポーネント | 役割 | 使用場所 | 最近の変更 |
|--------------|------|----------|------------|
| `Navigation.tsx` | 3タブナビゲーション<br>（ホーム/プロフィール/実績） | 各メイン画面 | - |
| `TopicModal.tsx` | 話題表示モーダル<br>・ローディング表示<br>・話題テキスト表示 | ホーム画面 | ローディング状態追加 |
| `Toast.tsx` | 通知トースト表示<br>（エラー・成功メッセージ） | 全画面（廃止予定） | useToastに移行中 |
| `CameraScanner.tsx` | QRカメラスキャナー<br>・カメラ起動<br>・QR検出<br>・統一デザイン適用 | スキャン画面 | ガラスモーフィズム<br>ネオン効果追加<br>四角形マスク実装 |
| `LoadingScreen.tsx` | 統一ローディング画面<br>・全画面版<br>・オーバーレイ版 | 全ページ | 新規作成 |
| `PageShell.tsx` | ページ共通レイアウト<br>・グラデーション背景<br>・カードレイアウト | 認証ページ等 | 新規作成 |
| `GoogleAnalytics.tsx` | Google Analytics設定<br>（サーバーコンポーネント） | layout.tsx | - |
| `ClientAnalytics.tsx` | SPA遷移トラッキング<br>（クライアントコンポーネント） | layout.tsx | - |

---

### 4️⃣ `/src/lib/` - ビジネスロジック層

#### **コア機能**

| ファイル | 機能 | 主要な関数/処理 | 最近の変更 |
|---------|------|----------------|------------|
| `session.ts` | 認証セッション管理 | ・`issueTicket()`: Cookie発行<br>・`requireSession()`: 認証確認 | - |
| `llm.ts` | AI話題生成 | ・Gemini API連携<br>・プロンプト生成<br>・フォールバック処理 | データサイズ最適化 |
| `qr.ts` | QRコード生成 | SVG形式のQRコード作成 | margin: 2に調整（美観改善） |
| `cooldown.ts` | クールダウン制御 | 30秒間の重複スキャン防止 | - |
| `db.ts` | データベース接続 | Prisma Client初期化 | - |

#### **データ定義**

| ファイル | 内容 |
|---------|------|
| `topics.ts` | プロフィール選択肢の定義<br>（音楽、スポーツ、趣味等） |
| `profile-shape.ts` | プロフィールのデータ構造定義 |

#### **データベース操作（`/lib/repos/`）**

| ファイル | 対象テーブル | 主要メソッド |
|---------|------------|-------------|
| `users.ts` | User | ・`createUser()`: ユーザー作成<br>・`verifyPassword()`: パスワード確認 |
| `profile.ts` | Profile | ・`getProfile()`: 取得<br>・`saveProfile()`: 保存（String型でJSON保存） |
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
├── profileJson: String型（JSON文字列として保存）
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
[llm.ts] Gemini AIで話題生成（軽量化済み）
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

# アナリティクス（オプション）
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

### **Vercel固有の設定**
- 全APIルートに`export const dynamic = 'force-dynamic'`設定
- Edge Runtimeではなく Node.js Runtimeを使用
- Suspenseバウンダリで`useSearchParams()`をラップ

---

## 📈 パフォーマンス最適化

### **実装済みの最適化**
1. **プロフィールデータ軽量化**: 選択された項目のみLLMに送信（約1/10サイズ削減）
2. **エラーハンドリング**: Gemini API失敗時のフォールバック
3. **クライアント側キャッシュ**: QRコードのSVGキャッシュ
4. **サーバーコンポーネント活用**: 不要なクライアントJSを削減
5. **QR表示最適化**: margin調整とSVG display:block化で美観改善
6. **UIコンポーネント共通化**: 約300行以上のコード削減
7. **API呼び出し統一化**: useApiフックによる401エラー自動処理

### **今後の改善ポイント**
- Vercel KVでのクールダウン管理（現在はin-memory）
- プロフィールデータのさらなる圧縮
- リトライロジックの実装
- Gemini APIのレート制限対策

---

## 🎨 UI/UXの特徴

### **デザインコンセプト**
- **シンプル**: 高校生が直感的に使える
- **モバイルファースト**: スマートフォン最適化
- **レスポンシブ**: 各種画面サイズ対応
- **ガラスモーフィズム**: 半透明デザイン
- **ネオン効果**: 若者向けのビジュアル

### **ナビゲーション設計**
- **3タブ構成**: ホーム・プロフィール・実績
- **モーダル活用**: 話題表示は画面遷移なし
- **トースト通知**: エラーを控えめに表示

### **最近のUI改善**
- QRコードの表示サイズ拡大（260px/300px）
- QRコード内側の均等な白縁（margin: 2）
- 外側カードの正方形化（aspect-square）
- SVGインライン表示の修正
- CameraScannerのデザイン統一（ガラスモーフィズム/ネオン効果）
- スキャン枠を四角形マスクに変更（w-80/sm:w-96）
- Toast管理をContext APIベースに移行（useToast）

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
- **PostgreSQL型エラー**: Profile.profileJsonはString型で保存

### **既知の問題**
1. **Gemini API頻繁な503エラー**
   - 現状: フォールバック処理実装済み
   - 対策案: リトライロジック、別モデルへの切り替え

2. **モバイルカメラ問題**
   - 現状: react-qr-scanner実装済み
   - 注意点: ストリームクリーンアップ必須

---

## 🏁 まとめ

このアプリケーションは、**技術的にはシンプルながら実用的**な構成となっています。
Next.js 14の最新機能を活用し、TypeScriptによる型安全性を保ちながら、
高校生が気軽に使えるソーシャルツールとして設計されています。

各フォルダ・ファイルが明確な役割を持ち、保守性の高い構造となっているため、
今後の機能拡張も容易に行えるアーキテクチャとなっています。

---

*最終更新: 2025年1月*