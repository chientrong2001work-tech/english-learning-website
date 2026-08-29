import type { CEFRLevel, ReadingTest } from "../types";

// A third, independent reading passage per level, authored specifically for
// the roadmap's repeatable Reading practice tab. Combined with readingTests.ts
// and placementReadingExtra.ts's placementReadingVariantB in levelReading.ts,
// this gives each level 3 distinct passages so "Làm lại" can show genuinely
// different content instead of the same fixed passage every time.
export const levelReadingVariantC: Record<CEFRLevel, ReadingTest> = {
  A1: {
    level: "A1",
    title: "My Best Friend",
    passage:
      "My best friend's name is Mai. She is eleven years old. She has long black hair and she always smiles. Mai lives near my house, so we walk to school together every day. She likes drawing and I like football. On weekends, we often play in the park. Mai is very kind, and she always helps me with my homework.",
    questions: [
      {
        id: "a1-rc1",
        question: "How old is Mai?",
        options: ["Eleven", "Ten", "Twelve", "Nine"],
        correctAnswer: "Eleven",
      },
      {
        id: "a1-rc2",
        question: "How do the two friends get to school?",
        options: ["By bus", "They walk", "By bike", "By car"],
        correctAnswer: "They walk",
      },
      {
        id: "a1-rc3",
        question: "What does Mai like doing?",
        options: ["Playing football", "Drawing", "Cooking", "Swimming"],
        correctAnswer: "Drawing",
      },
    ],
  },
  A2: {
    level: "A2",
    title: "A Visit to the Doctor",
    passage:
      "Yesterday, Nam felt sick, so his mother took him to see a doctor. They waited for twenty minutes before the doctor called them in. The doctor checked Nam's temperature and looked at his throat. She said Nam had a cold and needed to rest for a few days. She gave him some medicine and told him to drink a lot of water. Nam stayed home from school for two days and felt much better afterward.",
    questions: [
      {
        id: "a2-rc1",
        question: "Why did Nam go to see a doctor?",
        options: ["He felt sick", "For a routine check-up", "To visit his mother", "To get new glasses"],
        correctAnswer: "He felt sick",
      },
      {
        id: "a2-rc2",
        question: "What did the doctor say Nam had?",
        options: ["A broken arm", "A cold", "A headache only", "An allergy"],
        correctAnswer: "A cold",
      },
      {
        id: "a2-rc3",
        question: "How long did Nam stay home from school?",
        options: ["One day", "A week", "Two days", "Three days"],
        correctAnswer: "Two days",
      },
    ],
  },
  B1: {
    level: "B1",
    title: "Working From Home",
    passage:
      "In recent years, more companies have allowed employees to work from home instead of coming to the office every day. Supporters say this saves commuting time and lets people focus better without office distractions. On the other hand, some workers feel lonely without daily contact with colleagues, and it can be harder to separate work time from personal time. Many companies now offer a hybrid model, where employees work from home a few days a week and come to the office on the others, trying to combine the benefits of both approaches.",
    questions: [
      {
        id: "b1-rc1",
        question: "What is one benefit of working from home mentioned in the passage?",
        options: ["Higher salary", "Saving commuting time", "Free daily meals", "More vacation days"],
        correctAnswer: "Saving commuting time",
      },
      {
        id: "b1-rc2",
        question: "What problem do some workers experience?",
        options: ["Feeling lonely", "Too much noise", "Longer working hours", "Slower internet"],
        correctAnswer: "Feeling lonely",
      },
      {
        id: "b1-rc3",
        question: "What is a hybrid model, according to the passage?",
        options: [
          "Working only from home",
          "Working only in the office",
          "A mix of home and office days",
          "Working different jobs at once",
        ],
        correctAnswer: "A mix of home and office days",
      },
    ],
  },
  B2: {
    level: "B2",
    title: "Urbanization and City Life",
    passage:
      "Cities around the world continue to grow at an unprecedented rate, as millions of people migrate from rural areas in search of better job opportunities and access to services. This rapid urbanization brings clear economic benefits, including increased productivity and innovation driven by dense concentrations of talent. However, it also places enormous strain on housing, transportation, and public infrastructure, often leading to overcrowding and rising living costs. Urban planners argue that sustainable growth requires proactive investment in affordable housing and efficient public transit long before a city reaches a crisis point.",
    questions: [
      {
        id: "b2-rc1",
        question: "Why are people migrating to cities, according to the passage?",
        options: [
          "Better job opportunities and services",
          "Lower cost of living",
          "Government requirements",
          "Better weather conditions",
        ],
        correctAnswer: "Better job opportunities and services",
      },
      {
        id: "b2-rc2",
        question: "What strain does rapid urbanization cause?",
        options: [
          "Reduced innovation",
          "Pressure on housing and infrastructure",
          "Lower productivity",
          "Fewer job opportunities",
        ],
        correctAnswer: "Pressure on housing and infrastructure",
      },
      {
        id: "b2-rc3",
        question: "What do urban planners recommend?",
        options: [
          "Waiting until a crisis happens",
          "Limiting migration to cities",
          "Proactive investment in housing and transit",
          "Reducing the number of jobs available",
        ],
        correctAnswer: "Proactive investment in housing and transit",
      },
    ],
  },
  C1: {
    level: "C1",
    title: "The Decline of Local Journalism",
    passage:
      "Local newspapers, once a cornerstone of civic life, have been closing at an alarming rate as advertising revenue shifts toward large digital platforms. This decline carries consequences that extend well beyond the loss of jobs in the industry: studies have found that communities without robust local news coverage tend to experience lower voter turnout and reduced government accountability, since fewer journalists remain to scrutinize local officials. Some media analysts propose nonprofit funding models or public subsidies as potential remedies, while others caution that such interventions risk compromising journalistic independence.",
    questions: [
      {
        id: "c1-rc1",
        question: "Why are local newspapers closing, according to the passage?",
        options: [
          "Advertising revenue shifting to digital platforms",
          "A lack of interest in local news",
          "Government restrictions on the press",
          "A shortage of trained journalists",
        ],
        correctAnswer: "Advertising revenue shifting to digital platforms",
      },
      {
        id: "c1-rc2",
        question: "What consequence of this decline does the passage mention?",
        options: [
          "Higher advertising costs",
          "Lower voter turnout",
          "Increased government transparency",
          "More local job opportunities",
        ],
        correctAnswer: "Lower voter turnout",
      },
      {
        id: "c1-rc3",
        question: "What concern do some analysts raise about proposed remedies?",
        options: [
          "They are too expensive to implement",
          "They risk compromising journalistic independence",
          "They would eliminate all local newspapers",
          "They require too much government staff",
        ],
        correctAnswer: "They risk compromising journalistic independence",
      },
    ],
  },
  C2: {
    level: "C2",
    title: "Epistemic Bubbles and Shared Reality",
    passage:
      "The proliferation of algorithmically curated information feeds has given rise to what scholars term 'epistemic bubbles' — insulated informational environments in which individuals are disproportionately exposed to content that reinforces their preexisting beliefs. Unlike a mere absence of dissenting views, these bubbles actively shape perception through selective reinforcement, gradually eroding the shared factual foundation upon which democratic deliberation depends. Some theorists contend that the remedy lies not simply in exposing individuals to opposing viewpoints, which can paradoxically entrench polarization, but in cultivating epistemic humility and a willingness to revise one's beliefs in light of credible countervailing evidence.",
    questions: [
      {
        id: "c2-rc1",
        question: "What is an 'epistemic bubble', according to the passage?",
        options: [
          "A complete absence of any information",
          "An insulated environment reinforcing preexisting beliefs",
          "A government policy restricting information",
          "A technical error in search algorithms",
        ],
        correctAnswer: "An insulated environment reinforcing preexisting beliefs",
      },
      {
        id: "c2-rc2",
        question: "What do epistemic bubbles erode, according to the passage?",
        options: [
          "Internet infrastructure",
          "The shared factual foundation for democratic deliberation",
          "Advertising revenue for media companies",
          "Access to algorithmic content",
        ],
        correctAnswer: "The shared factual foundation for democratic deliberation",
      },
      {
        id: "c2-rc3",
        question: "Why might simply exposing people to opposing viewpoints fail, per some theorists?",
        options: [
          "It is technically impossible to do",
          "It can paradoxically entrench polarization",
          "It always changes people's minds instantly",
          "It removes epistemic bubbles entirely",
        ],
        correctAnswer: "It can paradoxically entrench polarization",
      },
    ],
  },
};
