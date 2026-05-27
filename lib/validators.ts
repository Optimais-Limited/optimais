import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  phone: z.string().max(40).optional().or(z.literal("")),
  company: z.string().max(160).optional().or(z.literal("")),
  subject: z.string().max(180).optional().or(z.literal("")),
  message: z.string().min(10).max(5000)
});

export const newsletterSchema = z.object({
  email: z.string().email(),
  name: z.string().max(120).optional().or(z.literal("")),
  interests: z.array(z.string().min(1).max(80)).default([])
});

const individualSignup = z.object({
  accountType: z.literal("individual"),
  firstName: z.string().min(1).max(80),
  lastName: z.string().min(1).max(80),
  email: z.string().email(),
  phone: z.string().max(40).optional().or(z.literal("")),
  country: z.string().max(100),
  serviceInterest: z.string().max(100).optional().or(z.literal("")),
  password: z.string().min(8).max(128),
});

const businessSignup = z.object({
  accountType: z.literal("business"),
  company: z.string().min(1).max(160),
  contactName: z.string().min(1).max(160),
  jobTitle: z.string().max(100).optional().or(z.literal("")),
  email: z.string().email(),
  phone: z.string().max(40).optional().or(z.literal("")),
  industry: z.string().max(100).optional().or(z.literal("")),
  country: z.string().max(100),
  serviceInterest: z.string().max(100).optional().or(z.literal("")),
  password: z.string().min(8).max(128),
});

export const signupSchema = z.discriminatedUnion("accountType", [individualSignup, businessSignup]);

export const scholarshipSchema = z.object({
  title: z.string().min(3).max(220),
  slug: z.string().min(3).max(240),
  provider: z.string().min(2).max(180),
  summary: z.string().min(10).max(700),
  description: z.string().optional(),
  applicationUrl: z.string().url(),
  sourceUrl: z.string().url().optional().or(z.literal("")),
  eligibleLevels: z.array(z.enum(["BACHELORS", "MASTERS", "PHD", "POSTDOC", "PROFESSIONAL_TRAINING"])).min(1),
  eligibleCountries: z.array(z.string()).default([]),
  regions: z.array(z.string()).default([]),
  fields: z.array(z.string()).default([]),
  fundingTypes: z.array(z.enum(["FULLY_FUNDED", "PARTIAL_FUNDING", "RESEARCH_GRANT", "FELLOWSHIP", "INTERNSHIP", "TRAINING"])).min(1),
  deadline: z.string().datetime().optional().or(z.literal("")),
  deadlineLabel: z.string().optional().or(z.literal("")),
  amount: z.string().optional().or(z.literal("")),
  isPublished: z.boolean().default(false)
});

export const blogPostSchema = z.object({
  title: z.string().min(3).max(220),
  slug: z.string().min(3).max(240),
  excerpt: z.string().max(500).optional().or(z.literal("")),
  content: z.string().min(20),
  coverImage: z.string().url().optional().or(z.literal("")),
  tags: z.array(z.string()).default([]),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("DRAFT")
});

export const savedScholarshipSchema = z.object({
  scholarshipId: z.string().min(1),
  notes: z.string().max(2000).optional().or(z.literal(""))
});

export const applicationRecordSchema = z.object({
  scholarshipId: z.string().optional().or(z.literal("")),
  title: z.string().min(2).max(220),
  provider: z.string().max(180).optional().or(z.literal("")),
  status: z.enum(["SAVED", "SHORTLISTED", "IN_PROGRESS", "SUBMITTED", "INTERVIEW", "AWARDED", "REJECTED", "ARCHIVED"]).default("SAVED"),
  deadline: z.string().datetime().optional().or(z.literal("")),
  nextStep: z.string().max(500).optional().or(z.literal("")),
  notes: z.string().max(4000).optional().or(z.literal("")),
  documents: z.array(z.string()).default([])
});

export const aiRequestSchema = z.object({
  feature: z.enum([
    "scholarship-recommender",
    "research-assistant",
    "government-search",
    "proposal-writer",
    "infrastructure-planner",
    "recommendations"
  ]),
  prompt: z.string().min(5).max(12000),
  context: z.record(z.unknown()).optional()
});
