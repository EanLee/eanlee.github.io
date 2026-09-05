/**
 * 自訂 TextMate 語法規則 (TextMate Grammars)
 * 供 Astro Shiki 語法高亮引擎註冊自訂語言，解決 [Shiki] The language doesn't exist 警告
 * 並提供專屬的語法上色效果。
 */

/**
 * 對話格式語法 (chat)
 * 用於技術文章中的人物對話紀錄（例如 吉米: ... / Eric: ...）
 */
export const chatLanguage = {
  name: 'chat',
  scopeName: 'source.chat',
  displayName: 'Chat Dialogue',
  patterns: [
    // 註解行
    {
      name: 'comment.line.double-slash.chat',
      match: '^\\s*//.*$',
    },
    // 對話發言者與冒號（例：吉米:、Eric:、[系統]:）
    {
      match: '^\\s*([^:：\\n]+)([:：])',
      captures: {
        1: { name: 'entity.name.tag.chat' },
        2: { name: 'punctuation.separator.chat' },
      },
    },
    // 行內程式碼標記（`...`）
    {
      name: 'markup.inline.raw.chat',
      match: '`[^`]+`',
    },
    // 雙引號與單引號字串
    {
      name: 'string.quoted.double.chat',
      match: '"[^"]*"',
    },
    {
      name: 'string.quoted.single.chat',
      match: "'[^']*'",
    },
  ],
};

/**
 * AI 提示詞語法 (prompt)
 * 用於展示輸入給 ChatGPT / LLM 的 Prompt 提示詞與指令
 */
export const promptLanguage = {
  name: 'prompt',
  scopeName: 'source.prompt',
  displayName: 'AI Prompt',
  patterns: [
    // 註解或指令前綴
    {
      name: 'comment.line.number-sign.prompt',
      match: '^\\s*(#|//).*$',
    },
    // 常見角色/區塊標籤（例：System:、User:、Assistant:、角色:、指令:、提示詞: 等）
    {
      match: '^\\s*(System|User|Assistant|Human|AI|Prompt|Input|Output|Context|角色|指令|提示詞|背景|範例)([:：])',
      captures: {
        1: { name: 'keyword.control.role.prompt' },
        2: { name: 'punctuation.separator.prompt' },
      },
    },
    // 編號列表（1. 2. - 等）
    {
      match: '^\\s*(\\d+\\.|[-*•])\\s+',
      captures: {
        1: { name: 'markup.list.numbered.prompt' },
      },
    },
    // 行內程式碼或變數（`...`）
    {
      name: 'markup.inline.raw.prompt',
      match: '`[^`]+`',
    },
    // 引號字串
    {
      name: 'string.quoted.double.prompt',
      match: '"[^"]*"',
    },
    {
      name: 'string.quoted.single.prompt',
      match: "'[^']*'",
    },
  ],
};

/**
 * T4 範本語法 (t4)
 * 用於 .NET / EF Core 的 T4 程式碼生成模板
 * 支援 C# 核心語法與 T4 專屬標籤 (<# ... #>, <#= ... #>, <#@ ... #>, <#+ ... #>)
 */
export const t4Language = {
  name: 't4',
  scopeName: 'source.t4',
  displayName: 'T4 Template',
  patterns: [
    // T4 標籤 (<#@, <#=, <#+, <#, #>)
    {
      match: '(<#(=|@|\\+)?)|(#>)',
      name: 'keyword.control.directive.t4',
    },
    // 單行與多行註解
    {
      name: 'comment.line.double-slash.t4',
      match: '//.*$',
    },
    {
      name: 'comment.block.t4',
      begin: '/\\*',
      end: '\\*/',
    },
    // C# 關鍵字
    {
      name: 'keyword.control.cs.t4',
      match:
        '\\b(abstract|as|base|break|case|catch|checked|class|const|continue|default|delegate|do|else|enum|event|explicit|extern|finally|fixed|for|foreach|goto|if|implicit|in|interface|internal|is|lock|namespace|new|operator|out|override|params|private|protected|public|readonly|ref|return|sealed|sizeof|stackalloc|static|struct|switch|this|throw|try|typeof|unchecked|unsafe|using|virtual|void|volatile|while|async|await|var|record|init|get|set)\\b',
    },
    // 常用型別
    {
      name: 'storage.type.cs.t4',
      match:
        '\\b(bool|byte|sbyte|char|decimal|double|float|int|uint|nint|nuint|long|ulong|short|ushort|object|string|dynamic|List|Dictionary|IEnumerable|ICollection|IList|Task|Nullable|DbContext|EntityType)\\b',
    },
    // 數值常數
    {
      name: 'constant.numeric.t4',
      match: '\\b\\d+(\\.\\d+)?\\b',
    },
    // 字串
    {
      name: 'string.quoted.double.t4',
      begin: '"',
      end: '"',
      patterns: [
        {
          name: 'constant.character.escape.t4',
          match: '\\\\.',
        },
      ],
    },
    {
      name: 'string.quoted.single.t4',
      match: "'[^']*'",
    },
  ],
};

export const customLanguages = [chatLanguage, promptLanguage, t4Language];
