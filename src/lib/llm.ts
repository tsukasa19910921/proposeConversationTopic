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
      {
        role: "user",
        parts: [{
          text: `A=${JSON.stringify(profileA)}\nB=${JSON.stringify(profileB)}\n出力は {"message":"..."} 形式で。`
        }]
      },
    ];

    const result = await model.generateContent({ contents: prompt });
    const response = result.response;
    const text = response.text().trim();

    try {
      const parsed = JSON.parse(text);
      return parsed.message || "音楽はよく聴きますか？最近のお気に入りがあれば教えてください。";
    } catch {
      return "音楽はよく聴きますか？最近のお気に入りがあれば教えてください。";
    }
  } catch (error) {
    console.error("LLM generation error:", error);
    return "音楽はよく聴きますか？最近のお気に入りがあれば教えてください。";
  }
}