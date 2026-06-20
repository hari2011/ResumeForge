export type ExperienceLevel = "entry" | "mid" | "senior";

export interface ResumeSection {
  title: string;
  bullets: string[];
}

export interface ResumeDraftInput {
  fullName: string;
  targetRole: string;
  yearsOfExperience: number;
  industries: string;
  skills: string[];
  achievements: string;
  education: string;
  certifications: string;
  jobDescription?: string;
  templateId?: string;
}

export interface GeneratedResume {
  summary: string;
  sections: ResumeSection[];
  suggestedSkills: string[];
  score: number;
  missingKeywords: string[];
}

export interface ImprovementInput {
  existingResume: string;
  targetRole: string;
  jobDescription: string;
  templateId?: string;
}

export interface ResumeAnalysis {
  detectedRole: string;
  experienceLevel: string;
  overallStrength: number;
  tone: string;
  sections: Array<{ name: string; issue: string; suggestion: string }>;
  topImprovements: string[];
}

export interface ParsedResumeStructure {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  targetRole: string;
  summary: string;
  experience: Array<{
    company: string;
    title: string;
    location: string;
    startDate: string;
    endDate: string;
    current: boolean;
    description: string;
  }>;
  education: Array<{
    institution: string;
    degree: string;
    field: string;
    startYear: string;
    endYear: string;
    gpa: string;
  }>;
  skills: string[];
  certifications: string;
}

export interface AtsScoreResult {
  score: number;
  strengths: string[];
  risks: string[];
  missingKeywords: string[];
  recommendations: string[];
  aiInsights?: {
    semanticScore: number;
    bulletQuality: string[];
    sectionFeedback: string[];
    topSuggestion: string;
  };
}

export interface MarketTrendItem {
  role: string;
  topSkills: string[];
  salaryBandUsd: string;
  hiringMomentum: "rising" | "stable" | "cooling";
  summary: string;
}
