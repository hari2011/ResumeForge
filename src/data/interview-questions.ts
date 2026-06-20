export interface InterviewQuestion {
  category: string;
  question: string;
  tipsByRole: Record<string, string>;
}

export const interviewQuestions: InterviewQuestion[] = [
  {
    category: "Behavioral",
    question: "Tell me about a time you overcame a significant challenge at work.",
    tipsByRole: {
      "product-manager":
        "Highlight how you gathered data, collaborated with teams, and measured outcomes.",
      "software-engineer":
        "Emphasize problem-solving, technical approach, and lessons learned.",
      "data-analyst":
        "Focus on insights discovered, stakeholder communication, and impact.",
    },
  },
  {
    category: "Behavioral",
    question: "Describe a situation where you had to work with a difficult team member.",
    tipsByRole: {
      "product-manager":
        "Show empathy, communication skills, and win-win outcomes.",
      "software-engineer":
        "Demonstrate collaboration and willingness to compromise for the team.",
      "data-analyst":
        "Highlight how you explained complex concepts clearly.",
    },
  },
  {
    category: "Technical",
    question: "Walk us through your approach to solving a complex problem.",
    tipsByRole: {
      "product-manager":
        "Use frameworks: define problem, gather data, analyze, recommend, measure.",
      "software-engineer": "Show your thinking: clarify requirements, design, tradeoffs, testing.",
      "data-analyst":
        "Explain: hypothesis, data sources, methodology, validation, storytelling.",
    },
  },
  {
    category: "Motivation",
    question: "Why are you interested in this role and company?",
    tipsByRole: {
      "product-manager":
        "Research their strategy, market position, and how you can drive growth.",
      "software-engineer":
        "Discuss their tech stack, engineering culture, and growth opportunities.",
      "data-analyst":
        "Highlight their data maturity, challenges, and your contribution.",
    },
  },
  {
    category: "Growth",
    question: "Where do you see yourself in five years?",
    tipsByRole: {
      "product-manager":
        "Show ambition: leading teams, owning strategy, broader business impact.",
      "software-engineer":
        "Express growth: technical depth, leadership, architectural influence.",
      "data-analyst":
        "Demonstrate progression: strategic analytics, cross-functional leadership.",
    },
  },
];

export function getInterviewTips(role: string): InterviewQuestion[] {
  const normalizedRole = role.toLowerCase().replace(/\s+/g, "-");
  return interviewQuestions.map((q) => ({
    ...q,
    tipsByRole: {
      [normalizedRole]: q.tipsByRole[normalizedRole] || q.tipsByRole["product-manager"],
    },
  }));
}
