import type { Certificate, GalleryImage, NewsItem } from "@/lib/types";

/**
 * Courses, hackathons and conferences — each category is its own tab.
 * Put images in /public/achievements/certificates/.
 * `category` is one of: "Course" | "Hackathon" | "Conference".
 * Example:
 * { id: "aws-ccp", title: "AWS Certified Cloud Practitioner", issuer: "Amazon Web Services",
 *   category: "Course", date: "2025",
 *   image: "/achievements/certificates/aws-ccp.jpg", link: "https://..." },
 */
export const certificates: Certificate[] = [
  // Courses — newest first
  {
    id: "supervised-ml",
    title: "Supervised Machine Learning: Regression and Classification",
    issuer: "DeepLearning.AI & Stanford Online · Coursera",
    category: "Course",
    date: "May 2026",
    image: "/achievements/certificates/supervised-ml.jpeg",
    link: "https://coursera.org/verify/ZCRA7SZ4TELE",
  },
  {
    id: "meta-frontend",
    title: "Introduction to Front-End Development",
    issuer: "Meta · Coursera",
    category: "Course",
    date: "Dec 2025",
    image: "/achievements/certificates/meta-frontend.jpeg",
    link: "https://coursera.org/verify/VMKD2KYDKU5V",
  },
  {
    id: "testdome-mysql",
    title: "MySQL — Top 25%",
    issuer: "TestDome",
    category: "Course",
    date: "Dec 2022",
    description: "Passed the TestDome public MySQL skills test, ranking in the top 25%.",
    image: "/achievements/certificates/testdome-mysql.jpg",
    link: "https://www.testdome.com/certificates/8c233f37407441ebbb3e1408cb02dedb",
  },
  {
    id: "fcc-responsive-web-design",
    title: "Responsive Web Design",
    issuer: "freeCodeCamp",
    category: "Course",
    date: "Dec 2020",
    description: "Developer certification representing approximately 300 hours of coursework.",
    image: "/achievements/certificates/webdesigncourse.jpg",
    link: "https://freecodecamp.org/certification/fcc5323b5e0-6889-41b6-9b8c-18f984a00c83/responsive-web-design",
  },
  {
    id: "flutter-dart",
    title: "Introduction to Flutter Development Using Dart",
    issuer: "The App Brewery",
    category: "Course",
    date: "Jul 2020",
    image: "/achievements/certificates/FlutterCourse.png",
  },
  {
    id: "datacamp-sql",
    title: "Introduction to SQL",
    issuer: "DataCamp",
    category: "Course",
    date: "May 2020",
    image: "/achievements/certificates/SQLcourse.jpg",
  },

  // Hackathons
  {
    id: "hackmoral-3",
    title: "HackMoral 3.0 — Mini Hackathon",
    issuer: "INTECS, Faculty of IT, University of Moratuwa",
    category: "Hackathon",
    date: "Jan 2021",
    description: "Certificate of participation.",
    image: "/achievements/certificates/hackathon2.jpg",
  },
  {
    id: "code-rush-2020",
    title: "Code Rush 2020 — Intra-Faculty Coding Competition",
    issuer: "INTECS, Faculty of IT, University of Moratuwa",
    category: "Hackathon",
    date: "Jun 2020",
    description: "Competed as a member of team CODE_RAIN.",
    image: "/achievements/certificates/hackathon.jpg",
  },
  {
    id: "homealone-2020",
    title: "HomeAlone 2020 — Virtual Mini-Hackathon",
    issuer: "Students' Union, Faculty of IT, University of Moratuwa",
    category: "Hackathon",
    date: "Apr 2020",
    description: "Participated as a member of team Ada.",
    image: "/achievements/certificates/homeAloneHackathon.jpg",
  },

  // Conferences
  {
    id: "icode-2026-presentation",
    title: "Research presentation accepted — ICODE 2026",
    issuer: "ICODE 2026",
    category: "Conference",
    date: "2026",
    description:
      "“AI-Powered University and Career Guidance Platform for Equitable Access in Sri Lanka”, presented as part of ongoing MSc research.",
  },
  {
    id: "pycon-sl-2022",
    title: "PyCon Sri Lanka 2022",
    issuer: "PyCon Sri Lanka · AIESEC in University of Moratuwa",
    category: "Conference",
    date: "Feb 2022",
    description: "Participated in the largest online conference for the Python community in Sri Lanka.",
    image: "/achievements/certificates/pythonconference.jpg",
  },
];

/**
 * News highlights — put images in /public/achievements/news/.
 * Example:
 * { id: "icode-coverage", title: "Headline of the article", source: "Daily News", date: "2026",
 *   summary: "One line on what the story covered.", image: "/achievements/news/icode.jpg", link: "https://..." },
 */
export const news: NewsItem[] = [];

/**
 * Gallery — put images in /public/achievements/gallery/.
 * Example:
 * { id: "icode-stage", src: "/achievements/gallery/icode-stage.jpg", caption: "Presenting at ICODE 2026" },
 */
export const gallery: GalleryImage[] = [];
