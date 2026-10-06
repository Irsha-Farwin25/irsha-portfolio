import type { ExperienceItem } from "@/lib/types";

/** Real work history. */
export const experience: ExperienceItem[] = [
  {
    id: "uda-software-engineer",
    organization: "Urban Development Authority",
    role: "Software Engineer",
    employmentType: "Full-time",
    startDate: "Sep 2025",
    endDate: null,
    location: "Colombo, Western Province, Sri Lanka",
    locationType: "On-site",
    summary:
      "Building and maintaining production web platforms for government digital transformation initiatives — administrative systems, public-facing services, and the APIs that connect them.",
    responsibilities: [
      // Mother Lanka was hers end to end; FMIS payments were a team effort, so it's credited as such.
      // **…** marks a key result, shown in bold.
      "Owned the **Mother Lanka Digital Wall end-to-end**: a trilingual (Sinhala, Tamil, English) citizen-engagement platform in daily public use, with **6 of its 7 modules live** and the seventh in final QA.",
      "Delivered its modules: development plan and regulation publishing, public consultation and feedback, online property bidding, development project oversight, and role-based user management with SMS notifications.",
      "Part of the team behind **UDA's first-ever online payment system** (FMIS, via GovPay and payment gateways), moving **13,500+ housing residents and 1,400+ marketplace merchants** from paper to digital payments, and passing **LKR 10 million within six months** of the February 2026 launch.",
      "Built and integrated REST APIs connecting frontend applications to backend services and third-party systems.",
      "Contributed to monitoring, debugging, and performance improvements on systems handling government-scale traffic and compliance requirements.",
    ],
    technologies: ["React", "Next.js", "Laravel", "MySQL", "REST APIs", "JavaScript", "TypeScript"],
    monogram: "UDA",
    sector: "government",
    about:
      "Sri Lanka's government agency that plans, regulates, and implements economic, social, environmental, and physical development in designated urban areas.",
    website: "https://www.uda.gov.lk/",
    // FMIS online payments (a team effort): UDA's first online payments, for 13,500+ residents and
    // 1,400+ merchants, past LKR 10M within six months of the Feb 2026 launch.
    headlineStats: [
      {
        prefix: "LKR",
        value: 10,
        suffix: "M+",
        label: "Payments processed via FMIS",
        proof: "UDA · first 6 months",
        segments: 6,
      },
      {
        value: 13500,
        suffix: "+",
        label: "Residents moved to digital payments",
        proof: "UDA · +1,400 merchants",
        segments: 6,
      },
    ],
    logo: "/experience/uda.png",
    projects: [
      "government-digital-services-portal",
      "procurement-bidding-system",
      "uda-financial-management-information-system",
    ],
  },
  {
    id: "unicornshift-software-engineer",
    organization: "UnicornShift",
    role: "Software Engineer",
    employmentType: "Contract",
    startDate: "Sep 2023",
    endDate: "Aug 2025",
    location: "Sydney, New South Wales, Australia",
    locationType: "Remote",
    summary:
      "Remote contract role with an Australian company, owning features end-to-end on its AI-powered platform for civil infrastructure contractors.",
    responsibilities: [
      "Developed features across the platform's React.js web app and its Node.js and GraphQL API.",
      "Built scalable frontend and backend features to connect contractors and streamline operations.",
      "Worked end-to-end from UI development to API design and database optimization.",
    ],
    technologies: ["React.js", "Node.js", "GraphQL", "MySQL", "Firebase", "JavaScript", "REST APIs"],
    monogram: "US",
    sector: "international",
    about:
      "Australian private company running an AI-powered procurement and shift-management platform built for the civil infrastructure construction and maintenance industry.",
    website: "https://unicornshift.net/",
    // Sydney is UTC+10 (AEST) or UTC+11 (AEDT); Colombo is UTC+5:30.
    remote: { from: "Colombo", gapHours: [4.5, 5.5] },
    // UNICORNSHIFT PTY LTD — Australian Private Company, active since Jan 2020 (NSW).
    registry: { id: "ABN 38 638 472 376", href: "https://abr.business.gov.au/ABN/View/38638472376" },
    logo: "/experience/unicornshift.png",
    logoFit: "cover",
    projects: ["unicornshift"],
  },
  {
    id: "acc-institute-intern",
    organization: "Arthur C Clarke Institute for Modern Technologies",
    role: "Software Engineer Intern",
    employmentType: "Full-time",
    startDate: "Jan 2022",
    endDate: "Jul 2022",
    location: "Colombo, Western Province, Sri Lanka",
    locationType: "On-site",
    summary:
      "Software engineering internship building management information systems: ACCIMT's own internal MIS, and an MIS for Buddhist and Pali University, Sri Lanka.",
    responsibilities: [
      "Contributed to ACCIMT's internal Management Information System, used by its research and administrative staff, spanning project management, procurement tracking, service agreements, automated attendance, and financial management.",
      "Developed a Management Information System for Buddhist and Pali University, Sri Lanka, handling trainee data and administrative workflows.",
      "Built frontend interfaces using Bootstrap and implemented backend functionalities with Laravel.",
      "Designed and maintained MySQL database schemas for efficient data storage and retrieval.",
    ],
    technologies: ["Laravel", "PHP", "Bootstrap", "MySQL"],
    monogram: "ACC",
    sector: "government",
    about:
      "Sri Lanka's government research agency for communication, robotics, space technology, electronics, industrial automation, and information technology.",
    website: "https://www.accimt.ac.lk/",
    // Research scientists, embedded systems engineers, and administrative staff.
    teamSize: "51–200",
    logo: "/experience/acc.png",
  },
];
