import { TOPICS } from "./topics";

// Packed形式（最小構造） - DB保存・LLM入力用
export type PackedProfile = {
  [topicId: string]: Array<{ name: string; text: string }>
};

// UI形式（フル構造） - UI表示用
export type UIProfile = {
  [topicId: string]: {
    [option: string]: { selected: boolean; freeText: string }
  }
};

// UI → Packed（選択済み＋freeTextのみを抽出）
export function packProfileFromUI(ui: UIProfile): PackedProfile {
  const out: PackedProfile = {};

  for (const [topicId, options] of Object.entries(ui || {})) {
    // 現行UIに存在するオプションのみを対象にする
    const topicDef = TOPICS[topicId as keyof typeof TOPICS];
    if (!topicDef) continue;

    const allowed = topicDef.options;
    const picked = Object.entries(options)
      .filter(([name, v]) => v?.selected && allowed.includes(name as any))
      .map(([name, v]) => ({ name, text: v.freeText || '' }));

    if (picked.length > 0) {
      out[topicId] = picked;
    }
  }

  return out;
}

// DB/LLM（Packed形式）→ UI（現行UIにある項目のみ反映）
export function expandProfileForUI(input: any): UIProfile {
  // まず、UI初期形状を作成
  const ui: UIProfile = {};

  for (const [topicId, def] of Object.entries(TOPICS)) {
    ui[topicId] = {};
    def.options.forEach(opt => {
      ui[topicId][opt] = { selected: false, freeText: '' };
    });
  }

  if (!input || typeof input !== 'object') {
    return ui;
  }

  // Packed形式（配列）の処理のみ
  for (const [topicId, val] of Object.entries(input)) {
    if (Array.isArray(val)) {
      for (const item of val) {
        const name = item?.name;
        // 現行UIに存在する項目のみ反映
        if (ui[topicId]?.[name]) {
          ui[topicId][name] = {
            selected: true,
            freeText: String(item?.text || '')
          };
        }
      }
    }
  }

  return ui;
}