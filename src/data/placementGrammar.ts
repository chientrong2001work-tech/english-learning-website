import type { CEFRLevel, ReadingQuestion } from "../types";

export const placementGrammar: Record<CEFRLevel, ReadingQuestion[]> = {
  A1: [
    {
      id: "pg-a1-1",
      question: "She ___ a teacher.",
      options: ["is", "are", "am", "be"],
      correctAnswer: "is",
    },
    {
      id: "pg-a1-2",
      question: "There ___ two cats in the garden.",
      options: ["is", "am", "be", "are"],
      correctAnswer: "are",
    },
  ],
  A2: [
    {
      id: "pg-a2-1",
      question: "Yesterday, I ___ to the market.",
      options: ["go", "goes", "going", "went"],
      correctAnswer: "went",
    },
    {
      id: "pg-a2-2",
      question: "This book is ___ than that one.",
      options: ["interesting", "interestinger", "most interesting", "more interesting"],
      correctAnswer: "more interesting",
    },
  ],
  B1: [
    {
      id: "pg-b1-1",
      question: "I ___ my homework already.",
      options: ["finish", "finished", "am finishing", "have finished"],
      correctAnswer: "have finished",
    },
    {
      id: "pg-b1-2",
      question: "If it rains tomorrow, we ___ the picnic.",
      options: ["cancel", "canceled", "would cancel", "will cancel"],
      correctAnswer: "will cancel",
    },
  ],
  B2: [
    {
      id: "pg-b2-1",
      question: "The report ___ by the manager yesterday.",
      options: ["wrote", "has written", "is writing", "was written"],
      correctAnswer: "was written",
    },
    {
      id: "pg-b2-2",
      question: "If I ___ more time, I would travel more.",
      options: ["have", "has", "having", "had"],
      correctAnswer: "had",
    },
  ],
  C1: [
    {
      id: "pg-c1-1",
      question: "If she ___ harder, she would have passed the exam.",
      options: ["studied", "studies", "would study", "had studied"],
      correctAnswer: "had studied",
    },
    {
      id: "pg-c1-2",
      question: "Not only ___ late, but he also forgot the documents.",
      options: ["he was", "he is", "is he", "was he"],
      correctAnswer: "was he",
    },
  ],
  C2: [
    {
      id: "pg-c2-1",
      question: "It is essential that he ___ present at the meeting.",
      options: ["is", "was", "were", "be"],
      correctAnswer: "be",
    },
    {
      id: "pg-c2-2",
      question: "___ had I arrived when the phone rang.",
      options: ["As soon", "Not until", "Hardly ever", "No sooner"],
      correctAnswer: "No sooner",
    },
  ],
};
