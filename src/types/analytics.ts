export interface ResumeAnalytics {
  resumeId: string;
  createdAt: Date;
  updatedAt: Date;
  views: number;
  atsScore: number;
  keywordMatches: number;
  improvementSuggestions: string[];
  exportCount: Record<string, number>;
  lastAtsCheckDate: Date;
}

export interface UserSession {
  userId: string;
  resumeIds: string[];
  preferences: {
    theme: "light" | "dark";
    defaultTemplate: string;
    autoSave: boolean;
  };
}

export const createDefaultAnalytics = (resumeId: string): ResumeAnalytics => ({
  resumeId,
  createdAt: new Date(),
  updatedAt: new Date(),
  views: 0,
  atsScore: 0,
  keywordMatches: 0,
  improvementSuggestions: [],
  exportCount: { pdf: 0, docx: 0, txt: 0 },
  lastAtsCheckDate: new Date(),
});

export const createDefaultSession = (userId: string): UserSession => ({
  userId,
  resumeIds: [],
  preferences: {
    theme: "light",
    defaultTemplate: "modern-clean",
    autoSave: true,
  },
});
