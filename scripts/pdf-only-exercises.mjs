const shared = {
  shampooFocus: [
    ["A", "link to relaxation"],
    ["B", "enviable lifestyle"],
    ["C", "natural ingredients"],
    ["D", "masculine image"],
    ["E", "product reliability"],
    ["F", "romantic interest"],
    ["G", "use by celebrities"],
  ],
  artTechniques: [
    ["A", "ultrasound"],
    ["B", "gamma-ray technology"],
    ["C", "stone"],
    ["D", "a laser scanner"],
    ["E", "a radar machine"],
    ["F", "glass"],
    ["G", "a thermographic camera"],
    ["H", "brick"],
  ],
};

export const pdfOnlyExercises = {
  "P1-1": {
    id: "p1-01",
    title: "Asia-Pacific Tours Activity Holidays",
    instruction: "Questions 1–10 · Complete the table below.",
    limit: "Write ONE WORD AND/OR A NUMBER for each answer.",
    kind: "tour-table",
    vocabulary: [
      ["fastest-growing destination", "发展最快的目的地"],
      ["on offer", "正在提供"],
      ["rave about", "大加赞赏"],
      ["of all sorts", "各种各样的"],
      ["miss out", "错过"],
      ["exhibits / collection", "展品 / 收藏"],
      ["priceless", "无价的"],
      ["wander around", "四处闲逛"],
      ["note all details down", "把所有细节记录下来"],
      ["make up one’s mind", "下定决心"],
    ],
    rows: [
      {
        tour: "Vietnam",
        details: [
          "a cookery course at a 5-star hotel",
          {
            before: "either ",
            q: 1,
            after: " lessons or a one-day trek in the ",
            q2: 2,
          },
          { before: "attend a ", q: 3, after: " performance" },
        ],
        costQuestion: 4,
      },
      {
        tour: "Hong Kong",
        details: [
          {
            before: "go to the hills to look at ",
            q: 5,
            after: " in a country park",
          },
          { before: "followed by ", q: 6, after: " in a monastery" },
          {
            before: "visit an ",
            q: 7,
            after: " factory with the chance to shop",
          },
        ],
        cost: "£1,320",
      },
      {
        tourQuestion: 8,
        details: [
          {
            before: "visit a museum of traditional ",
            q: 9,
            after: "",
          },
          { before: "tour of a big ", q: 10, after: " market" },
        ],
        cost: "£1,800",
      },
    ],
    questions: [
      {
        n: 1,
        answers: ["diving"],
        transcript:
          "On another day, you have a choice of two activities: the first is instruction in diving in the South China Sea, not a certificate course but just an introduction.",
        explanation:
          "先判断空格要填能与 lessons 搭配的名词。录音进入 two activities 后，第一项是 instruction in diving，因此填 diving。这里 instruction / course 对应 lessons。",
      },
      {
        n: 2,
        answers: ["jungle"],
        transcript:
          "You can spend the day on a trek through the jungle near the beach.",
        explanation:
          "介词 in 后需要地点。听到 trek 后继续捕捉地点，through the jungle 对应题目中的 trek in the jungle；spend the day on a trek 对应 one-day trek。",
      },
      {
        n: 3,
        answers: ["dance"],
        transcript:
          "We used to take people to a Vietnamese Opera but that didn’t prove so popular, so now we include a dance show.",
        explanation:
          "used to 引出的 opera 是过去的安排，but 和 so now 表明现在改为 dance show。show 与 performance 同义，因此填 dance。",
      },
      {
        n: 4,
        answers: ["1450", "1,450"],
        transcript:
          "The holiday used to be 1,600 pounds, but it’s just been reduced to 1,450 pounds.",
        explanation:
          "题目需要价格。1,600 是 used to 后的旧价，but 后的 reduced to 1,450 才是现价。",
      },
      {
        n: 5,
        answers: ["birds"],
        transcript:
          "It includes a walk in the hills of one of their country parks where you have the chance to see birds of all sorts.",
        explanation:
          "hills 和 country park 是定位词。see birds 对应 look at birds，go to the hills 对应 a walk in the hills。",
      },
      {
        n: 6,
        answers: ["dinner"],
        transcript:
          "You go with a trained escort, and it includes dinner in a monastery.",
        explanation:
          "空格需要名词。答案 dinner 出现在定位信息 in a monastery 之前，属于答案前置；不能等听到 monastery 后才开始找答案。",
      },
      {
        n: 7,
        answers: ["electronics"],
        transcript:
          "There’s another day when we take you around an electronics factory.",
        explanation:
          "an ___ factory 需要元音音素开头的名词或形容词。take you around 对应 visit，electronics factory 是最终地点；后面的 ceramics factory 是干扰信息。",
      },
      {
        n: 8,
        answers: ["Japan"],
        transcript:
          "I’ve always wanted to go to Korea but not on this trip, and I’ve been to Thailand ... but what about your Japan package?",
        explanation:
          "题目需要国家名。Korea 后有 not on this trip，Thailand 是已经去过的地方；最后实际询问的是 Japan package。",
      },
      {
        n: 9,
        answers: ["costume"],
        transcript:
          "That tour includes a terrific trip to a museum of traditional costume.",
        explanation:
          "traditional 后需要名词。录音直接出现 museum of traditional costume；trip to a museum 对应 visit a museum。",
      },
      {
        n: 10,
        answers: ["fish"],
        transcript:
          "A crafts market, I think. Well, we do go to a market, but it’s one that sells fish and it’s one of the largest in the world.",
        explanation:
          "crafts market 是猜测，随后 but 纠正为 sells fish。largest 对应题目中的 big，因此填 fish。",
      },
    ],
  },
  "P2-3": {
    id: "p2-01",
    title: "Shampoo Marketing Project",
    instruction: "Questions 21–30",
    limit: "Choose the correct letter for each answer.",
    kind: "shampoo",
    choices: [
      {
        n: 21,
        prompt: "Janet says that over time, shampoo has become",
        options: [
          ["A", "a cheaper product."],
          ["B", "more hygienic in its effects."],
          ["C", "a different kind of commodity."],
        ],
        answer: "C",
        explanation:
          "录音说它从一种经济实惠的清洁用品，逐渐变成 beauty product，说明商品属性发生了变化，而不是单纯更便宜或更卫生。",
      },
      {
        n: 22,
        prompt: "What does Janet say about ‘bad hair days’?",
        options: [
          ["A", "They really do exist."],
          ["B", "Women worry about them more than men."],
          ["C", "Their name is inaccurate."],
        ],
        answer: "A",
        explanation:
          "研究表明 bad hair days 并非想象出来的，而且男女受到的影响相同。因此 A 正确，B 被 equally affected 排除。",
      },
      {
        n: 23,
        prompt:
          "What do Janet and Michael say about the chemicals used in shampoos?",
        options: [
          ["A", "All shampoos contain the same chemicals."],
          ["B", "The chemicals are believed to be dangerous."],
          ["C", "The presence of the chemicals is rarely publicised."],
        ],
        answer: "C",
        explanation:
          "他们列举常见化学成分，并指出 manufacturers keep it quiet、包装上对此保持沉默，对应 rarely publicised。",
      },
      {
        n: 24,
        prompt:
          "According to Janet, printing directly onto shampoo bottles, rather than onto labels,",
        options: [
          ["A", "costs more."],
          ["B", "looks less attractive."],
          ["C", "takes a lot longer."],
        ],
        answer: "B",
        explanation:
          "直接印瓶身既更便宜又更快，但厂家认为它不能增强视觉效果、显得廉价，所以问题在外观。",
      },
      {
        n: 25,
        prompt:
          "With regard to environmental issues, Michael and Janet want to investigate",
        options: [
          ["A", "the appearance of shampoo bottles."],
          ["B", "variations in the weight of shampoo bottles."],
          ["C", "the source of recycled plastic in shampoo bottles."],
        ],
        answer: "B",
        explanation:
          "他们提出厂家可以通过减轻包装重量来提升环保性，并决定调查不同厂家是否真的这样做。",
      },
      {
        n: 26,
        prompt:
          "Michael bases his own shampoo purchase decisions on his",
        options: [
          ["A", "loyalty to certain brands."],
          ["B", "desire to get value for money."],
          ["C", "willingness to try new products."],
        ],
        answer: "C",
        explanation:
          "Michael 不信任所谓半价促销，也不固定购买少数品牌；遇到没见过的牌子，他通常愿意试一试。",
      },
    ],
    matching: {
      instruction:
        "According to the speakers, what is the main advertising focus of each of the following shampoo advertisements?",
      limit:
        "Choose FOUR answers from the box and write the correct letter, A–G, next to questions 27–30.",
      bankTitle: "Advertising focuses",
      options: shared.shampooFocus,
      rows: [
        {
          n: 27,
          label: "Zing",
          answer: "B",
          explanation:
            "广告展示幸福家庭、漂亮住宅和健康孩子，让观众产生“希望自己的生活也这样”的感觉，核心是令人羡慕的生活方式。",
        },
        {
          n: 28,
          label: "Splash",
          answer: "F",
          explanation:
            "广告围绕一对情侣是否分手展开故事，结尾两人继续在一起，核心吸引点是 romantic interest。",
        },
        {
          n: 29,
          label: "Just go",
          answer: "E",
          explanation:
            "广告提供大量产品成分和技术信息，使消费者相信它能完成预期功效，强调 product reliability。",
        },
        {
          n: 30,
          label: "Brozene",
          answer: "A",
          explanation:
            "广告几乎没有解说，只使用柔和音乐和平静画面，整体效果是 calming，因此对应 relaxation。",
        },
      ],
    },
  },
  "P3-4": {
    id: "p3-01",
    title: "Handwriting",
    instruction: "Questions 21–30",
    limit: "Choose the correct letters.",
    kind: "handwriting",
    multi: [
      {
        numbers: "21 and 22",
        label: "21–22",
        prompt:
          "Which TWO benefits for children of learning to write did both students find surprising?",
        options: [
          ["A", "improved fine motor skills"],
          ["B", "improved memory"],
          ["C", "improved concentration"],
          ["D", "improved imagination"],
          ["E", "improved spatial awareness"],
        ],
        answers: ["C", "E"],
        explanation:
          "两人用 less obvious、had never occurred to me 和 never associated 等表达说明，注意力提升与空间意识是他们此前没想到的。记忆、想象力和精细动作并未同时让两人意外。",
      },
      {
        numbers: "23 and 24",
        label: "23–24",
        prompt:
          "For children with dyspraxia, which TWO problems with handwriting do the students think are easiest to correct?",
        options: [
          ["A", "not spacing letters correctly"],
          ["B", "not writing in a straight line"],
          ["C", "applying too much pressure when writing"],
          ["D", "confusing letter shapes"],
          ["E", "writing very slowly"],
        ],
        answers: ["A", "C"],
        explanation:
          "方格纸让孩子每格写一个字母，能直接纠正字母间距；会在用力过大时发光的笔能纠正书写压力。这两种都被称为 simple solution。",
      },
    ],
    choices: [
      {
        n: 25,
        prompt:
          "What does the woman say about using laptops to teach writing to children with dyslexia?",
        options: [
          ["A", "Children often lack motivation to learn that way."],
          ["B", "Children become fluent relatively quickly."],
          ["C", "Children react more positively if they make a mistake."],
        ],
        answer: "C",
        explanation:
          "在键盘上出错不会那么令人沮丧，孩子更愿意尝试；录音同时明确说流利度并不会提高得更快。",
      },
      {
        n: 26,
        prompt:
          "When discussing whether to teach cursive or print writing, the woman thinks that",
        options: [
          ["A", "cursive writing disadvantages a certain group of children."],
          ["B", "print writing is associated with lower academic performance."],
          ["C", "most teachers in the UK prefer a traditional approach to handwriting."],
        ],
        answer: "A",
        explanation:
          "连笔书写对有学习困难的儿童尤其难，因为连接字母很有挑战性，说明它会使这一特定群体处于不利地位。",
      },
      {
        n: 27,
        prompt:
          "According to the students, what impact does poor handwriting have on exam performance?",
        options: [
          ["A", "There is evidence to suggest grades are affected by poor handwriting."],
          ["B", "Neat handwriting is less important now than it used to be."],
          ["C", "Candidates write more slowly and produce shorter answers."],
        ],
        answer: "A",
        explanation:
          "研究证实书写不清会影响考试结果；如果考官看不懂答卷，分数会受到影响。录音没有说答案变短。",
      },
      {
        n: 28,
        prompt:
          "What prediction does the man make about the future of handwriting?",
        options: [
          ["A", "Touch typing will be taught before writing by hand."],
          ["B", "Children will continue to learn to write by hand."],
          ["C", "People will dislike handwriting on digital devices."],
        ],
        answer: "B",
        explanation:
          "男生认为情况不会有太大变化，教师理解手写的价值，并把它称为基本生活技能，所以儿童仍会学习手写。",
      },
      {
        n: 29,
        prompt:
          "The woman is concerned that relying on digital devices has made it difficult for her to",
        options: [
          ["A", "take detailed notes."],
          ["B", "spell and punctuate."],
          ["C", "read old documents."],
        ],
        answer: "B",
        explanation:
          "她以自己的糟糕拼写和不一致的标点为例，认为这是缺少手写练习造成的。记笔记和读旧文件不是她描述的个人困难。",
      },
      {
        n: 30,
        prompt: "How do the students feel about their own handwriting?",
        options: [
          ["A", "concerned they are unable to write quickly"],
          ["B", "embarrassed by comments made about it"],
          ["C", "regretful that they have lost the habit"],
        ],
        answer: "C",
        explanation:
          "男生说自己怀念手写并觉得可惜，女生表示感受相同；两人遗憾自己已失去经常手写的习惯。",
      },
    ],
  },
  "P3-5": {
    id: "p3-02",
    title: "Using Scientific Techniques for Art",
    instruction: "Questions 21–30",
    limit: "Choose the correct letters.",
    kind: "art",
    choices: [
      {
        n: 21,
        prompt: "What does Josh think about Jackson Pollock’s paintings?",
        options: [
          ["A", "They are easy to copy."],
          ["B", "They are complex."],
          ["C", "They are childish."],
        ],
        answer: "B",
        explanation:
          "Josh 的结论是画面背后的构成和方法比表面看起来复杂，因此选 complex；easy to copy 和 childish 是干扰项。",
      },
      {
        n: 22,
        prompt: "The $5 painting was considered to be a fake because",
        options: [
          ["A", "it lacked documentation."],
          ["B", "it was too cheap."],
          ["C", "it featured the wrong colours."],
        ],
        answer: "A",
        explanation:
          "最初被怀疑的关键是没有来源记录或证明文件；购买价格和颜色不是判定它为赝品的直接原因。",
      },
      {
        n: 23,
        prompt:
          "What made the International Foundation for Art Research reject the $5 painting?",
        options: [
          ["A", "what was on the back of the painting"],
          ["B", "the type of paint used"],
          ["C", "how the paint was applied"],
        ],
        answer: "B",
        explanation:
          "基金会的检测依据是画中使用的颜料类型与作品年代或画家材料不符，因此选 the type of paint used。",
      },
      {
        n: 24,
        prompt: "What do Josh and Emily agree about art evaluation?",
        options: [
          ["A", "Only an experienced critic can evaluate a painting’s authenticity."],
          ["B", "Modern scientific methods have replaced the traditional approach."],
          ["C", "Experts from the science and art worlds should work together."],
        ],
        answer: "C",
        explanation:
          "两人认为科学检测能提供证据，但不能完全取代艺术史和专家判断；最佳方式是两个领域合作。",
      },
    ],
    flow: {
      instruction: "Questions 25–30 · Complete the flow-chart below.",
      limit:
        "Choose SIX answers from the box and write the correct letter, A–H, next to questions 25–30.",
      bankTitle: "Methods and materials",
      options: shared.artTechniques,
      title: "Seracini’s search for Leonardo Da Vinci’s Battle of Anghiari",
      rows: [
        {
          n: 25,
          before: "Seracini used ",
          after: " to help make a model of the building.",
          answer: "D",
          explanation:
            "激光扫描仪用于获取建筑空间数据并建立模型，因此选 D, a laser scanner。",
        },
        {
          n: 26,
          before: "Seracini used ",
          after:
            " to reveal different materials in the walls. He found the original architecture.",
          answer: "G",
          explanation:
            "热成像相机可显示墙体材料和温度差异，帮助识别被覆盖的原始建筑结构，因此选 G。",
        },
        {
          n: 27,
          before:
            "Seracini guessed that Da Vinci painted his masterpiece on the east wall, in a space that used to hold ",
          after: ".",
          answer: "F",
          explanation:
            "该空间原先是窗户或开口所在的位置，因此曾经容纳的是 glass，选 F。",
        },
        {
          n: 28,
          before: "Seracini analysed the wall using ",
          after: " and discovered a second wall behind it.",
          answer: "E",
          explanation:
            "雷达设备能探测墙后空隙和第二层墙体，因此选 E, a radar machine。",
        },
        {
          n: 29,
          before:
            "Seracini hypothesised that the Da Vinci painting is still there on the original ",
          after: " wall.",
          answer: "C",
          explanation:
            "推测中的原始壁画位于后来墙体后方的石墙上，因此选 C, stone。",
        },
        {
          n: 30,
          before: "Seracini is using ",
          after: " to prove his theory.",
          answer: "B",
          explanation:
            "最后使用伽马射线技术寻找颜料中的元素证据，以验证壁画是否存在，因此选 B。",
        },
      ],
    },
  },
  "P4-2": {
    id: "p4-01",
    title: "Human Memory",
    instruction: "Questions 31–40 · Complete the notes below.",
    limit: "Write ONE WORD ONLY for each answer.",
    kind: "memory-notes",
    sections: [
      {
        heading: "Early Cultures",
        notes: [
          {
            before: "Before 3000 BC, people were unable to ",
            q: 31,
            after: " so they relied on memory.",
          },
          "Memory helped with navigation and family history.",
          {
            before:
              "People used memory to identify dangerous foods, such as some types of ",
            q: 32,
            after: ".",
          },
        ],
      },
      {
        heading: "Ancient Greeks",
        notes: [
          {
            before: "Simonides believed that memories linked to a ",
            q: 33,
            after: " are easier to recall.",
          },
          {
            before:
              "In the 1st century, Greeks believed the senses, especially ",
            q: 34,
            after: ", could help memory.",
          },
        ],
      },
      {
        heading: "Ancient Romans",
        notes: [
          {
            before: "Making a good ",
            q: 35,
            after: " depended on memory.",
          },
          {
            before:
              "From 100 BC, they developed techniques to improve memory. Cicero believed people have a memory that can be developed, in addition to their ",
            q: 36,
            after: " memory.",
          },
        ],
      },
      {
        heading: "Later European History",
        notes: [
          {
            before: "Scholastics used earlier memory techniques to teach ",
            q: 37,
            after: ".",
          },
          {
            before: "In the 17th century, people believed ",
            q: 38,
            after: " could provide explanations.",
          },
          {
            before:
              "In the 19th century, schoolchildren learned facts, such as ",
            q: 39,
            after: ", using repetition.",
          },
        ],
      },
      {
        heading: "Modern Times",
        notes: [
          {
            before:
              "In the 1940s, important research was conducted on “S”, who worked as a ",
            q: 40,
            after: ".",
          },
          "Later, people started to rely on computers.",
        ],
      },
    ],
    questions: [
      {
        n: 31,
        answers: ["write"],
        transcript:
          "Before 3000 BC, people were dependent on being able to remember things because humans could not write; the skill hadn’t been developed.",
        explanation:
          "空格需要动词。relied on 对应 were dependent on，题目中的 unable to 对应录音中的 could not，因此答案是 write。",
      },
      {
        n: 32,
        answers: ["plants"],
        transcript:
          "It was essential to understand which foods were poisonous. This was particularly true of plants because they sometimes looked very similar.",
        explanation:
          "dangerous 对应 poisonous。particularly true of plants 对应题目中的 some types of，且 plants 是符合语义的复数名词。",
      },
      {
        n: 33,
        answers: ["place"],
        transcript:
          "It’s much easier to remember information if we connect it with one particular place.",
        explanation:
          "easier to remember 对应 easier to recall，connect with 对应 linked to；a 后需要单数名词，所以填 place。",
      },
      {
        n: 34,
        answers: ["sight"],
        transcript:
          "The Greeks believed people could use their human senses to improve memory, and this was particularly true when it came to sight.",
        explanation:
          "senses 是定位词，particularly true 对应 especially；录音重点指出 sight，所以填 sight。",
      },
      {
        n: 35,
        answers: ["speech"],
        transcript:
          "In ancient Rome, one of the greatest skills was the ability to give an impressive speech in public, and memory was one of the keys to doing that.",
        explanation:
          "give an impressive speech 对应 making a good speech，memory was one of the keys 对应 depended on memory。",
      },
      {
        n: 36,
        answers: ["natural"],
        transcript:
          "Cicero described a memory that can be developed, called artificial memory, and another type which he called natural.",
        explanation:
          "可发展的 artificial memory 已经出现在题干前半句，是干扰项；in addition to 要填另一类记忆，因此答案是 natural。",
      },
      {
        n: 37,
        answers: ["religion"],
        transcript:
          "The Scholastics used these techniques when they were instructing pupils about religion.",
        explanation:
          "instructing 对应 teach。题目问的是教学内容，不是教学对象 pupils，因此填 religion。",
      },
      {
        n: 38,
        answers: ["science"],
        transcript:
          "In the 17th century, people thought that science had the answers to most human questions.",
        explanation:
          "had the answers to questions 对应 could provide explanations。答案位于从句主语位置，属于答案前置。",
      },
      {
        n: 39,
        answers: ["dates"],
        transcript:
          "Children were expected to learn lots of facts by constantly repeating things like dates.",
        explanation:
          "19th century、children 和 facts 连续定位；constantly repeating 对应 using repetition，例子是 dates。",
      },
      {
        n: 40,
        answers: ["journalist"],
        transcript:
          "Psychologists found that S never made notes about anything, although he was a journalist and never forgot facts.",
        explanation:
          "work as a 后需要职业单数名词。录音明确说明 S was a journalist，因此填 journalist。",
      },
    ],
    vocabulary: [
      ["establish the historical context", "了解历史背景"],
      ["family history and ancestry", "家族史和族谱"],
      ["incredible memory skills", "非凡的记忆能力"],
    ],
  },
};

const escapeHtml = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

const blank = (n) =>
  `<span class="blank"><span class="blank-number">${n}</span><input type="text" name="q${n}" aria-label="Question ${n}"></span>`;

const currencyBlank = (n) =>
  `<span class="blank"><span class="blank-number">${n}</span><span>£</span><input type="text" name="q${n}" aria-label="Question ${n}"></span>`;

const selectBlank = (n, options) =>
  `<span class="blank select-blank"><span class="blank-number">${n}</span><select name="q${n}" aria-label="Question ${n}"><option value="">—</option>${options
    .map(([letter]) => `<option value="${letter}">${letter}</option>`)
    .join("")}</select></span>`;

const answerPanel = (question, answerText) => `
  <div class="answer-panel">
    <div class="answer-heading"><span class="answer-question">Q${escapeHtml(
      question.n ?? question.label ?? "",
    )}</span><strong class="result-label"></strong><span>答案：${escapeHtml(answerText)}</span></div>
    ${
      question.transcript
        ? `<p class="transcript"><b>录音定位</b>${escapeHtml(question.transcript)}</p>`
        : ""
    }
    <p><b>解析</b>${escapeHtml(question.explanation)}</p>
  </div>`;

const textResult = (question) => `
  <div class="inline-result gradable" data-type="text" data-q="${question.n}" data-answers="${escapeHtml(
    JSON.stringify(question.answers),
  )}" data-weight="1">
    ${answerPanel(question, question.answers.join(" / "))}
  </div>`;

const renderInline = (item) => {
  if (typeof item === "string") return escapeHtml(item);
  let html = `${escapeHtml(item.before)}${blank(item.q)}`;
  if (item.q2) html += `${escapeHtml(item.after)}${blank(item.q2)}`;
  else html += escapeHtml(item.after);
  return html;
};

const choiceQuestion = (question) => `
  <article class="question-card gradable" data-type="radio" data-q="${question.n}" data-answer="${question.answer}" data-weight="1">
    <div class="question-title"><span class="question-number">${question.n}</span><h3>${escapeHtml(
      question.prompt,
    )}</h3></div>
    <div class="choice-list">${question.options
      .map(
        ([letter, label]) =>
          `<label><input type="radio" name="q${question.n}" value="${letter}"><span class="choice-letter">${letter}</span><span>${escapeHtml(
            label,
          )}</span></label>`,
      )
      .join("")}</div>
    ${answerPanel(question, question.answer)}
  </article>`;

const optionBank = (title, options) => `
  <aside class="option-bank">
    <strong>${escapeHtml(title)}</strong>
    <div>${options
      .map(
        ([letter, label]) =>
          `<span><b>${letter}</b>${escapeHtml(label)}</span>`,
      )
      .join("")}</div>
  </aside>`;

const renderTour = (exercise) => `
  <section class="paper-block">
    <h2>Asia-Pacific Tours Activity Holidays</h2>
    <div class="table-wrap">
      <table class="tour-table">
        <thead><tr><th>Tour</th><th>Details</th><th>Cost</th></tr></thead>
        <tbody>
          ${exercise.rows
            .map(
              (row) => `<tr>
                <th>${row.tour === "Vietnam" ? '<span class="example-label">Example</span>' : ""}${row.tourQuestion ? blank(row.tourQuestion) : escapeHtml(row.tour)}</th>
                <td><ul>${row.details
                  .map((detail) => `<li>${renderInline(detail)}</li>`)
                  .join("")}</ul></td>
                <td>${row.costQuestion ? currencyBlank(row.costQuestion) : escapeHtml(row.cost)}</td>
              </tr>`,
            )
            .join("")}
        </tbody>
      </table>
    </div>
    <div class="solution-list"><h2>答案与解析</h2>${exercise.questions.map(textResult).join("")}</div>
  </section>
  ${renderVocabulary(exercise.vocabulary)}
`;

const renderShampoo = (exercise) => `
  <section class="paper-block">
    <div class="section-instruction"><b>Questions 21–26</b><span>Choose the correct letter, A, B, or C.</span></div>
    <h2>Shampoo Marketing Project</h2>
    ${exercise.choices.map(choiceQuestion).join("")}
  </section>
  <section class="paper-block">
    <div class="section-instruction"><b>Questions 27–30</b><span>${escapeHtml(
      exercise.matching.instruction,
    )}</span><span>${escapeHtml(exercise.matching.limit)}</span></div>
    ${optionBank(exercise.matching.bankTitle, exercise.matching.options)}
    <h2 class="subheading">Shampoo advertisements</h2>
    <div class="matching-list">
      ${exercise.matching.rows
        .map(
          (row) => `<article class="matching-row gradable" data-type="select" data-q="${row.n}" data-answer="${row.answer}" data-weight="1">
            <div><span class="question-number">${row.n}</span><strong>${escapeHtml(
              row.label,
            )}</strong></div>
            ${selectBlank(row.n, exercise.matching.options)}
            ${answerPanel(row, row.answer)}
          </article>`,
        )
        .join("")}
    </div>
  </section>
`;

const multiQuestion = (question) => `
  <article class="question-card multi-question gradable" data-type="multi" data-q="${question.label}" data-answers="${escapeHtml(
    JSON.stringify(question.answers),
  )}" data-weight="2">
    <div class="section-instruction"><b>Questions ${question.numbers}</b><span>Choose TWO letters, A–E.</span></div>
    <div class="question-title"><span class="question-number">${question.label}</span><h3>${escapeHtml(
      question.prompt,
    )}</h3></div>
    <div class="choice-list">${question.options
      .map(
        ([letter, label]) =>
          `<label><input type="checkbox" name="q${question.label.replace("–", "_")}" value="${letter}" data-max="2"><span class="choice-letter">${letter}</span><span>${escapeHtml(
            label,
          )}</span></label>`,
      )
      .join("")}</div>
    ${answerPanel(question, question.answers.join(" / "))}
  </article>`;

const renderHandwriting = (exercise) => `
  <section class="paper-block">
    ${exercise.multi.map(multiQuestion).join("")}
  </section>
  <section class="paper-block">
    <div class="section-instruction"><b>Questions 25–30</b><span>Choose the correct letter, A, B or C.</span></div>
    <h2>Teaching handwriting</h2>
    ${exercise.choices.map(choiceQuestion).join("")}
  </section>
`;

const renderArt = (exercise) => `
  <section class="paper-block">
    <div class="section-instruction"><b>Questions 21–24</b><span>Choose the correct letter, A, B, or C.</span></div>
    ${exercise.choices.map(choiceQuestion).join("")}
  </section>
  <section class="paper-block">
    <div class="section-instruction"><b>${escapeHtml(
      exercise.flow.instruction,
    )}</b><span>${escapeHtml(exercise.flow.limit)}</span></div>
    ${optionBank(exercise.flow.bankTitle, exercise.flow.options)}
    <h2 class="flow-title">${escapeHtml(exercise.flow.title)}</h2>
    <div class="flow-chart">
      ${exercise.flow.rows
        .map(
          (row, index) => `<article class="flow-step gradable" data-type="select" data-q="${row.n}" data-answer="${row.answer}" data-weight="1">
            <p>${escapeHtml(row.before)}${selectBlank(
              row.n,
              exercise.flow.options,
            )}${escapeHtml(row.after)}</p>
            ${answerPanel(row, row.answer)}
            ${index < exercise.flow.rows.length - 1 ? '<span class="flow-arrow">↓</span>' : ""}
          </article>`,
        )
        .join("")}
    </div>
  </section>
`;

const renderMemory = (exercise) => `
  <section class="paper-block memory-paper">
    <h2>Human Memory</h2>
    ${exercise.sections
      .map(
        (section) => `<section class="note-section"><h3>${escapeHtml(
          section.heading,
        )}</h3><ul>${section.notes
          .map((note) => `<li>${renderInline(note)}</li>`)
          .join("")}</ul></section>`,
      )
      .join("")}
    <div class="solution-list"><h2>答案与解析</h2>${exercise.questions.map(textResult).join("")}</div>
  </section>
  ${renderVocabulary(exercise.vocabulary)}
`;

function renderVocabulary(items = []) {
  if (!items.length) return "";
  return `<details class="vocabulary"><summary>原资料词汇补充</summary><dl>${items
    .map(
      ([term, meaning]) =>
        `<div><dt>${escapeHtml(term)}</dt><dd>${escapeHtml(meaning)}</dd></div>`,
    )
    .join("")}</dl></details>`;
}

const renderBody = (exercise) => {
  if (exercise.kind === "tour-table") return renderTour(exercise);
  if (exercise.kind === "shampoo") return renderShampoo(exercise);
  if (exercise.kind === "handwriting") return renderHandwriting(exercise);
  if (exercise.kind === "art") return renderArt(exercise);
  if (exercise.kind === "memory-notes") return renderMemory(exercise);
  throw new Error(`Unsupported PDF-only exercise kind: ${exercise.kind}`);
};

export function renderPdfOnlyExercise(exerciseKey, audioName) {
  const exercise = pdfOnlyExercises[exerciseKey];
  if (!exercise) throw new Error(`Unknown PDF-only exercise: ${exerciseKey}`);

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${escapeHtml(exercise.title)}</title>
  <style>
    :root{--ink:#173c37;--green:#0e5a4f;--green-2:#dfeee9;--paper:#fffdf8;--cream:#f5f2ea;--line:#d4ddd8;--orange:#e96842;--red:#a83d2c;--red-bg:#fff1ec}
    *{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:var(--cream);color:var(--ink);font:15px/1.65 Arial,"Noto Sans SC",sans-serif}
    button,input,select{font:inherit;color:inherit}button{cursor:pointer}
    .page-header{position:sticky;z-index:10;top:0;padding:16px 24px;background:rgba(255,253,248,.97);border-bottom:1px solid var(--line);backdrop-filter:blur(8px)}
    .page-header>div{max-width:980px;margin:auto}.page-header strong{display:block;font:700 24px/1.25 Georgia,serif}.page-header span{display:block;margin-top:4px;color:#667b75;font-size:12px}.page-header b{color:var(--orange)}
    main{max-width:980px;margin:auto;padding:22px 24px 110px}.audio-wrap{position:sticky;z-index:8;top:88px;margin-bottom:18px;padding:12px 14px;border:1px solid var(--line);border-radius:8px;background:rgba(245,242,234,.96);box-shadow:0 5px 20px rgba(28,55,48,.08)}audio{display:block;width:100%;height:38px}
    .paper-block{margin:18px 0;padding:28px 34px;border:1px solid var(--line);border-radius:9px;background:var(--paper);box-shadow:0 9px 28px rgba(31,58,50,.06)}
    h2{margin:0 0 22px;text-align:center;font:700 22px/1.3 Georgia,serif}.subheading,.flow-title{margin-top:26px;text-align:left;font-size:18px}.section-instruction{display:grid;gap:2px;margin-bottom:20px}.section-instruction b{font-size:16px}.section-instruction span{color:#516b64;font-size:13px}
    .question-card{padding:20px 0;border-top:1px solid #e5e9e6}.question-card:first-of-type{border-top:0}.question-title{display:flex;align-items:flex-start;gap:11px}.question-title h3{margin:0;font-size:15px;line-height:1.55}.question-number{display:inline-grid;flex:0 0 auto;min-width:34px;height:28px;padding:0 7px;place-items:center;border-radius:14px;background:var(--green);color:#fff;font-size:12px;font-weight:800}
    .choice-list{display:grid;gap:7px;margin:13px 0 0 45px}.choice-list label{display:grid;grid-template-columns:18px 28px minmax(0,1fr);align-items:start;gap:7px;padding:7px 9px;border:1px solid transparent;border-radius:6px;cursor:pointer}.choice-list label:hover{border-color:#bfd1ca;background:#f4f8f6}.choice-list input{margin:4px 0 0}.choice-letter{font-weight:800}
    .answer-panel{display:none;margin:14px 0 0 45px;padding:13px 15px;border-left:4px solid var(--green);background:#edf6f2}.review .answer-panel{display:block}.answer-panel.wrong{border-color:var(--red);background:var(--red-bg)}.answer-heading{display:flex;flex-wrap:wrap;gap:8px 15px}.answer-heading span{font-weight:700}.answer-question{min-width:30px;color:var(--orange)}.result-label{color:var(--green)}.answer-panel.wrong .result-label{color:var(--red)}.answer-panel p{margin:8px 0 0}.answer-panel p b{display:inline-block;margin-right:8px;color:#60756f;font-size:12px}.transcript{color:#385a52}
    .table-wrap{overflow-x:auto}.tour-table{width:100%;border-collapse:collapse}.tour-table th,.tour-table td{padding:16px 15px;border:1px solid #aebeb8;vertical-align:top;text-align:left}.tour-table thead th{background:var(--green);color:#fff;text-align:center}.tour-table tbody th{width:19%;background:#edf4f1}.tour-table tbody td:nth-child(2){min-width:480px}.tour-table tbody td:last-child{width:15%;white-space:nowrap;text-align:center}.tour-table ul{margin:0;padding-left:20px}.tour-table li+li{margin-top:10px}.example-label{display:block;margin-bottom:5px;color:#6b7d77;font-size:11px;font-weight:500}
    .blank{display:inline-flex;align-items:center;gap:5px;margin:0 3px;vertical-align:middle}.blank-number{color:var(--orange);font-size:11px;font-weight:800}.blank input{width:118px;height:32px;padding:3px 7px;border:0;border-bottom:2px solid #5a726a;background:#f8f8f3;outline:0}.blank input:focus{border-color:var(--orange);background:#fff}.select-blank select{width:54px;height:32px;border:1px solid #799188;border-radius:4px;background:#fff}
    .solution-list>h2{display:none;margin-top:30px}.review .solution-list>h2{display:block}.inline-result{display:none}.review .inline-result{display:block}.inline-result .answer-panel{margin-left:0}
    .option-bank{max-width:700px;margin:18px auto;padding:18px 20px;border:2px solid #adc1b9;border-radius:7px;background:#f5f8f6}.option-bank>strong{display:block;margin-bottom:10px;text-align:center}.option-bank>div{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px 24px}.option-bank span{display:flex;gap:9px}.option-bank b{color:var(--orange)}
    .matching-list{max-width:700px;margin:auto}.matching-row{display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:10px;padding:14px 0;border-bottom:1px solid #e3e8e5}.matching-row>div:first-child{display:flex;align-items:center;gap:12px}.matching-row .answer-panel{grid-column:1/-1;margin:4px 0 0}
    .multi-question .section-instruction{margin-bottom:13px}.multi-question+.multi-question{margin-top:15px}.multi-question .question-number{min-width:58px}
    .flow-chart{max-width:760px;margin:auto}.flow-step{position:relative;margin-bottom:28px;padding:19px 22px;border:1px solid #b9c9c3;border-radius:8px;background:#f8faf8}.flow-step p{margin:0}.flow-step .answer-panel{margin-left:0}.flow-arrow{position:absolute;right:50%;bottom:-31px;color:var(--orange);font-size:22px;font-weight:800}
    .memory-paper>h2{font-size:25px}.note-section{margin:22px 0}.note-section h3{display:inline-block;margin:0 0 8px;padding:3px 10px;border-left:4px solid var(--orange);background:#f1f5f2;font-size:16px}.note-section ul{margin:0;padding-left:30px}.note-section li+li{margin-top:10px}
    .vocabulary{margin:18px 0;padding:16px 20px;border:1px solid var(--line);border-radius:8px;background:var(--paper)}.vocabulary summary{font-weight:800;cursor:pointer}.vocabulary dl{margin:15px 0 0}.vocabulary dl>div{display:grid;grid-template-columns:minmax(180px,1fr) 1fr;gap:18px;padding:7px 0;border-top:1px solid #e7e9e6}.vocabulary dt{font-weight:700}.vocabulary dd{margin:0;color:#5d716b}
    .page-footer{position:fixed;z-index:11;right:0;bottom:0;left:0;display:flex;justify-content:space-between;align-items:center;gap:12px;padding:12px 24px;border-top:1px solid var(--line);background:rgba(255,253,248,.98)}.score-summary{font-weight:800}.score-summary:empty{display:none}.actions{display:flex;gap:9px;margin-left:auto}.actions button{padding:9px 16px;border:1px solid var(--green);border-radius:5px;background:#fff;color:var(--green);font-weight:800}.actions .primary{background:var(--green);color:#fff}
    .review input,.review select{pointer-events:none}.review .gradable.correct{--status:var(--green)}.review .gradable.incorrect{--status:var(--red)}
    @media(max-width:700px){.page-header{padding:12px 14px}.page-header strong{font-size:18px}.page-header span{font-size:10px}main{padding:12px 8px 100px}.audio-wrap{top:69px;margin-bottom:10px;padding:8px}.paper-block{padding:20px 14px}.choice-list{margin-left:0}.answer-panel{margin-left:0}.option-bank>div{grid-template-columns:1fr}.tour-table th,.tour-table td{padding:11px 10px}.blank input{width:92px}.page-footer{padding:9px 10px}.score-summary{font-size:12px}.actions button{padding:8px 11px}.vocabulary dl>div{grid-template-columns:1fr;gap:2px}}
  </style>
</head>
<body>
  <header class="page-header"><div><strong>${escapeHtml(
    exercise.title,
  )}</strong><span>${escapeHtml(exercise.instruction)} · <b>${escapeHtml(
    exercise.limit,
  )}</b></span></div></header>
  <main>
    <div class="audio-wrap"><audio controls preload="metadata" src="${escapeHtml(
      audioName,
    )}"></audio></div>
    ${renderBody(exercise)}
  </main>
  <footer class="page-footer">
    <div class="score-summary" id="score-summary"></div>
    <div class="actions"><button id="reset" type="button">重新作答</button><button class="primary" id="finish-btn" type="button">提交并查看答案</button></div>
  </footer>
  <script>
    const exerciseId=${JSON.stringify(exercise.id)};
    const normalise=value=>String(value??'').trim().toLowerCase().replace(/[,£\\s]/g,'');
    const rows=[...document.querySelectorAll('.gradable')];
    const getPanel=row=>row.querySelector('.answer-panel');

    document.querySelectorAll('input[type="checkbox"][data-max]').forEach(input=>{
      input.addEventListener('change',()=>{
        const group=[...document.querySelectorAll('[name="'+input.name+'"]')];
        const max=Number(input.dataset.max);
        const checked=group.filter(item=>item.checked);
        group.forEach(item=>item.disabled=checked.length>=max&&!item.checked);
      });
    });

    document.getElementById('finish-btn').addEventListener('click',()=>{
      let score=0,total=0;
      document.body.classList.add('review');
      rows.forEach(row=>{
        const type=row.dataset.type;
        const weight=Number(row.dataset.weight||1);
        let earned=0;
        if(type==='text'){
          const value=document.querySelector('[name="q'+row.dataset.q+'"]')?.value||'';
          const answers=JSON.parse(row.dataset.answers);
          earned=answers.some(answer=>normalise(answer)===normalise(value))?1:0;
        }else if(type==='radio'){
          const value=document.querySelector('[name="q'+row.dataset.q+'"]:checked')?.value||'';
          earned=value===row.dataset.answer?1:0;
        }else if(type==='select'){
          const value=document.querySelector('[name="q'+row.dataset.q+'"]')?.value||'';
          earned=value===row.dataset.answer?1:0;
        }else if(type==='multi'){
          const name='q'+row.dataset.q.replace('–','_');
          const values=[...document.querySelectorAll('[name="'+name+'"]:checked')].map(input=>input.value);
          const answers=JSON.parse(row.dataset.answers);
          earned=values.filter(value=>answers.includes(value)).length;
        }
        total+=weight;score+=earned;
        const correct=earned===weight;
        row.classList.toggle('correct',correct);
        row.classList.toggle('incorrect',!correct);
        const panel=getPanel(row);
        if(panel){
          panel.classList.toggle('wrong',!correct);
          const label=panel.querySelector('.result-label');
          label.textContent=correct?'✓ 正确':(weight>1?'✗ 本组答对 '+earned+'/'+weight:'✗ 错误');
        }
      });
      document.querySelectorAll('input,select').forEach(control=>control.disabled=true);
      document.getElementById('score-summary').textContent='本次得分：'+score+' / '+total;
      window.parent.postMessage({type:'tingjian:score',exerciseId,score,total,practicedAt:new Date().toISOString()},'*');
      window.scrollTo({top:0,behavior:'smooth'});
    });

    document.getElementById('reset').addEventListener('click',()=>{
      document.body.classList.remove('review');
      rows.forEach(row=>row.classList.remove('correct','incorrect'));
      document.querySelectorAll('input,select').forEach(control=>{
        control.disabled=false;
        if(control.matches('input[type="radio"],input[type="checkbox"]'))control.checked=false;
        else control.value='';
      });
      document.querySelectorAll('.answer-panel').forEach(panel=>panel.classList.remove('wrong'));
      document.getElementById('score-summary').textContent='';
      window.scrollTo({top:0,behavior:'smooth'});
    });
  </script>
</body>
</html>`;
}
