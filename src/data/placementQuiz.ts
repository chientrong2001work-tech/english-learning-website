import type { CEFRLevel } from "../types";

export interface PlacementListeningItem {
  id: string;
  level: CEFRLevel;
  word: string;
  correctAnswer: string;
  options: string[];
}

// Fixed (non-adaptive) listening items — same words and distractors every
// time, like EF SET's Quick Check, so results are comparable across attempts.
export const placementListening: Record<CEFRLevel, PlacementListeningItem[]> = {
  A1: [
    { id: "pl-a1-1", level: "A1", word: "hello", correctAnswer: "xin chào", options: ["xin chào", "tên", "cuốn sách", "con mèo"] },
    { id: "pl-a1-2", level: "A1", word: "family", correctAnswer: "gia đình", options: ["trường học", "buổi sáng", "gia đình", "con chó"] },
  ],
  A2: [
    { id: "pl-a2-1", level: "A2", word: "weather", correctAnswer: "thời tiết", options: ["kỳ nghỉ", "sở thích", "thời tiết", "cuối tuần"] },
    { id: "pl-a2-2", level: "A2", word: "improve", correctAnswer: "cải thiện", options: ["mời", "quên", "hứa", "cải thiện"] },
  ],
  B1: [
    { id: "pl-b1-1", level: "B1", word: "achieve", correctAnswer: "đạt được", options: ["môi trường", "cơ hội", "đạt được", "kinh nghiệm"] },
    { id: "pl-b1-2", level: "B1", word: "confident", correctAnswer: "tự tin", options: ["độc lập", "tự tin", "có trách nhiệm", "thái độ"] },
  ],
  B2: [
    { id: "pl-b2-1", level: "B2", word: "significant", correctAnswer: "đáng kể, quan trọng", options: ["gây tranh cãi", "bền vững", "đáng kể, quan trọng", "giả định"] },
    { id: "pl-b2-2", level: "B2", word: "perspective", correctAnswer: "quan điểm, góc nhìn", options: ["hậu quả", "quan điểm, góc nhìn", "thống trị", "mơ hồ"] },
  ],
  C1: [
    { id: "pl-c1-1", level: "C1", word: "meticulous", correctAnswer: "tỉ mỉ, cẩn thận", options: ["hùng biện", "thực dụng", "tỉ mỉ, cẩn thận", "sâu sắc"] },
    { id: "pl-c1-2", level: "C1", word: "resilient", correctAnswer: "kiên cường", options: ["mạch lạc", "kiên cường", "tùy tiện", "tinh tế"] },
  ],
  C2: [
    { id: "pl-c2-1", level: "C2", word: "ubiquitous", correctAnswer: "có mặt khắp nơi", options: ["khó hiểu", "hình mẫu", "có mặt khắp nơi", "hay thay đổi thất thường"] },
    { id: "pl-c2-2", level: "C2", word: "ephemeral", correctAnswer: "phù du, ngắn ngủi", options: ["minh oan", "che giấu", "có hại âm thầm", "phù du, ngắn ngủi"] },
  ],
};
