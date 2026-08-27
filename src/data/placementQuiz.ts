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
      options: ["Go to school together", "Watch a movie at the cinema", "Have lunch together", "Play football"],
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
      options: ["Next to the supermarket", "Next to the school", "Behind the park", "In front of the hospital"],
      acceptedTextAnswers: ["next to the supermarket", "near the supermarket", "by the supermarket"],
    },
    {
      id: "pl-a1-3",
      level: "A1",
      dialogue: [
        { speaker: "A", text: "Hello! What's your name?" },
        { speaker: "B", text: "My name is Huy. What's yours?" },
        { speaker: "A", text: "I'm Linh. Nice to meet you!" },
        { speaker: "B", text: "Nice to meet you too!" },
      ],
      question: "What is the first speaker's name?",
      correctAnswer: "Linh",
      options: ["Linh", "Minh", "Anna", "Hoai"],
      acceptedTextAnswers: ["linh"],
    },
    {
      id: "pl-a1-4",
      level: "A1",
      dialogue: [
        { speaker: "A", text: "Do you like coffee or tea?" },
        { speaker: "B", text: "I like tea. I don't drink coffee." },
        { speaker: "A", text: "Me too! Let's have some tea." },
        { speaker: "B", text: "Great idea!" },
      ],
      question: "What does the second speaker want to drink?",
      correctAnswer: "Tea",
      options: ["Tea", "Coffee", "Juice", "Water"],
      acceptedTextAnswers: ["tea"],
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
        "Because she doesn't like her boss",
        "Because it's her first office job",
      ],
      acceptedTextAnswers: ["first office job", "it's her first job", "first job"],
    },
    {
      id: "pl-a2-3",
      level: "A2",
      dialogue: [
        { speaker: "A", text: "What time does the movie start tonight?" },
        { speaker: "B", text: "It starts at eight, but let's meet at seven thirty for dinner first." },
        { speaker: "A", text: "Sounds good. Where should we eat?" },
        { speaker: "B", text: "There's a new pizza place near the cinema." },
      ],
      question: "What time does the movie start?",
      correctAnswer: "Eight",
      options: ["Seven", "Seven thirty", "Eight", "Nine"],
      acceptedTextAnswers: ["eight", "8 pm", "eight o'clock"],
    },
    {
      id: "pl-a2-4",
      level: "A2",
      dialogue: [
        { speaker: "A", text: "I can't find my keys anywhere!" },
        { speaker: "B", text: "Did you check your jacket pocket?" },
        { speaker: "A", text: "Oh, you're right, here they are! Thanks." },
        { speaker: "B", text: "No problem, that happens to me all the time." },
      ],
      question: "Where did the speaker find the keys?",
      correctAnswer: "In the jacket pocket",
      options: ["In the jacket pocket", "On the kitchen counter near the sink", "In the car", "Under the bed"],
      acceptedTextAnswers: ["jacket pocket", "in the jacket", "in his jacket pocket"],
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
        "Because the flights are expensive",
        "Because she has no time off",
        "Because the weather is bad",
        "Because she doesn't really like visiting Da Nang",
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
        "The company is unfortunately closing down completely",
        "The current job has little room to grow",
      ],
      acceptedTextAnswers: ["little room to grow", "no room to grow", "not much room to grow"],
    },
    {
      id: "pl-b1-3",
      level: "B1",
      dialogue: [
        { speaker: "A", text: "I'm really stressed about the presentation tomorrow." },
        { speaker: "B", text: "Have you practiced it in front of anyone yet?" },
        { speaker: "A", text: "Not yet, I've only rehearsed alone." },
        { speaker: "B", text: "You should practice in front of a friend tonight — it really helps with nerves." },
      ],
      question: "What does speaker B suggest?",
      correctAnswer: "Practice in front of a friend",
      options: ["Practice in front of a friend", "Cancel the presentation", "Read the slides out loud alone", "Ask for more time"],
      acceptedTextAnswers: ["practice in front of a friend", "practice with a friend", "rehearse in front of someone"],
    },
    {
      id: "pl-b1-4",
      level: "B1",
      dialogue: [
        { speaker: "A", text: "Why did you decide to start your own business instead of getting a regular job?" },
        { speaker: "B", text: "I wanted more control over my schedule, and I've always wanted to be my own boss." },
        { speaker: "A", text: "That makes sense. Isn't it risky though?" },
        { speaker: "B", text: "It is, but I think the freedom is worth the risk for me." },
      ],
      question: "Why did the speaker start a business?",
      correctAnswer: "To have more control over her schedule",
      options: [
        "To make more money quickly",
        "Because her friends convinced her to try it",
        "Because she lost her old job",
        "To have more control over her schedule",
      ],
      acceptedTextAnswers: ["more control over her schedule", "control over schedule", "be her own boss", "own boss"],
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
    {
      id: "pl-b2-3",
      level: "B2",
      dialogue: [
        { speaker: "A", text: "Have you seen the news about the new tax policy?" },
        { speaker: "B", text: "Yes, I think it could actually help small businesses, though some economists disagree." },
        { speaker: "A", text: "What's the main criticism?" },
        { speaker: "B", text: "They argue it doesn't do enough to address the bigger structural issues in the economy." },
      ],
      question: "What do critics say about the new tax policy?",
      correctAnswer: "It doesn't address bigger structural issues",
      options: [
        "It only benefits large corporations",
        "It will be repealed soon",
        "It doesn't address bigger structural issues",
        "It has essentially no economic impact at all on anyone",
      ],
      acceptedTextAnswers: ["doesn't address structural issues", "structural issues in the economy", "bigger structural issues"],
    },
    {
      id: "pl-b2-4",
      level: "B2",
      dialogue: [
        { speaker: "A", text: "I've been thinking about going back to university for a master's degree." },
        { speaker: "B", text: "That's a big commitment. What's motivating you?" },
        { speaker: "A", text: "Honestly, I feel like I've hit a ceiling at work without more qualifications." },
        { speaker: "B", text: "That's a fair reason. Have you looked into part-time programs?" },
      ],
      question: "Why is the speaker considering a master's degree?",
      correctAnswer: "She feels she has hit a ceiling at work",
      options: [
        "She wants to change careers completely",
        "Her company is paying for the entire program",
        "She feels she has hit a ceiling at work",
        "She misses being a student",
      ],
      acceptedTextAnswers: ["hit a ceiling at work", "hit a ceiling", "needs more qualifications"],
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
        "Whether wages will increase immediately for everyone involved",
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
    {
      id: "pl-c1-3",
      level: "C1",
      dialogue: [
        { speaker: "A", text: "The board seems divided over whether to expand into overseas markets." },
        { speaker: "B", text: "What's driving the hesitation?" },
        {
          speaker: "A",
          text: "Some members feel the company doesn't yet have the operational expertise to manage international logistics.",
        },
        { speaker: "B", text: "That's a reasonable concern, especially given how complex supply chains have become." },
      ],
      question: "Why are some board members hesitant about overseas expansion?",
      correctAnswer: "They doubt the company has the operational expertise",
      options: [
        "They think the market is too small",
        "They doubt the company has the operational expertise",
        "They are worried about currency exchange rates",
        "They believe international competitors are already far too strong",
      ],
      acceptedTextAnswers: ["lack operational expertise", "doubt operational expertise", "don't have the expertise"],
    },
    {
      id: "pl-c1-4",
      level: "C1",
      dialogue: [
        { speaker: "A", text: "I noticed the report downplays the project's budget overruns." },
        { speaker: "B", text: "That's concerning. Do you think it was intentional?" },
        { speaker: "A", text: "Hard to say, but the numbers are definitely presented selectively." },
        { speaker: "B", text: "We should raise this with the audit committee before the next meeting." },
      ],
      question: "What does speaker A suggest about the report?",
      correctAnswer: "The numbers are presented selectively",
      options: [
        "The report is completely accurate",
        "The numbers are presented selectively",
        "The budget overruns were minor",
        "The audit committee itself wrote the entire report",
      ],
      acceptedTextAnswers: ["presented selectively", "numbers are selective", "selectively presented"],
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
        "Ignoring regulatory bodies and their concerns entirely",
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
        "Opposition from several foreign governments and organizations",
        "A lack of consultation with local stakeholders",
      ],
      acceptedTextAnswers: ["lack of consultation", "no consultation with stakeholders", "insufficient consultation"],
    },
    {
      id: "pl-c2-3",
      level: "C2",
      dialogue: [
        { speaker: "A", text: "The committee's report seems to conflate correlation with causation throughout." },
        {
          speaker: "B",
          text: "I noticed that too — they attribute the productivity increase entirely to the new software, without ruling out other variables.",
        },
        { speaker: "A", text: "Exactly, and that undermines the credibility of their recommendations." },
        { speaker: "B", text: "Which is unfortunate, because the underlying data itself looks quite robust." },
      ],
      question: "What is the main flaw in the committee's report?",
      correctAnswer: "It conflates correlation with causation",
      options: [
        "It contains fabricated data",
        "It conflates correlation with causation",
        "It was published far too late",
        "It ignores productivity entirely and completely",
      ],
      acceptedTextAnswers: ["conflates correlation with causation", "correlation with causation", "confuses correlation and causation"],
    },
    {
      id: "pl-c2-4",
      level: "C2",
      dialogue: [
        {
          speaker: "A",
          text: "Some analysts contend the central bank's rate hike was premature, given how fragile the recovery still is.",
        },
        {
          speaker: "B",
          text: "Others argue that delaying it further would have risked a far more damaging bout of inflation down the line.",
        },
        { speaker: "A", text: "It really comes down to which risk you're more willing to tolerate." },
        { speaker: "B", text: "Precisely — there's no consensus, only competing assumptions about the economy's trajectory." },
      ],
      question: "What do some analysts believe about the rate hike?",
      correctAnswer: "It was premature given the fragile recovery",
      options: [
        "It should have happened much sooner",
        "It was premature given the fragile recovery",
        "It had no real effect on inflation",
        "It was unanimously supported by all economists",
      ],
      acceptedTextAnswers: ["premature", "too early given the recovery", "premature given fragile recovery"],
    },
  ],
};
