import type { CEFRLevel } from "../types";

export interface LevelSpeakingQuestion {
  id: string;
  prompt: string;
  hint: string;
  // Groups of synonym keywords an on-topic answer is expected to contain —
  // same scoring approach as the placement test's speaking questions.
  keywordGroups: string[][];
}

// A per-level speaking question bank for the roadmap's repeatable practice
// tab (separate from placementSpeaking.ts, which is a fixed, level-agnostic
// set used only once by the placement test). Each "Làm lại" samples a
// random subset from the current level's pool, and both topic complexity
// and expected sentence structure increase from A1 to C2.
export const levelSpeaking: Record<CEFRLevel, LevelSpeakingQuestion[]> = {
  A1: [
    {
      id: "ls-a1-1",
      prompt: "What is your name, and how old are you?",
      hint: "Nói tên và tuổi của bạn bằng một câu đơn giản.",
      keywordGroups: [
        ["my name", "i am called", "i'm called", "call me", "this is"],
        ["years old", "i am", "i'm"],
      ],
    },
    {
      id: "ls-a1-2",
      prompt: "Tell me about your family.",
      hint: "Nói bạn có bao nhiêu người trong gia đình, gồm những ai.",
      keywordGroups: [["family", "mother", "father", "sister", "brother", "parents"]],
    },
    {
      id: "ls-a1-3",
      prompt: "What is your favorite food?",
      hint: "Nói món ăn bạn thích nhất và một lý do đơn giản.",
      keywordGroups: [["favorite", "favourite", "like", "love"]],
    },
    {
      id: "ls-a1-4",
      prompt: "What do you do every morning?",
      hint: "Kể 2-3 việc bạn thường làm vào buổi sáng.",
      keywordGroups: [["morning", "wake up", "breakfast", "get up"]],
    },
    {
      id: "ls-a1-5",
      prompt: "What is the weather like today?",
      hint: "Mô tả thời tiết hôm nay bằng một câu ngắn.",
      keywordGroups: [["weather", "sunny", "rainy", "cold", "hot", "warm", "cloudy"]],
    },
    {
      id: "ls-a1-6",
      prompt: "Do you have any pets? Tell me about them.",
      hint: "Nói bạn có nuôi thú cưng không, và nó tên gì hoặc trông như thế nào.",
      keywordGroups: [["pet", "dog", "cat", "animal", "no pet", "don't have"]],
    },
  ],
  A2: [
    {
      id: "ls-a2-1",
      prompt: "What do you usually do on the weekend?",
      hint: "Kể những việc bạn thường làm vào cuối tuần.",
      keywordGroups: [["weekend", "usually", "often", "sometimes"]],
    },
    {
      id: "ls-a2-2",
      prompt: "Can you describe your house or apartment?",
      hint: "Mô tả ngôi nhà/căn hộ của bạn có mấy phòng, ở đâu.",
      keywordGroups: [["house", "apartment", "room", "live in", "bedroom"]],
    },
    {
      id: "ls-a2-3",
      prompt: "What did you do last weekend?",
      hint: "Kể lại một việc bạn đã làm vào cuối tuần trước (thì quá khứ).",
      keywordGroups: [["last weekend", "went", "did", "visited", "watched", "played"]],
    },
    {
      id: "ls-a2-4",
      prompt: "How do you usually travel to work or school?",
      hint: "Nói bạn di chuyển đến chỗ làm/trường bằng phương tiện gì.",
      keywordGroups: [["bus", "car", "bike", "bicycle", "walk", "train", "motorbike"]],
    },
    {
      id: "ls-a2-5",
      prompt: "What kind of music or movies do you like?",
      hint: "Nói thể loại nhạc/phim bạn thích và lý do ngắn gọn.",
      keywordGroups: [["music", "movie", "film", "like", "enjoy"]],
    },
    {
      id: "ls-a2-6",
      prompt: "What are your plans for next week?",
      hint: "Nói 1-2 dự định của bạn cho tuần tới (thì tương lai).",
      keywordGroups: [["next week", "going to", "will", "plan"]],
    },
  ],
  B1: [
    {
      id: "ls-b1-1",
      prompt: "Do you prefer living in a big city or a small town? Why?",
      hint: "Nêu ý kiến của bạn và giải thích lý do.",
      keywordGroups: [
        ["prefer", "rather", "would choose"],
        ["because", "since", "the reason"],
      ],
    },
    {
      id: "ls-b1-2",
      prompt: "Tell me about a memorable trip you have taken.",
      hint: "Kể về một chuyến đi đáng nhớ của bạn — ở đâu, với ai, điều gì đặc biệt.",
      keywordGroups: [["trip", "travel", "visited", "went to", "vacation", "holiday"]],
    },
    {
      id: "ls-b1-3",
      prompt: "How has technology changed the way you communicate with friends?",
      hint: "So sánh cách liên lạc bạn bè trước đây và bây giờ.",
      keywordGroups: [
        ["technology", "phone", "internet", "social media", "app"],
        ["changed", "different", "used to", "now"],
      ],
    },
    {
      id: "ls-b1-4",
      prompt: "What is a hobby you would like to start, and why?",
      hint: "Nói về một sở thích bạn muốn bắt đầu và lý do.",
      keywordGroups: [
        ["hobby", "start", "learn", "try"],
        ["because", "since", "the reason"],
      ],
    },
    {
      id: "ls-b1-5",
      prompt: "Describe a person who has influenced your life.",
      hint: "Nói về một người có ảnh hưởng đến bạn và lý do.",
      keywordGroups: [
        ["influenced", "inspired", "taught me", "important to me"],
        ["because", "since", "the reason"],
      ],
    },
    {
      id: "ls-b1-6",
      prompt: "What are your plans for the next few years?",
      hint: "Nói về dự định của bạn trong vài năm tới (công việc, học tập...).",
      keywordGroups: [["plan", "going to", "hope to", "want to", "future"]],
    },
  ],
  B2: [
    {
      id: "ls-b2-1",
      prompt: "Do you think social media has a positive or negative effect on society? Why?",
      hint: "Nêu quan điểm và ít nhất một lý do cụ thể.",
      keywordGroups: [
        ["social media", "positive", "negative", "effect", "impact"],
        ["because", "since", "for example", "such as"],
      ],
    },
    {
      id: "ls-b2-2",
      prompt: "What are the advantages and disadvantages of working from home?",
      hint: "Nêu ít nhất một ưu điểm và một nhược điểm.",
      keywordGroups: [
        ["advantage", "benefit", "flexible", "convenient"],
        ["disadvantage", "drawback", "isolated", "distraction"],
      ],
    },
    {
      id: "ls-b2-3",
      prompt: "If you could change one thing about your country, what would it be?",
      hint: "Nêu một điều bạn muốn thay đổi và giải thích tại sao.",
      keywordGroups: [
        ["change", "improve", "would be"],
        ["because", "since", "the reason"],
      ],
    },
    {
      id: "ls-b2-4",
      prompt: "How important is it to learn a foreign language, and why?",
      hint: "Nêu quan điểm về tầm quan trọng của việc học ngoại ngữ.",
      keywordGroups: [
        ["important", "language", "learn", "useful"],
        ["because", "since", "for example"],
      ],
    },
    {
      id: "ls-b2-5",
      prompt: "Describe a difficult decision you had to make and how you made it.",
      hint: "Kể về một quyết định khó khăn và cách bạn giải quyết.",
      keywordGroups: [
        ["decision", "decide", "difficult", "choice"],
        ["because", "so", "in the end", "eventually"],
      ],
    },
    {
      id: "ls-b2-6",
      prompt: "Do you think money can buy happiness? Explain your view.",
      hint: "Nêu quan điểm của bạn về câu hỏi này và giải thích.",
      keywordGroups: [
        ["money", "happiness", "happy"],
        ["because", "since", "in my opinion", "i think"],
      ],
    },
  ],
  C1: [
    {
      id: "ls-c1-1",
      prompt: "To what extent do you think governments should regulate the internet?",
      hint: "Nêu quan điểm với lập luận rõ ràng, có thể nêu ví dụ.",
      keywordGroups: [
        ["government", "regulate", "regulation", "control", "internet"],
        ["should", "extent", "because", "however"],
      ],
    },
    {
      id: "ls-c1-2",
      prompt: "How do you think artificial intelligence will change the job market in the future?",
      hint: "Nêu dự đoán và lập luận cho quan điểm đó.",
      keywordGroups: [
        ["artificial intelligence", "ai", "automation", "job market", "jobs"],
        ["will", "future", "change", "impact"],
      ],
    },
    {
      id: "ls-c1-3",
      prompt: "Some people believe university education should be free for everyone. Do you agree or disagree?",
      hint: "Nêu rõ bạn đồng ý hay không và giải thích lập luận.",
      keywordGroups: [
        ["agree", "disagree", "university education", "free"],
        ["because", "however", "on the other hand"],
      ],
    },
    {
      id: "ls-c1-4",
      prompt: "What role does culture play in shaping a person's identity?",
      hint: "Nêu quan điểm về vai trò của văn hóa đối với con người.",
      keywordGroups: [
        ["culture", "identity", "shape", "influence"],
        ["because", "for instance", "for example"],
      ],
    },
    {
      id: "ls-c1-5",
      prompt: "How should society balance economic growth with environmental protection?",
      hint: "Nêu quan điểm về cách cân bằng giữa phát triển kinh tế và bảo vệ môi trường.",
      keywordGroups: [
        ["economic growth", "environment", "environmental", "balance", "sustainable"],
        ["should", "because", "however"],
      ],
    },
    {
      id: "ls-c1-6",
      prompt: "Discuss the impact of globalization on local traditions and cultures.",
      hint: "Thảo luận về ảnh hưởng của toàn cầu hóa đến văn hóa/truyền thống địa phương.",
      keywordGroups: [
        ["globalization", "globalisation", "traditions", "local culture"],
        ["impact", "effect", "influence", "because"],
      ],
    },
  ],
  C2: [
    {
      id: "ls-c2-1",
      prompt: "Is it possible for a society to be both completely free and completely equal? Discuss.",
      hint: "Thảo luận sâu, có thể nêu ví dụ hoặc phản biện.",
      keywordGroups: [
        ["free", "freedom", "equal", "equality", "society"],
        ["however", "on the other hand", "trade-off", "because"],
      ],
    },
    {
      id: "ls-c2-2",
      prompt: "To what extent should individual privacy be sacrificed for public safety?",
      hint: "Nêu lập luận cân bằng giữa quyền riêng tư và an toàn công cộng.",
      keywordGroups: [
        ["privacy", "public safety", "security"],
        ["extent", "sacrifice", "trade-off", "because", "however"],
      ],
    },
    {
      id: "ls-c2-3",
      prompt: "How do you evaluate the trade-off between technological progress and its unintended consequences?",
      hint: "Đánh giá sự đánh đổi giữa tiến bộ công nghệ và hệ quả không mong muốn.",
      keywordGroups: [
        ["technological progress", "technology", "unintended consequences", "trade-off"],
        ["however", "because", "on the other hand"],
      ],
    },
    {
      id: "ls-c2-4",
      prompt: "Do you believe morality is universal, or is it shaped entirely by culture? Justify your view.",
      hint: "Nêu quan điểm triết học và lập luận bảo vệ quan điểm đó.",
      keywordGroups: [
        ["morality", "moral", "universal", "culture", "relative"],
        ["believe", "because", "however", "argue"],
      ],
    },
    {
      id: "ls-c2-5",
      prompt: "What responsibility do wealthy nations have toward addressing global inequality?",
      hint: "Thảo luận về trách nhiệm của các quốc gia giàu đối với bất bình đẳng toàn cầu.",
      keywordGroups: [
        ["wealthy nations", "developed countries", "global inequality", "responsibility"],
        ["should", "because", "however"],
      ],
    },
    {
      id: "ls-c2-6",
      prompt: "Discuss whether artistic expression should have any limits in a free society.",
      hint: "Thảo luận về giới hạn (nếu có) của tự do sáng tạo nghệ thuật.",
      keywordGroups: [
        ["artistic expression", "art", "free society", "freedom", "censorship"],
        ["limits", "should", "because", "however"],
      ],
    },
  ],
};
