import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const SYSTEM = `あなたは高校生の初対面の会話を助けるアシスタントです。
安全第一（政治/宗教/性/病気/金銭/個人特定は扱わない）。
出力は敬体で必ず1文のみ、20文字以上40文字以内、最後は質問で終える。
「ユーザーAさん」「ユーザーBさん」という表現は使わず、「お二人」「二人とも」など自然な表現を使う。`;

// プロフィールを確認（Packed形式のみ対応）
function validatePackedProfile(profile: any): any {
  // Packed形式（配列）であることを確認
  if (!profile || typeof profile !== 'object') {
    return {};
  }

  // すべての値が配列であることを確認
  const isPacked = Object.values(profile).every(v => Array.isArray(v));
  if (!isPacked) {
    console.warn('Profile is not in packed format, returning empty');
    return {};
  }

  return profile;
}

// リトライ機能付きのGemini API呼び出し
async function generateContentWithRetry(
  prompt: any,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<any> {
  let lastError: any;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      console.log(`Attempt ${attempt + 1}/${maxRetries} to generate content...`);

      const result = await model.generateContent({
        contents: prompt,
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.7,  // 安定性向上のため温度を設定
          maxOutputTokens: 256,  // 出力トークン数を制限
        }
      });

      // 成功したら結果を返す
      return result;

    } catch (error: any) {
      lastError = error;
      console.error(`Attempt ${attempt + 1} failed:`, error?.message || error);

      // 503エラーの場合のみリトライ
      if (error?.status === 503 && attempt < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, attempt); // 指数バックオフ
        console.log(`Waiting ${delay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }

      // 503以外のエラーまたは最後の試行の場合はエラーを投げる
      throw error;
    }
  }

  // すべての試行が失敗した場合
  throw lastError;
}

export async function generateTopic(profileA: any, profileB: any): Promise<string> {
  try {
    // Packed形式のプロフィールを検証
    const simplifiedA = validatePackedProfile(profileA);
    const simplifiedB = validatePackedProfile(profileB);

    // デバッグ用ログ
    console.log("=== LLM Debug ===");
    console.log("Simplified Profile A:", JSON.stringify(simplifiedA, null, 2));
    console.log("Simplified Profile B:", JSON.stringify(simplifiedB, null, 2));
    console.log("API Key exists:", !!process.env.GOOGLE_GEMINI_API_KEY);

    // より簡潔なプロンプト
    const promptText = `
以下は二人の高校生のプロフィールです。主に趣味や好きなことが列挙されています。
データ形式: カテゴリごとに選択した項目の配列。name=選択項目、text=自由記述（空の場合あり）

プロフィール1: ${JSON.stringify(simplifiedA)}
プロフィール2: ${JSON.stringify(simplifiedB)}

二人の共通の興味を見つけて、短い会話の話題を1つ提案してください。
重要な制約：
・必ず1文のみ（長くても40文字以内）
・簡潔で自然な質問形式
・「お二人とも」より短い表現を使う
・例：「野球はどのチームが好きですか？」（16文字）

出力形式: {"message": "話題の内容"}`;

    const prompt = [
      { role: "user", parts: [{ text: promptText }] }
    ];

    console.log("Sending simplified prompt to Gemini...");

    // リトライ機能付きでAPI呼び出し
    const result = await generateContentWithRetry(prompt);

    const response = result.response;
    let text = response.text().trim();
    console.log("Raw response from Gemini:", text);

    // 念のためマークダウンのコードブロックを除去
    if (text.startsWith('```json')) {
      text = text.replace(/^```json\s*/, '').replace(/\s*```$/, '').trim();
    } else if (text.startsWith('```')) {
      text = text.replace(/^```\s*/, '').replace(/\s*```$/, '').trim();
    }

    try {
      const parsed = JSON.parse(text);
      console.log("Parsed message:", parsed.message);
      return parsed.message || "音楽はよく聴きますか？最近のお気に入りがあれば教えてください。";
    } catch (parseError) {
      console.error("Failed to parse JSON response:", parseError);

      // JSONではない場合、直接テキストとして使用を試みる
      if (text && text.length > 10 && !text.toLowerCase().includes('error')) {
        // 「」や""で囲まれた部分を抽出
        const match = text.match(/[「"](.*?)[」"]/);
        if (match) {
          return match[1];
        }
        // そのまま返す（ただし、改行や余計な記号は除去）
        return text.replace(/[\n\r\"]/g, '').trim();
      }

      return "音楽はよく聴きますか？最近のお気に入りがあれば教えてください。";
    }
  } catch (error) {
    console.error("LLM generation error:", error);

    // 503エラーの場合、再試行を促す
    if ((error as any)?.status === 503) {
      console.log("503 error detected - service temporarily unavailable");
      throw new Error("SERVICE_UNAVAILABLE");
    }

    // その他のエラーの場合も再試行を促す
    throw new Error("GENERATION_FAILED");
  }
}