# CLAUDE.md — POC「高校生向けQRプロフィール×話題提示」実装ガイド

本プロジェクトは **Vercel** へデプロイし、**Gemini**（Google Generative AI）を用いて「話題を1件だけ」生成するWebアプリです。  
開発は **Claude Code**（anthropic/claude-code）でのペアプロ・自動化を想定した手順・タスクを記述します。

---

## 0. プロジェクト要約
- 目的：QR交換 → Geminiが**会話の最初のひと言（1件）**を提示  
- 主要ページ：
  - **ホーム**：自分のQR（大）＋「相手のQRを読み取る」ボタン、話題はモーダル表示  
  - **プロフィール**：トピック→選択肢→任意入力（PUTで全置換）  
  - **実績**：自分の `scanOut / scanIn` 数値のみ  
- 主要API：
  - `POST /api/auth/signup|login|logout`（署名付きCookieセッション）
  - `GET/PUT /api/profile/me`
  - `GET /api/qr/me`（URL＋SVG返却）
  - `POST /api/scan`（30秒クールダウン / message返却）
  - `GET /api/metrics/me`（カウントのみ）
- DBは **User / Profile / Counters** の3表分離設計。  
- クールダウンは **30秒**（本番はKV推奨、開発は in-memory）。

---

## 1. 技術スタック
- **Framework**: Next.js 14（App Router）
- **Runtime**: Node.js 18+（Vercel推奨）
- **DB**: PostgreSQL（Neon または Supabase 無料枠 / Prisma）
- **LLM**: **Gemini 1.5**（Google Generative AI / @google/generative-ai）
- **Auth**: 署名付きCookie（HMAC）
- **QR**: SVG生成（`qrcode`）
- **Cooldown**: Vercel KV（本番推奨） / 開発は in-memory Map
- **UI**: React + Tailwind（推奨）

---

## 2. 環境変数（.env.local）
DATABASE_URL=postgres://...
SESSION_SECRET=ランダム長文字列
SESSION_MAX_AGE_SECONDS=86400
APP_BASE_URL=http://localhost:3000

GOOGLE_GEMINI_API_KEY=xxxxxxxxxxxxxxxx

---

## 3. ディレクトリ構成
```
/src
  /app
    /api
      /auth
        login/route.ts
        logout/route.ts
        signup/route.ts
      /profile/me/route.ts
      /qr/me/route.ts
      /scan/route.ts
      /metrics/me/route.ts
    layout.tsx
    page.tsx
    globals.css
  /lib
    db.ts
    session.ts       # HMAC署名Cookie
    llm.ts           # Gemini呼び出し
    qr.ts            # QR生成
    cooldown.ts      # クールダウン
    repos/
      users.ts
      profile.ts
      counters.ts
  /components
    QrCard.tsx
    TopicModal.tsx
    Toast.tsx
    Navigation.tsx
    CameraScanner.tsx
/prisma
  schema.prisma
package.json
tsconfig.json
next.config.js
tailwind.config.js
postcss.config.js
.env.local
CLAUDE.md

---

## 4. UX設計・画面仕様

### 4.1 ナビゲーション（3タブ）
1. **ホーム（デフォルト）**
   - 上部：自分のQR（大きく表示）
   - 下部：［相手のQRを読み取る］ボタン
   - スキャン成功 → ホーム上にモーダルで話題表示 → ［閉じる］でホームに戻る

2. **プロフィール**
   - トピック（例：音楽、スポーツ、趣味等）→ 選択肢（チェックボックス）
   - 選択時のみ任意の自由入力フィールド表示
   - ［保存］ボタンでPUT全置換

3. **実績**
   - 数値のみシンプル表示：
     - `scanOut`（読んだ回数）
     - `scanIn`（読まれた回数）

### 4.2 読み取り画面
- 全画面カメラビュー
- QR検出 → `POST /api/scan`
- **429（クールダウン）時**：モーダル出さず、**トースト**「時間をおいてトライしてください ⏳」

### 4.3 話題表示
- モーダルで**1件だけ**表示（敬体／1–2文／質問で終える）
- ［閉じる］でホームへ（自分のQRが再び大きく表示）

---

## 5. API仕様詳細

### 5.1 Auth
- `POST /api/auth/signup`
  - Body: `{ userId: string, password: string }`
  - 成功: 200 `{ok:true}` + `Set-Cookie: sid=...`
  - 重複ID: 409 `{error:"user_exists"}`

- `POST /api/auth/login`
  - Body: `{ userId: string, password: string }`
  - 成功: 200 `{ok:true}` + `Set-Cookie: sid=...`
  - 失敗: 401 `{error:"invalid_credentials"}`

- `POST /api/auth/logout`
  - 成功: 200 `{ok:true}`（Cookie破棄）

### 5.2 Profile（認証必須）
- `GET /api/profile/me`
  - 成功: 200 `{...profileJson}`
  - 未作成: 404 or `{}`

- `PUT /api/profile/me`
  - Body: `{ ...profileJson }` （サイズ上限8KB）
  - 成功: 200 `{ok:true}`

### 5.3 QR（認証必須）
- `GET /api/qr/me`
  - 成功: 200 `{ "url": "https://app/scan?sid=<UUID>", "svg": "<svg...>" }`

### 5.4 Scan（認証必須）
- `POST /api/scan`
  - Body: `{ "scannedSid": "<相手User.id(UUID)>" }`
  - 検証：自己スキャン→400、相手不在→404
  - クールダウン30秒→429 `{"error":"cooldown","message":"時間をおいてトライしてください"}`
  - 成功→200 `{ "message": "二人とも音楽が好きみたいですね。最近よく聴く曲はありますか？" }`
  - 副作用：`scanOut++` / `scanIn++`

### 5.5 Metrics（認証必須）
- `GET /api/metrics/me`
  - 成功: 200 `{ "scanOut": number, "scanIn": number }`

### 5.6 共通エラー
| 状態 | HTTP | 返却例 |
|------|-----:|--------|
| 未ログイン | 401 | `{"error":"unauthorized"}` |
| 自己スキャン | 400 | `{"error":"self_scan"}` |
| 相手不在 | 404 | `{"error":"user_not_found"}` |
| クールダウン | 429 | `{"error":"cooldown","message":"時間をおいてトライしてください"}` |
| 予期せぬ | 500 | `{"error":"internal"}` |

---

## 6. Prisma スキーマ
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id           String   @id @default(uuid())
  userId       String   @unique
  passwordHash String
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  profile      Profile?
  counters     Counters?
}

model Profile {
  userId      String   @id
  profileJson Json
  updatedAt   DateTime @updatedAt

  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Counters {
  userId        String   @id
  scanOutCount  Int      @default(0)
  scanInCount   Int      @default(0)
  updatedAt     DateTime @updatedAt

  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

---

## 5. セッション（HMAC署名付きCookie）
```ts
// lib/session.ts
import { cookies } from "next/headers";
import crypto from "crypto";

const NAME = "sid";
const MAX_AGE = Number(process.env.SESSION_MAX_AGE_SECONDS || 86400);
const SECRET = process.env.SESSION_SECRET!;

export function issueTicket(userId: string) {
  const exp = Math.floor(Date.now() / 1000) + MAX_AGE;
  const payload = `${userId}.${exp}`;
  const sig = crypto.createHmac("sha256", SECRET).update(payload).digest("hex");
  return `${payload}.${sig}`;
}

export function setSessionCookie(resp: any, userId: string) {
  const ticket = issueTicket(userId);
  resp.cookies.set(NAME, ticket, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export function requireSession() {
  const raw = cookies().get(NAME)?.value;
  if (!raw) throw new Error("UNAUTH");
  const [userId, expStr, sig] = raw.split(".");
  const exp = Number(expStr);
  const now = Math.floor(Date.now() / 1000);
  if (now > exp) throw new Error("EXPIRED");
  const payload = `${userId}.${exp}`;
  const expect = crypto.createHmac("sha256", SECRET).update(payload).digest("hex");
  if (expect !== sig) throw new Error("BADSIG");
  return { userId };
}
```

---

## 6. クールダウン実装
```ts
// lib/cooldown.ts
let mem = new Map<string, number>();
const WINDOW = 30_000;

export async function canScan(scannerId: string, scannedId: string) {
  const key = `${scannerId}:${scannedId}`;
  const now = Date.now();
  const last = mem.get(key) ?? 0;
  if (now - last < WINDOW) return { ok: false, waitMs: WINDOW - (now - last) };
  mem.set(key, now);
  return { ok: true };
}
```

---

## 7. Gemini 呼び出し
```ts
// lib/llm.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const SYSTEM = `あなたは高校生の初対面の会話を助けるアシスタントです。
安全第一（政治/宗教/性/病気/金銭/個人特定は扱わない）。
出力は敬体で1〜2文、最後は質問で終える。出力は1件のみ。`;

export async function generateTopic(profileA: any, profileB: any): Promise<string> {
  try {
    const prompt = [
      { role: "user", parts: [{ text: SYSTEM }] },
      { role: "user", parts: [{ text: `A=${JSON.stringify(profileA)}\nB=${JSON.stringify(profileB)}\n出力は {"message":"..."} 形式で。`} ] },
    ];
    const res = await model.generateContent({ contents: prompt });
    const msg = JSON.parse(res.response.text().trim()).message;
    return msg;
  } catch {
    return "音楽はよく聴きますか？最近のお気に入りがあれば教えてください。";
  }
}
```

---

## 8. API サンプル

### QR
```ts
// app/api/qr/me/route.ts
import { NextResponse } from "next/server";
import { requireSession } from "@/lib/session";
import QRCode from "qrcode";

export async function GET() {
  const me = requireSession();
  const url = `${process.env.APP_BASE_URL}/scan?sid=${me.userId}`;
  const svg = await QRCode.toString(url, { type: "svg", errorCorrectionLevel: "M", margin: 0 });
  return NextResponse.json({ url, svg });
}
```

### スキャン
```ts
// app/api/scan/route.ts
import { NextResponse } from "next/server";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/db";
import { getProfile } from "@/lib/repos/profile";
import { incrScanOutIn } from "@/lib/repos/counters";
import { generateTopic } from "@/lib/llm";
import { canScan } from "@/lib/cooldown";

export async function POST(req: Request) {
  try {
    const me = requireSession();
    const { scannedSid } = await req.json();
    if (!scannedSid) return NextResponse.json({ error: "bad_request" }, { status: 400 });
    if (me.userId === scannedSid) return NextResponse.json({ error: "self_scan" }, { status: 400 });

    const scanned = await prisma.user.findUnique({ where: { id: scannedSid } });
    if (!scanned) return NextResponse.json({ error: "user_not_found" }, { status: 404 });

    const cd = await canScan(me.userId, scanned.id);
    if (!cd.ok) return NextResponse.json({ error: "cooldown", message: "時間をおいてトライしてください" }, { status: 429 });

    const [pa, pb] = await Promise.all([getProfile(me.userId), getProfile(scanned.id)]);
    const message = await generateTopic(pa ?? {}, pb ?? {});
    await incrScanOutIn(me.userId, scanned.id);

    return NextResponse.json({ message });
  } catch {
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
```

### 実績
```ts
// app/api/metrics/me/route.ts
import { NextResponse } from "next/server";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/db";

export async function GET() {
  const me = requireSession();
  const c = await prisma.counters.findUnique({ where: { userId: me.userId } });
  return NextResponse.json({
    scanOut: c?.scanOutCount ?? 0,
    scanIn:  c?.scanInCount  ?? 0,
  });
}
```

---

## 9. テスト観点（POC）
- ログイン/ログアウト：Cookie属性確認  
- プロフィール：GET空→PUT保存→GET反映  
- QR：URL＋SVGが返却されること  
- スキャン：正常／自己／相手不在／クールダウン  
- LLM：JSON形式の返却、失敗時はフォールバック  
- 実績：カウントが正しく増加  

---

## 10. 実装状況と順序

### ✅ 実装完了済み（バックエンド）：
1. **基盤設定**
   - Next.js 14プロジェクト初期化
   - Prisma設定とスキーマ定義（PostgreSQL対応）
   - TypeScript設定（target: es2020）
   - Tailwind CSS設定

2. **認証システム** (署名付きCookie)
   - `lib/session.ts` - HMAC署名付きCookie
   - `lib/repos/users.ts` - ユーザー管理
   - `api/auth/signup` - 新規登録
   - `api/auth/login` - ログイン
   - `api/auth/logout` - ログアウト

3. **プロフィール機能**
   - `lib/repos/profile.ts` - プロフィール管理（String型でJSON保存）
   - `api/profile/me` - GET/PUT エンドポイント

4. **QR生成・表示**
   - `lib/qr.ts` - SVG QRコード生成
   - `api/qr/me` - QR生成エンドポイント

5. **スキャン・話題提示**（核心機能）
   - `lib/cooldown.ts` - 30秒クールダウン
   - `lib/llm.ts` - Gemini連携
   - `lib/repos/counters.ts` - カウンター管理
   - `api/scan` - スキャン処理エンドポイント

6. **実績表示**
   - `api/metrics/me` - 実績取得エンドポイント

### ✅ 実装完了済み（フロントエンド）：
1. **認証画面**
   - `/auth/signup` - 新規登録画面
   - `/auth/login` - ログイン画面
   - 認証後のリダイレクト処理

2. **メイン画面**
   - `/home` - QR表示・スキャン機能
   - `/profile` - プロフィール編集
   - `/metrics` - 実績表示

3. **共通コンポーネント**
   - `Navigation.tsx` - 3タブナビゲーション
   - `TopicModal.tsx` - 話題表示モーダル
   - `Toast.tsx` - エラー/通知トースト
   - `CameraScanner.tsx` - QRスキャナー

### ✅ Vercelデプロイ対応：
- **動的実行設定**: 全APIルートに `export const runtime = 'nodejs'` と `export const dynamic = 'force-dynamic'` 追加
- **環境変数ドキュメント**: DEPLOYMENT_FIX.md作成
- **本番環境での動作確認済み**

### 📝 修正済み設計変更：
- **Middleware削除**: Edge環境でのnext/headers互換性問題により、各APIハンドラでの認証チェックに統一
- **QR画像サイズ**: SVGの拡大縮小特性を活かすためwidth固定指定を削除
- **Profile.profileJson型**: PostgreSQLとの互換性のためString型で保持（JSON.parse/stringifyで処理）
- **動的レンダリング強制**: cookies()使用によるビルドエラー対策

### 🚀 最近の改善（2024年12月）：
1. **QRスキャナー実装** (CameraScanner.tsx)
   - react-qr-scanner導入
   - モバイル対応（背面カメラ優先）
   - タイムアウトエラー対策（ストリームクリーンアップ）

2. **UX改善**
   - QR読み取り直後に処理中モーダル表示
   - TopicModalにローディング状態追加
   - 振動フィードバック（対応デバイス）

3. **LLM最適化** (lib/llm.ts)
   - データサイズ削減（選択項目のみ送信で約1/10）
   - 503エラー時のフォールバック処理
   - 柔軟なレスポンス解析

### 🎉 POC完成状態：
現在、全機能が実装済みでVercelデプロイも成功。以下が動作確認済み：
- ユーザー登録・ログイン
- プロフィール保存・取得
- QRコード生成・表示（カメラスキャン対応）
- スキャン・話題生成（Gemini連携、フォールバック付き）
- 実績カウント表示
- 30秒クールダウン機能

### 🐛 既知の問題と残タスク：
1. **Gemini API 503エラー頻発**
   - 現状：フォールバック処理で対応中
   - TODO: リトライロジックの実装
   - TODO: 別のLLMモデルへの切り替え検討（gemini-pro等）
   - TODO: レート制限の実装検討

2. **パフォーマンス最適化**
   - TODO: プロフィールデータのさらなる軽量化
   - TODO: キャッシュ戦略の実装

---

## 11. 受け入れ条件（POC Done）
20–30人規模テストで：
- ログイン・プロフィール保存成功率 ≥ 90%
- スキャン→話題表示の成功率 ≥ 85%、平均応答 ≤ 1.5s
- アンケート：「会話を始めやすくなった」**≥ 70%**
- クールダウン中は 429 とトーストが正しく表示

---

## 12. デプロイ手順（Vercel）

### 必須環境変数
1. **DATABASE_URL** - PostgreSQL接続文字列（Supabase/Neon）
2. **SESSION_SECRET** - ランダムな32文字以上の文字列
3. **APP_BASE_URL** - 本番URL（例: https://your-app.vercel.app）
4. **GOOGLE_GEMINI_API_KEY** - Gemini APIキー
5. **SESSION_MAX_AGE_SECONDS** - セッション有効期限（デフォルト: 86400）

### デプロイ確認事項
- ✅ 全APIルートに `export const dynamic = 'force-dynamic'` 設定済み
- ✅ Prismaビルド時に `prisma generate` 実行（package.jsonのbuildスクリプトで対応済み）
- ✅ PostgreSQL（Supabase）との接続確認済み
- ✅ HTTPS環境での動作確認済み

---

## 13. 開発環境セットアップ手順

### 前提条件
- Node.js 18+
- PostgreSQL データベース（Supabase推奨）
- Gemini API キー

### セットアップ
```bash
# 依存関係インストール
npm install

# 環境変数設定
cp .env.local.example .env.local
# DATABASE_URL, SESSION_SECRET, GOOGLE_GEMINI_API_KEY を設定

# Prismaクライアント生成
npx prisma generate

# データベースマイグレーション（本番環境）
npx prisma db push

# 開発サーバー起動
npm run dev
```

### APIテスト例
```bash
# 新規登録
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"userId":"test1","password":"password123"}'

# QR取得
curl -X GET http://localhost:3000/api/qr/me \
  -H "Cookie: sid=<session_cookie>"
```  
