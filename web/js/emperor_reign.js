// 皇統 deity の在位年・代数データ(genealogy.js 用、軽量データソース)
// 日本書紀・古事記・続日本紀の伝承 + 学術推定。神話時代は「神代」と表記。
// dai: 代数(神武=1)、reign: 在位表記(例「神代」「3-4C」「629-641」「781-806」)
// 出典: 国立公文書館「天皇陵」資料・日本史広辞典・宮内庁皇統譜
(function () {
  const REIGN = {
    // 神武〜開化(欠史八代):伝承のみ
    "DEI-507": { dai: 1,  reign: "神代",        note: "初代、神武東征(伝)" },
    "DEI-553": { dai: 2,  reign: "神代(伝)",   note: "欠史八代 L1" },
    "DEI-554": { dai: 3,  reign: "神代(伝)",   note: "欠史八代 L1" },
    "DEI-555": { dai: 4,  reign: "神代(伝)",   note: "欠史八代 L1" },
    "DEI-556": { dai: 5,  reign: "神代(伝)",   note: "欠史八代 L1" },
    "DEI-557": { dai: 6,  reign: "神代(伝)",   note: "欠史八代 L1" },
    "DEI-558": { dai: 7,  reign: "神代(伝)",   note: "欠史八代 L1" },
    "DEI-559": { dai: 8,  reign: "神代(伝)",   note: "欠史八代 L1" },
    "DEI-560": { dai: 9,  reign: "神代(伝)",   note: "欠史八代 L1" },
    // 三輪王権〜河内王権
    "DEI-561": { dai: 10, reign: "3-4C(推定)", note: "崇神、三輪王権" },
    "DEI-562": { dai: 11, reign: "3-4C(推定)", note: "垂仁、伊勢遷座" },
    "DEI-563": { dai: 12, reign: "4C 前半(推定)", note: "景行、ヤマトタケル父" },
    "DEI-564": { dai: 13, reign: "4C 中(推定)", note: "成務" },
    "DEI-565": { dai: 14, reign: "4C 後半(伝)", note: "仲哀、神功皇后夫" },
    "DEI-183": { dai: null, reign: "4C 後半(伝)", note: "神功皇后(摂政)" },
    "DEI-182": { dai: 15, reign: "4C 末-5C 初(推定)", note: "応神=八幡神同体説" },
    "DEI-566": { dai: 16, reign: "5C 前半(伝 313-399)", note: "仁徳、大仙陵古墳被葬伝" },
    "DEI-567": { dai: 17, reign: "5C 前半(伝)", note: "履中" },
    "DEI-568": { dai: 21, reign: "5C 後半(456-479 推定)", note: "雄略=ワカタケル大王(稲荷山鉄剣銘 L0)" },
    "DEI-569": { dai: 26, reign: "507-531(L0)", note: "継体、王朝交代説 L2" },
    "DEI-570": { dai: 29, reign: "539-571(L0)", note: "欽明、仏教公伝 552" },
    "DEI-571": { dai: 30, reign: "572-585", note: "敏達、推古夫" },
    "DEI-572": { dai: 31, reign: "585-587", note: "用明、聖徳太子父" },
    "DEI-573": { dai: 32, reign: "587-592", note: "崇峻、史上唯一の暗殺天皇" },
    "DEI-574": { dai: 33, reign: "593-628",  note: "推古、初の女帝、聖徳太子摂政" },
    "DEI-575": { dai: 34, reign: "629-641",  note: "舒明" },
    "DEI-576": { dai: 35, reign: "642-645",  note: "皇極、後に重祚=斉明(655-661)" },
    "DEI-526": { dai: 38, reign: "668-671",  note: "天智、大化改新の中大兄、近江京遷都" },
    "DEI-577": { dai: 40, reign: "673-686",  note: "天武、壬申の乱勝利、律令体制基礎" },
    "DEI-578": { dai: 41, reign: "686/690-697", note: "持統、初の譲位、藤原京遷都" },
    "DEI-579": { dai: 45, reign: "724-749",  note: "聖武、東大寺大仏建立" },
    "DEI-552": { dai: null, reign: "皇族",    note: "光明皇后(聖武妃)" },
    "DEI-580": { dai: 49, reign: "770-781",  note: "光仁、天智系への王統移行" },
    "DEI-505": { dai: 50, reign: "781-806",  note: "桓武、平安遷都(794)" },
    "DEI-581": { dai: 52, reign: "809-823",  note: "嵯峨、空海・最澄保護" },
    "DEI-582": { dai: 60, reign: "897-930",  note: "醍醐、延喜の治、延喜式編纂" },
    // 中世以降(deity_master に登録の主要天皇)
    "DEI-523": { dai: 82, reign: "1183-1198(在位)", note: "後鳥羽、承久の乱、隠岐配流" },
    "DEI-524": { dai: 75, reign: "1123-1141(在位)", note: "崇徳、保元の乱、讃岐配流、怨霊化" },
    "DEI-525": { dai: 81, reign: "1180-1185(在位)", note: "安徳、壇ノ浦入水" },
    "DEI-522": { dai: 96, reign: "1318-1339(在位)", note: "後醍醐、南朝総本" },
    // 近代
    "DEI-506": { dai: 121, reign: "1846-1867", note: "孝明、幕末" },
    "DEI-503": { dai: 122, reign: "1867-1912", note: "明治、明治維新" },
    "DEI-504": { dai: null, reign: "皇族",    note: "昭憲皇太后(明治妃)" },
    "DEI-508": { dai: null, reign: "皇族",    note: "媛蹈韛五十鈴媛、神武皇后" },
    "DEI-527": { dai: null, reign: "皇族",    note: "護良親王、後醍醐皇子、鎌倉幽閉" },
    "DEI-520": { dai: null, reign: "皇族",    note: "宗良親王、後醍醐皇子" },
    "DEI-521": { dai: null, reign: "皇族",    note: "懐良親王、後醍醐皇子、九州征西" },
    // 神話祖系(皇統に直接連なる母系・父系)
    "DEI-015": { dai: null, reign: "神話祖系", note: "ニニギ(天孫降臨、神武の曾祖父)" },
    "DEI-083": { dai: null, reign: "神話祖系", note: "コノハナサクヤ(ニニギ妃、神武の曾祖母)" },
    "DEI-085": { dai: null, reign: "神話祖系", note: "ヒコホホデミ=山幸彦(神武の祖父)" },
    "DEI-088": { dai: null, reign: "神話祖系", note: "豊玉姫(海宮姫、神武の祖母)" },
    "DEI-090": { dai: null, reign: "神話祖系", note: "ウガヤフキアエズ(神武の父)" },
    "DEI-089": { dai: null, reign: "神話祖系", note: "玉依姫(神武の母、海宮の姫)" },
    "DEI-016": { dai: null, reign: "皇族",    note: "ヤマトタケル(景行皇子、仲哀の父)" },
  };

  window.EmperorReign = REIGN;
})();
