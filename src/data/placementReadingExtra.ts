import type { CEFRLevel, ReadingTest } from "../types";

// A second, independent set of reading passages (one per level), used only by
// the placement test so a retake ("Làm lại") shows genuinely different
// questions instead of the exact same passage as the previous attempt.
export const placementReadingVariantB: Record<CEFRLevel, ReadingTest> = {
  A1: {
    level: "A1",
    title: "My Daily Routine",
    passage:
      "My name is Tom. I wake up at seven o'clock every morning. First, I brush my teeth and eat breakfast. Then I go to school by bus. After school, I do my homework and play with my dog. I go to bed at nine o'clock.",
    questions: [
      {
        id: "a1-rb1",
        question: "What time does Tom wake up?",
        options: ["Seven o'clock", "Six o'clock", "Eight o'clock", "Nine o'clock"],
        correctAnswer: "Seven o'clock",
      },
      {
        id: "a1-rb2",
        question: "How does Tom go to school?",
        options: ["By car", "By bike", "By bus", "On foot"],
        correctAnswer: "By bus",
      },
    ],
  },
  A2: {
    level: "A2",
    title: "Planning a Weekend Trip",
    passage:
      "Mai and her friends are planning a trip to Sapa next weekend. They will travel by train because it is cheaper than flying. They plan to hike in the mountains and try local food. Mai is a little worried about the cold weather, so she is bringing a warm jacket.",
    questions: [
      {
        id: "a2-rb1",
        question: "How will Mai and her friends travel to Sapa?",
        options: ["By plane", "By train", "By car", "By bus"],
        correctAnswer: "By train",
      },
      {
        id: "a2-rb2",
        question: "Why is Mai bringing a warm jacket?",
        options: [
          "Because she doesn't like the sun",
          "Because her friend told her to",
          "Because it always rains heavily in Sapa during this season",
          "Because she is worried about the cold weather",
        ],
        correctAnswer: "Because she is worried about the cold weather",
      },
    ],
  },
  B1: {
    level: "B1",
    title: "The Benefits of Reading",
    passage:
      "Reading books regularly can improve your vocabulary, concentration, and imagination. Many experts recommend reading at least twenty minutes a day. Unlike watching videos, reading requires active thinking, which helps keep the brain sharp. Some people prefer physical books, while others enjoy e-books because they are easy to carry. Whichever format you choose, the important thing is to make reading a daily habit.",
    questions: [
      {
        id: "b1-rb1",
        question: "According to the passage, what does reading improve?",
        options: [
          "Vocabulary, concentration, and imagination",
          "Only your vocabulary",
          "Your ability to watch videos",
          "Your overall typing and computer keyboard speed",
        ],
        correctAnswer: "Vocabulary, concentration, and imagination",
      },
      {
        id: "b1-rb2",
        question: "Why do some people prefer e-books?",
        options: ["They are cheaper than physical books", "They have better stories", "They are easy to carry", "They don't require batteries"],
        correctAnswer: "They are easy to carry",
      },
    ],
  },
  B2: {
    level: "B2",
    title: "The Rise of Freelancing",
    passage:
      "Over the past decade, freelancing has become an increasingly popular career choice. Advances in technology now allow people to work remotely for clients around the world, offering greater flexibility than traditional office jobs. However, freelancers often face challenges such as inconsistent income and a lack of employer-provided benefits like health insurance. Despite these drawbacks, surveys suggest that most freelancers report higher job satisfaction than their traditionally employed counterparts.",
    questions: [
      {
        id: "b2-rb1",
        question: "What advantage of freelancing does the passage mention?",
        options: [
          "Guaranteed high income every month",
          "Greater flexibility than traditional office jobs",
          "Free health insurance for everyone",
          "Significantly shorter working hours compared to regular employees",
        ],
        correctAnswer: "Greater flexibility than traditional office jobs",
      },
      {
        id: "b2-rb2",
        question: "What challenge do freelancers often face?",
        options: ["Too much vacation time", "Boring daily tasks", "Strict company rules", "Inconsistent income"],
        correctAnswer: "Inconsistent income",
      },
    ],
  },
  C1: {
    level: "C1",
    title: "The Ethics of Artificial Intelligence",
    passage:
      "As artificial intelligence systems become more capable, questions about their ethical use have grown increasingly urgent. Critics warn that algorithms trained on biased data can perpetuate existing social inequalities, sometimes in ways that are difficult to detect. Proponents counter that, when properly regulated, AI can actually reduce human bias in decisions such as hiring or lending. The central challenge, many argue, lies not in the technology itself but in ensuring meaningful human oversight throughout its development and deployment.",
    questions: [
      {
        id: "c1-rb1",
        question: "What do critics warn about AI?",
        options: [
          "It can perpetuate existing social inequalities",
          "It is too expensive to develop",
          "It will replace all human jobs immediately",
          "It cannot realistically be regulated by any government at all",
        ],
        correctAnswer: "It can perpetuate existing social inequalities",
      },
      {
        id: "c1-rb2",
        question: "According to proponents, what can AI do when properly regulated?",
        options: ["Eliminate the need for human oversight", "Guarantee perfect accuracy always", "Reduce human bias in decisions", "Replace the need for regulation"],
        correctAnswer: "Reduce human bias in decisions",
      },
    ],
  },
  C2: {
    level: "C2",
    title: "The Limits of Rational Choice Theory",
    passage:
      "Rational choice theory assumes that individuals consistently act to maximize their own self-interest based on available information. Yet behavioral economists have repeatedly demonstrated that human decision-making frequently deviates from this idealized model, often influenced by cognitive biases, social pressures, and emotional states rather than pure logic. These deviations, once dismissed as mere anomalies, are now understood to be systematic and predictable, prompting a fundamental reassessment of how economic models ought to account for genuinely human behavior.",
    questions: [
      {
        id: "c2-rb1",
        question: "What does rational choice theory assume?",
        options: [
          "That people always act completely randomly",
          "That individuals act to maximize self-interest",
          "That emotions drive all decisions",
          "That markets are always completely unpredictable and chaotic",
        ],
        correctAnswer: "That individuals act to maximize self-interest",
      },
      {
        id: "c2-rb2",
        question: "How are the deviations from rational choice theory now understood?",
        options: ["As random and impossible to predict", "As rare exceptions to the rule", "As errors in data collection", "As systematic and predictable"],
        correctAnswer: "As systematic and predictable",
      },
    ],
  },
};
