export const industries = [
  "Technology",
  "Finance",
  "Healthcare",
  "E-commerce",
  "Education",
  "Manufacturing",
  "Consulting",
  "Media",
  "Government",
  "Nonprofit",
  "Telecommunications",
  "Energy",
];

export const marketCoreSkills = [
  "Communication",
  "Stakeholder management",
  "Problem solving",
  "Project management",
  "Data analysis",
  "Strategic planning",
  "Process improvement",
  "Cross-functional collaboration",
  "Presentation",
  "Documentation",
];

export const industrySkills: Record<string, string[]> = {
  Technology: [
    "System design",
    "API development",
    "Cloud platforms",
    "CI/CD",
    "Agile delivery",
    "Observability",
    "SQL",
    "Python",
  ],
  Finance: [
    "Financial modeling",
    "Risk analysis",
    "Regulatory compliance",
    "Forecasting",
    "Excel",
    "SQL",
    "Variance analysis",
    "Audit readiness",
  ],
  Healthcare: [
    "Patient workflow optimization",
    "EHR systems",
    "HIPAA compliance",
    "Care coordination",
    "Clinical documentation",
    "Quality assurance",
    "Data privacy",
    "Root cause analysis",
  ],
  "E-commerce": [
    "Conversion optimization",
    "Lifecycle marketing",
    "Merchandising",
    "A/B testing",
    "Customer analytics",
    "Retention strategy",
    "SEO",
    "Performance marketing",
  ],
  Education: [
    "Curriculum design",
    "Instructional strategy",
    "Student engagement",
    "Assessment design",
    "Classroom technology",
    "Program evaluation",
    "LMS platforms",
    "Training facilitation",
  ],
  Manufacturing: [
    "Lean operations",
    "Six Sigma",
    "Quality control",
    "Supply chain planning",
    "SOP development",
    "Safety compliance",
    "Inventory optimization",
    "Root cause analysis",
  ],
  Consulting: [
    "Client advisory",
    "Business analysis",
    "Workshop facilitation",
    "Requirements gathering",
    "Change management",
    "Executive communication",
    "Roadmapping",
    "Process redesign",
  ],
  Media: [
    "Content strategy",
    "Editorial planning",
    "Audience analytics",
    "Campaign management",
    "Brand storytelling",
    "Social media strategy",
    "SEO",
    "Copywriting",
  ],
  Government: [
    "Policy analysis",
    "Public program delivery",
    "Grant compliance",
    "Procurement",
    "Stakeholder engagement",
    "Reporting",
    "Risk management",
    "Data governance",
  ],
  Nonprofit: [
    "Fundraising",
    "Grant writing",
    "Program management",
    "Community outreach",
    "Volunteer coordination",
    "Impact measurement",
    "Partnership development",
    "Donor stewardship",
  ],
  Telecommunications: [
    "Network operations",
    "Service reliability",
    "Incident response",
    "Capacity planning",
    "Vendor management",
    "SLA management",
    "Change control",
    "Monitoring tools",
  ],
  Energy: [
    "Grid operations",
    "Asset management",
    "Regulatory compliance",
    "Environmental reporting",
    "Maintenance planning",
    "Risk assessment",
    "SCADA awareness",
    "Operational safety",
  ],
};

export const educationOptions = [
  "High School Diploma",
  "Associate Degree",
  "Bachelor of Arts (BA)",
  "Bachelor of Science (BS)",
  "Master of Business Administration (MBA)",
  "Master of Science (MS)",
  "Master of Arts (MA)",
  "Doctor of Philosophy (PhD)",
  "Professional Certification Program",
  "Bootcamp / Vocational Program",
];

/** Maps role keywords to the most common/recommended degree for that track */
export const roleEducationMap: Record<string, { recommended: string; fields: string[] }> = {
  "product manager": {
    recommended: "Master of Business Administration (MBA)",
    fields: ["Business Administration", "Computer Science", "Engineering", "Product Management"],
  },
  "software engineer": {
    recommended: "Bachelor of Science (BS)",
    fields: ["Computer Science", "Software Engineering", "Information Technology", "Electrical Engineering"],
  },
  "data analyst": {
    recommended: "Bachelor of Science (BS)",
    fields: ["Statistics", "Mathematics", "Computer Science", "Data Science", "Economics"],
  },
  "data scientist": {
    recommended: "Master of Science (MS)",
    fields: ["Data Science", "Machine Learning", "Statistics", "Computer Science"],
  },
  "cloud engineer": {
    recommended: "Bachelor of Science (BS)",
    fields: ["Computer Science", "Information Technology", "Network Engineering", "Cloud Computing"],
  },
  "marketing manager": {
    recommended: "Bachelor of Arts (BA)",
    fields: ["Marketing", "Business Administration", "Communications", "Advertising"],
  },
  "content strategist": {
    recommended: "Bachelor of Arts (BA)",
    fields: ["Communications", "Journalism", "English", "Marketing", "Media Studies"],
  },
  "sales executive": {
    recommended: "Bachelor of Arts (BA)",
    fields: ["Business Administration", "Marketing", "Communications", "Economics"],
  },
  "ux designer": {
    recommended: "Bachelor of Arts (BA)",
    fields: ["Human-Computer Interaction", "Graphic Design", "Industrial Design", "Psychology"],
  },
  "financial analyst": {
    recommended: "Bachelor of Science (BS)",
    fields: ["Finance", "Accounting", "Economics", "Business Administration"],
  },
  "nurse": {
    recommended: "Bachelor of Science (BS)",
    fields: ["Nursing", "Healthcare Administration", "Biology"],
  },
  "project manager": {
    recommended: "Bachelor of Science (BS)",
    fields: ["Project Management", "Business Administration", "Engineering", "Operations Management"],
  },
  "operations manager": {
    recommended: "Bachelor of Science (BS)",
    fields: ["Operations Management", "Business Administration", "Supply Chain", "Industrial Engineering"],
  },
  "devops engineer": {
    recommended: "Bachelor of Science (BS)",
    fields: ["Computer Science", "Information Technology", "Systems Engineering"],
  },
  "consultant": {
    recommended: "Master of Business Administration (MBA)",
    fields: ["Business Administration", "Management", "Economics", "Engineering"],
  },
  "teacher": {
    recommended: "Bachelor of Arts (BA)",
    fields: ["Education", "Curriculum Design", "Subject-Area Specialization"],
  },
};

/**
 * Returns the recommended education level and suggested fields of study for a given role.
 * Falls back to a generic recommendation if role is not in the map.
 */
export function getEducationRecommendation(
  targetRole: string
): { recommended: string; fields: string[] } {
  const normalized = targetRole.toLowerCase();
  const match = Object.entries(roleEducationMap).find(([key]) => normalized.includes(key));

  return (
    match?.[1] ?? {
      recommended: "Bachelor of Science (BS)",
      fields: ["Business Administration", "Information Technology", "Management", "Communications"],
    }
  );
}
