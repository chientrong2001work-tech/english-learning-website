export interface PlacementSpeakingQuestion {
  id: string;
  prompt: string;
  hint: string;
}

// IELTS Part 1-style personal questions — answered aloud in full sentences,
// not read-aloud vocabulary, so the recording reflects real spontaneous speech.
export const placementSpeakingQuestions: PlacementSpeakingQuestion[] = [
  {
    id: "sp-1",
    prompt: "What is your name, and where are you from?",
    hint: "Giới thiệu tên và quê quán / nơi bạn sống.",
  },
  {
    id: "sp-2",
    prompt: "Do you work or study? Can you tell me a bit about it?",
    hint: "Nói về công việc hoặc việc học hiện tại của bạn.",
  },
  {
    id: "sp-3",
    prompt: "What do you like to do in your free time, and why?",
    hint: "Nói về sở thích của bạn và lý do bạn thích điều đó.",
  },
];
