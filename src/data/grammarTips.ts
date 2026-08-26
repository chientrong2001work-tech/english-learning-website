import type { GrammarTip } from "../types";

export const grammarTips: GrammarTip[] = [
  {
    id: "present-perfect",
    title: "Present Perfect",
    summary: "Diễn tả hành động đã xảy ra nhưng còn liên quan đến hiện tại.",
    structure: "S + have/has + V3/V-ed",
    example: "I have finished my homework. (Tôi đã làm xong bài tập.)",
  },
  {
    id: "first-conditional",
    title: "Câu điều kiện loại 1",
    summary: "Diễn tả một điều có khả năng xảy ra ở hiện tại/tương lai.",
    structure: "If + S + V(hiện tại), S + will + V(nguyên mẫu)",
    example: "If it rains, I will stay at home.",
  },
  {
    id: "comparative",
    title: "So sánh hơn",
    summary: "Dùng để so sánh hai đối tượng với nhau.",
    structure: "S + V + adj-er/more + adj + than + O",
    example: "This book is more interesting than that one.",
  },
  {
    id: "used-to",
    title: "Used to",
    summary: "Diễn tả thói quen hoặc trạng thái trong quá khứ, nay không còn nữa.",
    structure: "S + used to + V(nguyên mẫu)",
    example: "I used to live in Da Nang.",
  },
  {
    id: "passive-voice",
    title: "Câu bị động",
    summary: "Nhấn mạnh vào đối tượng chịu tác động của hành động.",
    structure: "S + be + V3/V-ed (+ by O)",
    example: "The cake was made by my sister.",
  },
  {
    id: "modal-verbs",
    title: "Động từ khuyết thiếu",
    summary: "Diễn tả khả năng, lời khuyên, sự cho phép...",
    structure: "S + modal verb (can/should/must...) + V(nguyên mẫu)",
    example: "You should drink more water.",
  },
];
