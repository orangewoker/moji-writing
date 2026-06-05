const STORAGE_KEY = "moxian-writing-workbench-v3";
const LEGACY_STORAGE_KEYS = ["moxian-writing-workbench-v2", "moxian-writing-workbench-v1"];

const providerPresets = {
  custom: { baseUrl: "", model: "" },
  openai: { baseUrl: "https://api.openai.com/v1", model: "gpt-4.1" },
  deepseek: { baseUrl: "https://api.deepseek.com/v1", model: "deepseek-chat" },
  qwen: { baseUrl: "https://dashscope.aliyuncs.com/compatible-mode/v1", model: "qwen-plus" },
  moonshot: { baseUrl: "https://api.moonshot.cn/v1", model: "moonshot-v1-8k" },
  zhipu: { baseUrl: "https://open.bigmodel.cn/api/paas/v4", model: "glm-4" },
};

const DEFAULT_ASSISTANT_SYSTEM_PROMPT = "你是专业中文小说创作助手，回答要具体、可落地，避免空泛。";
const DEFAULT_WRITING_REQUIREMENTS = [
  "1. 文笔轻松流畅，不要繁琐复杂，不要太多复杂形容词，适合普通中学文化程度的读者阅读。",
  "2. 单句不宜过长。",
  "3. 避免堆砌华丽形容；不要连续使用 2 个以上形容词。",
  "4. 多用口语化表达和生活化比喻，让读者容易代入。",
  "5. 每段 1～2 句为宜；每段不要超过 2 句。",
  "6. 角色少而精，先聚焦 2-3 个主要人物，并在首次登场时用一句话点明性格或外貌关键词。",
  "7. 不要用旁白，只进行白描，留给读者自行感受。",
  "8. 笑点、泪点都宜自然，不用生硬煽情。",
  "9. 多穿插现代都市生活常用互联网梗或热门 App 使用，如知乎、小红书、微信、美团等等，营造真实的现代都市生活氛围。",
].join("\n");

const systemFonts = [
  { label: "微软雅黑", family: "Microsoft YaHei" },
  { label: "宋体", family: "SimSun" },
  { label: "黑体", family: "SimHei" },
  { label: "楷体", family: "KaiTi" },
  { label: "仿宋", family: "FangSong" },
  { label: "等线", family: "DengXian" },
  { label: "苹方/系统黑体", family: "PingFang SC" },
  { label: "思源黑体/无衬线", family: "Noto Sans CJK SC" },
  { label: "思源宋体/衬线", family: "Noto Serif CJK SC" },
  { label: "系统默认", family: "system-ui" },
];

const actionConfigs = {
  continue: {
    title: "AI 续写",
    icon: "pen",
    desc: "基于当前选区或章节继续写下去，会参考大纲、伏笔、鼓点、情绪、主支线和人物状态。",
    refs: ["outline", "mainLine", "branchLines", "foreshadows", "foreshadowLedger", "beatPlan", "emotionPlan", "characters", "roleCards", "props", "worldBackground", "keySettings", "timeline"],
    scope: "auto",
    placeholder: "例如：续写到主角发现第二个线索为止，结尾留悬念，控制在 1000 字左右。",
    instruction: "请基于当前正文续写 800-1200 字，保持人物动机、叙事视角、语言风格一致，并在结尾留下推进下一场的钩子。",
  },
  outline: {
    title: "生成大纲",
    icon: "list",
    desc: "生成章节级或卷级大纲，可写明想要的篇幅、走向、反转密度。",
    refs: ["mainLine", "branchLines", "characters", "roleCards", "worldBackground", "keySettings", "characterArc", "foreshadows", "timeline", "notes"],
    scope: "context",
    placeholder: "例如：生成后续 12 章大纲，主角从被动调查转为主动设局，第 6 章要有一次误判。",
    instruction: "请生成后续 8-12 个章节的大纲，每章包含目标、冲突、反转、结尾钩子，并标出伏笔投放和回收点。",
  },
  foreshadow: {
    title: "伏笔设计",
    icon: "pin",
    desc: "为当前剧情设计可埋、可误导、可回收的伏笔。",
    refs: ["outline", "mainLine", "branchLines", "foreshadowLedger", "timeline", "characters", "roleCards", "props", "worldBackground", "keySettings"],
    scope: "chapter",
    placeholder: "例如：我想埋一个和主角身世有关的暗线，但前期不要让读者看穿。",
    instruction: "请设计可埋入当前章节的伏笔，包含表层信息、真实含义、误导方向、回收章节和回收方式。",
  },
  beat: {
    title: "鼓点起伏",
    icon: "pulse",
    desc: "检查一章里的铺垫、升级、转折、爆点和余波是否好读。",
    refs: ["outline", "mainLine", "branchLines", "beatPlan", "emotionPlan", "targetWords", "roleCards", "worldBackground", "timeline"],
    scope: "chapter",
    placeholder: "例如：帮我把中段拖沓的位置找出来，并建议在哪里加压、在哪里断章。",
    instruction: "请分析并重排当前章节的鼓点起伏，标出铺垫、升级、转折、爆点、余波，以及建议增删的位置。",
  },
  emotion: {
    title: "情绪曲线",
    icon: "wave",
    desc: "分析主角情绪、读者情绪和场景峰谷，适合修节奏。",
    refs: ["outline", "mainLine", "emotionPlan", "beatPlan", "characters", "roleCards", "characterArc", "worldBackground"],
    scope: "chapter",
    placeholder: "例如：我希望这一章从压抑到惊疑再到短暂兴奋，帮我检查是否成立。",
    instruction: "请给出当前章节的情绪曲线，标出主角情绪、读者情绪、峰谷变化和下一步增强建议。",
  },
  thread: {
    title: "主支线检查",
    icon: "thread",
    desc: "检查主线、支线、伏笔和人物动机是否互相支撑。",
    refs: ["outline", "mainLine", "branchLines", "timeline", "foreshadowLedger", "characters", "roleCards", "props", "worldBackground", "keySettings", "characterArc"],
    scope: "book",
    placeholder: "例如：检查事业线和感情线有没有抢主线戏份，哪些支线可以合并。",
    instruction: "请检查主线、支线与人物动机是否互相支撑，指出断裂、重复、拖沓和可以合并的剧情点。",
  },
  correct: {
    title: "剧情纠偏",
    icon: "check",
    desc: "找逻辑漏洞、人物行为不合理、信息泄露过早、伏笔未承接等问题。",
    refs: ["outline", "mainLine", "branchLines", "timeline", "foreshadowLedger", "characters", "roleCards", "props", "worldBackground", "keySettings", "characterArc"],
    scope: "chapter",
    placeholder: "例如：重点检查主角为什么会相信那封信，这个动机是否足够。",
    instruction: "请做剧情纠偏：找出逻辑漏洞、人物行为不合理、节奏失衡、信息泄露过早或伏笔未承接的问题，并给出修改方案。",
  },
  polish: {
    title: "润色所选",
    icon: "wand",
    desc: "默认处理选中正文；没有选区时会处理当前章节。",
    refs: ["genre", "emotionPlan", "beatPlan", "characters", "roleCards", "worldBackground", "keySettings"],
    scope: "selection",
    placeholder: "例如：更克制、更有悬疑感，减少解释，增加动作和环境细节。",
    instruction: "请润色所选正文，保留原意和情节，只提升句子节奏、画面感、动作清晰度与情绪张力。",
  },
  split: {
    title: "分章建议",
    icon: "split",
    desc: "按目标字数和钩子位置，建议在哪里切章。",
    refs: ["outline", "beatPlan", "emotionPlan", "targetWords", "mainLine", "branchLines"],
    scope: "chapter",
    placeholder: "例如：目标每章 3000 字，帮我找最适合断章的位置和下一章开场。",
    instruction: "请根据单章目标字数与剧情节奏，给出分章/断章建议，标注适合切断的位置、理由和下一章开场钩子。",
  },
  scene: {
    title: "生成章节摘要",
    icon: "card",
    desc: "把当前章节整理成精炼摘要，保存到左侧章节摘要里，供续写、润色和相邻章节参考。",
    refs: ["outline", "timeline", "mainLine", "branchLines", "characters", "roleCards", "props", "worldBackground", "keySettings", "foreshadowLedger", "sceneCards"],
    scope: "chapter",
    placeholder: "例如：总结这一章的剧情推进、人物变化、关键信息、伏笔和结尾钩子。",
    instruction: "请把当前章节整理成结构清晰的章节摘要，控制在 400-800 字。必须包含：本章核心事件、人物目标和变化、冲突推进、关键信息/设定、伏笔投放或回收、情绪/节奏变化、结尾状态和下一章承接点。不要改写正文，不要输出场景卡格式。",
  },
  outlineBackfill: {
    title: "纲要反推",
    icon: "thread",
    desc: "根据当前章节摘要和修改后的章纲，反推后续章纲与必要的卷纲调整；总纲默认不动。",
    refs: ["outline", "volumeOutline", "chapterOutline", "currentChapterSummary", "prev3Chapters", "next3Chapters", "mainLine", "branchLines", "foreshadowLedger", "timeline"],
    scope: "book",
    placeholder: "例如：我刚修改了当前章节，请根据摘要调整后续 3-5 章章纲，并列出卷纲需要同步的小改动。",
    instruction: "请根据当前章节摘要和现有章纲，反推后续章纲与必要的卷纲调整。总纲默认固定，不要改动；如确实必须动总纲，只列为风险提示。输出分为：1. 当前章纲修订点；2. 后续章纲调整；3. 卷纲同步调整；4. 不应改动的总纲约束。",
  },
};

const settingAiConfigs = {
  mainLine: {
    title: "生成主线",
    desc: "根据已有正文、角色和世界设定，梳理主角目标、核心冲突和阶段推进。",
    instruction: "请为本小说生成或完善主线，包含主角长期目标、核心冲突、阶段目标、关键转折、最终走向，并指出当前章节应如何服务主线。",
    refs: ["outline", "branchLines", "characters", "roleCards", "worldBackground", "keySettings", "timeline"],
  },
  branchLines: {
    title: "生成支线",
    desc: "围绕主线设计感情线、事业线、反派线或人物关系线。",
    instruction: "请为本小说生成或完善支线，列出每条支线的目标、人物、冲突、与主线的关系、投放章节和回收方式，避免喧宾夺主。",
    refs: ["outline", "mainLine", "characters", "roleCards", "worldBackground", "keySettings"],
  },
  foreshadows: {
    title: "生成伏笔",
    desc: "设计可埋入正文、可误导、可回收的伏笔。",
    instruction: "请为本小说生成伏笔清单，包含表层线索、真实含义、误导方向、投放章节、回收章节和回收方式。",
    refs: ["outline", "mainLine", "branchLines", "foreshadowLedger", "props", "worldBackground", "keySettings"],
  },
  characters: {
    title: "生成人物状态",
    desc: "整理人物欲望、秘密、关系变化和当前心理状态。",
    instruction: "请整理当前主要人物状态，包含人物目标、恐惧、秘密、关系变化、当前心理、下一步可能行动。",
    refs: ["outline", "mainLine", "branchLines", "roleCards", "characterArc", "emotionPlan"],
  },
  roleCards: {
    title: "生成角色卡",
    desc: "生成可长期引用的人物角色卡。",
    instruction: "请生成主要角色卡，每张卡包含姓名、身份、外显目标、内在欲望、弱点、秘密、口癖/行为习惯、关系网、成长弧线和可用剧情功能。",
    refs: ["outline", "mainLine", "branchLines", "characters", "characterArc", "worldBackground"],
  },
  props: {
    title: "生成道具设定",
    desc: "整理关键物品、能力、限制和剧情用途。",
    instruction: "请生成关键道具/物品设定，包含名称、外观、归属、能力或用途、限制、首次出场、误导用法、回收方式和不能破坏的规则。",
    refs: ["outline", "foreshadows", "foreshadowLedger", "worldBackground", "keySettings"],
  },
  worldBackground: {
    title: "生成世界背景",
    desc: "补全时代、地理、势力、规则和社会结构。",
    instruction: "请生成世界背景设定，包含时代与地理、主要势力、社会结构、日常规则、超常规则、冲突来源、禁忌和读者需要逐步理解的信息。",
    refs: ["genre", "mainLine", "branchLines", "roleCards", "keySettings", "notes"],
  },
  keySettings: {
    title: "生成重要设定",
    desc: "整理不能违背的硬规则、谜底和禁忌。",
    instruction: "请生成重要设定清单，包含硬规则、隐藏谜底、系统限制、世界禁忌、人物不可违背的事实、后续写作必须遵守的约束。",
    refs: ["outline", "mainLine", "worldBackground", "props", "foreshadowLedger", "notes"],
  },
};

const iconPaths = {
  board: '<rect x="3" y="4" width="18" height="16" rx="2"></rect><path d="M8 4v16M16 4v16M3 10h18"></path>',
  add: '<path d="M12 5v14"></path><path d="M5 12h14"></path>',
  arrowLeft: '<path d="M19 12H5"></path><path d="M12 5l-7 7 7 7"></path>',
  arrowRight: '<path d="M5 12h14"></path><path d="M12 5l7 7-7 7"></path>',
  bookmark: '<path d="M6 4h12v17l-6-4-6 4z"></path>',
  bot: '<path d="M12 8V4"></path><rect x="5" y="8" width="14" height="12" rx="2"></rect><path d="M7 14h.01M17 14h.01M9 18h6"></path>',
  camera: '<path d="M6 8l2-3h8l2 3"></path><rect x="3" y="8" width="18" height="13" rx="2"></rect><circle cx="12" cy="14" r="3"></circle>',
  card: '<rect x="4" y="5" width="16" height="14" rx="2"></rect><path d="M8 10h8M8 14h5"></path>',
  chapters: '<path d="M5 4h11a2 2 0 0 1 2 2v16H7a2 2 0 0 1-2-2z"></path><path d="M7 4v16a2 2 0 0 0 2 2"></path>',
  check: '<path d="M20 6L9 17l-5-5"></path>',
  chevron: '<path d="M6 9l6 6 6-6"></path>',
  copy: '<rect x="9" y="9" width="11" height="11" rx="2"></rect><rect x="4" y="4" width="11" height="11" rx="2"></rect>',
  folder: '<path d="M3 7h7l2 2h9v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>',
  home: '<path d="M3 11l9-8 9 8"></path><path d="M5 10v10h14V10"></path><path d="M10 20v-6h4v6"></path>',
  insert: '<path d="M12 5v14"></path><path d="M5 12h14"></path><path d="M4 4h16v4"></path><path d="M4 20h16v-4"></path>',
  download: '<path d="M12 3v12"></path><path d="M7 10l5 5 5-5"></path><path d="M5 21h14"></path>',
  edit: '<path d="M12 20h9"></path><path d="M16.5 3.5l4 4L8 20l-5 1 1-5z"></path>',
  library: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5z"></path><path d="M8 6h8"></path>',
  list: '<path d="M8 6h13M8 12h13M8 18h13"></path><path d="M3 6h.01M3 12h.01M3 18h.01"></path>',
  pen: '<path d="M17 3l4 4L8 20l-5 1 1-5z"></path>',
  open: '<path d="M7 17L17 7"></path><path d="M9 7h8v8"></path><path d="M5 5v14h14"></path>',
  pin: '<path d="M12 17v5"></path><path d="M8 3h8l-1 8 3 4H6l3-4z"></path>',
  play: '<path d="M8 5v14l11-7z"></path>',
  pulse: '<path d="M3 12h4l2-7 4 14 2-7h6"></path>',
  replace: '<path d="M3 7h12a4 4 0 0 1 0 8H7"></path><path d="M7 11l-4 4 4 4"></path><path d="M17 3l4 4-4 4"></path>',
  replaceAll: '<path d="M4 7h11a4 4 0 0 1 0 8H8"></path><path d="M8 11l-4 4 4 4"></path><path d="M15 4h5v5"></path><path d="M20 4l-7 7"></path>',
  reset: '<path d="M4 4v6h6"></path><path d="M20 12a8 8 0 1 1-2.3-5.7L4 10"></path>',
  result: '<path d="M4 4h16v16H4z"></path><path d="M8 9h8M8 13h8M8 17h5"></path>',
  route: '<circle cx="6" cy="6" r="2"></circle><circle cx="18" cy="18" r="2"></circle><path d="M8 6h4a4 4 0 0 1 0 8h-1a4 4 0 0 0 0 8h5"></path>',
  save: '<path d="M5 3h12l2 2v16H5z"></path><path d="M8 3v6h8V3"></path><path d="M8 21v-7h8v7"></path>',
  search: '<path d="M10.5 18a7.5 7.5 0 1 1 5.3-12.8 7.5 7.5 0 0 1-5.3 12.8z"></path><path d="M16 16l5 5"></path>',
  spark: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"></path>',
  sidebarLeft: '<path d="M4 5h16v14H4z"></path><path d="M9 5v14"></path><path d="M14 9l-3 3 3 3"></path>',
  sidebarRight: '<path d="M4 5h16v14H4z"></path><path d="M15 5v14"></path><path d="M10 9l3 3-3 3"></path>',
  split: '<path d="M4 7h6a4 4 0 0 1 4 4v13"></path><path d="M14 11a4 4 0 0 1 4-4h2"></path><path d="M18 3l4 4-4 4"></path>',
  send: '<path d="M22 2L11 13"></path><path d="M22 2l-7 20-4-9-9-4z"></path>',
  settings: '<path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"></path><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2 3.4-.2-.1a1.7 1.7 0 0 0-2 .2l-.3.2-3.7-2.1v-.4a1.7 1.7 0 0 0-1.4-1.7h-.4l-1.8-3.1.2-.3a1.7 1.7 0 0 0 0-2.1l-.2-.3 1.8-3.1h.4a1.7 1.7 0 0 0 1.4-1.7v-.4l3.7-2.1.3.2a1.7 1.7 0 0 0 2 .2l.2-.1 2 3.4-.1.1a1.7 1.7 0 0 0-.3 1.9l.1.3v4.2z"></path>',
  stop: '<rect x="6" y="6" width="12" height="12" rx="2"></rect>',
  upload: '<path d="M12 21V9"></path><path d="M7 14l5-5 5 5"></path><path d="M5 3h14"></path>',
  thread: '<path d="M4 7h5a3 3 0 0 1 3 3v4a3 3 0 0 0 3 3h5"></path><path d="M4 17h5a3 3 0 0 0 3-3v-4a3 3 0 0 1 3-3h5"></path>',
  trash: '<path d="M4 7h16"></path><path d="M9 7V4h6v3"></path><path d="M7 7l1 15h8l1-15"></path><path d="M10 11v6M14 11v6"></path>',
  wand: '<path d="M15 4l5 5"></path><path d="M14 5l-9 9 5 5 9-9z"></path><path d="M4 4h.01M9 2h.01M2 9h.01"></path>',
  wave: '<path d="M3 12c2.5-5 5.5-5 8 0s5.5 5 8 0"></path>',
  x: '<path d="M18 6L6 18"></path><path d="M6 6l12 12"></path>',
};

function createDefaultProject(id = `project-${Date.now()}`, title = "未命名小说") {
  return {
    id,
    title,
    genre: "长篇小说",
    targetWords: 3000,
    mainLine: "",
    branchLines: "",
    foreshadows: "",
    characters: "",
    roleCards: "",
    props: "",
    worldBackground: "",
    keySettings: "",
    outline: "",
    volumeOutline: "",
    chapterOutline: "",
    timeline: "",
    foreshadowLedger: "",
    beatPlan: "",
    emotionPlan: "",
    characterArc: "",
    sceneCards: "",
    notes: "",
    activeBoard: "outline",
    volumeCollapsed: {},
    activeChapterId: `${id}-chapter-1`,
    chapters: [
      {
        id: `${id}-chapter-1`,
        title: "第一章",
        volume: "第一卷",
        content: "",
        summary: "",
        bookmarks: [],
        highlights: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    ],
    snapshots: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

const defaultState = {
  activeProjectId: null,
  projects: [],
  project: null,
  ui: {
    leftCollapsed: false,
    rightCollapsed: false,
    rightPanelWidth: 370,
    collapsedSections: {},
    textareaHeights: {},
    editorPrefs: {
      fontFamily: "Microsoft YaHei",
      textColor: "#20231f",
      bgColor: "#ffffff",
      customFonts: [],
    },
  },
  storage: {
    dataDir: "",
    usingFile: false,
  },
  ai: {
    providerPreset: "custom",
    baseUrl: "",
    modelName: "",
    apiKey: "",
    systemPrompt: DEFAULT_ASSISTANT_SYSTEM_PROMPT,
    temperature: 0.85,
    writingRequirementPreset: "easyUrban",
    writingRequirements: DEFAULT_WRITING_REQUIREMENTS,
    activeProfileId: "default",
    profiles: [],
    chat: {
      profileId: "",
      useSystemPrompt: false,
      systemPrompt: "你是专业中文小说创作助手，回答要具体、可落地，避免空泛。",
      messages: [],
    },
  },
  selectedAction: "continue",
};

const els = {
  homeView: document.querySelector("#homeView"),
  homeBtn: document.querySelector("#homeBtn"),
  homeNewProjectBtn: document.querySelector("#homeNewProjectBtn"),
  homeImportFolderBtn: document.querySelector("#homeImportFolderBtn"),
  homeImportFileBtn: document.querySelector("#homeImportFileBtn"),
  homeChooseDataDirBtn: document.querySelector("#homeChooseDataDirBtn"),
  homeDataDirText: document.querySelector("#homeDataDirText"),
  homeProjectSelect: document.querySelector("#homeProjectSelect"),
  openHomeProjectBtn: document.querySelector("#openHomeProjectBtn"),
  recentProjectList: document.querySelector("#recentProjectList"),
  projectSelect: document.querySelector("#projectSelect"),
  projectList: document.querySelector("#projectList"),
  newProjectBtn: document.querySelector("#newProjectBtn"),
  deleteProjectBtn: document.querySelector("#deleteProjectBtn"),
  projectTitle: document.querySelector("#projectTitle"),
  genre: document.querySelector("#genre"),
  targetWords: document.querySelector("#targetWords"),
  targetProgressText: document.querySelector("#targetProgressText"),
  targetProgressFill: document.querySelector("#targetProgressFill"),
  targetProgressFooter: document.querySelector("#targetProgressFooter"),
  backupBtn: document.querySelector("#backupBtn"),
  importBtn: document.querySelector("#importBtn"),
  chooseDataDirBtn: document.querySelector("#chooseDataDirBtn"),
  dataDirText: document.querySelector("#dataDirText"),
  importFile: document.querySelector("#importFile"),
  outlineList: document.querySelector("#outlineList"),
  editOutlineBtn: document.querySelector("#editOutlineBtn"),
  importOutlineBtn: document.querySelector("#importOutlineBtn"),
  clearOutlineBtn: document.querySelector("#clearOutlineBtn"),
  importOutlineFile: document.querySelector("#importOutlineFile"),
  chapterList: document.querySelector("#chapterList"),
  chapterSummaryList: document.querySelector("#chapterSummaryList"),
  chapterSummaryEditor: document.querySelector("#chapterSummaryEditor"),
  saveChapterSummaryBtn: document.querySelector("#saveChapterSummaryBtn"),
  clearChapterSummaryBtn: document.querySelector("#clearChapterSummaryBtn"),
  addChapterBtn: document.querySelector("#addChapterBtn"),
  chapterVolume: document.querySelector("#chapterVolume"),
  applyVolumeBtn: document.querySelector("#applyVolumeBtn"),
  addVolumeBtn: document.querySelector("#addVolumeBtn"),
  deleteVolumeBtn: document.querySelector("#deleteVolumeBtn"),
  importChapterBtn: document.querySelector("#importChapterBtn"),
  importFolderBtn: document.querySelector("#importFolderBtn"),
  importChapterFile: document.querySelector("#importChapterFile"),
  importFolderFile: document.querySelector("#importFolderFile"),
  deleteChapterBtn: document.querySelector("#deleteChapterBtn"),
  exportBtn: document.querySelector("#exportBtn"),
  toggleLeftPanelBtn: document.querySelector("#toggleLeftPanelBtn"),
  toggleRightPanelBtn: document.querySelector("#toggleRightPanelBtn"),
  snapshotBtn: document.querySelector("#snapshotBtn"),
  snapshotList: document.querySelector("#snapshotList"),
  chapterTitle: document.querySelector("#chapterTitle"),
  chapterMeta: document.querySelector("#chapterMeta"),
  editorWrap: document.querySelector("#editorWrap"),
  bookmarkJumpBtn: document.querySelector("#bookmarkJumpBtn"),
  lineGutter: document.querySelector("#lineGutter"),
  editorHighlights: document.querySelector("#editorHighlights"),
  editor: document.querySelector("#editor"),
  saveStatus: document.querySelector("#saveStatus"),
  chapterWordCount: document.querySelector("#chapterWordCount"),
  selectionWordCount: document.querySelector("#selectionWordCount"),
  totalWordCount: document.querySelector("#totalWordCount"),
  splitSelectionBtn: document.querySelector("#splitSelectionBtn"),
  splitSuggestBtn: document.querySelector("#splitSuggestBtn"),
  sceneCardBtn: document.querySelector("#sceneCardBtn"),
  providerPreset: document.querySelector("#providerPreset"),
  aiProfileSelect: document.querySelector("#aiProfileSelect"),
  aiProfileName: document.querySelector("#aiProfileName"),
  newAiProfileBtn: document.querySelector("#newAiProfileBtn"),
  saveAiProfileBtn: document.querySelector("#saveAiProfileBtn"),
  deleteAiProfileBtn: document.querySelector("#deleteAiProfileBtn"),
  baseUrl: document.querySelector("#baseUrl"),
  modelName: document.querySelector("#modelName"),
  apiKey: document.querySelector("#apiKey"),
  aiSystemPrompt: document.querySelector("#aiSystemPrompt"),
  aiTemperature: document.querySelector("#aiTemperature"),
  aiTemperatureNumber: document.querySelector("#aiTemperatureNumber"),
  testAiBtn: document.querySelector("#testAiBtn"),
  mainLine: document.querySelector("#mainLine"),
  branchLines: document.querySelector("#branchLines"),
  foreshadows: document.querySelector("#foreshadows"),
  characters: document.querySelector("#characters"),
  roleCards: document.querySelector("#roleCards"),
  props: document.querySelector("#props"),
  worldBackground: document.querySelector("#worldBackground"),
  keySettings: document.querySelector("#keySettings"),
  saveStoryBtn: document.querySelector("#saveStoryBtn"),
  boardTabs: document.querySelectorAll("[data-board]"),
  boardText: document.querySelector("#boardText"),
  boardAiBtn: document.querySelector("#boardAiBtn"),
  saveBoardBtn: document.querySelector("#saveBoardBtn"),
  editorFontSelect: document.querySelector("#editorFontSelect"),
  chooseFontFolderBtn: document.querySelector("#chooseFontFolderBtn"),
  fontFolderInput: document.querySelector("#fontFolderInput"),
  editorTextColor: document.querySelector("#editorTextColor"),
  editorBgColor: document.querySelector("#editorBgColor"),
  resetEditorStyleBtn: document.querySelector("#resetEditorStyleBtn"),
  actionButtons: document.querySelectorAll("[data-action]"),
  writingRequirementPreset: document.querySelector("#writingRequirementPreset"),
  writingRequirements: document.querySelector("#writingRequirements"),
  aiInstruction: document.querySelector("#aiInstruction"),
  runAiBtn: document.querySelector("#runAiBtn"),
  insertResultBtn: document.querySelector("#insertResultBtn"),
  copyResultBtn: document.querySelector("#copyResultBtn"),
  stopAiBtn: document.querySelector("#stopAiBtn"),
  aiProgress: document.querySelector("#aiProgress"),
  aiTaskDialog: document.querySelector("#aiTaskDialog"),
  aiDialogTitle: document.querySelector("#aiDialogTitle"),
  aiDialogDesc: document.querySelector("#aiDialogDesc"),
  aiReferenceHint: document.querySelector("#aiReferenceHint"),
  closeAiDialogBtn: document.querySelector("#closeAiDialogBtn"),
  aiTaskScope: document.querySelector("#aiTaskScope"),
  aiTaskInstruction: document.querySelector("#aiTaskInstruction"),
  referenceOptions: document.querySelector("#referenceOptions"),
  selectAllRefsBtn: document.querySelector("#selectAllRefsBtn"),
  clearRefsBtn: document.querySelector("#clearRefsBtn"),
  promptPreview: document.querySelector("#promptPreview"),
  previewPromptBtn: document.querySelector("#previewPromptBtn"),
  runDialogAiBtn: document.querySelector("#runDialogAiBtn"),
  aiResult: document.querySelector("#aiResult"),
  chatProfileSelect: document.querySelector("#chatProfileSelect"),
  chatUseSystemPrompt: document.querySelector("#chatUseSystemPrompt"),
  chatSystemPrompt: document.querySelector("#chatSystemPrompt"),
  chatMessages: document.querySelector("#chatMessages"),
  chatInput: document.querySelector("#chatInput"),
  sendChatBtn: document.querySelector("#sendChatBtn"),
  stopChatBtn: document.querySelector("#stopChatBtn"),
  clearChatBtn: document.querySelector("#clearChatBtn"),
  copyChatBtn: document.querySelector("#copyChatBtn"),
  chatProgress: document.querySelector("#chatProgress"),
  toggleFindBtn: document.querySelector("#toggleFindBtn"),
  findBar: document.querySelector("#findBar"),
  findInput: document.querySelector("#findInput"),
  replaceInput: document.querySelector("#replaceInput"),
  findPrevBtn: document.querySelector("#findPrevBtn"),
  findNextBtn: document.querySelector("#findNextBtn"),
  replaceOneBtn: document.querySelector("#replaceOneBtn"),
  replaceAllBtn: document.querySelector("#replaceAllBtn"),
  findStatus: document.querySelector("#findStatus"),
  rightResizer: document.querySelector("#rightResizer"),
  contextMenu: document.querySelector("#contextMenu"),
  renameDialog: document.querySelector("#renameDialog"),
  renameDialogTitle: document.querySelector("#renameDialogTitle"),
  renameInput: document.querySelector("#renameInput"),
  confirmRenameBtn: document.querySelector("#confirmRenameBtn"),
  toast: document.querySelector("#toast"),
};

let state = loadState();
let saveTimer = null;
let toastTimer = null;
let currentDialogAction = state.selectedAction || "continue";
let currentDialogSelectedRefs = [];
let activeAiAbortController = null;
let activeChatAbortController = null;
let activeBoardSlice = null;

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || LEGACY_STORAGE_KEYS.map((key) => localStorage.getItem(key)).find(Boolean);
    if (!raw) return normalizeState(structuredClone(defaultState));
    return normalizeState(JSON.parse(raw));
  } catch {
    return normalizeState(structuredClone(defaultState));
  }
}

function normalizeTemperature(value, fallback = 0.85) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  return Math.min(2, Math.max(0, Math.round(numeric * 100) / 100));
}

function normalizeAiState(input = {}) {
  const base = { ...defaultState.ai, ...input };
  const baseSystemPrompt = input.systemPrompt || base.systemPrompt || DEFAULT_ASSISTANT_SYSTEM_PROMPT;
  const baseTemperature = normalizeTemperature(input.temperature, defaultState.ai.temperature);
  const profiles = Array.isArray(input.profiles) && input.profiles.length
    ? input.profiles
    : [
        {
          id: "default",
          name: "默认配置",
          providerPreset: input.providerPreset || base.providerPreset || "custom",
          baseUrl: input.baseUrl || base.baseUrl || "",
          modelName: input.modelName || base.modelName || "",
          apiKey: input.apiKey || base.apiKey || "",
          systemPrompt: baseSystemPrompt,
          temperature: baseTemperature,
        },
      ];
  const normalizedProfiles = profiles.map((profile, index) => ({
    id: profile.id || `ai-profile-${Date.now()}-${index}`,
    name: profile.name || `AI 配置 ${index + 1}`,
    providerPreset: profile.providerPreset || "custom",
    baseUrl: profile.baseUrl || "",
    modelName: profile.modelName || "",
    apiKey: profile.apiKey || "",
    systemPrompt: profile.systemPrompt || baseSystemPrompt,
    temperature: normalizeTemperature(profile.temperature, baseTemperature),
  }));
  const activeProfileId = normalizedProfiles.some((profile) => profile.id === input.activeProfileId)
    ? input.activeProfileId
    : normalizedProfiles[0].id;
  const active = normalizedProfiles.find((profile) => profile.id === activeProfileId) || normalizedProfiles[0];
  const rawChat = input.chat || {};
  const chatProfileId = normalizedProfiles.some((profile) => profile.id === rawChat.profileId)
    ? rawChat.profileId
    : activeProfileId;
  const chatMessages = Array.isArray(rawChat.messages)
    ? rawChat.messages
        .filter((message) => ["user", "assistant"].includes(message.role) && message.content)
        .slice(-20)
        .map((message) => ({ role: message.role, content: String(message.content) }))
    : [];
  return {
    ...base,
    ...active,
    activeProfileId,
    profiles: normalizedProfiles,
    writingRequirementPreset: input.writingRequirementPreset || base.writingRequirementPreset || "easyUrban",
    writingRequirements: input.writingRequirements || base.writingRequirements || DEFAULT_WRITING_REQUIREMENTS,
    chat: {
      ...defaultState.ai.chat,
      ...rawChat,
      profileId: chatProfileId,
      messages: chatMessages,
      useSystemPrompt: !!rawChat.useSystemPrompt,
      systemPrompt: rawChat.systemPrompt || defaultState.ai.chat.systemPrompt,
    },
  };
}

function normalizeState(input) {
  const projects = Array.isArray(input.projects)
    ? input.projects.map(normalizeProject)
    : input.project || input.chapters
      ? [normalizeProject({ ...input.project, chapters: input.chapters, snapshots: input.snapshots, activeChapterId: input.activeChapterId })]
      : [];

  const merged = {
    ...structuredClone(defaultState),
    ...input,
    ai: normalizeAiState(input.ai || {}),
    ui: {
      ...defaultState.ui,
      ...(input.ui || {}),
      textareaHeights: { ...((input.ui || {}).textareaHeights || {}) },
      editorPrefs: {
        ...defaultState.ui.editorPrefs,
        ...((input.ui || {}).editorPrefs || {}),
        customFonts: Array.isArray((input.ui || {}).editorPrefs?.customFonts) ? (input.ui || {}).editorPrefs.customFonts : [],
      },
    },
    storage: { ...defaultState.storage, ...(input.storage || {}) },
    projects,
    activeProjectId: Object.prototype.hasOwnProperty.call(input, "activeProjectId") ? input.activeProjectId : null,
  };
  if (merged.activeProjectId && !merged.projects.some((item) => item.id === merged.activeProjectId)) {
    merged.activeProjectId = null;
  }
  merged.project = merged.activeProjectId ? merged.projects.find((item) => item.id === merged.activeProjectId) || null : null;
  if (merged.project && !merged.project.activeBoard) merged.project.activeBoard = input.activeBoard || "outline";
  return merged;
}

function normalizeBookmarks(input, maxLine = Infinity) {
  return [...new Set((Array.isArray(input) ? input : [])
    .map((line) => Number(line))
    .filter((line) => Number.isInteger(line) && line > 0 && line <= maxLine))]
    .sort((a, b) => a - b);
}

function normalizeHighlights(input, content = "") {
  const limit = String(content || "").length;
  return (Array.isArray(input) ? input : [])
    .map((item) => ({
      id: item.id || `highlight-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      start: Math.max(0, Number(item.start) || 0),
      end: Math.max(0, Number(item.end) || 0),
    }))
    .filter((item) => item.end > item.start && item.start < limit)
    .map((item) => ({ ...item, end: Math.min(item.end, limit) }));
}

function cleanOutlineLine(line = "") {
  return String(line || "").trim().replace(/^#+\s*/, "").replace(/^[-*]\s*/, "");
}

function outlineIndent(line = "") {
  const match = String(line || "").match(/^[\t ]*/);
  return (match?.[0] || "").replace(/\t/g, "    ").length;
}

function isMasterOutlineLine(clean = "") {
  return /^(总纲|总大纲|全书总纲|全书大纲|master outline)/i.test(clean);
}

function isVolumeOutlineLine(clean = "") {
  return /^(卷纲|卷大纲|第[一二三四五六七八九十百千万\d]+卷(?:[:：\s]|$)|卷[一二三四五六七八九十百千万\d]+(?:[:：\s]|$)|volume\s*\d+)/i.test(clean) && !/章/.test(clean.slice(0, 10));
}

function isStageOutlineLine(clean = "") {
  return /^(阶段[:：]|部分[:：]|篇章[:：]|单元[:：]|【.+】)/.test(clean) && !isChapterOutlineLine(clean);
}

function isVolumeOnlyOutlineLine(clean = "") {
  return /^(阶段规划|主要剧情|主线|支线|本卷伏笔|卷伏笔)[:：]/.test(clean);
}

function isChapterOutlineLine(clean = "") {
  return /^(章纲|章大纲|第.+章|第.+节|chapter\s*\d+|ch\s*\d+)/i.test(clean);
}

function splitLegacyOutline(text = "") {
  const source = String(text || "");
  const lines = source.split(/\r?\n/);
  const parts = { outline: [], volumeOutline: [], chapterOutline: [] };
  let mode = "outline";
  let sawVolume = false;
  let sawChapter = false;

  lines.forEach((line) => {
    const clean = cleanOutlineLine(line);
    if (!clean) {
      if (parts[mode].length) parts[mode].push(line);
      return;
    }
    const indent = outlineIndent(line);
    if (isMasterOutlineLine(clean)) {
      mode = "outline";
      parts.outline.push(line);
      return;
    }
    if (isChapterOutlineLine(clean)) {
      mode = "chapterOutline";
      sawChapter = true;
      parts.chapterOutline.push(line);
      return;
    }
    if (isVolumeOutlineLine(clean)) {
      mode = "volumeOutline";
      sawVolume = true;
      parts.volumeOutline.push(line);
      parts.chapterOutline.push(line);
      return;
    }
    if (isVolumeOnlyOutlineLine(clean) && sawVolume) {
      mode = "volumeOutline";
      parts.volumeOutline.push(line);
      return;
    }
    if (isStageOutlineLine(clean) && sawVolume) {
      mode = "volumeOutline";
      parts.volumeOutline.push(line);
      return;
    }
    if (indent >= 2 && !sawChapter && sawVolume) {
      mode = "volumeOutline";
      parts.volumeOutline.push(line);
      return;
    }
    parts[mode].push(line);
  });

  const trimLines = (value) => value.join("\n").trim();
  return {
    outline: trimLines(parts.outline),
    volumeOutline: sawVolume ? trimLines(parts.volumeOutline) : "",
    chapterOutline: sawChapter ? trimLines(parts.chapterOutline) : "",
  };
}

function normalizeProject(input) {
  const fallback = createDefaultProject(input.id || `project-${Date.now()}`);
  const legacyOutline = input.outline || "";
  const shouldSplitLegacyOutline = legacyOutline && !input.volumeOutline && !input.chapterOutline;
  const splitOutline = shouldSplitLegacyOutline ? splitLegacyOutline(legacyOutline) : null;
  const project = {
    ...fallback,
    ...input,
    id: input.id || fallback.id,
    title: input.title || input.name || fallback.title,
    outline: splitOutline ? splitOutline.outline || "" : input.outline || "",
    volumeOutline: splitOutline ? splitOutline.volumeOutline : input.volumeOutline || "",
    chapterOutline: splitOutline ? splitOutline.chapterOutline : input.chapterOutline || "",
    timeline: input.timeline || "",
    foreshadowLedger: input.foreshadowLedger || "",
    beatPlan: input.beatPlan || "",
    emotionPlan: input.emotionPlan || "",
    characterArc: input.characterArc || "",
    sceneCards: input.sceneCards || "",
    notes: input.notes || "",
    activeBoard: input.activeBoard || "outline",
    volumeCollapsed: input.volumeCollapsed || {},
    chapters: Array.isArray(input.chapters) && input.chapters.length ? input.chapters : fallback.chapters,
    snapshots: Array.isArray(input.snapshots) ? input.snapshots : [],
  };
  project.chapters = project.chapters.map((chapter, index) => ({
    id: chapter.id || `${project.id}-chapter-${index + 1}`,
    title: chapter.title || `第${index + 1}章`,
    volume: chapter.volume || "第一卷",
    content: chapter.content || "",
    summary: chapter.summary || "",
    bookmarks: normalizeBookmarks(chapter.bookmarks),
    highlights: normalizeHighlights(chapter.highlights, chapter.content || ""),
    createdAt: chapter.createdAt || Date.now(),
    updatedAt: chapter.updatedAt || Date.now(),
  }));
  if (!project.chapters.some((chapter) => chapter.id === project.activeChapterId)) {
    project.activeChapterId = project.chapters[0].id;
  }
  return project;
}

function project() {
  state.project = state.activeProjectId ? state.projects.find((item) => item.id === state.activeProjectId) || null : null;
  return state.project;
}

function hasFileStorage() {
  return !!window.mojiStorage;
}

function renderStorageState() {
  const dataDir = state.storage?.dataDir || "";
  const text = dataDir ? `数据目录：${dataDir}` : hasFileStorage() ? "数据目录：未设置，请先选择目录" : "数据目录：浏览器预览模式，使用本地缓存";
  if (els.dataDirText) els.dataDirText.textContent = text;
  if (els.homeDataDirText) els.homeDataDirText.textContent = dataDir || (hasFileStorage() ? "尚未设置，便携版需要先选择一个目录保存所有数据。" : "浏览器预览模式会临时保存到本地缓存。");
}

async function saveStateToFile() {
  if (!hasFileStorage() || !state.storage?.dataDir) return;
  try {
    state.storage.usingFile = true;
    await window.mojiStorage.saveWorkspace(state);
  } catch (error) {
    showToast(`保存到数据目录失败：${error.message || error}`);
  }
}

function persist(immediate = false) {
  els.saveStatus.textContent = "保存中...";
  clearTimeout(saveTimer);
  saveTimer = setTimeout(async () => {
    const current = project();
    if (current) current.updatedAt = Date.now();
    state.project = current;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Large imported font files can exceed browser cache quota; file storage remains the primary store in the desktop app.
    }
    await saveStateToFile();
    els.saveStatus.textContent = "已保存";
    renderChapterMeta();
    renderStorageState();
  }, immediate ? 0 : 260);
}

async function loadWorkspaceFromDataDir() {
  if (!hasFileStorage()) {
    state.storage.usingFile = false;
    return;
  }
  try {
    const result = await window.mojiStorage.readWorkspace();
    const dataDir = result?.dataDir || "";
    if (result?.state) {
      state = normalizeState({
        ...result.state,
        storage: { ...(result.state.storage || {}), dataDir, usingFile: !!dataDir },
      });
    } else {
      state.storage = { ...state.storage, dataDir, usingFile: !!dataDir };
      if (dataDir) await saveStateToFile();
    }
  } catch (error) {
    showToast(`读取数据目录失败：${error.message || error}`);
  }
}

async function chooseDataDir() {
  if (!hasFileStorage()) {
    showToast("浏览器预览模式不支持选择系统目录");
    return false;
  }
  const result = await window.mojiStorage.chooseDataDir();
  if (result?.canceled) return false;
  state.storage = { ...state.storage, dataDir: result.dataDir || "", usingFile: !!result.dataDir };
  await loadWorkspaceFromDataDir();
  await saveStateToFile();
  bindInitialValues();
  render();
  showToast("工作数据目录已设置");
  return true;
}

async function ensureDataDirReady() {
  if (!hasFileStorage() || state.storage?.dataDir) return true;
  showToast("请先选择工作数据目录");
  return chooseDataDir();
}

function activeChapter() {
  const current = project();
  if (!current) return null;
  return current.chapters.find((chapter) => chapter.id === current.activeChapterId) || current.chapters[0];
}

function activeChapterNumber() {
  const current = project();
  if (!current?.chapters?.length) return 1;
  const index = current.chapters.findIndex((chapter) => chapter.id === current.activeChapterId);
  return (index >= 0 ? index : 0) + 1;
}

function countWords(text) {
  const source = (text || "").trim();
  if (!source) return 0;
  const cjk = source.match(/[\u3400-\u9fff\uf900-\ufaff]/g) || [];
  const words = source
    .replace(/[\u3400-\u9fff\uf900-\ufaff]/g, " ")
    .match(/[A-Za-z0-9]+(?:[-'][A-Za-z0-9]+)*/g) || [];
  return cjk.length + words.length;
}

function formatTime(timestamp) {
  return new Intl.DateTimeFormat("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(timestamp || Date.now());
}

function formatDateTime(timestamp) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(timestamp || Date.now());
}

function showToast(message) {
  clearTimeout(toastTimer);
  els.toast.textContent = message;
  els.toast.classList.add("show");
  toastTimer = setTimeout(() => els.toast.classList.remove("show"), 1800);
}

function renderIcons(root = document) {
  root.querySelectorAll(".ui-icon[data-icon]").forEach((icon) => {
    const name = icon.dataset.icon;
    const path = iconPaths[name];
    if (!path || icon.dataset.rendered === "true") return;
    icon.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">${path}</svg>`;
    icon.dataset.rendered = "true";
  });
}

function setupSectionToggles() {
  document.querySelectorAll("section.panel, section.chapter-tools").forEach((section, index) => {
    if (!section.dataset.sectionKey) {
      const classKey = [...section.classList].filter((name) => name !== "panel").join("-") || "section";
      section.dataset.sectionKey = `${classKey}-${index}`;
    }
    let title = section.querySelector(":scope > .section-title");
    const directHeading = section.querySelector(":scope > h2");
    if (!title && directHeading) {
      title = document.createElement("div");
      title.className = "section-title collapsible-title";
      section.insertBefore(title, directHeading);
      title.appendChild(directHeading);
    }
    if (!title || title.querySelector("[data-collapse-section]")) return;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "section-collapse-toggle";
    button.dataset.collapseSection = section.dataset.sectionKey;
    button.title = "收起/展开";
    button.setAttribute("aria-label", "收起或展开模块");
    button.innerHTML = iconMarkup("chevron");
    title.appendChild(button);
  });
}

function renderSectionCollapseState() {
  const collapsed = state.ui.collapsedSections || {};
  document.querySelectorAll("[data-section-key]").forEach((section) => {
    const isCollapsed = !!collapsed[section.dataset.sectionKey];
    section.classList.toggle("section-collapsed", isCollapsed);
    const button = section.querySelector("[data-collapse-section]");
    if (button) button.classList.toggle("collapsed", isCollapsed);
  });
}

function toggleSectionCollapse(key) {
  state.ui.collapsedSections = state.ui.collapsedSections || {};
  state.ui.collapsedSections[key] = !state.ui.collapsedSections[key];
  renderSectionCollapseState();
  persist(true);
}

async function loadCustomFonts() {
  const fonts = state.ui.editorPrefs.customFonts || [];
  if (!("FontFace" in window)) return;
  for (const font of fonts) {
    if (!font.name || !font.dataUrl || font.loaded) continue;
    try {
      const face = new FontFace(font.name, `url(${font.dataUrl})`);
      await face.load();
      document.fonts.add(face);
      font.loaded = true;
    } catch {
      font.loaded = false;
    }
  }
  scheduleEditorMarkerRender();
}

function renderEditorPreferences() {
  const prefs = state.ui.editorPrefs;
  if (!prefs) return;
  document.documentElement.style.setProperty("--editor-font", JSON.stringify(prefs.fontFamily || "Microsoft YaHei"));
  document.documentElement.style.setProperty("--editor-text", prefs.textColor || "#20231f");
  document.documentElement.style.setProperty("--editor-bg", prefs.bgColor || "#ffffff");

  if (els.editorFontSelect) {
    const currentValue = els.editorFontSelect.value;
    els.editorFontSelect.innerHTML = "";
    const systemGroup = document.createElement("optgroup");
    systemGroup.label = "Windows / 系统字体";
    systemFonts.forEach((font) => {
      const option = document.createElement("option");
      option.value = font.family;
      option.textContent = font.label;
      systemGroup.appendChild(option);
    });
    els.editorFontSelect.appendChild(systemGroup);

    const customFonts = prefs.customFonts || [];
    if (customFonts.length) {
      const customGroup = document.createElement("optgroup");
      customGroup.label = "已导入字体";
      customFonts.forEach((font) => {
        const option = document.createElement("option");
        option.value = font.name;
        option.textContent = font.name;
        customGroup.appendChild(option);
      });
      els.editorFontSelect.appendChild(customGroup);
    }
    els.editorFontSelect.value = prefs.fontFamily || currentValue || "Microsoft YaHei";
  }
  if (els.editorTextColor) els.editorTextColor.value = prefs.textColor || "#20231f";
  if (els.editorBgColor) els.editorBgColor.value = prefs.bgColor || "#ffffff";
  loadCustomFonts();
}

function updateEditorPreference(key, value) {
  state.ui.editorPrefs[key] = value;
  renderEditorPreferences();
  renderEditorMarkers();
  persist();
}

function resetEditorPreferences() {
  state.ui.editorPrefs = structuredClone(defaultState.ui.editorPrefs);
  renderEditorPreferences();
  persist(true);
  showToast("阅读样式已恢复默认");
}

function resizableTextareas() {
  return [...document.querySelectorAll(".assistant-panel textarea, .ai-dialog textarea, #aiResult, #chapterSummaryEditor")].filter((item) => item.id);
}

function applyTextareaHeights() {
  const heights = state.ui.textareaHeights || {};
  resizableTextareas().forEach((textarea) => {
    const height = Number(heights[textarea.id]) || 0;
    if (height > 40) textarea.style.height = `${height}px`;
  });
}

function saveTextareaHeight(textarea) {
  if (!textarea?.id) return;
  const height = Math.round(textarea.getBoundingClientRect().height);
  if (!height || height < 40) return;
  state.ui.textareaHeights = state.ui.textareaHeights || {};
  if (state.ui.textareaHeights[textarea.id] === height) return;
  state.ui.textareaHeights[textarea.id] = height;
  persist();
}

function bindTextareaResizePersistence() {
  resizableTextareas().forEach((textarea) => {
    if (textarea.dataset.heightPersistenceBound === "true") return;
    textarea.dataset.heightPersistenceBound = "true";
    textarea.addEventListener("mouseup", () => saveTextareaHeight(textarea));
    textarea.addEventListener("blur", () => saveTextareaHeight(textarea));
  });
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

async function importFontFiles(files) {
  const fontFiles = [...files].filter((file) => /\.(ttf|otf|woff2?|ttc)$/i.test(file.name));
  if (!fontFiles.length) {
    showToast("没有识别到字体文件");
    return;
  }
  const customFonts = state.ui.editorPrefs.customFonts || [];
  for (const file of fontFiles.slice(0, 30)) {
    const name = stripExtension(file.name);
    const existing = customFonts.find((font) => font.name === name);
    const dataUrl = await readFileAsDataUrl(file);
    if (existing) {
      existing.dataUrl = dataUrl;
      existing.loaded = false;
    } else {
      customFonts.push({ name, dataUrl, loaded: false });
    }
  }
  state.ui.editorPrefs.customFonts = customFonts;
  state.ui.editorPrefs.fontFamily = customFonts[customFonts.length - 1]?.name || state.ui.editorPrefs.fontFamily;
  renderEditorPreferences();
  persist(true);
  showToast(`已导入 ${fontFiles.length} 个字体文件`);
}

function bindInitialValues() {
  const current = project();
  renderAiProfiles();
  renderEditorPreferences();
  if (!current) {
    els.projectTitle.value = "";
    els.genre.value = "";
    els.targetWords.value = "";
    els.mainLine.value = "";
    els.branchLines.value = "";
    els.foreshadows.value = "";
    els.characters.value = "";
    els.roleCards.value = "";
    els.props.value = "";
    els.worldBackground.value = "";
    els.keySettings.value = "";
    els.boardText.value = "";
    els.chapterVolume.value = "";
    els.chapterVolume.innerHTML = "";
    els.providerPreset.value = state.ai.providerPreset;
    els.baseUrl.value = state.ai.baseUrl;
    els.modelName.value = state.ai.modelName;
    els.apiKey.value = state.ai.apiKey;
    syncAiBehaviorFields();
    return;
  }
  els.projectTitle.value = current.title;
  els.genre.value = current.genre;
  els.targetWords.value = current.targetWords;
  els.providerPreset.value = state.ai.providerPreset;
  els.baseUrl.value = state.ai.baseUrl;
  els.modelName.value = state.ai.modelName;
  els.apiKey.value = state.ai.apiKey;
  syncAiBehaviorFields();
  els.mainLine.value = current.mainLine;
  els.branchLines.value = current.branchLines;
  els.foreshadows.value = current.foreshadows;
  els.characters.value = current.characters;
  els.roleCards.value = current.roleCards;
  els.props.value = current.props;
  els.worldBackground.value = current.worldBackground;
  els.keySettings.value = current.keySettings;
  els.boardText.value = current[current.activeBoard] || "";
  els.chapterVolume.value = activeChapter()?.volume || "第一卷";
}

function render() {
  renderProjectList();
  renderHomeState();
  renderPanelState();
  const chapter = activeChapter();
  if (!chapter) return;

  els.chapterTitle.value = chapter.title;
  els.editor.style.height = "";
  els.editor.disabled = false;
  els.editor.readOnly = false;
  els.editor.value = chapter.content;
  renderVolumeState();
  renderChapterList();
  renderChapterSummaryList();
  renderSnapshots();
  renderChapterMeta();
  renderCounts();
  renderEditorMarkers();
  renderActionState();
  renderBoardState();
  renderOutlineList();
  renderAiProfiles();
  renderChatPanel();
  renderEditorPreferences();
  applyTextareaHeights();
  bindTextareaResizePersistence();
  restoreFormInteractivity();
}

function renderHomeState() {
  const isHome = !project();
  document.body.classList.toggle("home-mode", isHome);
  renderStorageState();
  renderRecentProjects();
}

function renderProjectList() {
  const current = project();
  els.projectSelect.innerHTML = "";
  els.homeProjectSelect.innerHTML = "";
  els.projectList.innerHTML = "";

  if (!state.projects.length) {
    const option = document.createElement("option");
    option.value = "";
    option.textContent = "暂无小说";
    els.projectSelect.appendChild(option.cloneNode(true));
    els.homeProjectSelect.appendChild(option);
    return;
  }

  state.projects.forEach((item) => {
    const option = document.createElement("option");
    option.value = item.id;
    option.textContent = item.title || "未命名小说";
    option.selected = !!current && item.id === current.id;
    els.projectSelect.appendChild(option);

    const homeOption = option.cloneNode(true);
    homeOption.selected = false;
    els.homeProjectSelect.appendChild(homeOption);

    const button = document.createElement("button");
    button.className = `project-item${current && item.id === current.id ? " active" : ""}`;
    button.type = "button";
    button.dataset.id = item.id;
    const total = item.chapters.reduce((sum, chapter) => sum + countWords(chapter.content), 0);
    button.innerHTML = `<strong>${escapeHtml(item.title || "未命名小说")}</strong><span>${item.chapters.length} 章 · ${total} 字</span>`;
    els.projectList.appendChild(button);
  });
}

function renderPanelState() {
  document.body.classList.toggle("left-collapsed", !!state.ui.leftCollapsed);
  document.body.classList.toggle("right-collapsed", !!state.ui.rightCollapsed);
  document.documentElement.style.setProperty("--right-panel-width", `${state.ui.rightPanelWidth || 370}px`);
  els.toggleLeftPanelBtn.title = state.ui.leftCollapsed ? "展开左侧栏" : "收起左侧栏";
  els.toggleRightPanelBtn.title = state.ui.rightCollapsed ? "展开右侧栏" : "收起右侧栏";
  renderSectionCollapseState();
}

function renderRecentProjects() {
  els.recentProjectList.innerHTML = "";
  if (!state.projects.length) {
    const hint = document.createElement("p");
    hint.className = "empty-hint";
    hint.textContent = "还没有小说。可以新建一本，或导入章节文件夹。";
    els.recentProjectList.appendChild(hint);
    return;
  }
  [...state.projects]
    .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))
    .slice(0, 12)
    .forEach((item) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "recent-project";
      button.dataset.id = item.id;
      const total = item.chapters.reduce((sum, chapter) => sum + countWords(chapter.content), 0);
      button.innerHTML = `<strong>${escapeHtml(item.title || "未命名小说")}</strong><span>${item.chapters.length} 章 · ${total} 字</span><span>最近更新 ${formatDateTime(item.updatedAt || item.createdAt)}</span>`;
      els.recentProjectList.appendChild(button);
    });
}

function volumeName(chapter) {
  return chapter.volume || "第一卷";
}

function getProjectVolumes(current = project()) {
  return [...new Set(current.chapters.map(volumeName))];
}

function renderVolumeState() {
  const current = project();
  const chapter = activeChapter();
  if (!current || !chapter) return;
  els.chapterVolume.value = volumeName(chapter);
  els.chapterVolume.innerHTML = "";
  getProjectVolumes(current).forEach((name) => {
    const option = document.createElement("option");
    option.value = name;
    option.textContent = name;
    option.selected = name === volumeName(chapter);
    els.chapterVolume.appendChild(option);
  });
}

function toggleVolume(volume) {
  const current = project();
  current.volumeCollapsed = current.volumeCollapsed || {};
  current.volumeCollapsed[volume] = !current.volumeCollapsed[volume];
  persist(true);
  renderChapterList();
}

function updateActiveChapterVolume() {
  const chapter = activeChapter();
  if (!chapter) return;
  const nextVolume = els.chapterVolume.value.trim() || "第一卷";
  syncActiveChapter({ volume: nextVolume });
  renderVolumeState();
  renderChapterList();
  showToast(`已设置到「${nextVolume}」`);
}

function addVolume() {
  const current = project();
  const defaultName = `第${getProjectVolumes(current).length + 1}卷`;
  const typed = els.chapterVolume.value.trim();
  const volume = typed && !getProjectVolumes(current).includes(typed) ? typed : defaultName;
  const chapter = activeChapter();
  if (chapter) {
    chapter.volume = volume;
    chapter.updatedAt = Date.now();
  }
  current.volumeCollapsed = current.volumeCollapsed || {};
  current.volumeCollapsed[volume] = false;
  persist(true);
  bindInitialValues();
  render();
  showToast(`已新建分卷「${volume}」`);
}

function deleteActiveVolume() {
  const current = project();
  const volume = els.chapterVolume.value.trim() || activeChapter()?.volume || "第一卷";
  const volumes = getProjectVolumes(current);
  if (volumes.length <= 1) {
    showToast("至少保留一个分卷");
    return;
  }
  if (!volumes.includes(volume)) {
    showToast("当前分卷不存在");
    return;
  }
  const fallback = volumes.find((item) => item !== volume) || "第一卷";
  if (!window.confirm(`删除分卷「${volume}」吗？其中章节会移动到「${fallback}」。`)) return;
  current.chapters.forEach((chapter) => {
    if (volumeName(chapter) === volume) chapter.volume = fallback;
  });
  if (current.volumeCollapsed) delete current.volumeCollapsed[volume];
  persist(true);
  bindInitialValues();
  render();
  showToast(`已删除分卷「${volume}」`);
}

function parseOutlineItems(text = "") {
  const lines = text.split(/\r?\n/);
  const items = [];
  let volume = "未分卷";
  lines.forEach((line, lineIndex) => {
    const trimmed = line.trim();
    if (!trimmed) return;
    const clean = cleanOutlineLine(line);
    if (isVolumeOnlyOutlineLine(clean)) return;
    if (isVolumeOutlineLine(clean)) {
      volume = clean;
      items.push({ type: "volume", title: clean, volume, lineIndex, excerpt: "" });
      return;
    }
    if (isStageOutlineLine(clean)) {
      items.push({ type: "stage", title: clean, volume, lineIndex, excerpt: "" });
      return;
    }
    if (isChapterOutlineLine(clean)) {
      items.push({ type: "chapter", title: clean, volume, lineIndex, excerpt: "" });
      return;
    }
    const last = items[items.length - 1];
    if (last && last.type === "chapter" && !last.excerpt) last.excerpt = clean.slice(0, 80);
  });
  return items;
}

function parseOutlineVolumeBlocks(text = "") {
  const lines = String(text || "").split(/\r?\n/);
  const blocks = [];
  let current = null;
  lines.forEach((line, lineIndex) => {
    const clean = cleanOutlineLine(line);
    if (!clean) {
      if (current) current.lines.push(line);
      return;
    }
    if (isVolumeOutlineLine(clean)) {
      current = { title: clean, volume: clean, lineIndex, lines: [] };
      blocks.push(current);
      return;
    }
    if (current) current.lines.push(line);
  });
  blocks.forEach((block, index) => {
    block.endLine = index + 1 < blocks.length ? blocks[index + 1].lineIndex : lines.length;
  });
  return blocks;
}

function previewFromOutlineLines(lines = []) {
  const values = lines
    .map((line) => cleanOutlineLine(line))
    .filter((line) => line && !isVolumeOutlineLine(line) && !isStageOutlineLine(line) && !isChapterOutlineLine(line) && !/^\*{3,}$/.test(line))
    .slice(0, 3);
  return values.join(" / ") || "点击查看这一卷卷纲";
}

function groupChapterOutlineItems(text = "") {
  const groups = new Map();
  parseOutlineItems(text).forEach((item) => {
    if (item.type === "volume") {
      if (!groups.has(item.volume)) groups.set(item.volume, { title: item.volume, lineIndex: item.lineIndex, items: [] });
      return;
    }
    if (item.type === "stage") return;
    if (!groups.has(item.volume)) groups.set(item.volume, { title: item.volume, lineIndex: item.lineIndex, items: [] });
    groups.get(item.volume).items.push(item);
  });
  return groups;
}

function chapterNumberFromTitle(title = "") {
  const text = readableOutlineTitle(title);
  const arabic = text.match(/(?:第\s*)?(\d+)\s*(?:章|节|\.|、|:|：)/i);
  if (arabic) return Number(arabic[1]);
  return 0;
}

function blockFromLineRange(text = "", startLine = 0, endLine = 0) {
  return String(text || "").split(/\r?\n/).slice(startLine, endLine).join("\n").trim();
}

function outlineSliceEndLine(boardKey = "outline", startLine = 0) {
  const current = project();
  const lines = String(current?.[boardKey] || "").split(/\r?\n/);
  const start = Math.max(0, Number(startLine) || 0);
  if (!lines.length || start >= lines.length) return lines.length;
  const startClean = cleanOutlineLine(lines[start]);
  if (!startClean) return lines.length;
  const stopAt = (clean) => {
    if (!clean) return false;
    if (boardKey === "volumeOutline") return isVolumeOutlineLine(clean);
    if (boardKey === "chapterOutline") {
      if (isVolumeOutlineLine(startClean)) return isVolumeOutlineLine(clean);
      if (isVolumeOnlyOutlineLine(clean)) return false;
      return isVolumeOutlineLine(clean) || isStageOutlineLine(clean) || isChapterOutlineLine(clean);
    }
    return false;
  };
  for (let index = start + 1; index < lines.length; index += 1) {
    if (stopAt(cleanOutlineLine(lines[index]))) return index;
  }
  return lines.length;
}

function findChapterOutlineBlock(current = project(), chapterNumber = 0) {
  const lines = String(current?.chapterOutline || "").split(/\r?\n/);
  let volume = "";
  let chapterCount = 0;
  for (let index = 0; index < lines.length; index += 1) {
    const clean = cleanOutlineLine(lines[index]);
    if (!clean) continue;
    if (isVolumeOutlineLine(clean)) {
      volume = clean;
      continue;
    }
    if (!isChapterOutlineLine(clean)) continue;
    chapterCount += 1;
    const number = chapterNumberFromTitle(clean);
    if (number !== chapterNumber && chapterCount !== chapterNumber) continue;
    let endLine = lines.length;
    for (let next = index + 1; next < lines.length; next += 1) {
      const nextClean = cleanOutlineLine(lines[next]);
      if (nextClean && (isVolumeOutlineLine(nextClean) || isStageOutlineLine(nextClean) || isChapterOutlineLine(nextClean))) {
        endLine = next;
        break;
      }
    }
    return {
      text: blockFromLineRange(current.chapterOutline, index, endLine),
      volume,
      startLine: index,
      endLine,
    };
  }
  return { text: "", volume: "", startLine: 0, endLine: 0 };
}

function findVolumeOutlineBlock(current = project(), volumeKey = "") {
  const blocks = parseOutlineVolumeBlocks(current?.volumeOutline || "");
  if (!blocks.length) return { text: "", startLine: 0, endLine: 0 };
  const activeVolume = volumeKey || findChapterOutlineBlock(current, activeChapterNumber()).volume || volumeName(activeChapter() || {});
  const readableActive = readableOutlineTitle(activeVolume);
  const block = blocks.find((item) => item.volume === activeVolume)
    || blocks.find((item) => readableOutlineTitle(item.volume).includes(readableActive) || readableActive.includes(readableOutlineTitle(item.volume)))
    || blocks.find((item) => item.volume.includes(readableActive) || readableActive.includes(item.volume));
  if (!block) return { text: "", startLine: 0, endLine: 0 };
  return {
    text: blockFromLineRange(current.volumeOutline, block.lineIndex, block.endLine),
    startLine: block.lineIndex,
    endLine: block.endLine,
  };
}

function readableOutlineTitle(title = "") {
  return String(title || "")
    .replace(/^章纲[一二三四五六七八九十百千万\d\-－—~～至到]*[:：]\s*/, "")
    .replace(/^卷纲[一二三四五六七八九十百千万\d\-－—~～至到]*[:：]\s*/, "")
    .replace(/^阶段[:：]\s*/, "")
    .trim();
}

function outlinePreview(text = "") {
  return String(text || "")
    .split(/\r?\n/)
    .map((line) => cleanOutlineLine(line))
    .find((line) => line && !isMasterOutlineLine(line) && !/^\*{3,}$/.test(line))
    || "点击查看完整内容";
}

function plannedChapterTitle(project, chapterNumber) {
  const items = parseOutlineItems(project?.chapterOutline || "").filter((item) => item.type === "chapter");
  const exact = items.find((item) => {
    const text = readableOutlineTitle(item.title || "");
    const arabic = text.match(/(?:第\s*)?(\d+)\s*(?:章|节|\.|、|:|：)/i);
    return arabic && Number(arabic[1]) === chapterNumber;
  });
  const fallback = items[chapterNumber - 1];
  const raw = readableOutlineTitle((exact || fallback)?.title || "");
  return raw.replace(/^[-*\s#]*/, "").trim();
}

function renderOutlineSection(title, boardKey, text, collapsed) {
  const items = parseOutlineItems(text || "");
  const section = document.createElement("div");
  section.className = "outline-section";
  const titleButton = document.createElement("button");
  titleButton.className = "outline-section-title";
  titleButton.type = "button";
  titleButton.dataset.outlineBoard = boardKey;
  titleButton.dataset.outlineLine = "0";
  titleButton.innerHTML = `<strong>${escapeHtml(title)}</strong><span>${items.length || 0}</span>`;
  section.appendChild(titleButton);
  if (!items.length && !text.trim()) {
    const hint = document.createElement("p");
    hint.className = "empty-hint";
    hint.textContent = `还没有${title}。`;
    section.appendChild(hint);
    return section;
  }
  if (!items.length) {
    const button = document.createElement("button");
    button.className = "outline-item";
    button.type = "button";
    button.dataset.outlineBoard = boardKey;
    button.dataset.outlineLine = "0";
    button.innerHTML = `<strong>${escapeHtml(`查看${title}`)}</strong><span>${escapeHtml(title)}</span><p>${escapeHtml(outlinePreview(text))}</p>`;
    section.appendChild(button);
    return section;
  }
  items.forEach((item) => {
    if (item.type === "volume") {
      const header = document.createElement("button");
      header.className = `volume-header${collapsed[item.volume] ? " collapsed" : ""}`;
      header.type = "button";
      header.dataset.outlineVolume = item.volume;
      header.innerHTML = `<strong>${escapeHtml(readableOutlineTitle(item.title))}</strong><span>${escapeHtml(title)}</span><span class="volume-chevron">${collapsed[item.volume] ? "展开" : "收起"}</span>`;
      section.appendChild(header);
      return;
    }
    if (collapsed[item.volume]) return;
    const button = document.createElement("button");
    button.className = "outline-item";
    button.type = "button";
    button.dataset.outlineBoard = boardKey;
    button.dataset.outlineLine = String(item.lineIndex);
    button.innerHTML = `<strong>${escapeHtml(readableOutlineTitle(item.title))}</strong><span>${escapeHtml(readableOutlineTitle(item.volume))}</span>${item.excerpt ? `<p>${escapeHtml(item.excerpt)}</p>` : ""}`;
    section.appendChild(button);
  });
  return section;
}

function renderOutlineList() {
  const current = project();
  if (!current || !els.outlineList) return;
  els.outlineList.innerHTML = "";
  const hasAny = [current.outline, current.volumeOutline, current.chapterOutline].some((text) => String(text || "").trim());
  if (!hasAny) {
    const hint = document.createElement("p");
    hint.className = "empty-hint";
    hint.textContent = "还没有大纲。点击编辑可分别填写总纲、卷纲和章纲。";
    els.outlineList.appendChild(hint);
    return;
  }
  const collapsed = current.volumeCollapsed || {};
  if ((current.outline || "").trim()) {
    els.outlineList.appendChild(renderOutlineSection("总纲", "outline", current.outline || "", collapsed));
  }

  const volumeBlocks = parseOutlineVolumeBlocks(current.volumeOutline || "");
  const chapterGroups = groupChapterOutlineItems(current.chapterOutline || "");
  const volumeKeys = [];
  volumeBlocks.forEach((block) => {
    if (!volumeKeys.includes(block.volume)) volumeKeys.push(block.volume);
  });
  chapterGroups.forEach((group, key) => {
    if (!volumeKeys.includes(key)) volumeKeys.push(key);
  });

  volumeKeys.forEach((volumeKey) => {
    const block = volumeBlocks.find((item) => item.volume === volumeKey);
    const chapterGroup = chapterGroups.get(volumeKey);
    const section = document.createElement("div");
    section.className = "outline-section outline-volume-section";
    const header = document.createElement("button");
    header.className = `volume-header${collapsed[volumeKey] ? " collapsed" : ""}`;
    header.type = "button";
    header.dataset.outlineVolume = volumeKey;
    header.innerHTML = `<strong>${escapeHtml(readableOutlineTitle(volumeKey))}</strong><span>卷纲 · ${(chapterGroup?.items || []).filter((item) => item.type === "chapter").length} 章</span><span class="volume-chevron">${collapsed[volumeKey] ? "展开" : "收起"}</span>`;
    section.appendChild(header);

    if (!collapsed[volumeKey]) {
      if (block) {
        const summary = document.createElement("button");
        summary.className = "outline-item outline-volume-summary";
        summary.type = "button";
        summary.dataset.outlineBoard = "volumeOutline";
        summary.dataset.outlineLine = String(block.lineIndex);
        summary.dataset.outlineEnd = String(block.endLine);
        summary.innerHTML = `<strong>卷纲</strong><span>${escapeHtml(readableOutlineTitle(block.title))}</span><p>${escapeHtml(previewFromOutlineLines(block.lines))}</p>`;
        section.appendChild(summary);
      }
      const chapterItems = chapterGroup?.items || [];
      chapterItems.forEach((item, itemIndex) => {
        const button = document.createElement("button");
        button.className = `outline-item outline-child${item.type === "stage" ? " outline-stage" : ""}`;
        button.type = "button";
        button.dataset.outlineBoard = "chapterOutline";
        button.dataset.outlineLine = String(item.lineIndex);
        const nextItem = chapterItems[itemIndex + 1];
        button.dataset.outlineEnd = String(nextItem?.lineIndex || String(current.chapterOutline || "").split(/\r?\n/).length);
        const itemTitle = item.type === "stage" ? readableOutlineTitle(item.title) : readableOutlineTitle(item.title);
        const label = item.type === "stage" ? "阶段" : "章纲";
        button.innerHTML = `<strong>${escapeHtml(itemTitle)}</strong><span>${label}</span>${item.excerpt ? `<p>${escapeHtml(item.excerpt)}</p>` : ""}`;
        section.appendChild(button);
      });
    }
    els.outlineList.appendChild(section);
  });
}

function clearCurrentOutline() {
  const current = project();
  if (!current) return;
  const hasOutline = ["outline", "volumeOutline", "chapterOutline"].some((key) => (current[key] || "").trim());
  if (!hasOutline) {
    showToast("当前没有可清理的大纲");
    return;
  }
  if (!window.confirm("确定清理当前小说的总纲、卷纲和章纲吗？正文和其他设定不会受影响。")) return;
  current.outline = "";
  current.volumeOutline = "";
  current.chapterOutline = "";
  current.activeBoard = "outline";
  persist(true);
  renderOutlineList();
  renderBoardState();
  showToast("大纲已清理");
}

function openOutlineEditor(lineIndex = 0, boardKey = "outline", endLine = null) {
  const current = project();
  if (!current) return;
  const safeLineIndex = Number(lineIndex) || 0;
  const safeEndLine = ["volumeOutline", "chapterOutline"].includes(boardKey)
    ? outlineSliceEndLine(boardKey, safeLineIndex)
    : Number(endLine) || 0;
  if (safeEndLine > safeLineIndex) {
    showBoardSlice(boardKey, safeLineIndex, safeEndLine);
    return;
  }
  commitBoardText();
  current.activeBoard = boardKey;
  activeBoardSlice = null;
  persist();
  renderBoardState();
  els.boardText.focus();
  const lines = els.boardText.value.split(/\r?\n/);
  const start = lines.slice(0, safeLineIndex).join("\n").length + (safeLineIndex > 0 ? 1 : 0);
  const end = start + (lines[safeLineIndex] || "").length;
  els.boardText.setSelectionRange(start, end);
}

function renderChapterList() {
  const current = project();
  els.chapterList.innerHTML = "";
  const groups = new Map();
  current.chapters.forEach((chapter, index) => {
    const volume = volumeName(chapter);
    if (!groups.has(volume)) groups.set(volume, []);
    groups.get(volume).push({ chapter, index });
  });

  groups.forEach((items, volume) => {
    const words = items.reduce((sum, item) => sum + countWords(item.chapter.content), 0);
    const collapsed = !!current.volumeCollapsed?.[volume];
    const header = document.createElement("button");
    header.className = `volume-header${collapsed ? " collapsed" : ""}`;
    header.type = "button";
    header.dataset.volume = volume;
    header.dataset.dropVolume = volume;
    header.innerHTML = `<strong>${escapeHtml(volume)}</strong><span>${items.length} 章 · ${words} 字</span><span class="volume-chevron">${collapsed ? "展开" : "收起"}</span>`;
    els.chapterList.appendChild(header);
    if (collapsed) return;

    items.forEach(({ chapter, index }) => {
    const button = document.createElement("button");
    button.className = `chapter-item${chapter.id === current.activeChapterId ? " active" : ""}`;
    button.type = "button";
    button.dataset.id = chapter.id;
    button.dataset.volume = volumeName(chapter);
    button.draggable = true;
    const chapterWords = countWords(chapter.content);
    const target = Number(current.targetWords) || 0;
    const progress = target ? Math.min(999, Math.round((chapterWords / target) * 100)) : 0;
    button.innerHTML = `<strong>${escapeHtml(index + 1)}. ${escapeHtml(chapter.title || "未命名章节")}</strong><span>${chapterWords} 字 · ${progress}% · ${formatTime(chapter.updatedAt)}</span>`;
    els.chapterList.appendChild(button);
    });
  });
}

function renderChapterSummaryList() {
  const current = project();
  if (!els.chapterSummaryList || !current) return;
  els.chapterSummaryList.innerHTML = "";
  current.chapters.forEach((chapter, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `chapter-summary-item${chapter.id === current.activeChapterId ? " active" : ""}`;
    button.dataset.id = chapter.id;
    const summary = (chapter.summary || "").trim();
    const preview = summary ? (summary.length > 180 ? `${summary.slice(0, 180)}...` : summary) : "暂无摘要";
    button.innerHTML = `<strong>${escapeHtml(index + 1)}. ${escapeHtml(chapter.title || "未命名章节")}</strong><p>${escapeHtml(preview)}</p>`;
    els.chapterSummaryList.appendChild(button);
  });
  renderChapterSummaryEditor();
}

function renderChapterSummaryEditor() {
  if (!els.chapterSummaryEditor) return;
  const chapter = activeChapter();
  els.chapterSummaryEditor.value = chapter?.summary || "";
  els.chapterSummaryEditor.disabled = !chapter;
}

function saveChapterSummary() {
  const chapter = activeChapter();
  if (!chapter) return;
  chapter.summary = els.chapterSummaryEditor.value.trim();
  chapter.updatedAt = Date.now();
  persist(true);
  renderChapterSummaryList();
  renderChapterList();
  showToast("章节摘要已保存");
}

function clearChapterSummary() {
  const chapter = activeChapter();
  if (!chapter) return;
  chapter.summary = "";
  chapter.updatedAt = Date.now();
  els.chapterSummaryEditor.value = "";
  persist(true);
  renderChapterSummaryList();
  renderChapterList();
  showToast("章节摘要已清空");
}

function closeContextMenu() {
  els.contextMenu.hidden = true;
  els.contextMenu.innerHTML = "";
}

function showContextMenu(event, items) {
  event.preventDefault();
  els.contextMenu.innerHTML = "";
  items.forEach((item) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = item.label;
    button.addEventListener("click", () => {
      closeContextMenu();
      item.action();
    });
    els.contextMenu.appendChild(button);
  });
  els.contextMenu.hidden = false;
  els.contextMenu.style.left = `${Math.min(event.clientX, window.innerWidth - 170)}px`;
  els.contextMenu.style.top = `${Math.min(event.clientY, window.innerHeight - 90)}px`;
}

function openRenameDialog({ title, value, onConfirm }) {
  els.renameDialogTitle.textContent = title;
  els.renameInput.value = value || "";
  els.confirmRenameBtn.onclick = () => {
    const next = els.renameInput.value.trim();
    if (!next) {
      showToast("名称不能为空");
      return;
    }
    onConfirm(next);
    if (els.renameDialog.open) els.renameDialog.close();
  };
  if (typeof els.renameDialog.showModal === "function") {
    els.renameDialog.showModal();
  } else {
    els.renameDialog.setAttribute("open", "open");
  }
  els.renameInput.focus();
  els.renameInput.select();
}

function renameChapter(chapterId) {
  const current = project();
  const chapter = current.chapters.find((item) => item.id === chapterId);
  if (!chapter) return;
  openRenameDialog({
    title: "重命名章节",
    value: chapter.title || "",
    onConfirm: (next) => {
      chapter.title = next;
      chapter.updatedAt = Date.now();
      persist(true);
      render();
      showToast("章节已重命名");
    },
  });
}

function renameVolume(oldName) {
  const current = project();
  openRenameDialog({
    title: "重命名分卷",
    value: oldName,
    onConfirm: (next) => {
      current.chapters.forEach((chapter) => {
        if (volumeName(chapter) === oldName) chapter.volume = next;
      });
      current.volumeCollapsed = current.volumeCollapsed || {};
      current.volumeCollapsed[next] = current.volumeCollapsed[oldName] || false;
      delete current.volumeCollapsed[oldName];
      persist(true);
      bindInitialValues();
      render();
      showToast("分卷已重命名");
    },
  });
}

function moveChapterTo(chapterId, target = {}) {
  const current = project();
  const fromIndex = current.chapters.findIndex((chapter) => chapter.id === chapterId);
  if (fromIndex < 0) return;
  const [chapter] = current.chapters.splice(fromIndex, 1);
  if (target.volume) chapter.volume = target.volume;

  let toIndex = current.chapters.length;
  if (target.beforeChapterId) {
    const found = current.chapters.findIndex((item) => item.id === target.beforeChapterId);
    if (found >= 0) toIndex = found;
  } else if (target.volume) {
    const lastInVolume = current.chapters.reduce((last, item, index) => volumeName(item) === target.volume ? index : last, -1);
    toIndex = lastInVolume >= 0 ? lastInVolume + 1 : current.chapters.length;
  }
  current.chapters.splice(toIndex, 0, chapter);
  current.activeChapterId = chapter.id;
  chapter.updatedAt = Date.now();
  persist(true);
  bindInitialValues();
  render();
}

let draggedChapterId = "";

function clearDropTargets() {
  els.chapterList.querySelectorAll(".drop-target, .dragging").forEach((item) => item.classList.remove("drop-target", "dragging"));
}

function restoreFormInteractivity() {
  document.querySelectorAll(".sidebar input, .sidebar textarea, .sidebar select, .assistant-panel input, .assistant-panel textarea, .assistant-panel select").forEach((control) => {
    control.disabled = false;
    if ("readOnly" in control && control.id !== "promptPreview") control.readOnly = false;
  });
  if (els.contextMenu) closeContextMenu();
}

function startRightResize(event) {
  event.preventDefault();
  document.body.classList.add("resizing-right");
  const onMove = (moveEvent) => {
    const width = Math.min(680, Math.max(300, window.innerWidth - moveEvent.clientX));
    state.ui.rightPanelWidth = width;
    document.documentElement.style.setProperty("--right-panel-width", `${width}px`);
    scheduleEditorOverlaySync();
  };
  const onUp = () => {
    document.body.classList.remove("resizing-right");
    window.removeEventListener("mousemove", onMove);
    window.removeEventListener("mouseup", onUp);
    renderEditorMarkers();
    persist(true);
  };
  window.addEventListener("mousemove", onMove);
  window.addEventListener("mouseup", onUp);
}

function renderSnapshots() {
  const current = project();
  els.snapshotList.innerHTML = "";
  const chapterSnapshots = current.snapshots
    .filter((snapshot) => snapshot.chapterId === current.activeChapterId)
    .slice(-6)
    .reverse();

  if (!chapterSnapshots.length) {
    const hint = document.createElement("p");
    hint.className = "empty-hint";
    hint.textContent = "还没有快照。改大段正文前可以先保存一份。";
    els.snapshotList.appendChild(hint);
    return;
  }

  chapterSnapshots.forEach((snapshot) => {
    const item = document.createElement("div");
    item.className = "snapshot-item";
    item.dataset.id = snapshot.id;
    item.innerHTML = `<button class="snapshot-main" type="button" data-restore-snapshot="${escapeHtml(snapshot.id)}"><strong>${escapeHtml(snapshot.title)}</strong><span>${countWords(snapshot.content)} 字 · ${formatDateTime(snapshot.createdAt)}</span></button><button class="snapshot-delete" type="button" data-delete-snapshot="${escapeHtml(snapshot.id)}" title="删除快照">${iconMarkup("trash")}删除</button>`;
    els.snapshotList.appendChild(item);
  });
}

function renderChapterMeta() {
  const chapter = activeChapter();
  if (!chapter) return;
  els.chapterMeta.textContent = `上次更新 ${formatTime(chapter.updatedAt)} · 目标 ${project().targetWords || 0} 字`;
}

function renderCounts() {
  const current = project();
  const chapter = activeChapter();
  const chapterWords = countWords(chapter?.content || "");
  const selectedText = els.editor.value.slice(els.editor.selectionStart, els.editor.selectionEnd);
  const total = current.chapters.reduce((sum, item) => sum + countWords(item.content), 0);
  const target = Number(current.targetWords) || 0;
  const progress = target ? Math.round((chapterWords / target) * 100) : 0;

  els.chapterWordCount.textContent = chapterWords;
  els.selectionWordCount.textContent = countWords(selectedText);
  els.totalWordCount.textContent = total;
  els.targetProgressText.textContent = `${progress}%`;
  els.targetProgressFooter.textContent = `${progress}%`;
  els.targetProgressFill.style.width = `${Math.min(100, progress)}%`;
}

function ensureChapterMarkers(chapter = activeChapter()) {
  if (!chapter) return null;
  chapter.bookmarks = normalizeBookmarks(chapter.bookmarks, lineCountForText(chapter.content || ""));
  chapter.highlights = normalizeHighlights(chapter.highlights, chapter.content || "");
  return chapter;
}

function lineCountForText(text = "") {
  return String(text || "").split("\n").length;
}

function lineForOffset(text = "", offset = 0) {
  return String(text || "").slice(0, Math.max(0, offset)).split("\n").length;
}

function offsetForLine(text = "", line = 1) {
  const source = String(text || "");
  if (line <= 1) return 0;
  let index = 0;
  for (let currentLine = 1; currentLine < line; currentLine += 1) {
    const next = source.indexOf("\n", index);
    if (next === -1) return source.length;
    index = next + 1;
  }
  return index;
}

let editorOverlaySyncFrame = 0;
let lineGutterRenderKey = "";
let lineGutterLayout = { tops: [], lineHeight: 34, contentHeight: 0 };
let editorMarkerRenderFrame = 0;
let lineMeasureCanvas = null;

function syncEditorOverlayScroll() {
  if (!els.editor) return;
  const top = els.editor.scrollTop;
  const gutterContent = els.lineGutter?.querySelector(".line-gutter-content");
  if (gutterContent) gutterContent.style.transform = `translateY(${-top}px)`;
  if (els.editorHighlights) {
    els.editorHighlights.scrollTop = top;
    els.editorHighlights.scrollLeft = els.editor.scrollLeft;
  }
}

function scheduleEditorOverlaySync() {
  if (editorOverlaySyncFrame) cancelAnimationFrame(editorOverlaySyncFrame);
  editorOverlaySyncFrame = requestAnimationFrame(() => {
    editorOverlaySyncFrame = 0;
    syncEditorOverlayScroll();
  });
}

function scheduleEditorMarkerRender() {
  if (editorMarkerRenderFrame) cancelAnimationFrame(editorMarkerRenderFrame);
  editorMarkerRenderFrame = requestAnimationFrame(() => {
    editorMarkerRenderFrame = 0;
    lineGutterRenderKey = "";
    renderEditorMarkers();
  });
}

function editorLineMetrics() {
  const computed = window.getComputedStyle(els.editor);
  const fontSize = Number.parseFloat(computed.fontSize) || 18;
  const lineHeight = Number.parseFloat(computed.lineHeight) || fontSize * 1.9 || 34;
  const paddingLeft = Number.parseFloat(computed.paddingLeft) || 0;
  const paddingRight = Number.parseFloat(computed.paddingRight) || 0;
  const paddingTop = Number.parseFloat(computed.paddingTop) || 0;
  const paddingBottom = Number.parseFloat(computed.paddingBottom) || 0;
  const wrapWidth = Math.max(1, els.editor.clientWidth - paddingLeft - paddingRight);
  const font = computed.font || `${computed.fontStyle} ${computed.fontWeight} ${computed.fontSize} ${computed.fontFamily}`;
  return { font, lineHeight, paddingTop, paddingBottom, wrapWidth };
}

function wrappedRowCount(line, wrapWidth, measureText) {
  if (!line) return 1;
  let rows = 1;
  let width = 0;
  for (const char of line) {
    const charWidth = measureText(char === "\t" ? "    " : char);
    if (width > 0 && width + charWidth > wrapWidth) {
      rows += 1;
      width = charWidth;
    } else {
      width += charWidth;
    }
  }
  return rows;
}

function computeLineGutterLayout(lines) {
  const metrics = editorLineMetrics();
  if (!lineMeasureCanvas) lineMeasureCanvas = document.createElement("canvas");
  const context = lineMeasureCanvas.getContext("2d");
  context.font = metrics.font;
  const widthCache = new Map();
  const measureText = (text) => {
    if (!widthCache.has(text)) widthCache.set(text, context.measureText(text).width);
    return widthCache.get(text);
  };
  const rawTops = [];
  let rawHeight = 0;
  lines.forEach((line) => {
    rawTops.push(rawHeight);
    rawHeight += wrappedRowCount(line, metrics.wrapWidth, measureText) * metrics.lineHeight;
  });
  const actualContentHeight = Math.max(metrics.lineHeight, els.editor.scrollHeight - metrics.paddingTop - metrics.paddingBottom);
  const scale = rawHeight > 0 ? actualContentHeight / rawHeight : 1;
  return {
    tops: rawTops.map((top) => top * scale),
    lineHeight: metrics.lineHeight,
    contentHeight: actualContentHeight,
    paddingTop: metrics.paddingTop,
  };
}

function renderLineGutter(force = false) {
  if (!els.lineGutter) return;
  const chapter = ensureChapterMarkers();
  const text = els.editor.value;
  const lines = text.split("\n");
  const total = lines.length;
  const bookmarks = new Set(chapter?.bookmarks || []);
  const metrics = editorLineMetrics();
  const renderKey = [
    chapter?.id || "",
    total,
    els.editor.scrollHeight,
    Math.round(metrics.wrapWidth),
    metrics.font,
    metrics.lineHeight,
    [...bookmarks].join(","),
  ].join(":");
  if (!force && renderKey === lineGutterRenderKey && els.lineGutter.querySelector(".line-gutter-content")) {
    syncEditorOverlayScroll();
    return;
  }
  lineGutterRenderKey = renderKey;
  lineGutterLayout = computeLineGutterLayout(lines);
  els.lineGutter.innerHTML = "";
  const content = document.createElement("div");
  content.className = "line-gutter-content";
  content.style.height = `${lineGutterLayout.contentHeight}px`;
  for (let line = 1; line <= total; line += 1) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `line-number${bookmarks.has(line) ? " bookmarked" : ""}`;
    button.dataset.line = String(line);
    button.title = bookmarks.has(line) ? "取消书签" : "标记书签";
    button.innerHTML = `<span>${line}</span>${bookmarks.has(line) ? "<strong>&#9670;</strong>" : ""}`;
    button.style.top = `${lineGutterLayout.tops[line - 1] || 0}px`;
    button.style.height = `${lineGutterLayout.lineHeight}px`;
    button.style.lineHeight = `${lineGutterLayout.lineHeight}px`;
    content.appendChild(button);
  }
  els.lineGutter.appendChild(content);
  syncEditorOverlayScroll();
}

function renderEditorHighlights() {
  if (!els.editorHighlights) return;
  const chapter = ensureChapterMarkers();
  const text = els.editor.value;
  const highlights = [...(chapter?.highlights || [])].sort((a, b) => a.start - b.start || a.end - b.end);
  if (!highlights.length) {
    els.editorHighlights.innerHTML = "";
    syncEditorOverlayScroll();
    return;
  }
  const lines = text.split("\n");
  let offset = 0;
  const html = lines.map((line) => {
    const lineStart = offset;
    const lineEnd = lineStart + line.length;
    let cursor = 0;
    let lineHtml = "";
    highlights.forEach((item) => {
      const start = Math.max(item.start, lineStart) - lineStart;
      const end = Math.min(item.end, lineEnd) - lineStart;
      if (end <= start || start < cursor) return;
      lineHtml += escapeHtml(line.slice(cursor, start));
      lineHtml += `<mark data-highlight-id="${escapeHtml(item.id)}">${escapeHtml(line.slice(start, end))}</mark>`;
      cursor = end;
    });
    lineHtml += escapeHtml(line.slice(cursor));
    offset = lineEnd + 1;
    return `<div class="highlight-line">${lineHtml || "&ZeroWidthSpace;"}</div>`;
  }).join("");
  els.editorHighlights.innerHTML = html || '<div class="highlight-line">&ZeroWidthSpace;</div>';
  syncEditorOverlayScroll();
}

function renderEditorMarkers() {
  ensureChapterMarkers();
  renderEditorHighlights();
  renderLineGutter();
  scheduleEditorOverlaySync();
  const bookmarks = activeChapter()?.bookmarks || [];
  if (els.bookmarkJumpBtn) {
    els.bookmarkJumpBtn.disabled = !bookmarks.length;
    els.bookmarkJumpBtn.title = bookmarks.length ? `跳到下一个书签（${bookmarks.length}）` : "还没有书签";
    els.bookmarkJumpBtn.setAttribute("aria-label", els.bookmarkJumpBtn.title);
  }
}

function toggleBookmarkLine(line) {
  const chapter = ensureChapterMarkers();
  if (!chapter) return;
  const bookmarks = new Set(chapter.bookmarks || []);
  if (bookmarks.has(line)) bookmarks.delete(line);
  else bookmarks.add(line);
  chapter.bookmarks = normalizeBookmarks([...bookmarks]);
  persist(true);
  renderEditorMarkers();
}

function jumpToLine(line) {
  const targetLine = Math.max(1, Math.min(Number(line) || 1, lineCountForText(els.editor.value)));
  const offset = offsetForLine(els.editor.value, targetLine);
  renderLineGutter(true);
  const metrics = editorLineMetrics();
  const lineTop = lineGutterLayout.tops[targetLine - 1] || 0;
  const maxTop = Math.max(0, els.editor.scrollHeight - els.editor.clientHeight);
  const targetTop = Math.min(maxTop, Math.max(0, metrics.paddingTop + lineTop - els.editor.clientHeight * 0.28));
  try {
    els.editor.focus({ preventScroll: true });
  } catch {
    els.editor.focus();
  }
  els.editor.setSelectionRange(offset, offset);
  const applyJumpScroll = () => {
    els.editor.scrollTop = targetTop;
    syncEditorOverlayScroll();
  };
  applyJumpScroll();
  requestAnimationFrame(() => {
    applyJumpScroll();
    requestAnimationFrame(applyJumpScroll);
  });
  setTimeout(applyJumpScroll, 0);
  setTimeout(applyJumpScroll, 80);
  renderCounts();
}

function jumpToNextBookmark() {
  const chapter = ensureChapterMarkers();
  const bookmarks = chapter?.bookmarks || [];
  if (!bookmarks.length) {
    showToast("还没有书签");
    return;
  }
  const currentLine = lineForOffset(els.editor.value, els.editor.selectionEnd);
  const next = bookmarks.find((line) => line > currentLine) || bookmarks[0];
  jumpToLine(next);
}

function editorSelectionRange() {
  return {
    chapterId: activeChapter()?.id || "",
    start: Math.min(els.editor.selectionStart, els.editor.selectionEnd),
    end: Math.max(els.editor.selectionStart, els.editor.selectionEnd),
  };
}

function activeSelectionRange(range = null) {
  const currentChapterId = activeChapter()?.id || "";
  const selected = range?.chapterId === currentChapterId ? range : editorSelectionRange();
  return {
    start: Math.max(0, Number(selected.start) || 0),
    end: Math.max(0, Number(selected.end) || 0),
  };
}

function addHighlightForSelection(range = null) {
  const chapter = ensureChapterMarkers();
  if (!chapter) return;
  const { start, end } = activeSelectionRange(range);
  if (end <= start) {
    showToast("先选择要高亮的正文");
    return;
  }
  chapter.highlights.push({ id: `highlight-${Date.now()}`, start, end });
  chapter.highlights = normalizeHighlights(chapter.highlights, els.editor.value);
  persist(true);
  renderEditorHighlights();
  showToast("已标记高亮");
}

function removeHighlightsForSelection(range = null) {
  const chapter = ensureChapterMarkers();
  if (!chapter) return;
  const { start, end } = activeSelectionRange(range);
  chapter.highlights = (chapter.highlights || []).filter((item) => item.end <= start || item.start >= end);
  persist(true);
  renderEditorHighlights();
  showToast("已取消选区高亮");
}

async function copyEditorSelection() {
  const selected = els.editor.value.slice(els.editor.selectionStart, els.editor.selectionEnd);
  if (!selected) {
    showToast("先选择要复制的正文");
    return;
  }
  try {
    await navigator.clipboard.writeText(selected);
    showToast("已复制选区");
  } catch {
    showToast("复制失败，可以手动复制");
  }
}

async function copyHighlightById(highlightId) {
  const chapter = ensureChapterMarkers();
  const item = chapter?.highlights?.find((highlight) => highlight.id === highlightId);
  if (!item) return;
  try {
    await navigator.clipboard.writeText(els.editor.value.slice(item.start, item.end));
    showToast("已复制高亮区域");
  } catch {
    showToast("复制失败，可以手动复制");
  }
}

function removeHighlightById(highlightId) {
  const chapter = ensureChapterMarkers();
  if (!chapter) return;
  chapter.highlights = (chapter.highlights || []).filter((item) => item.id !== highlightId);
  persist(true);
  renderEditorHighlights();
  showToast("已取消高亮");
}

function getHighlightIdFromPoint(x, y) {
  if (!els.editorHighlights) return "";
  const oldEditorPointer = els.editor.style.pointerEvents;
  const oldHighlightPointer = els.editorHighlights.style.pointerEvents;
  els.editor.style.pointerEvents = "none";
  els.editorHighlights.style.pointerEvents = "auto";
  const target = document.elementFromPoint(x, y);
  els.editor.style.pointerEvents = oldEditorPointer;
  els.editorHighlights.style.pointerEvents = oldHighlightPointer;
  return target?.closest?.("mark[data-highlight-id]")?.dataset.highlightId || "";
}

function showEditorContextMenu(event) {
  const selectionRange = editorSelectionRange();
  const selected = els.editor.value.slice(selectionRange.start, selectionRange.end);
  const highlightId = getHighlightIdFromPoint(event.clientX, event.clientY);
  if (!selected && !highlightId) return;
  event.preventDefault();
  const items = highlightId
    ? [
        { label: "复制高亮区域", action: () => copyHighlightById(highlightId) },
        { label: "取消此处高亮", action: () => removeHighlightById(highlightId) },
      ]
    : selected
    ? [
        { label: "标记高亮", action: () => addHighlightForSelection(selectionRange) },
        { label: "取消选区高亮", action: () => removeHighlightsForSelection(selectionRange) },
        { label: "复制所选区域", action: copyEditorSelection },
      ]
    : [];
  showContextMenu(event, items);
}

function showEditorSelectionMenu(event) {
  const selectionRange = editorSelectionRange();
  const selected = els.editor.value.slice(selectionRange.start, selectionRange.end);
  if (!selected) return;
  event.preventDefault();
  showContextMenu(event, [
    { label: "标记高亮", action: () => addHighlightForSelection(selectionRange) },
    { label: "取消选区高亮", action: () => removeHighlightsForSelection(selectionRange) },
    { label: "复制所选区域", action: copyEditorSelection },
  ]);
}

function renderActionState() {
  els.actionButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.action === state.selectedAction);
  });
}

function renderBoardState() {
  const current = project();
  els.boardTabs.forEach((button) => {
    button.classList.toggle("active", button.dataset.board === current.activeBoard);
  });
  activeBoardSlice = null;
  els.boardText.value = current[current.activeBoard] || "";
  els.boardText.placeholder = `${boardLabels[current.activeBoard] || "创作看板"}内容写在这里。`;
}

function replaceBoardSlice(current, value) {
  if (!current || !activeBoardSlice) return;
  const { boardKey, startLine, endLine } = activeBoardSlice;
  const lines = String(current[boardKey] || "").split(/\r?\n/);
  const nextLines = String(value || "").split(/\r?\n/);
  lines.splice(startLine, Math.max(0, endLine - startLine), ...nextLines);
  current[boardKey] = lines.join("\n").trim();
  activeBoardSlice.endLine = startLine + nextLines.length;
}

function commitBoardText() {
  const current = project();
  if (!current) return;
  if (activeBoardSlice) {
    replaceBoardSlice(current, els.boardText.value);
  } else {
    current[current.activeBoard] = els.boardText.value;
  }
  persist();
}

function showBoardSlice(boardKey, startLine, endLine) {
  const current = project();
  if (!current) return;
  commitBoardText();
  current.activeBoard = boardKey;
  activeBoardSlice = { boardKey, startLine, endLine };
  els.boardTabs.forEach((button) => {
    button.classList.toggle("active", button.dataset.board === boardKey);
  });
  els.boardText.value = blockFromLineRange(current[boardKey] || "", startLine, endLine);
  els.boardText.placeholder = `${boardLabels[boardKey] || "创作看板"}当前片段。`;
  persist();
  els.boardText.focus();
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function iconMarkup(name) {
  const path = iconPaths[name] || iconPaths.spark;
  return `<span class="ui-icon" data-rendered="true"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">${path}</svg></span>`;
}

function updateProjectField(key, value) {
  const current = project();
  current[key] = value;
  if (key === "title") renderProjectList();
  persist();
  renderCounts();
  renderChapterMeta();
  renderChapterList();
  if (["outline", "volumeOutline", "chapterOutline"].includes(key)) renderOutlineList();
}

function updateAiField(key, value) {
  const nextValue = key === "temperature" ? normalizeTemperature(value) : value;
  state.ai[key] = nextValue;
  const profile = activeAiProfile();
  if (profile && Object.prototype.hasOwnProperty.call(profile, key)) profile[key] = nextValue;
  persist();
}

function updateAiTemperature(value) {
  updateAiField("temperature", value);
  syncAiBehaviorFields();
}

function updateWritingRequirements(value) {
  state.ai.writingRequirements = value;
  state.ai.writingRequirementPreset = value === DEFAULT_WRITING_REQUIREMENTS ? "easyUrban" : "custom";
  syncAiBehaviorFields();
  refreshPromptPreviewIfOpen();
  persist();
}

function refreshPromptPreviewIfOpen() {
  if (els.aiTaskDialog?.open) refreshPromptPreview();
}

function syncActiveChapter(updates) {
  const chapter = activeChapter();
  if (!chapter) return;
  Object.assign(chapter, updates, { updatedAt: Date.now() });
  if (Object.prototype.hasOwnProperty.call(updates, "content")) {
    chapter.highlights = normalizeHighlights(chapter.highlights, chapter.content || "");
  }
  persist();
  renderChapterList();
  renderChapterSummaryList();
  renderChapterMeta();
  renderCounts();
  if (Object.prototype.hasOwnProperty.call(updates, "content")) renderEditorMarkers();
}

function insertEditorText(text, selectionOffset = text.length) {
  const editor = els.editor;
  const start = editor.selectionStart;
  const end = editor.selectionEnd;
  const before = editor.value.slice(0, start);
  const selected = editor.value.slice(start, end);
  const after = editor.value.slice(end);
  const insertion = text.includes("$selection") ? text.replace("$selection", selected) : text;
  editor.value = before + insertion + after;
  const cursor = before.length + selectionOffset;
  editor.setSelectionRange(cursor, cursor);
  syncActiveChapter({ content: editor.value });
  editor.focus();
}

function insertChineseDoubleQuote() {
  const editor = els.editor;
  const selected = editor.value.slice(editor.selectionStart, editor.selectionEnd);
  if (selected) {
    insertEditorText("「$selection」", selected.length + 2);
    return;
  }
  insertEditorText("「」", 1);
}

function findMatches(query) {
  const text = els.editor.value;
  if (!query) return [];
  const matches = [];
  let index = 0;
  while (index <= text.length) {
    const found = text.indexOf(query, index);
    if (found === -1) break;
    matches.push({ start: found, end: found + query.length });
    index = found + Math.max(1, query.length);
  }
  return matches;
}

function updateFindStatus(currentIndex = -1, total = null) {
  const count = total ?? findMatches(els.findInput.value).length;
  els.findStatus.textContent = count ? `${currentIndex + 1}/${count}` : "0/0";
}

function scrollEditorToSelection(position) {
  const textLength = Math.max(1, els.editor.value.length);
  const ratio = Math.min(1, Math.max(0, position / textLength));
  els.editor.scrollTop = Math.max(0, ratio * els.editor.scrollHeight - els.editor.clientHeight / 2);
}

function selectFindMatch(direction = 1) {
  const query = els.findInput.value;
  const matches = findMatches(query);
  if (!matches.length) {
    updateFindStatus(-1, 0);
    showToast("没有找到匹配内容");
    return;
  }
  const cursor = direction >= 0 ? els.editor.selectionEnd : els.editor.selectionStart;
  let index = matches.findIndex((match) => direction >= 0 ? match.start >= cursor : match.end < cursor);
  if (index === -1) index = direction >= 0 ? 0 : matches.length - 1;
  const match = matches[index];
  els.editor.focus();
  els.editor.setSelectionRange(match.start, match.end);
  scrollEditorToSelection(match.start);
  updateFindStatus(index, matches.length);
}

function replaceCurrentMatch() {
  const query = els.findInput.value;
  const replacement = els.replaceInput.value;
  const start = els.editor.selectionStart;
  const end = els.editor.selectionEnd;
  if (!query || els.editor.value.slice(start, end) !== query) {
    selectFindMatch(1);
    return;
  }
  els.editor.value = els.editor.value.slice(0, start) + replacement + els.editor.value.slice(end);
  els.editor.setSelectionRange(start, start + replacement.length);
  syncActiveChapter({ content: els.editor.value });
  selectFindMatch(1);
}

function replaceAllMatches() {
  const query = els.findInput.value;
  const replacement = els.replaceInput.value;
  if (!query) {
    showToast("先输入要搜索的内容");
    return;
  }
  const matches = findMatches(query);
  if (!matches.length) {
    updateFindStatus(-1, 0);
    showToast("没有找到匹配内容");
    return;
  }
  els.editor.value = els.editor.value.split(query).join(replacement);
  syncActiveChapter({ content: els.editor.value });
  updateFindStatus(-1, 0);
  showToast(`已替换 ${matches.length} 处`);
}

function toggleFindBar() {
  els.findBar.classList.toggle("open");
  if (els.findBar.classList.contains("open")) {
    els.findInput.focus();
    updateFindStatus();
  } else {
    els.editor.focus();
  }
}

function switchProject(projectId) {
  if (!state.projects.some((item) => item.id === projectId)) return;
  state.activeProjectId = projectId;
  state.project = project();
  persist(true);
  bindInitialValues();
  render();
}

async function newProject(name = "") {
  if (!(await ensureDataDirReady())) return;
  const defaultName = `新小说 ${state.projects.length + 1}`;
  const item = createDefaultProject(`project-${Date.now()}`, String(name).trim() || defaultName);
  state.projects.push(item);
  state.activeProjectId = item.id;
  state.project = item;
  persist(true);
  bindInitialValues();
  render();
  showToast("新小说已创建");
  els.projectTitle.focus();
  els.projectTitle.select();
}

function deleteProject() {
  if (state.projects.length === 1) {
    showToast("至少保留一本小说");
    return;
  }
  const current = project();
  const confirmed = window.confirm(`确定删除「${current.title || "未命名小说"}」吗？`);
  if (!confirmed) return;
  const index = state.projects.findIndex((item) => item.id === current.id);
  state.projects.splice(index, 1);
  state.activeProjectId = state.projects[Math.max(0, index - 1)].id;
  state.project = project();
  persist(true);
  bindInitialValues();
  render();
  showToast("小说已删除");
}

function goHome() {
  state.activeProjectId = null;
  state.project = null;
  persist(true);
  bindInitialValues();
  render();
}

function openSelectedHomeProject() {
  const projectId = els.homeProjectSelect.value;
  if (!projectId) {
    showToast("还没有可打开的小说");
    return;
  }
  switchProject(projectId);
}

function togglePanel(side) {
  if (side === "left") {
    state.ui.leftCollapsed = !state.ui.leftCollapsed;
  } else {
    state.ui.rightCollapsed = !state.ui.rightCollapsed;
  }
  renderPanelState();
  persist(true);
}

function addChapter(content = "") {
  const current = project();
  const next = current.chapters.length + 1;
  const plannedTitle = plannedChapterTitle(current, next);
  const chapter = {
    id: `chapter-${Date.now()}`,
    title: plannedTitle || `第${next}章`,
    volume: activeChapter()?.volume || "第一卷",
    content,
    summary: "",
    bookmarks: [],
    highlights: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  current.chapters.push(chapter);
  current.activeChapterId = chapter.id;
  persist(true);
  render();
  els.editor.focus();
}

function deleteActiveChapter() {
  const current = project();
  if (current.chapters.length === 1) {
    showToast("至少保留一个章节");
    return;
  }
  const chapter = activeChapter();
  const confirmed = window.confirm(`确定删除「${chapter.title || "未命名章节"}」吗？`);
  if (!confirmed) return;

  const index = current.chapters.findIndex((item) => item.id === chapter.id);
  current.chapters.splice(index, 1);
  current.snapshots = current.snapshots.filter((snapshot) => snapshot.chapterId !== chapter.id);
  current.activeChapterId = current.chapters[Math.max(0, index - 1)].id;
  persist(true);
  render();
  showToast("章节已删除");
}

function splitSelectionIntoChapter() {
  const currentProject = project();
  const editor = els.editor;
  const start = editor.selectionStart;
  const end = editor.selectionEnd;
  if (start === end) {
    showToast("先选中要拆出去的正文");
    return;
  }

  const selected = editor.value.slice(start, end).trim();
  if (!selected) {
    showToast("选区没有可拆分内容");
    return;
  }

  const current = activeChapter();
  const index = currentProject.chapters.findIndex((chapter) => chapter.id === current.id);
  const nextNumber = index + 2;
  const nextChapter = {
    id: `chapter-${Date.now()}`,
    title: `第${nextNumber}章`,
    volume: current.volume || "第一卷",
    content: selected,
    summary: "",
    bookmarks: [],
    highlights: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  current.content = `${editor.value.slice(0, start).trimEnd()}${editor.value.slice(end).trimStart() ? "\n\n" : ""}${editor.value.slice(end).trimStart()}`;
  current.highlights = normalizeHighlights(current.highlights, current.content);
  current.updatedAt = Date.now();
  currentProject.chapters.splice(index + 1, 0, nextChapter);
  currentProject.activeChapterId = nextChapter.id;
  persist(true);
  render();
  showToast(`已拆出 ${countWords(selected)} 字到新章节`);
}

function saveSnapshot() {
  const current = project();
  const chapter = activeChapter();
  if (!chapter) return;
  current.snapshots.push({
    id: `snapshot-${Date.now()}`,
    chapterId: chapter.id,
    title: chapter.title || "未命名章节",
    content: chapter.content,
    createdAt: Date.now(),
  });
  if (current.snapshots.length > 80) current.snapshots = current.snapshots.slice(-80);
  persist(true);
  renderSnapshots();
  showToast("快照已保存");
}

function restoreSnapshot(snapshotId) {
  const current = project();
  const snapshot = current.snapshots.find((item) => item.id === snapshotId);
  if (!snapshot) return;
  const confirmed = window.confirm("恢复快照会覆盖当前章节正文，确定继续吗？");
  if (!confirmed) return;

  current.activeChapterId = snapshot.chapterId;
  const chapter = activeChapter();
  chapter.title = snapshot.title;
  chapter.content = snapshot.content;
  chapter.updatedAt = Date.now();
  persist(true);
  render();
  showToast("已恢复快照");
}

function deleteSnapshot(snapshotId) {
  const current = project();
  const snapshot = current.snapshots.find((item) => item.id === snapshotId);
  if (!snapshot) return;
  const confirmed = window.confirm(`删除「${snapshot.title || "未命名章节"}」这份快照吗？`);
  if (!confirmed) return;
  current.snapshots = current.snapshots.filter((item) => item.id !== snapshotId);
  persist(true);
  renderSnapshots();
  showToast("快照已删除");
}

function exportNovel() {
  const current = project();
  const title = current.title || "未命名小说";
  const header = [
    title,
    `类型/基调：${current.genre || "未设置"}`,
    `总字数：${current.chapters.reduce((sum, chapter) => sum + countWords(chapter.content), 0)}`,
    "",
  ].join("\n");
  let lastVolume = "";
  const body = current.chapters
    .map((chapter) => {
      const parts = [];
      const currentVolume = volumeName(chapter);
      if (currentVolume !== lastVolume) {
        parts.push(currentVolume);
        lastVolume = currentVolume;
      }
      parts.push(`${chapter.title || "未命名章节"}\n\n${chapter.content || ""}`);
      return parts.join("\n\n");
    })
    .join("\n\n");
  downloadBlob(`${title}.txt`, header + body, "text/plain;charset=utf-8");
}

function backupProject() {
  const current = project();
  const title = current.title || "未命名小说";
  const payload = JSON.stringify({ type: "moxian-project", version: 3, project: current, exportedAt: new Date().toISOString() }, null, 2);
  downloadBlob(`${title}-写作台备份.json`, payload, "application/json;charset=utf-8");
}

function downloadBlob(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function extractOutlineFromFile(filename, text) {
  const lower = filename.toLowerCase();
  if (lower.endsWith(".json")) {
    const data = JSON.parse(text);
    const source = data.type === "moxian-project" && data.project
      ? data.project
      : data.project || data;
    if (source && (source.outline || source.volumeOutline || source.chapterOutline)) {
      const normalized = normalizeProject({ ...source, id: "outline-import" });
      return {
        outline: normalized.outline || "",
        volumeOutline: normalized.volumeOutline || "",
        chapterOutline: normalized.chapterOutline || "",
      };
    }
    return {
      outline: JSON.stringify(data, null, 2),
      volumeOutline: "",
      chapterOutline: "",
    };
  }
  return splitLegacyOutline(String(text || "").trim());
}

function importOutlineIntoCurrentProject(file) {
  const current = project();
  if (!file || !current) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const text = String(reader.result || "");
      const nextOutline = extractOutlineFromFile(file.name, text);
      const hasImportedOutline = ["outline", "volumeOutline", "chapterOutline"].some((key) => (nextOutline[key] || "").trim());
      if (!hasImportedOutline) {
        showToast("没有识别到可导入的大纲内容");
        return;
      }
      const hasCurrentOutline = ["outline", "volumeOutline", "chapterOutline"].some((key) => (current[key] || "").trim());
      if (hasCurrentOutline && !window.confirm("导入后会覆盖当前小说的总纲、卷纲和章纲，确定继续吗？")) return;
      current.outline = nextOutline.outline || "";
      current.volumeOutline = nextOutline.volumeOutline || "";
      current.chapterOutline = nextOutline.chapterOutline || "";
      current.activeBoard = "outline";
      current.volumeCollapsed = {};
      persist(true);
      bindInitialValues();
      render();
      showToast("大纲已导入当前小说");
    } catch {
      showToast("大纲导入失败，请检查文件内容");
    } finally {
      els.importOutlineFile.value = "";
    }
  };
  reader.readAsText(file, "utf-8");
}

function importProject(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const text = String(reader.result || "");
      const imported = parseImportedFile(file.name, text);
      if (imported.type === "library") {
        state = normalizeState(imported.state);
      } else {
        state.projects.push(imported.project);
        state.activeProjectId = imported.project.id;
        state.project = imported.project;
      }
      persist(true);
      bindInitialValues();
      render();
      showToast("导入完成");
    } catch {
      showToast("导入失败，请检查文件内容");
    } finally {
      els.importFile.value = "";
    }
  };
  reader.readAsText(file, "utf-8");
}

function parseImportedFile(filename, text) {
  const lower = filename.toLowerCase();
  if (lower.endsWith(".json")) {
    const data = JSON.parse(text);
    if (Array.isArray(data.projects)) return { type: "library", state: data };
    if (data.type === "moxian-project" && data.project) {
      return { type: "project", project: normalizeProject({ ...data.project, id: `project-${Date.now()}` }) };
    }
    if (data.project) {
      return { type: "project", project: normalizeProject({ ...data.project, id: `project-${Date.now()}` }) };
    }
    if (Array.isArray(data.chapters)) {
      return { type: "project", project: normalizeProject({ ...data, id: `project-${Date.now()}`, title: data.title || stripExtension(filename) }) };
    }
    return {
      type: "project",
      project: normalizeProject({
        id: `project-${Date.now()}`,
        title: data.title || stripExtension(filename),
        outline: data.outline || JSON.stringify(data, null, 2),
        notes: data.notes || "",
      }),
    };
  }

  const isOutline = /大纲|outline|设定|設定|纲要|梗概/i.test(filename);
  const base = stripExtension(filename);
  if (isOutline || lower.endsWith(".md")) {
    return {
      type: "project",
      project: normalizeProject({
        ...createDefaultProject(`project-${Date.now()}`, base),
        outline: text.trim(),
        notes: lower.endsWith(".md") ? `从 ${filename} 导入的 Markdown 大纲。` : "",
      }),
    };
  }

  return {
    type: "project",
    project: normalizeProject({
      ...createDefaultProject(`project-${Date.now()}`, base),
      chapters: parseChaptersFromText(text),
    }),
  };
}

function stripExtension(filename) {
  return filename.replace(/\.[^.]+$/, "") || "导入小说";
}

function parseChaptersFromText(text) {
  const normalized = text.replace(/\r\n/g, "\n").trim();
  if (!normalized) {
    return [{ id: `chapter-${Date.now()}`, title: "第一章", volume: "第一卷", content: "", bookmarks: [], highlights: [], createdAt: Date.now(), updatedAt: Date.now() }];
  }
  const lines = normalized.split("\n");
  const chapters = [];
  let current = null;
  const headingPattern = /^\s*(第[零〇一二三四五六七八九十百千万\d]+[章节回卷集部].*|chapter\s+\d+.*)\s*$/i;

  lines.forEach((line) => {
    if (headingPattern.test(line)) {
      if (current) chapters.push(current);
      current = { title: line.trim(), lines: [] };
      return;
    }
    if (!current) current = { title: "第一章", lines: [] };
    current.lines.push(line);
  });
  if (current) chapters.push(current);

  return chapters.map((item, index) => ({
    id: `chapter-${Date.now()}-${index}`,
    title: item.title || `第${index + 1}章`,
    volume: "第一卷",
    content: item.lines.join("\n").trim(),
    bookmarks: [],
    highlights: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }));
}

function readFileText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file, "utf-8");
  });
}

function sortFilesNaturally(files) {
  const collator = new Intl.Collator("zh-CN", { numeric: true, sensitivity: "base" });
  return [...files].sort((a, b) => collator.compare(a.webkitRelativePath || a.name, b.webkitRelativePath || b.name));
}

async function filesToChapters(files) {
  const txtFiles = sortFilesNaturally(files).filter((file) => /\.txt$/i.test(file.name));
  const chapters = [];
  for (const [index, file] of txtFiles.entries()) {
    const content = await readFileText(file);
    chapters.push({
      id: `chapter-${Date.now()}-${index}`,
      title: stripExtension(file.name) || `第${index + 1}章`,
      volume: "第一卷",
      content: content.trim(),
      bookmarks: [],
      highlights: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  }
  return chapters;
}

function folderProjectTitle(files) {
  const first = [...files].find((file) => file.webkitRelativePath);
  if (!first) return "导入小说";
  return first.webkitRelativePath.split(/[\\/]/)[0] || "导入小说";
}

async function importFolderFiles(files, asNewProject = false) {
  const chapters = await filesToChapters(files);
  if (!chapters.length) {
    showToast("文件夹里没有找到 TXT 章节");
    return;
  }

  if (asNewProject || !project()) {
    const item = normalizeProject({
      ...createDefaultProject(`project-${Date.now()}`, folderProjectTitle(files)),
      chapters,
    });
    state.projects.push(item);
    state.activeProjectId = item.id;
    state.project = item;
    persist(true);
    bindInitialValues();
    render();
    showToast(`已导入 ${chapters.length} 个章节`);
    return;
  }

  const current = project();
  current.chapters.push(...chapters);
  current.activeChapterId = chapters[0].id;
  persist(true);
  render();
  showToast(`已追加 ${chapters.length} 个章节`);
}

async function importChapterFiles(files) {
  const chapters = await filesToChapters(files);
  if (!chapters.length) {
    showToast("没有找到 TXT 章节");
    return;
  }
  if (!project()) {
    const item = normalizeProject({
      ...createDefaultProject(`project-${Date.now()}`, stripExtension(files[0]?.name || "导入小说")),
      chapters,
    });
    state.projects.push(item);
    state.activeProjectId = item.id;
    state.project = item;
  } else {
    const current = project();
    current.chapters.push(...chapters);
    current.activeChapterId = chapters[0].id;
  }
  persist(true);
  bindInitialValues();
  render();
  showToast(`已导入 ${chapters.length} 个章节`);
}

function getSelectionText() {
  return els.editor.value.slice(els.editor.selectionStart, els.editor.selectionEnd).trim();
}

function getBookSummaryText() {
  return project().chapters
    .map((chapter, index) => {
      const summary = (chapter.summary || "").trim();
      return `第 ${index + 1} 章：${chapter.title || "未命名章节"}\n摘要：${summary || "暂无摘要，请先生成章节摘要"}`;
    })
    .join("\n\n");
}

function getSourceText(scope = "auto") {
  const selection = getSelectionText();
  const chapter = activeChapter();
  if (scope === "selection") return selection || chapter?.content.trim() || "";
  if (scope === "chapter") return chapter?.content.trim() || "";
  if (scope === "book") return getBookSummaryText();
  if (scope === "context") return "";
  return selection || chapter?.content.trim() || "";
}

function describeScope(scope = "auto") {
  const labels = {
    auto: "自动：优先当前选区，否则当前章节",
    selection: "仅当前选区",
    chapter: "当前章节",
    book: "全书章节摘要",
    context: "只使用设定与看板",
  };
  return labels[scope] || labels.auto;
}

function buildContext() {
  const current = project();
  const chapter = activeChapter();
  return [
    `Title: ${current.title || "Untitled"}`,
    `Genre: ${current.genre || "Unset"}`,
    `Current chapter: ${chapter?.title || "Untitled chapter"}`,
    `Target words per chapter: ${current.targetWords || "Unset"}`,
  ].join("\n");
}

const referenceLabels = {
  title: "作品名",
  genre: "类型/基调",
  targetWords: "单章目标字数",
  mainLine: "主线",
  branchLines: "支线",
  foreshadows: "当前伏笔",
  characters: "人物状态",
  roleCards: "角色卡",
  props: "道具",
  worldBackground: "世界背景",
  keySettings: "重要设定",
  outline: "总纲",
  volumeOutline: "卷纲",
  chapterOutline: "章纲",
  currentChapterSummary: "当前章节摘要",
  timeline: "时间线",
  foreshadowLedger: "伏笔回收表",
  beatPlan: "鼓点计划",
  emotionPlan: "情绪曲线",
  characterArc: "人物弧光",
  sceneCards: "场景卡",
  prev3Chapters: "前三章",
  next3Chapters: "后三章",
  notes: "灵感备注",
};

const optionalReferenceKeys = [
  "outline",
  "volumeOutline",
  "chapterOutline",
  "currentChapterSummary",
  "mainLine",
  "branchLines",
  "foreshadows",
  "foreshadowLedger",
  "beatPlan",
  "emotionPlan",
  "characters",
  "roleCards",
  "props",
  "worldBackground",
  "keySettings",
  "timeline",
  "sceneCards",
  "prev3Chapters",
  "next3Chapters",
];

const boardLabels = {
  outline: "总纲",
  volumeOutline: "卷纲",
  chapterOutline: "章纲",
  timeline: "时间线",
  foreshadowLedger: "伏笔表",
  beatPlan: "鼓点",
  emotionPlan: "情绪曲线",
  characterArc: "人物弧",
  sceneCards: "场景卡",
  notes: "灵感",
};

function getTaskConfig(action) {
  if (action?.startsWith("board:")) {
    const key = action.slice("board:".length);
    const label = boardLabels[key] || "创作看板";
    const outlineBoardConfigs = {
      outline: {
        refs: ["mainLine", "branchLines", "characters", "roleCards", "worldBackground", "keySettings", "notes"],
        instruction: "请生成或整理本书总纲。总纲只写全书核心设定、主线目标、终局方向、主要人物关系、关键谜底和不可违背的硬约束。总纲一旦确定，后续通常不要轻易调整；如果必须调整，请明确列出改动风险。",
      },
      volumeOutline: {
        refs: ["outline", "mainLine", "branchLines", "characters", "roleCards", "worldBackground", "keySettings", "timeline", "notes"],
        instruction: "请严格根据总纲生成或整理卷纲。不要反向改写总纲。每卷写清：卷名、卷目标、核心冲突、主要转折、人物阶段变化、伏笔投放与回收、结尾钩子。",
      },
      chapterOutline: {
        refs: ["outline", "volumeOutline", "chapterOutline", "currentChapterSummary", "mainLine", "branchLines", "characters", "roleCards", "worldBackground", "keySettings", "timeline", "prev3Chapters", "next3Chapters"],
        instruction: "请严格根据卷纲生成或整理章纲。每章写清：章名、对应分卷、目标、冲突、关键场面、人物变化、伏笔、结尾钩子。若依据章节摘要修订了某一章章纲，只反推调整后续章纲和必要的卷纲，不要轻易改动总纲。",
      },
    };
    const outlineConfig = outlineBoardConfigs[key] || {};
    return {
      title: `AI 写${label}`,
      icon: "board",
      desc: `根据作品上下文辅助生成或修改「${label}」内容，完成后会写回当前看板。`,
      refs: outlineConfig.refs || ["outline", "volumeOutline", "chapterOutline", "timeline", "mainLine", "branchLines", "foreshadows", "characters", "roleCards", "props", "worldBackground", "keySettings", "notes"],
      scope: "context",
      instruction: outlineConfig.instruction || `请生成或完善创作看板中的「${label}」。保留已有信息中合理的部分，补足缺口，结构清晰，方便后续写正文时直接参考。`,
      boardKey: key,
    };
  }
  return actionConfigs[action] || settingAiConfigs[action] || actionConfigs.continue;
}

function chapterReferenceExcerpt(chapter, index) {
  const summary = (chapter?.summary || "").trim();
  return [
    `第 ${index + 1} 章：${chapter?.title || "未命名章节"}`,
    `摘要：${summary || "暂无摘要，请先生成章节摘要"}`,
  ].join("\n");
}

function adjacentChaptersReference(direction) {
  const current = project();
  if (!current?.chapters?.length) return "";
  const activeIndex = current.chapters.findIndex((chapter) => chapter.id === current.activeChapterId);
  if (activeIndex < 0) return "";
  const range = direction === "prev"
    ? current.chapters.slice(Math.max(0, activeIndex - 3), activeIndex)
    : current.chapters.slice(activeIndex + 1, activeIndex + 4);
  const startIndex = direction === "prev" ? Math.max(0, activeIndex - 3) : activeIndex + 1;
  return range
    .map((chapter, offset) => chapterReferenceExcerpt(chapter, startIndex + offset))
    .join("\n\n");
}

function activeVolumeOutlineReference() {
  const current = project();
  if (!current) return "";
  const chapterBlock = findChapterOutlineBlock(current, activeChapterNumber());
  return findVolumeOutlineBlock(current, chapterBlock.volume || volumeName(activeChapter() || {})).text || "";
}

function activeChapterOutlineReference() {
  const current = project();
  if (!current) return "";
  return findChapterOutlineBlock(current, activeChapterNumber()).text || "";
}

function referenceValue(key) {
  const current = project();
  if (!current) return "";
  if (key === "currentChapterSummary") return activeChapter()?.summary || "";
  if (key === "prev3Chapters") return adjacentChaptersReference("prev");
  if (key === "next3Chapters") return adjacentChaptersReference("next");
  if (key === "volumeOutline") return activeVolumeOutlineReference() || current.volumeOutline || "";
  if (key === "chapterOutline") return activeChapterOutlineReference() || current.chapterOutline || "";
  return current[key] || "";
}

function buildReferenceContext(action) {
  const config = getTaskConfig(action);
  return (config.refs || [])
    .map((key) => {
      const value = referenceValue(key);
      const label = referenceLabels[key] || key;
      return `${label}：${value || "未设置"}`;
    })
    .join("\n");
}

function referenceHint(action) {
  const config = getTaskConfig(action);
  return (config.refs || []).map((key) => referenceLabels[key] || key).join("、");
}

function selectedReferenceKeys(action, selectedRefs = null) {
  const refs = optionalReferenceKeys;
  if (Array.isArray(selectedRefs)) return selectedRefs.filter((key) => refs.includes(key));
  return currentDialogAction === action ? currentDialogSelectedRefs.filter((key) => refs.includes(key)) : [];
}

function buildSelectedReferenceContext(action, selectedRefs = null) {
  return selectedReferenceKeys(action, selectedRefs)
    .map((key) => {
      const value = referenceValue(key);
      const label = referenceLabels[key] || key;
      return `${label}: ${value || "Unset"}`;
    })
    .join("\n");
}

function selectedReferenceHint(action, selectedRefs = null) {
  const selected = selectedReferenceKeys(action, selectedRefs);
  return selected.map((key) => referenceLabels[key] || key).join(", ");
}

function renderReferenceOptions(action) {
  if (!els.referenceOptions) return;
  const refs = optionalReferenceKeys;
  els.referenceOptions.innerHTML = "";
  currentDialogSelectedRefs = currentDialogSelectedRefs.filter((key) => refs.includes(key));
  if (!refs.length) {
    const hint = document.createElement("p");
    hint.className = "empty-hint";
    hint.textContent = "No optional references for this task.";
    els.referenceOptions.appendChild(hint);
    return;
  }
  refs.forEach((key) => {
    const label = document.createElement("label");
    label.className = "reference-option";
    const input = document.createElement("input");
    input.type = "checkbox";
    input.value = key;
    input.checked = currentDialogSelectedRefs.includes(key);
    const text = document.createElement("span");
    text.textContent = referenceLabels[key] || key;
    label.append(input, text);
    els.referenceOptions.appendChild(label);
  });
}

function setReferenceSelection(keys) {
  const refs = optionalReferenceKeys;
  currentDialogSelectedRefs = [...new Set(keys)].filter((key) => refs.includes(key));
  renderReferenceOptions(currentDialogAction);
  refreshPromptPreview();
}

function buildPrompt(options = {}) {
  const action = typeof options === "string" ? options : options.action || state.selectedAction;
  const config = getTaskConfig(action);
  const scope = typeof options === "object" ? options.scope || config.scope : config.scope;
  const text = getSourceText(scope);
  const globalExtra = els.aiInstruction.value.trim();
  const taskExtra = typeof options === "object" ? (options.extra || "").trim() : "";
  const extra = [globalExtra, taskExtra].filter(Boolean).join("\n");
  const selectedRefs = typeof options === "object" ? options.selectedRefs : null;
  const writingRequirements = els.writingRequirements?.value.trim() || state.ai.writingRequirements || "";

  return [
    "请直接完成本次小说写作任务。内容要具体、可执行，必要时提供示例文本。",
    "",
    "【作品上下文】",
    buildContext(),
    writingRequirements ? "【写作要求】" : "",
    writingRequirements,
    "",
    "【本任务重点参考】",
    buildSelectedReferenceContext(action, selectedRefs) || "No optional references selected.",
    "",
    "【作用范围】",
    describeScope(scope),
    "",
    "【任务】",
    `${config.title}：${config.instruction}`,
    extra ? `补充要求：${extra}` : "",
    "",
    "【当前文本】",
    text || "当前没有正文，请基于上下文生成。",
  ]
    .filter(Boolean)
    .join("\n");
}

function openAiTask(action = state.selectedAction) {
  const config = getTaskConfig(action);
  currentDialogAction = action;
  state.selectedAction = action;
  currentDialogSelectedRefs = (config.refs || []).filter((key) => optionalReferenceKeys.includes(key));
  persist();
  renderActionState();

  els.aiDialogTitle.innerHTML = `${iconMarkup(config.icon || "spark")}${escapeHtml(config.title)}`;
  els.aiDialogDesc.textContent = config.desc;
  renderReferenceOptions(action);
  els.aiReferenceHint.textContent = "Selected references: none";
  els.aiTaskScope.value = config.scope || "chapter";
  els.aiTaskInstruction.value = els.aiInstruction.value.trim() || config.placeholder || config.instruction || "";
  els.promptPreview.value = buildPrompt({
    action,
    scope: els.aiTaskScope.value,
    extra: els.aiTaskInstruction.value,
    selectedRefs: currentDialogSelectedRefs,
  });

  if (typeof els.aiTaskDialog.showModal === "function") {
    els.aiTaskDialog.showModal();
  } else {
    els.aiTaskDialog.setAttribute("open", "open");
  }
  applyTextareaHeights();
  bindTextareaResizePersistence();
  els.aiTaskInstruction.focus();
}

function refreshPromptPreview() {
  els.promptPreview.value = buildPrompt({
    action: currentDialogAction,
    scope: els.aiTaskScope.value,
    extra: els.aiTaskInstruction.value,
    selectedRefs: currentDialogSelectedRefs,
  });
  els.aiReferenceHint.textContent = `Selected references: ${selectedReferenceHint(currentDialogAction) || "none"}`;
}

function estimateTokens(text = "") {
  const source = String(text || "");
  if (!source) return 0;
  return Math.max(1, Math.ceil(source.length / 1.8));
}

function formatTokenUsage(usage, fallbackPrompt = "", fallbackCompletion = "") {
  if (usage?.total_tokens) {
    return `token 消耗：输入 ${usage.prompt_tokens || 0} · 输出 ${usage.completion_tokens || 0} · 总计 ${usage.total_tokens}`;
  }
  const promptTokens = estimateTokens(fallbackPrompt);
  const completionTokens = estimateTokens(fallbackCompletion);
  return `token 估算：输入 ${promptTokens} · 输出 ${completionTokens} · 总计 ${promptTokens + completionTokens}`;
}

function setAiProgress(message) {
  els.aiProgress.textContent = message;
}

function isAbortError(error) {
  return error?.name === "AbortError" || String(error?.message || "").toLowerCase().includes("abort");
}

function setAiStreamingState(isStreaming) {
  if (els.stopAiBtn) els.stopAiBtn.disabled = !isStreaming;
  if (els.runDialogAiBtn) els.runDialogAiBtn.disabled = isStreaming;
  if (els.runAiBtn) els.runAiBtn.disabled = isStreaming;
}

function setChatStreamingState(isStreaming) {
  if (els.stopChatBtn) els.stopChatBtn.disabled = !isStreaming;
  if (els.sendChatBtn) els.sendChatBtn.disabled = isStreaming;
}

function stopCurrentAi() {
  if (!activeAiAbortController) return;
  activeAiAbortController.abort();
  setAiProgress("正在停止当前 AI 输出...");
}

function stopCurrentChat() {
  if (!activeChatAbortController) return;
  activeChatAbortController.abort();
  els.chatProgress.textContent = "正在停止当前对话输出...";
}

function appendBoardEntry(boardKey, content, title) {
  const current = project();
  if (!current || !content.trim()) return;
  const entry = [`## ${title || "AI 生成内容"} · ${formatDateTime(Date.now())}`, "", content.trim()].join("\n");
  current[boardKey] = current[boardKey] ? `${entry}\n\n---\n\n${current[boardKey]}` : entry;
  if (current.activeBoard === boardKey) els.boardText.value = current[boardKey];
  persist(true);
}

function applyAiResultToReference(action, content) {
  const current = project();
  if (!current || !content.trim()) return;
  const config = getTaskConfig(action);
  if (config.boardKey && Object.prototype.hasOwnProperty.call(current, config.boardKey)) {
    if (activeBoardSlice?.boardKey === config.boardKey) {
      replaceBoardSlice(current, content.trim());
      els.boardText.value = content.trim();
    } else {
      current[config.boardKey] = content.trim();
      if (current.activeBoard === config.boardKey) els.boardText.value = current[config.boardKey];
    }
    persist(true);
    renderOutlineList();
    showToast("AI 内容已写入创作看板");
    return;
  }
  if (settingAiConfigs[action] && Object.prototype.hasOwnProperty.call(current, action)) {
    current[action] = content.trim();
    if (els[action]) els[action].value = current[action];
    persist(true);
    showToast("AI 内容已写入对应设定");
    return;
  }
  if (action === "scene") {
    const chapter = activeChapter();
    if (!chapter) return;
    chapter.summary = content.trim();
    chapter.updatedAt = Date.now();
    persist(true);
    renderChapterSummaryList();
    renderChapterSummaryEditor();
    renderChapterList();
    showToast("章节摘要已保存");
  }
}

async function readStreamingChat(response, prompt, config) {
  const reader = response.body?.getReader();
  if (!reader) {
    const data = await response.json();
    const content = data.choices?.[0]?.message?.content?.trim() || "";
    return { content, usage: data.usage || null };
  }

  const decoder = new TextDecoder("utf-8");
  let buffer = "";
  let content = "";
  let usage = null;
  let lastPaint = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const events = buffer.split("\n\n");
      buffer = events.pop() || "";

      for (const eventText of events) {
        const dataLines = eventText
          .split("\n")
          .map((line) => line.trim())
          .filter((line) => line.startsWith("data:"))
          .map((line) => line.slice(5).trim());

        for (const dataLine of dataLines) {
          if (!dataLine || dataLine === "[DONE]") continue;
          try {
            const payload = JSON.parse(dataLine);
            if (payload.usage) usage = payload.usage;
            const delta = payload.choices?.[0]?.delta?.content || "";
            if (delta) content += delta;
          } catch {
            // Some compatible providers may send heartbeat lines; skip unparsable chunks.
          }
        }
      }

      const now = Date.now();
      if (now - lastPaint > 80) {
        els.aiResult.textContent = content || `正在等待「${config.title}」开始输出...`;
        setAiProgress(`流式输出中 · 已接收 ${content.length} 字 · ${formatTokenUsage(usage, prompt, content)}`);
        lastPaint = now;
      }
    }
  } catch (error) {
    if (isAbortError(error)) return { content: content.trim(), usage, aborted: true };
    throw error;
  }

  if (buffer.trim()) {
    const tailLines = buffer
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.startsWith("data:"))
      .map((line) => line.slice(5).trim());
    for (const line of tailLines) {
      if (!line || line === "[DONE]") continue;
      try {
        const payload = JSON.parse(line);
        if (payload.usage) usage = payload.usage;
        content += payload.choices?.[0]?.delta?.content || "";
      } catch {
        // Ignore trailing non-JSON data.
      }
    }
  }

  return { content: content.trim(), usage, aborted: false };
}

async function runProfileStreamingChat(profile, messages, onUpdate, signal = null) {
  const { baseUrl, modelName, apiKey } = profile || {};
  if (!baseUrl || !modelName || !apiKey) throw new Error("AI 配置不完整");
  const endpoint = `${baseUrl.replace(/\/$/, "")}/chat/completions`;
  const requestBody = {
    model: modelName,
    messages,
    temperature: normalizeTemperature(profile.temperature),
    stream: true,
    stream_options: { include_usage: true },
  };
  const requestHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
  };
  let response = await fetch(endpoint, {
    method: "POST",
    headers: requestHeaders,
    body: JSON.stringify(requestBody),
    signal,
  });
  if (!response.ok && (response.status === 400 || response.status === 422)) {
    delete requestBody.stream_options;
    response = await fetch(endpoint, {
      method: "POST",
      headers: requestHeaders,
      body: JSON.stringify(requestBody),
      signal,
    });
  }
  if (!response.ok) throw new Error(await response.text() || `HTTP ${response.status}`);

  const reader = response.body?.getReader();
  if (!reader) {
    const data = await response.json();
    const content = data.choices?.[0]?.message?.content?.trim() || "";
    onUpdate(content, data.usage || null);
    return { content, usage: data.usage || null };
  }

  const decoder = new TextDecoder("utf-8");
  let buffer = "";
  let content = "";
  let usage = null;
  let lastPaint = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const events = buffer.split("\n\n");
      buffer = events.pop() || "";
      for (const eventText of events) {
        const dataLines = eventText
          .split("\n")
          .map((line) => line.trim())
          .filter((line) => line.startsWith("data:"))
          .map((line) => line.slice(5).trim());
        for (const dataLine of dataLines) {
          if (!dataLine || dataLine === "[DONE]") continue;
          try {
            const payload = JSON.parse(dataLine);
            if (payload.usage) usage = payload.usage;
            content += payload.choices?.[0]?.delta?.content || "";
          } catch {
            // Ignore provider heartbeat chunks.
          }
        }
      }
      const now = Date.now();
      if (now - lastPaint > 80) {
        onUpdate(content, usage);
        lastPaint = now;
      }
    }
  } catch (error) {
    if (isAbortError(error)) {
      onUpdate(content, usage);
      return { content: content.trim(), usage, aborted: true };
    }
    throw error;
  }
  onUpdate(content, usage);
  return { content: content.trim(), usage, aborted: false };
}

async function runAi(options = {}) {
  if (activeAiAbortController) {
    showToast("已有 AI 任务正在输出");
    return;
  }
  const normalized = typeof options === "string" ? { action: options } : options;
  const action = normalized.action || state.selectedAction;
  const prompt = normalized.prompt || buildPrompt({
    action,
    scope: normalized.scope,
    extra: normalized.extra,
    selectedRefs: normalized.selectedRefs,
  });
  const config = getTaskConfig(action);
  const { baseUrl, modelName, apiKey } = state.ai;
  const systemPrompt = state.ai.systemPrompt || DEFAULT_ASSISTANT_SYSTEM_PROMPT;
  const temperature = normalizeTemperature(state.ai.temperature);
  const promptForUsage = `${systemPrompt}\n${prompt}`;
  els.aiResult.textContent = `正在准备「${config.title}」...`;
  setAiProgress("准备请求 AI 服务");

  if (!baseUrl || !modelName || !apiKey) {
    els.aiResult.textContent = `尚未完整配置 AI 服务。以下是「${config.title}」已整理好的提示词：\n\n【系统提示词】\n${systemPrompt}\n\n【用户提示词】\n${prompt}`;
    setAiProgress(`未配置 API · ${formatTokenUsage(null, promptForUsage, "")}`);
    showToast("已生成提示词");
    return;
  }

  activeAiAbortController = new AbortController();
  setAiStreamingState(true);
  els.aiResult.textContent = "";
  setAiProgress(`正在连接「${config.title}」...`);
  try {
    const endpoint = `${baseUrl.replace(/\/$/, "")}/chat/completions`;
    const requestBody = {
      model: modelName,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
      temperature,
      stream: true,
      stream_options: { include_usage: true },
    };
    const requestHeaders = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    };
    let response = await fetch(endpoint, {
      method: "POST",
      headers: requestHeaders,
      body: JSON.stringify(requestBody),
      signal: activeAiAbortController.signal,
    });

    if (!response.ok) {
      const firstError = await response.text();
      if (response.status === 400 || response.status === 422) {
        delete requestBody.stream_options;
        response = await fetch(endpoint, {
          method: "POST",
          headers: requestHeaders,
          body: JSON.stringify(requestBody),
          signal: activeAiAbortController.signal,
        });
      }
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || firstError || `HTTP ${response.status}`);
      }
    }

    const { content, usage, aborted } = await readStreamingChat(response, promptForUsage, config);
    els.aiResult.textContent = content || "没有收到可用内容。";
    if (aborted) {
      setAiProgress(`已停止 · 保留已接收 ${content.length} 字 · ${formatTokenUsage(usage, promptForUsage, content)}`);
      showToast("AI 输出已停止");
    } else {
      setAiProgress(`AI 完成 · ${formatTokenUsage(usage, promptForUsage, content)}`);
      applyAiResultToReference(action, content);
      showToast("AI 任务完成");
    }
  } catch (error) {
    if (isAbortError(error)) {
      const content = els.aiResult.textContent.trim();
      setAiProgress(`已停止 · 保留已接收 ${content.length} 字 · ${formatTokenUsage(null, promptForUsage, content)}`);
      showToast("AI 输出已停止");
    } else {
      els.aiResult.textContent = `请求失败：${error.message}\n\n你仍可复制以下提示词手动使用：\n\n${prompt}`;
      setAiProgress(`请求失败 · ${formatTokenUsage(null, promptForUsage, "")}`);
      showToast("AI 请求失败");
    }
  } finally {
    activeAiAbortController = null;
    setAiStreamingState(false);
  }
}

async function runDialogAi() {
  const options = {
    action: currentDialogAction,
    scope: els.aiTaskScope.value,
    extra: els.aiTaskInstruction.value,
    selectedRefs: currentDialogSelectedRefs,
    prompt: els.promptPreview.value,
  };
  if (els.aiTaskDialog.open) els.aiTaskDialog.close();
  await runAi({
    ...options,
  });
}

function selectedChatProfile() {
  const profileId = state.ai.chat?.profileId || state.ai.activeProfileId;
  return state.ai.profiles.find((profile) => profile.id === profileId) || activeAiProfile();
}

function updateChatField(key, value) {
  state.ai.chat = state.ai.chat || structuredClone(defaultState.ai.chat);
  state.ai.chat[key] = value;
  persist();
}

async function runChatAi() {
  if (activeChatAbortController) {
    showToast("AI 对话正在输出");
    return;
  }
  const text = els.chatInput.value.trim();
  if (!text) {
    showToast("请输入对话内容");
    return;
  }
  state.ai.chat = state.ai.chat || structuredClone(defaultState.ai.chat);
  state.ai.chat.profileId = els.chatProfileSelect.value || state.ai.chat.profileId || state.ai.activeProfileId;
  state.ai.chat.useSystemPrompt = !!els.chatUseSystemPrompt.checked;
  state.ai.chat.systemPrompt = els.chatSystemPrompt.value.trim() || defaultState.ai.chat.systemPrompt;
  const profile = selectedChatProfile();
  const userMessage = { role: "user", content: text };
  state.ai.chat.messages = [...(state.ai.chat.messages || []), userMessage].slice(-20);
  persist();
  els.chatInput.value = "";
  renderChatMessages();
  activeChatAbortController = new AbortController();
  setChatStreamingState(true);
  els.chatProgress.textContent = `正在连接 ${profile?.name || "AI"}...`;

  const requestMessages = [];
  if (state.ai.chat.useSystemPrompt && state.ai.chat.systemPrompt) {
    requestMessages.push({ role: "system", content: state.ai.chat.systemPrompt });
  }
  requestMessages.push(...state.ai.chat.messages);

  try {
    const promptForUsage = requestMessages.map((message) => message.content).join("\n");
    const { content, usage, aborted } = await runProfileStreamingChat(profile, requestMessages, (partial, currentUsage) => {
      renderChatMessages(partial || "正在等待输出...");
      els.chatProgress.textContent = `流式输出中 · 已接收 ${partial.length} 字 · ${formatTokenUsage(currentUsage, promptForUsage, partial)}`;
    }, activeChatAbortController.signal);
    if (content) {
      state.ai.chat.messages = [...state.ai.chat.messages, { role: "assistant", content }].slice(-20);
      persist(true);
    }
    renderChatMessages();
    els.chatProgress.textContent = aborted
      ? `已停止 · 保留已接收 ${content.length} 字 · ${formatTokenUsage(usage, promptForUsage, content)}`
      : `AI 对话完成 · ${formatTokenUsage(usage, promptForUsage, content)}`;
    if (aborted) showToast("AI 对话已停止");
  } catch (error) {
    renderChatMessages();
    if (isAbortError(error)) {
      els.chatProgress.textContent = "AI 对话已停止";
      showToast("AI 对话已停止");
    } else {
      els.chatProgress.textContent = `对话失败 · ${error.message}`;
      showToast("AI 对话失败");
    }
  } finally {
    activeChatAbortController = null;
    setChatStreamingState(false);
  }
}

function clearChat() {
  state.ai.chat = state.ai.chat || structuredClone(defaultState.ai.chat);
  state.ai.chat.messages = [];
  persist(true);
  renderChatMessages();
  els.chatProgress.textContent = "对话已清空";
}

async function copyChat() {
  const messages = state.ai.chat?.messages || [];
  if (!messages.length) {
    showToast("没有可复制的对话");
    return;
  }
  const text = messages.map((message) => `${message.role === "user" ? "你" : "AI"}：\n${message.content}`).join("\n\n");
  await navigator.clipboard.writeText(text);
  showToast("对话已复制");
}

function insertResult() {
  const result = els.aiResult.textContent.trim();
  if (!result || result.startsWith("AI 结果会显示")) {
    showToast("没有可插入的内容");
    return;
  }
  const editor = els.editor;
  const start = editor.selectionStart;
  const end = editor.selectionEnd;
  const prefix = editor.value.slice(0, start);
  const suffix = editor.value.slice(end);
  const insertion = `${start > 0 && !prefix.endsWith("\n") ? "\n\n" : ""}${result}${suffix && !result.endsWith("\n") ? "\n\n" : ""}`;
  editor.value = prefix + insertion + suffix;
  const cursor = prefix.length + insertion.length;
  editor.setSelectionRange(cursor, cursor);
  syncActiveChapter({ content: editor.value });
  editor.focus();
}

async function copyResult() {
  const result = els.aiResult.textContent.trim();
  if (!result) {
    showToast("没有可复制的内容");
    return;
  }
  try {
    await navigator.clipboard.writeText(result);
    showToast("已复制");
  } catch {
    showToast("复制失败，可以手动选中复制");
  }
}

async function testAiConnectivity() {
  updateAiField("baseUrl", els.baseUrl.value.trim());
  updateAiField("modelName", els.modelName.value.trim());
  updateAiField("apiKey", els.apiKey.value.trim());
  updateAiField("systemPrompt", els.aiSystemPrompt?.value.trim() || DEFAULT_ASSISTANT_SYSTEM_PROMPT);
  updateAiField("temperature", els.aiTemperatureNumber?.value || els.aiTemperature?.value);
  persist(true);

  const { baseUrl, modelName, apiKey } = state.ai;
  if (!baseUrl || !modelName || !apiKey) {
    setAiProgress("测试失败 · 请先填写接口地址、模型和 API Key");
    showToast("AI 配置不完整");
    return;
  }

  const oldTitle = els.testAiBtn.title;
  els.testAiBtn.title = "测试中";
  els.testAiBtn.setAttribute("aria-label", "测试中");
  els.testAiBtn.disabled = true;
  setAiProgress("正在测试 AI 服务联通性...");

  try {
    const response = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: modelName,
        messages: [{ role: "user", content: "ping" }],
        max_tokens: 1,
        temperature: 0,
      }),
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `HTTP ${response.status}`);
    }
    setAiProgress("AI 服务联通 OK · 配置已保存");
    showToast("AI 服务 OK，已保存");
  } catch (error) {
    setAiProgress(`测试失败 · ${error.message}`);
    showToast("AI 服务测试失败");
  } finally {
    els.testAiBtn.title = oldTitle || "测试 AI 服务";
    els.testAiBtn.setAttribute("aria-label", els.testAiBtn.title);
    els.testAiBtn.disabled = false;
  }
}

function activeAiProfile() {
  return state.ai.profiles.find((profile) => profile.id === state.ai.activeProfileId) || state.ai.profiles[0];
}

function syncAiBehaviorFields() {
  const temperature = normalizeTemperature(state.ai.temperature);
  if (els.aiSystemPrompt) els.aiSystemPrompt.value = state.ai.systemPrompt || DEFAULT_ASSISTANT_SYSTEM_PROMPT;
  if (els.aiTemperature) els.aiTemperature.value = String(temperature);
  if (els.aiTemperatureNumber) els.aiTemperatureNumber.value = String(temperature);
  if (els.writingRequirementPreset) els.writingRequirementPreset.value = state.ai.writingRequirementPreset || "easyUrban";
  if (els.writingRequirements) els.writingRequirements.value = state.ai.writingRequirements || DEFAULT_WRITING_REQUIREMENTS;
}

function syncAiFieldsFromProfile() {
  const profile = activeAiProfile();
  if (!profile) return;
  state.ai.providerPreset = profile.providerPreset;
  state.ai.baseUrl = profile.baseUrl;
  state.ai.modelName = profile.modelName;
  state.ai.apiKey = profile.apiKey;
  state.ai.systemPrompt = profile.systemPrompt || DEFAULT_ASSISTANT_SYSTEM_PROMPT;
  state.ai.temperature = normalizeTemperature(profile.temperature);
  els.aiProfileName.value = profile.name || "";
  els.providerPreset.value = profile.providerPreset;
  els.baseUrl.value = profile.baseUrl;
  els.modelName.value = profile.modelName;
  els.apiKey.value = profile.apiKey;
  syncAiBehaviorFields();
}

function renderAiProfiles() {
  if (!els.aiProfileSelect) return;
  els.aiProfileSelect.innerHTML = "";
  state.ai.profiles.forEach((profile) => {
    const option = document.createElement("option");
    option.value = profile.id;
    option.textContent = profile.name || "未命名配置";
    option.selected = profile.id === state.ai.activeProfileId;
    els.aiProfileSelect.appendChild(option);
  });
  syncAiFieldsFromProfile();
  renderChatPanel();
}

function renderChatPanel() {
  const chat = state.ai.chat || defaultState.ai.chat;
  if (els.chatProfileSelect) {
    els.chatProfileSelect.innerHTML = "";
    state.ai.profiles.forEach((profile) => {
      const option = document.createElement("option");
      option.value = profile.id;
      option.textContent = profile.name || "未命名配置";
      option.selected = profile.id === chat.profileId;
      els.chatProfileSelect.appendChild(option);
    });
    if (!state.ai.profiles.some((profile) => profile.id === chat.profileId) && state.ai.profiles[0]) {
      chat.profileId = state.ai.profiles[0].id;
      els.chatProfileSelect.value = chat.profileId;
    }
  }
  if (els.chatUseSystemPrompt) els.chatUseSystemPrompt.checked = !!chat.useSystemPrompt;
  if (els.chatSystemPrompt) {
    els.chatSystemPrompt.value = chat.systemPrompt || defaultState.ai.chat.systemPrompt;
    els.chatSystemPrompt.disabled = !chat.useSystemPrompt;
  }
  renderChatMessages();
}

function renderChatMessages(streamingContent = "") {
  if (!els.chatMessages) return;
  const messages = [...(state.ai.chat?.messages || [])];
  if (streamingContent) messages.push({ role: "assistant", content: streamingContent });
  if (!messages.length) {
    els.chatMessages.textContent = "No chat yet.";
    return;
  }
  els.chatMessages.innerHTML = messages.map((message) => (
    `<div class="chat-message ${message.role}"><strong>${message.role === "user" ? "You" : "AI"}</strong><p>${escapeHtml(message.content)}</p></div>`
  )).join("");
  els.chatMessages.scrollTop = els.chatMessages.scrollHeight;
}

function saveCurrentAiProfile() {
  let profile = activeAiProfile();
  if (!profile) {
    profile = { id: `ai-profile-${Date.now()}`, name: "默认配置", providerPreset: "custom", baseUrl: "", modelName: "", apiKey: "" };
    state.ai.profiles.push(profile);
    state.ai.activeProfileId = profile.id;
  }
  profile.name = els.aiProfileName.value.trim() || profile.name || "未命名配置";
  profile.providerPreset = els.providerPreset.value;
  profile.baseUrl = els.baseUrl.value.trim();
  profile.modelName = els.modelName.value.trim();
  profile.apiKey = els.apiKey.value.trim();
  profile.systemPrompt = els.aiSystemPrompt?.value.trim() || DEFAULT_ASSISTANT_SYSTEM_PROMPT;
  profile.temperature = normalizeTemperature(els.aiTemperatureNumber?.value || els.aiTemperature?.value);
  state.ai.providerPreset = profile.providerPreset;
  state.ai.baseUrl = profile.baseUrl;
  state.ai.modelName = profile.modelName;
  state.ai.apiKey = profile.apiKey;
  state.ai.systemPrompt = profile.systemPrompt;
  state.ai.temperature = profile.temperature;
  persist(true);
  renderAiProfiles();
  showToast("AI 配置已保存");
}

function newAiProfile() {
  const name = `AI 配置 ${state.ai.profiles.length + 1}`;
  const profile = {
    id: `ai-profile-${Date.now()}`,
    name,
    providerPreset: els.providerPreset.value || "custom",
    baseUrl: els.baseUrl.value.trim(),
    modelName: els.modelName.value.trim(),
    apiKey: els.apiKey.value.trim(),
    systemPrompt: els.aiSystemPrompt?.value.trim() || DEFAULT_ASSISTANT_SYSTEM_PROMPT,
    temperature: normalizeTemperature(els.aiTemperatureNumber?.value || els.aiTemperature?.value),
  };
  state.ai.profiles.push(profile);
  state.ai.activeProfileId = profile.id;
  persist(true);
  renderAiProfiles();
  els.aiProfileName.focus();
  els.aiProfileName.select();
  showToast("AI 配置已新建，可直接改名称");
}

function deleteAiProfile() {
  if (state.ai.profiles.length <= 1) {
    showToast("至少保留一个 AI 配置");
    return;
  }
  const profile = activeAiProfile();
  if (!window.confirm(`删除「${profile.name}」这个 AI 配置吗？`)) return;
  state.ai.profiles = state.ai.profiles.filter((item) => item.id !== profile.id);
  state.ai.activeProfileId = state.ai.profiles[0].id;
  persist(true);
  renderAiProfiles();
  showToast("AI 配置已删除");
}

function switchAiProfile(profileId) {
  if (!state.ai.profiles.some((profile) => profile.id === profileId)) return;
  state.ai.activeProfileId = profileId;
  syncAiFieldsFromProfile();
  persist(true);
}

function applyProviderPreset() {
  const preset = providerPresets[els.providerPreset.value];
  state.ai.providerPreset = els.providerPreset.value;
  const profile = activeAiProfile();
  if (profile) profile.providerPreset = els.providerPreset.value;
  if (preset && els.providerPreset.value !== "custom") {
    state.ai.baseUrl = preset.baseUrl;
    state.ai.modelName = preset.model;
    els.baseUrl.value = preset.baseUrl;
    els.modelName.value = preset.model;
    if (profile) {
      profile.baseUrl = preset.baseUrl;
      profile.modelName = preset.model;
    }
  }
  persist();
}

function bindEvents() {
  els.projectTitle.addEventListener("input", (event) => updateProjectField("title", event.target.value));
  els.genre.addEventListener("input", (event) => updateProjectField("genre", event.target.value));
  els.targetWords.addEventListener("input", (event) => updateProjectField("targetWords", Number(event.target.value) || 0));
  document.addEventListener("click", (event) => {
    const toggle = event.target.closest("[data-collapse-section]");
    if (!toggle) return;
    toggleSectionCollapse(toggle.dataset.collapseSection);
  });

  els.mainLine.addEventListener("input", (event) => updateProjectField("mainLine", event.target.value));
  els.branchLines.addEventListener("input", (event) => updateProjectField("branchLines", event.target.value));
  els.foreshadows.addEventListener("input", (event) => updateProjectField("foreshadows", event.target.value));
  els.characters.addEventListener("input", (event) => updateProjectField("characters", event.target.value));
  els.roleCards.addEventListener("input", (event) => updateProjectField("roleCards", event.target.value));
  els.props.addEventListener("input", (event) => updateProjectField("props", event.target.value));
  els.worldBackground.addEventListener("input", (event) => updateProjectField("worldBackground", event.target.value));
  els.keySettings.addEventListener("input", (event) => updateProjectField("keySettings", event.target.value));
  els.saveStoryBtn.addEventListener("click", () => {
    persist(true);
    showToast("剧情控制已保存");
  });
  document.querySelectorAll("[data-setting-ai]").forEach((button) => {
    button.addEventListener("click", () => openAiTask(button.dataset.settingAi));
  });

  els.boardTabs.forEach((button) => {
    button.addEventListener("click", () => {
      const current = project();
      commitBoardText();
      current.activeBoard = button.dataset.board;
      activeBoardSlice = null;
      persist();
      renderBoardState();
      renderOutlineList();
    });
  });
  els.boardText.addEventListener("input", (event) => {
    const current = project();
    const key = current.activeBoard;
    if (activeBoardSlice) {
      replaceBoardSlice(current, event.target.value);
      persist();
      renderOutlineList();
      return;
    }
    updateProjectField(key, event.target.value);
    if (["outline", "volumeOutline", "chapterOutline"].includes(key)) renderOutlineList();
  });
  els.saveBoardBtn.addEventListener("click", () => {
    commitBoardText();
    persist(true);
    showToast("创作看板已保存");
  });
  els.boardAiBtn.addEventListener("click", () => {
    const current = project();
    if (!current) return;
    commitBoardText();
    openAiTask(`board:${current.activeBoard}`);
  });

  els.providerPreset.addEventListener("change", applyProviderPreset);
  els.aiProfileSelect.addEventListener("change", (event) => switchAiProfile(event.target.value));
  els.aiProfileName.addEventListener("input", (event) => {
    const profile = activeAiProfile();
    if (!profile) return;
    profile.name = event.target.value;
    [...els.aiProfileSelect.options].forEach((option) => {
      if (option.value === profile.id) option.textContent = profile.name || "未命名配置";
    });
  });
  els.newAiProfileBtn.addEventListener("click", newAiProfile);
  els.saveAiProfileBtn.addEventListener("click", saveCurrentAiProfile);
  els.deleteAiProfileBtn.addEventListener("click", deleteAiProfile);
  els.baseUrl.addEventListener("input", (event) => updateAiField("baseUrl", event.target.value));
  els.modelName.addEventListener("input", (event) => updateAiField("modelName", event.target.value));
  els.apiKey.addEventListener("input", (event) => updateAiField("apiKey", event.target.value));
  els.aiSystemPrompt.addEventListener("input", (event) => updateAiField("systemPrompt", event.target.value.trim() || DEFAULT_ASSISTANT_SYSTEM_PROMPT));
  els.aiTemperature.addEventListener("input", (event) => updateAiTemperature(event.target.value));
  els.aiTemperatureNumber.addEventListener("input", (event) => updateAiTemperature(event.target.value));
  els.testAiBtn.addEventListener("click", testAiConnectivity);
  els.writingRequirementPreset.addEventListener("change", (event) => {
    state.ai.writingRequirementPreset = event.target.value;
    if (event.target.value === "easyUrban") state.ai.writingRequirements = DEFAULT_WRITING_REQUIREMENTS;
    syncAiBehaviorFields();
    refreshPromptPreviewIfOpen();
    persist();
  });
  els.writingRequirements.addEventListener("input", (event) => updateWritingRequirements(event.target.value));
  els.chatProfileSelect.addEventListener("change", (event) => updateChatField("profileId", event.target.value));
  els.chatUseSystemPrompt.addEventListener("change", (event) => {
    updateChatField("useSystemPrompt", event.target.checked);
    els.chatSystemPrompt.disabled = !event.target.checked;
  });
  els.chatSystemPrompt.addEventListener("input", (event) => updateChatField("systemPrompt", event.target.value));
  els.sendChatBtn.addEventListener("click", runChatAi);
  els.stopChatBtn.addEventListener("click", stopCurrentChat);
  els.clearChatBtn.addEventListener("click", clearChat);
  els.copyChatBtn.addEventListener("click", copyChat);
  els.chatInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      runChatAi();
    }
  });

  els.editorFontSelect.addEventListener("change", (event) => updateEditorPreference("fontFamily", event.target.value));
  els.editorTextColor.addEventListener("input", (event) => updateEditorPreference("textColor", event.target.value));
  els.editorBgColor.addEventListener("input", (event) => updateEditorPreference("bgColor", event.target.value));
  els.chooseFontFolderBtn.addEventListener("click", () => els.fontFolderInput.click());
  els.fontFolderInput.addEventListener("change", async (event) => {
    await importFontFiles(event.target.files);
    event.target.value = "";
  });
  els.resetEditorStyleBtn.addEventListener("click", resetEditorPreferences);

  els.chapterList.addEventListener("click", (event) => {
    const volumeHeader = event.target.closest(".volume-header");
    if (volumeHeader) {
      toggleVolume(volumeHeader.dataset.volume);
      return;
    }
    const item = event.target.closest(".chapter-item");
    if (!item) return;
    project().activeChapterId = item.dataset.id;
    persist(true);
    render();
  });
  els.chapterSummaryList.addEventListener("click", (event) => {
    const item = event.target.closest(".chapter-summary-item");
    if (!item) return;
    project().activeChapterId = item.dataset.id;
    persist(true);
    render();
  });
  els.saveChapterSummaryBtn.addEventListener("click", saveChapterSummary);
  els.clearChapterSummaryBtn.addEventListener("click", clearChapterSummary);
  els.chapterSummaryEditor.addEventListener("keydown", (event) => {
    if (event.key.toLowerCase() === "s" && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      saveChapterSummary();
    }
  });
  els.chapterList.addEventListener("contextmenu", (event) => {
    const chapterItem = event.target.closest(".chapter-item");
    if (chapterItem) {
      showContextMenu(event, [{ label: "重命名章节名称", action: () => renameChapter(chapterItem.dataset.id) }]);
      return;
    }
    const volumeHeader = event.target.closest(".volume-header");
    if (volumeHeader?.dataset.volume) {
      showContextMenu(event, [{ label: "重命名分卷", action: () => renameVolume(volumeHeader.dataset.volume) }]);
    }
  });
  els.chapterList.addEventListener("dragstart", (event) => {
    const item = event.target.closest(".chapter-item");
    if (!item) return;
    draggedChapterId = item.dataset.id;
    item.classList.add("dragging");
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", draggedChapterId);
  });
  els.chapterList.addEventListener("dragover", (event) => {
    if (!draggedChapterId) return;
    const target = event.target.closest(".chapter-item, .volume-header");
    if (!target) return;
    event.preventDefault();
    clearDropTargets();
    target.classList.add("drop-target");
  });
  els.chapterList.addEventListener("drop", (event) => {
    if (!draggedChapterId) return;
    const chapterTarget = event.target.closest(".chapter-item");
    const volumeTarget = event.target.closest(".volume-header");
    event.preventDefault();
    if (chapterTarget && chapterTarget.dataset.id !== draggedChapterId) {
      moveChapterTo(draggedChapterId, { beforeChapterId: chapterTarget.dataset.id, volume: chapterTarget.dataset.volume });
    } else if (volumeTarget?.dataset.dropVolume) {
      moveChapterTo(draggedChapterId, { volume: volumeTarget.dataset.dropVolume });
    }
    draggedChapterId = "";
    clearDropTargets();
  });
  els.chapterList.addEventListener("dragend", () => {
    draggedChapterId = "";
    clearDropTargets();
  });
  document.addEventListener("click", (event) => {
    if (!event.target.closest("#contextMenu")) closeContextMenu();
  });

  els.projectSelect.addEventListener("change", (event) => switchProject(event.target.value));
  els.editOutlineBtn.addEventListener("click", () => openOutlineEditor(0, "outline"));
  els.importOutlineBtn.addEventListener("click", async () => {
    if (await ensureDataDirReady()) els.importOutlineFile.click();
  });
  els.importOutlineFile.addEventListener("change", (event) => importOutlineIntoCurrentProject(event.target.files[0]));
  els.clearOutlineBtn.addEventListener("click", clearCurrentOutline);
  els.outlineList.addEventListener("click", (event) => {
    const volume = event.target.closest("[data-outline-volume]");
    if (volume) {
      toggleVolume(volume.dataset.outlineVolume);
      renderOutlineList();
      return;
    }
    const item = event.target.closest("[data-outline-line]");
    if (!item) return;
    openOutlineEditor(Number(item.dataset.outlineLine) || 0, item.dataset.outlineBoard || "outline", Number(item.dataset.outlineEnd) || 0);
  });
  els.projectList.addEventListener("click", (event) => {
    const item = event.target.closest(".project-item");
    if (!item) return;
    switchProject(item.dataset.id);
  });
  els.recentProjectList.addEventListener("click", (event) => {
    const item = event.target.closest(".recent-project");
    if (!item) return;
    switchProject(item.dataset.id);
  });
  els.homeBtn.addEventListener("click", goHome);
  els.homeChooseDataDirBtn.addEventListener("click", chooseDataDir);
  els.chooseDataDirBtn.addEventListener("click", chooseDataDir);
  els.homeNewProjectBtn.addEventListener("click", () => newProject());
  els.homeImportFileBtn.addEventListener("click", async () => {
    if (await ensureDataDirReady()) els.importFile.click();
  });
  els.homeImportFolderBtn.addEventListener("click", async () => {
    if (await ensureDataDirReady()) els.importFolderFile.click();
  });
  els.openHomeProjectBtn.addEventListener("click", openSelectedHomeProject);
  els.homeProjectSelect.addEventListener("change", openSelectedHomeProject);
  els.newProjectBtn.addEventListener("click", () => newProject());
  els.deleteProjectBtn.addEventListener("click", deleteProject);

  els.snapshotList.addEventListener("click", (event) => {
    const deleteTarget = event.target.closest("[data-delete-snapshot]");
    if (deleteTarget) {
      event.stopPropagation();
      deleteSnapshot(deleteTarget.dataset.deleteSnapshot);
      return;
    }
    const item = event.target.closest(".snapshot-item");
    if (!item) return;
    restoreSnapshot(item.dataset.id);
  });

  els.addChapterBtn.addEventListener("click", () => addChapter());
  els.applyVolumeBtn.addEventListener("click", updateActiveChapterVolume);
  els.addVolumeBtn.addEventListener("click", addVolume);
  els.deleteVolumeBtn.addEventListener("click", deleteActiveVolume);
  els.chapterVolume.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      updateActiveChapterVolume();
    }
  });
  els.chapterVolume.addEventListener("change", updateActiveChapterVolume);
  els.deleteChapterBtn.addEventListener("click", deleteActiveChapter);
  els.exportBtn.addEventListener("click", exportNovel);
  els.toggleLeftPanelBtn.addEventListener("click", () => togglePanel("left"));
  els.toggleRightPanelBtn.addEventListener("click", () => togglePanel("right"));
  els.rightResizer.addEventListener("mousedown", startRightResize);
  window.addEventListener("resize", scheduleEditorMarkerRender);
  els.backupBtn.addEventListener("click", backupProject);
  els.importBtn.addEventListener("click", async () => {
    if (await ensureDataDirReady()) els.importFile.click();
  });
  els.importFile.addEventListener("change", (event) => importProject(event.target.files[0]));
  els.importChapterBtn.addEventListener("click", async () => {
    if (await ensureDataDirReady()) els.importChapterFile.click();
  });
  els.importFolderBtn.addEventListener("click", async () => {
    if (await ensureDataDirReady()) els.importFolderFile.click();
  });
  els.importChapterFile.addEventListener("change", async (event) => {
    await importChapterFiles(event.target.files);
    event.target.value = "";
  });
  els.importFolderFile.addEventListener("change", async (event) => {
    await importFolderFiles(event.target.files, !project());
    event.target.value = "";
  });
  els.snapshotBtn.addEventListener("click", saveSnapshot);

  els.chapterTitle.addEventListener("input", (event) => syncActiveChapter({ title: event.target.value }));
  els.editor.addEventListener("input", (event) => syncActiveChapter({ content: event.target.value }));
  els.editor.addEventListener("beforeinput", (event) => {
    if (event.inputType === "insertText" && event.data === '"') {
      event.preventDefault();
      insertChineseDoubleQuote();
    }
  });
  els.editor.addEventListener("select", renderCounts);
  document.addEventListener("selectionchange", () => {
    if (document.activeElement === els.editor) renderCounts();
  });
  els.editor.addEventListener("keydown", (event) => {
    if (event.key === '"') {
      event.preventDefault();
      insertChineseDoubleQuote();
      return;
    }
    requestAnimationFrame(renderCounts);
    setTimeout(renderCounts, 0);
  });
  els.editor.addEventListener("keyup", renderCounts);
  els.editor.addEventListener("mouseup", renderCounts);
  els.editor.addEventListener("scroll", syncEditorOverlayScroll);
  els.editor.addEventListener("wheel", () => scheduleEditorOverlaySync(), { passive: true });
  els.editor.addEventListener("pointerup", scheduleEditorOverlaySync);
  els.editor.addEventListener("contextmenu", showEditorContextMenu);
  els.editorWrap.addEventListener("scroll", syncEditorOverlayScroll);
  els.lineGutter.addEventListener("wheel", (event) => {
    els.editor.scrollTop += event.deltaY;
    els.editor.scrollLeft += event.deltaX;
    syncEditorOverlayScroll();
    event.preventDefault();
  });
  els.lineGutter.addEventListener("click", (event) => {
    const button = event.target.closest("[data-line]");
    if (!button) return;
    toggleBookmarkLine(Number(button.dataset.line));
  });
  els.bookmarkJumpBtn.addEventListener("mousedown", (event) => event.preventDefault());
  els.bookmarkJumpBtn.addEventListener("click", (event) => {
    event.preventDefault();
    jumpToNextBookmark();
  });

  els.splitSelectionBtn.addEventListener("click", splitSelectionIntoChapter);
  els.toggleFindBtn.addEventListener("click", toggleFindBar);
  els.findInput.addEventListener("input", () => updateFindStatus());
  els.findInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      selectFindMatch(event.shiftKey ? -1 : 1);
    }
  });
  els.findPrevBtn.addEventListener("click", () => selectFindMatch(-1));
  els.findNextBtn.addEventListener("click", () => selectFindMatch(1));
  els.replaceOneBtn.addEventListener("click", replaceCurrentMatch);
  els.replaceAllBtn.addEventListener("click", replaceAllMatches);
  els.splitSuggestBtn.addEventListener("click", () => openAiTask("split"));
  els.sceneCardBtn.addEventListener("click", () => openAiTask("scene"));
  els.actionButtons.forEach((button) => {
    button.addEventListener("click", () => {
      openAiTask(button.dataset.action);
    });
  });
  els.runAiBtn.addEventListener("click", () => openAiTask());
  els.aiInstruction.addEventListener("input", refreshPromptPreviewIfOpen);
  els.aiTaskScope.addEventListener("change", refreshPromptPreview);
  els.aiTaskInstruction.addEventListener("input", refreshPromptPreview);
  els.referenceOptions.addEventListener("change", () => {
    const selected = [...els.referenceOptions.querySelectorAll("input[type='checkbox']:checked")].map((input) => input.value);
    setReferenceSelection(selected);
  });
  els.selectAllRefsBtn.addEventListener("click", () => setReferenceSelection(optionalReferenceKeys));
  els.clearRefsBtn.addEventListener("click", () => setReferenceSelection([]));
  els.previewPromptBtn.addEventListener("click", refreshPromptPreview);
  els.runDialogAiBtn.addEventListener("click", runDialogAi);
  els.stopAiBtn.addEventListener("click", stopCurrentAi);
  els.closeAiDialogBtn.addEventListener("click", () => {
    if (els.aiTaskDialog.open) els.aiTaskDialog.close();
  });
  els.insertResultBtn.addEventListener("click", insertResult);
  els.copyResultBtn.addEventListener("click", copyResult);
}

async function initializeApp() {
  document.body.classList.remove("resizing-right");
  document.body.classList.remove("dragging");
  setupSectionToggles();
  renderIcons();
  await loadWorkspaceFromDataDir();
  bindInitialValues();
  bindEvents();
  render();
}

initializeApp();
