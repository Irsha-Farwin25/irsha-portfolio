import type { Achievement } from "@/lib/types";

/**
 * PLACEHOLDER: only the ICODE 2026 presentation is confirmed. The remaining
 * entries are bracketed templates — replace or remove before launch.
 */
export const achievements: Achievement[] = [
  {
    id: "icode-2026-presentation",
    title: "Research presentation accepted — ICODE 2026",
    category: "Conference",
    date: "2026",
    description:
      "“AI-Powered University and Career Guidance Platform for Equitable Access in Sri Lanka”, presented as part of ongoing MSc research.",
  },
  {
    id: "academic-placeholder",
    title: "[Academic honor, dean's list, or distinction]",
    category: "Academic",
    issuer: "[Issuing institution]",
    date: "[Year]",
    description: "[Add a verified academic honor if applicable — remove this entry otherwise.]",
    isPlaceholder: true,
  },
  {
    id: "certification-placeholder",
    title: "[Professional certification]",
    category: "Certification",
    issuer: "[Issuing body]",
    date: "[Year]",
    description: "[Add a verified certification if applicable — remove this entry otherwise.]",
    isPlaceholder: true,
  },
];
