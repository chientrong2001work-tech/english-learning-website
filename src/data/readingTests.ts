import type { ReadingTest } from "../types";

export const readingTests: ReadingTest[] = [
  {
    level: "A1",
    title: "My Family",
    passage:
      "Hi, my name is Lan. I am ten years old. I live in a small house with my family. I have a mother, a father, and one brother. My mother is a teacher. My father works in a shop. I love my family very much. Every day, we eat dinner together and talk about our day.",
    questions: [
      {
        id: "a1-r1",
        question: "How old is Lan?",
        options: ["Ten", "Nine", "Eleven", "Twelve"],
        correctAnswer: "Ten",
      },
      {
        id: "a1-r2",
        question: "What does Lan's mother do?",
        options: ["Doctor", "Shop owner", "Student", "Teacher"],
        correctAnswer: "Teacher",
      },
      {
        id: "a1-r3",
        question: "What does Lan's family do every day?",
        options: ["Watch television every evening", "Eat dinner together", "Go shopping at the market", "Play games in the garden"],
        correctAnswer: "Eat dinner together",
      },
    ],
  },
  {
    level: "A2",
    title: "A Trip to the Beach",
    passage:
      "Last weekend, my friends and I went to the beach. We left home early in the morning because we wanted to avoid the traffic. When we arrived, the weather was sunny and warm. We swam in the sea, played volleyball, and had a picnic lunch. In the afternoon, it started to rain, so we decided to go home early. It was still a great day, and we are planning another trip next month.",
    questions: [
      {
        id: "a2-r1",
        question: "Why did they leave home early?",
        options: ["To watch the sunrise", "To catch a bus", "To avoid traffic", "Because it was raining"],
        correctAnswer: "To avoid traffic",
      },
      {
        id: "a2-r2",
        question: "What was the weather like when they arrived?",
        options: ["Sunny and warm", "Cold and windy", "Rainy", "Cloudy"],
        correctAnswer: "Sunny and warm",
      },
      {
        id: "a2-r3",
        question: "Why did they go home early?",
        options: ["They were tired", "The beach closed", "They finished their food", "It started to rain"],
        correctAnswer: "It started to rain",
      },
    ],
  },
  {
    level: "B1",
    title: "Learning a New Language",
    passage:
      "Learning a new language can be challenging, but it also brings many benefits. Many people believe that living in a country where the language is spoken is the fastest way to learn. However, with modern technology, you can now practice speaking, listening, and writing skills from home. The key to success is consistency: studying a little every day is usually more effective than studying for many hours once a week. Also, making mistakes is a natural part of the process, so learners should not be afraid to speak, even if they are not confident yet.",
    questions: [
      {
        id: "b1-r1",
        question: "According to the passage, what is the fastest way to learn a language?",
        options: ["Studying grammar books every weekend", "Living where the language is spoken", "Watching movies without subtitles", "Taking expensive online courses"],
        correctAnswer: "Living where the language is spoken",
      },
      {
        id: "b1-r2",
        question: "What does the passage say about mistakes?",
        options: ["They should always be avoided completely", "They slow down your overall progress", "They are a natural part of learning", "Only complete beginners make them"],
        correctAnswer: "They are a natural part of learning",
      },
      {
        id: "b1-r3",
        question: "What is the key to successful language learning, according to the text?",
        options: ["Consistency", "Talent", "Expensive courses", "Living abroad"],
        correctAnswer: "Consistency",
      },
    ],
  },
  {
    level: "B2",
    title: "The Impact of Social Media",
    passage:
      "Social media has transformed the way people communicate, share information, and form opinions. While it offers undeniable benefits, such as connecting people across the globe and giving a voice to those who previously had none, it also raises significant concerns. Critics argue that constant exposure to curated, idealized versions of other people's lives can negatively affect users' mental health and self-esteem. Furthermore, the rapid spread of misinformation on these platforms has made it increasingly difficult for the public to distinguish fact from fiction. As a result, many experts advocate for greater media literacy education to help users navigate this complex digital landscape.",
    questions: [
      {
        id: "b2-r1",
        question: "What benefit of social media is mentioned in the passage?",
        options: ["It replaces traditional education", "It eliminates misinformation", "It reduces screen time", "It connects people globally"],
        correctAnswer: "It connects people globally",
      },
      {
        id: "b2-r2",
        question: "According to critics, what can negatively affect users?",
        options: ["Having an extremely slow home internet connection speed", "Exposure to idealized versions of others' lives", "Seeing too many advertisements online", "The lack of new platform features"],
        correctAnswer: "Exposure to idealized versions of others' lives",
      },
      {
        id: "b2-r3",
        question: "What do many experts recommend?",
        options: ["Banning social media for everyone entirely", "Reducing everyone's internet access", "Greater media literacy education", "Introducing much stricter government regulation"],
        correctAnswer: "Greater media literacy education",
      },
    ],
  },
  {
    level: "C1",
    title: "Rethinking Economic Growth",
    passage:
      "For decades, gross domestic product (GDP) has served as the primary measure of a nation's prosperity. Yet a growing number of economists argue that this metric, while useful, offers an incomplete picture of societal well-being. GDP accounts for the total value of goods and services produced, but it fails to capture crucial factors such as income inequality, environmental degradation, and quality of life. Consequently, alternative indices — such as the Human Development Index and the Genuine Progress Indicator — have been proposed to provide a more holistic assessment. Proponents of these alternatives contend that policymakers who rely solely on GDP risk pursuing growth at the expense of long-term sustainability and social equity.",
    questions: [
      {
        id: "c1-r1",
        question: "What is the main criticism of GDP mentioned in the passage?",
        options: ["It offers an incomplete picture of well-being", "It has become too difficult to calculate accurately", "It is no longer used by any economists today", "It only measures environmental factors directly"],
        correctAnswer: "It offers an incomplete picture of well-being",
      },
      {
        id: "c1-r2",
        question: "What do alternative indices attempt to do?",
        options: ["Replace all forms of economic measurement entirely", "Simplify the way GDP itself is calculated", "Focus policy attention only on income levels", "Provide a more holistic assessment of prosperity"],
        correctAnswer: "Provide a more holistic assessment of prosperity",
      },
      {
        id: "c1-r3",
        question: "What risk do policymakers face if they rely solely on GDP?",
        options: ["Facing significant legal penalties from regulators", "Pursuing growth at the expense of sustainability and equity", "Losing several major international trade partners", "Triggering an immediate, severe, and totally unexpected economic collapse"],
        correctAnswer: "Pursuing growth at the expense of sustainability and equity",
      },
    ],
  },
  {
    level: "C2",
    title: "The Paradox of Choice",
    passage:
      "Contemporary consumer culture is predicated on the assumption that an abundance of options invariably enhances well-being. Paradoxically, empirical research suggests the opposite may be true: an overwhelming array of choices can induce decision paralysis and diminish overall satisfaction, a phenomenon psychologist Barry Schwartz termed 'the paradox of choice.' When confronted with excessive alternatives, individuals often experience heightened anxiety, second-guess their decisions, and attribute any resulting dissatisfaction to their own poor judgment rather than to the inherent difficulty of the decision itself. This insight has profound implications for fields ranging from retail design to public policy, suggesting that curated simplicity may, counterintuitively, foster greater contentment than unfettered abundance.",
    questions: [
      {
        id: "c2-r1",
        question: "What is \"the paradox of choice\"?",
        options: ["The widely-held idea that having more choices always leads to greater happiness", "A marketing strategy retailers use to increase sales", "The phenomenon where excessive choice can reduce satisfaction", "A structured method for simplifying difficult decisions"],
        correctAnswer: "The phenomenon where excessive choice can reduce satisfaction",
      },
      {
        id: "c2-r2",
        question: "What do individuals often do when faced with excessive alternatives?",
        options: ["Experience heightened anxiety and self-doubt", "Make their decisions much faster than usual", "Simply choose to ignore every single one of the available options", "Ask other people to decide for them instead"],
        correctAnswer: "Experience heightened anxiety and self-doubt",
      },
      {
        id: "c2-r3",
        question: "What does the passage suggest about curated simplicity?",
        options: ["It is generally less effective than having abundance", "It is a concept that only applies to retail settings", "It has essentially no real-world practical implications", "It may foster greater contentment than abundance"],
        correctAnswer: "It may foster greater contentment than abundance",
      },
    ],
  },
];
