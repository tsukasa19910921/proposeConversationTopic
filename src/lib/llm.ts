import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const SYSTEM = `あなたは高校生の初対面の会話を助けるアシスタントです。
安全第一（政治/宗教/性/病気/金銭/個人特定は扱わない）。
出力は敬体で1〜2文、最後は質問で終える。出力は1件のみ。`;

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
ユーザーA: ${JSON.stringify(simplifiedA)}
ユーザーB: ${JSON.stringify(simplifiedB)}

共通の興味を見つけて、会話の話題を1つ提案してください。
敬体で1-2文、最後は質問で終わること。

出力形式: {"message": "話題の内容"}`;

    const prompt = [
      { role: "user", parts: [{ text: promptText }] }
    ];

    console.log("Sending simplified prompt to Gemini...");
    const result = await model.generateContent({ contents: prompt });
    const response = result.response;
    const text = response.text().trim();
    console.log("Raw response from Gemini:", text);

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

    // 503エラーの場合、プロフィールから直接話題を生成
    if ((error as any)?.status === 503) {
      console.log("Using fallback due to 503 error");
      const simplifiedA = validatePackedProfile(profileA);
      const simplifiedB = validatePackedProfile(profileB);

      // 共通の興味を探す
      for (const category in simplifiedA) {
        if (simplifiedB[category]) {
          const aItems = simplifiedA[category];
          const bItems = simplifiedB[category];

          for (const aItem of aItems) {
            for (const bItem of bItems) {
              if (aItem.name === bItem.name) {
                // 共通の興味が見つかった
                if (aItem.name === 'テニス') {
                  return 'お二人ともテニスがお好きなんですね！最近はプレーされていますか？';
                }
                if (aItem.name === 'ファストフード') {
                  return 'マクドナルドがお好きなんですね！お気に入りのメニューは何ですか？';
                }
                return `${aItem.name}という共通の趣味があるんですね！最近のお気に入りや体験を教えてください。`;
              }
            }
          }
        }
      }
    }

    return "音楽はよく聴きますか？最近のお気に入りがあれば教えてください。";
  }
}