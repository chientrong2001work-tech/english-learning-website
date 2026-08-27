import type { CEFRLevel } from "../types";
import type { DialogueLine } from "../lib/speech";

export interface PlacementListeningItem {
  id: string;
  level: CEFRLevel;
  dialogue: DialogueLine[];
  question: string;
  correctAnswer: string;
  options: string[];
  // Normalized (lowercase, no punctuation) phrases accepted when the learner
  // types their answer instead of picking one of the options.
  acceptedTextAnswers: string[];
}

// Fixed (non-adaptive) short two-person dialogues — same every attempt, like
// EF SET's Quick Check, so results are comparable across attempts. Each item
// tests listening comprehension of a real exchange, not an isolated word.
export const placementListening: Record<CEFRLevel, PlacementListeningItem[]> = {
  A1: [
    {
      id: "pl-a1-1",
      level: "A1",
      dialogue: [
        { speaker: "A", text: "Hi Mai, how are you today?" },
        { speaker: "B", text: "I'm fine, thanks. And you?" },
        { speaker: "A", text: "I'm good. Do you want to have lunch together?" },
        { speaker: "B", text: "Yes, I'd love to!" },
      ],
      question: "What do the two speakers decide to do?",
      correctAnswer: "Have lunch together",
      options: ["Go to school", "Watch a movie", "Have lunch together", "Play football"],
      acceptedTextAnswers: ["have lunch", "have lunch together", "eat lunch together", "lunch together"],
    },
    {
      id: "pl-a1-2",
      level: "A1",
      dialogue: [
        { speaker: "A", text: "Excuse me, where is the bus stop?" },
        { speaker: "B", text: "It's next to the supermarket, over there." },
        { speaker: "A", text: "Thank you very much!" },
        { speaker: "B", text: "You're welcome." },
      ],
      question: "Where is the bus stop?",
      correctAnswer: "Next to the supermarket",
      options: ["Next to the school", "Next to the supermarket", "Behind the park", "In front of the hospital"],
      acceptedTextAnswers: ["next to the supermarket", "near the supermarket", "by the supermarket"],
    },
  ],
  A2: [
    {
      id: "pl-a2-1",
      level: "A2",
      dialogue: [
        { speaker: "A", text: "What are you doing this weekend?" },
        { speaker: "B", text: "I'm going to visit my grandparents in the countryside." },
        { speaker: "A", text: "That sounds nice. How long will you stay?" },
        { speaker: "B", text: "Just for two days, then I'll come back on Sunday evening." },
      ],
      question: "How long will the speaker stay at her grandparents' house?",
      correctAnswer: "Two days",
      options: ["One week", "Five days", "One day", "Two days"],
      acceptedTextAnswers: ["two days", "2 days"],
    },
    {
      id: "pl-a2-2",
      level: "A2",
      dialogue: [
        { speaker: "A", text: "I heard you got a new job. Congratulations!" },
        { speaker: "B", text: "Thanks! I start next Monday at a marketing company." },
        { speaker: "A", text: "Are you excited?" },
        { speaker: "B", text: "Yes, but also a little nervous because it's my first office job." },
      ],
      question: "Why is the speaker a little nervous?",
      correctAnswer: "Because it's her first office job",
      options: [
        "Because the salary is low",
        "Because the office is far away",
        "Because it's her first office job",
        "Because she doesn't like her boss",
      ],
      acceptedTextAnswers: ["first office job", "it's her first job", "first job"],
    },
  ],
  B1: [
    {
      id: "pl-b1-1",
      level: "B1",
      dialogue: [
        { speaker: "A", text: "Have you decided where to go for your holiday this year?" },
        { speaker: "B", text: "I'm thinking about going to Da Nang, but flights are quite expensive right now." },
        { speaker: "A", text: "Maybe you should book earlier next time to get a better price." },
        { speaker: "B", text: "You're right, I'll keep that in mind for next year." },
      ],
      question: "Why hasn't the speaker booked the trip yet?",
      correctAnswer: "Because the flights are expensive",
      options: [
        "Because she has no time off",
        "Because the flights are expensive",
        "Because the weather is bad",
        "Because she doesn't like Da Nang",
      ],
      acceptedTextAnswers: ["flights are expensive", "expensive flights", "flight prices are high"],
    },
    {
      id: "pl-b1-2",
      level: "B1",
      dialogue: [
        { speaker: "A", text: "I'm thinking about switching careers to something in technology." },
        { speaker: "B", text: "Really? What's making you consider that?" },
        { speaker: "A", text: "My current job doesn't offer much room to grow, and I've always been interested in coding." },
        { speaker: "B", text: "That makes sense. Have you started learning any programming yet?" },
      ],
      question: "Why does the speaker want to switch careers?",
      correctAnswer: "The current job has little room to grow",
      options: [
        "The salary is too low",
        "The job requires too much travel",
        "The company is closing down",
        "The current job has little room to grow",
      ],
      acceptedTextAnswers: ["little room to grow", "no room to grow", "not much room to grow"],
    },
  ],
  B2: [
    {
      id: "pl-b2-1",
      level: "B2",
      dialogue: [
        { speaker: "A", text: "Do you think remote work will remain common after the pandemic?" },
        { speaker: "B", text: "I do, actually. Many companies realized productivity didn't drop, and employees value the flexibility." },
        { speaker: "A", text: "True, though some argue that collaboration suffers without face-to-face contact." },
        { speaker: "B", text: "That's a fair point, but I think a hybrid model could balance both concerns." },
      ],
      question: "What does speaker B suggest as a solution?",
      correctAnswer: "A hybrid work model",
      options: ["Returning fully to the office", "Reducing working hours", "A hybrid work model", "Hiring more staff"],
      acceptedTextAnswers: ["hybrid model", "hybrid work model", "a mix of remote and office work"],
    },
    {
      id: "pl-b2-2",
      level: "B2",
      dialogue: [
        { speaker: "A", text: "The city council just approved a new plan to reduce traffic congestion downtown." },
        { speaker: "B", text: "Oh? What does the plan involve?" },
        {
          speaker: "A",
          text: "They're expanding the bus network and adding more bike lanes to encourage people to leave their cars at home.",
        },
        { speaker: "B", text: "That could really help, as long as the buses actually run on time." },
      ],
      question: "What is one part of the new plan?",
      correctAnswer: "Adding more bike lanes",
      options: ["Building a new highway", "Adding more bike lanes", "Banning bicycles downtown", "Increasing parking fees only"],
      acceptedTextAnswers: ["more bike lanes", "adding bike lanes", "bike lanes"],
    },
  ],
  C1: [
    {
      id: "pl-c1-1",
      level: "C1",
      dialogue: [
        { speaker: "A", text: "I've been reading about how automation might reshape the job market over the next decade." },
        { speaker: "B", text: "It's a complicated issue. Some sectors will lose jobs, but new industries tend to emerge as well." },
        { speaker: "A", text: "True, but the concern is whether workers will have the skills needed for those new roles." },
        { speaker: "B", text: "Exactly — that's why retraining programs are becoming such a critical policy discussion." },
      ],
      question: "What does speaker B identify as the key concern being discussed?",
      correctAnswer: "Whether workers can be retrained for new roles",
      options: [
        "Whether automation will completely stop",
        "Whether companies will go bankrupt",
        "Whether wages will increase immediately",
        "Whether workers can be retrained for new roles",
      ],
      acceptedTextAnswers: ["retraining workers", "workers need retraining", "retraining for new roles"],
    },
    {
      id: "pl-c1-2",
      level: "C1",
      dialogue: [
        { speaker: "A", text: "The new environmental regulations have sparked quite a debate among manufacturers." },
        { speaker: "B", text: "I can imagine. Compliance costs must be significant for smaller companies." },
        {
          speaker: "A",
          text: "That's the main objection, yes — though supporters argue the long-term environmental benefits outweigh the short-term costs.",
        },
        { speaker: "B", text: "It's the classic tension between economic and environmental priorities." },
      ],
      question: "What is the manufacturers' main objection to the new regulations?",
      correctAnswer: "The high cost of compliance",
      options: [
        "The regulations are too vague",
        "The regulations favor large companies",
        "The high cost of compliance",
        "The regulations were announced too late",
      ],
      acceptedTextAnswers: ["compliance costs", "cost of compliance", "high compliance costs"],
    },
  ],
  C2: [
    {
      id: "pl-c2-1",
      level: "C2",
      dialogue: [
        {
          speaker: "A",
          text: "Critics argue that the merger will stifle competition, while the companies insist it will drive innovation through shared resources.",
        },
        {
          speaker: "B",
          text: "It's rarely so clear-cut, though. Regulatory bodies often struggle to predict long-term market effects with any real precision.",
        },
        { speaker: "A", text: "Right, and by the time the effects are measurable, the market structure may already be irreversibly altered." },
        { speaker: "B", text: "Which is precisely why some economists advocate for more cautious, incremental approval processes." },
      ],
      question: "What do some economists advocate for, according to speaker B?",
      correctAnswer: "A more cautious, incremental approval process",
      options: [
        "Immediate approval of all mergers",
        "A more cautious, incremental approval process",
        "Banning all corporate mergers",
        "Ignoring regulatory bodies entirely",
      ],
      acceptedTextAnswers: ["cautious approval process", "incremental approval", "gradual approval process"],
    },
    {
      id: "pl-c2-2",
      level: "C2",
      dialogue: [
        {
          speaker: "A",
          text: "The report suggests that the policy's unintended consequences may have outweighed its original benefits.",
        },
        { speaker: "B", text: "That's a fairly damning assessment. Did they offer any explanation for the discrepancy?" },
        {
          speaker: "A",
          text: "They attribute it largely to the fact that the policy was implemented without adequate consultation with local stakeholders.",
        },
        { speaker: "B", text: "Which, in hindsight, seems like a rather predictable oversight." },
      ],
      question: "What do they attribute the policy's problems to?",
      correctAnswer: "A lack of consultation with local stakeholders",
      options: [
        "A shortage of funding",
        "Poor timing of the announcement",
        "Opposition from foreign governments",
        "A lack of consultation with local stakeholders",
      ],
      acceptedTextAnswers: ["lack of consultation", "no consultation with stakeholders", "insufficient consultation"],
    },
  ],
};
