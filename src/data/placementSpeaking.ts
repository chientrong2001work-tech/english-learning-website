export interface PlacementSpeakingQuestion {
  id: string;
  prompt: string;
  hint: string;
  // Groups of synonym keywords an on-topic answer is expected to contain —
  // used to check the answer actually addresses the question, not just that
  // it's long enough or has varied vocabulary.
  keywordGroups: string[][];
}

// IELTS Part 1-style personal questions — answered aloud in full sentences,
// not read-aloud vocabulary, so the recording reflects real spontaneous speech.
export const placementSpeakingQuestions: PlacementSpeakingQuestion[] = [
  {
    id: "sp-1",
    prompt: "What is your name, and where are you from?",
    hint: "Giới thiệu tên và quê quán / nơi bạn sống.",
    keywordGroups: [
      ["my name", "i am called", "i'm called", "call me", "this is"],
      ["from", "i live", "i was born", "born in"],
    ],
  },
  {
    id: "sp-2",
    prompt: "Do you work or study? Can you tell me a bit about it?",
    hint: "Nói về công việc hoặc việc học hiện tại của bạn.",
    keywordGroups: [
      ["work", "job", "study", "studying", "student", "university", "college", "school", "company"],
    ],
  },
  {
    id: "sp-3",
    prompt: "What do you like to do in your free time, and why?",
    hint: "Nói về sở thích của bạn và lý do bạn thích điều đó.",
    keywordGroups: [
      ["like to", "enjoy", "love", "hobby", "free time", "spend time"],
      ["because", "since", "it makes me", "it helps", "so that"],
    ],
  },
];
