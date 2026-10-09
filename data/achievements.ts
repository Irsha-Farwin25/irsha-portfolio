import type { Certificate, GalleryAlbum, NewsItem, NewsStory } from "@/lib/types";

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
    narration:
      "Stanford machine learning. The maths behind her AI.",
    image: "/achievements/certificates/supervised-ml.jpeg",
    link: "https://coursera.org/verify/ZCRA7SZ4TELE",
  },
  {
    id: "meta-frontend",
    title: "Introduction to Front-End Development",
    issuer: "Meta · Coursera",
    category: "Course",
    date: "Dec 2025",
    narration:
      "Front-end, trained by Meta.",
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
    narration:
      "Top 25% on TestDome's MySQL test.",
    image: "/achievements/certificates/testdome-mysql.jpg",
    link: "https://www.testdome.com/certificates/8c233f37407441ebbb3e1408cb02dedb",
  },
  {
    id: "canopylab-strategic-leadership",
    title: "Strategic Leadership and Sustainable Development",
    issuer: "CanopyLAB",
    category: "Course",
    date: "Jul 2021",
    narration:
      "Strategic leadership, beyond the next sprint.",
    image: "/achievements/certificates/volunteering.jpg",
  },
  {
    id: "fcc-responsive-web-design",
    title: "Responsive Web Design",
    issuer: "freeCodeCamp",
    category: "Course",
    date: "Dec 2020",
    description: "Developer certification representing approximately 300 hours of coursework.",
    narration:
      "300 hours of responsive design.",
    image: "/achievements/certificates/webdesigncourse.jpg",
    link: "https://freecodecamp.org/certification/fcc5323b5e0-6889-41b6-9b8c-18f984a00c83/responsive-web-design",
  },
  {
    id: "flutter-dart",
    title: "Introduction to Flutter Development Using Dart",
    issuer: "The App Brewery",
    category: "Course",
    date: "Jul 2020",
    narration:
      "Flutter: one codebase, Android and iOS.",
    image: "/achievements/certificates/FlutterCourse.png",
  },
  {
    id: "datacamp-sql",
    title: "Introduction to SQL",
    issuer: "DataCamp",
    category: "Course",
    date: "May 2020",
    narration:
      "SQL in 2020, where her data story began.",
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
    narration: "HackMoral 3.0: idea to code, against the clock.",
    image: "/achievements/certificates/hackathon2.jpg",
  },
  {
    id: "code-rush-2020",
    title: "Code Rush 2020 — Intra-Faculty Coding Competition",
    issuer: "INTECS, Faculty of IT, University of Moratuwa",
    category: "Hackathon",
    date: "Jun 2020",
    description: "Competed as a member of team CODE_RAIN.",
    narration:
      "Code Rush 2020, with team CODE_RAIN.",
    image: "/achievements/certificates/hackathon.jpg",
  },
  {
    id: "homealone-2020",
    title: "HomeAlone 2020 — Virtual Mini-Hackathon",
    issuer: "Students' Union, Faculty of IT, University of Moratuwa",
    category: "Hackathon",
    date: "Apr 2020",
    description: "Participated as a member of team Ada.",
    narration:
      "Lockdown 2020? Hacking with team Ada.",
    image: "/achievements/certificates/homeAloneHackathon.jpg",
  },

  // Conferences
  {
    id: "icode-2026-presentation",
    title: "ICODE 2026 — Certificate of Presentation",
    issuer: "Centre for Open and Distance Learning (CODL), University of Moratuwa",
    category: "Conference",
    date: "Aug 2026",
    description:
      "Presented the research paper “AI-Powered University and Career Guidance Platform for Equitable Access in Sri Lanka” at the International Conference on Open and Digital Education.",
    narration:
      "Her own research, presented at ICODE 2026.",
    image: "/achievements/certificates/conference-certificate.png",
    link: "https://icode.bit.uom.lk/proceedings",
  },
  {
    id: "lincoln-ml-engineers",
    title: "Machine Learning for Engineers — 2-Day Online Workshop",
    issuer: "Department of Engineering, Lincoln University College, Sri Lanka",
    category: "Conference",
    date: "May 2026",
    description:
      "Certificate of participation for a workshop on machine learning and its practical applications in engineering.",
    narration:
      "Two days of ML for engineers.",
    image: "/achievements/certificates/workshop.jpg",
  },
  {
    id: "pycon-sl-2022",
    title: "PyCon Sri Lanka 2022",
    issuer: "PyCon Sri Lanka · AIESEC in University of Moratuwa",
    category: "Conference",
    date: "Feb 2022",
    description: "Participated in the largest online conference for the Python community in Sri Lanka.",
    narration:
      "PyCon Sri Lanka 2022, with the community.",
    image: "/achievements/certificates/pythonconference.jpg",
  },
];

/**
 * News highlights — put images in /public/achievements/news/.
 * Example:
 * { id: "icode-coverage", title: "Headline of the article", source: "Daily News", date: "2026",
 *   summary: "One line on what the story covered.", image: "/achievements/news/icode.jpg", link: "https://..." },
 */
export const news: NewsItem[] = [
  // The first item is shown as the large featured card.
  {
    id: "mldw-newswire",
    title: "UDA unveils 'Mother Lanka' digital public engagement platform",
    source: "Newswire",
    story: "mother-lanka",
    date: "Mar 2026",
    summary: "Newswire's report on the Urban Development Authority's new digital public engagement platform.",
    // The article's own photo at full resolution (sharper than a screenshot of the page).
    image: "/achievements/news/MLDW-Newswire-photo.jpg",
    link: "https://www.newswire.lk/2026/03/16/uda-unveils-mother-lanka-digital-public-engagement-platform/",
  },
  {
    id: "icode-2026-proceedings",
    title: "AI-Powered University and Career Guidance Platform for Equitable Access in Sri Lanka",
    source: "ICODE 2026 Proceedings",
    story: "icode-2026",
    date: "Aug 2026",
    summary:
      "My abstract and slides, published in Session F: Ethics, Quality Assurance & Governance of the official ICODE 2026 proceedings.",
    image: "/achievements/news/icode-proceedings.jpg",
    link: "https://icode.bit.uom.lk/assets/AI-Powered%20University%20_%20Career%20Guidance%20Platform%20for%20Sri%20Lankan%20A_L%20Students-j-VPa90D.pdf",
    linkLabel: "View slides",
    extraLinks: [{ label: "ICODE 2026 proceedings", href: "https://icode.bit.uom.lk/proceedings" }],
  },
  {
    id: "mldw-newsfirst",
    title: "UDA Launches 'Mother Lanka Digital' Platform to Enhance Public Participation in Urban Planning",
    source: "News 1st",
    story: "mother-lanka",
    date: "Mar 2026",
    summary: "Coverage of the launch of the UDA Mother Lanka Digital Platform, which I led end-to-end.",
    image: "/achievements/news/MLDW-NewsFirst.jpg",
    link: "https://www.newsfirst.lk/2026/03/16/uda-launches-mother-lanka-digital-platform-to-enhance-public-participation-in-urban-planning",
  },
  {
    id: "fmis-dailymirror",
    title: "Online payment facility introduced for UDA clients",
    source: "Daily Mirror",
    story: "uda-payments",
    date: "Feb 2026",
    summary:
      "Daily Mirror's coverage of the UDA's GovPay-powered online payment platform for Peliyagoda Manning Market businesses and UDA apartment residents.",
    image: "/achievements/news/DailyMirror-FMIS.jpg",
    link: "https://www.dailymirror.lk/breaking-news/Online-payment-facility-introduced-for-UDA-clients/108-331866",
  },
  {
    id: "fmis-themorning",
    title: "Govt launches online payment system for UDA clients",
    source: "The Morning",
    story: "uda-payments",
    date: "Feb 2026",
    summary:
      "The Morning's coverage of the GovPay-powered online payment platform for Peliyagoda Manning Market and UDA apartment complexes.",
    image: "/achievements/news/The-Morning.jpg",
    link: "https://www.themorning.lk/articles/u1QkBdiTeGfmSb5FFSS8",
  },
  {
    id: "fmis-hirunews",
    title: "UDA launches online payment system at Manning Market",
    source: "Hiru News",
    story: "uda-payments",
    date: "Feb 2026",
    summary:
      "Hiru News's coverage of the UDA's GovPay-powered online payment platform launched at Peliyagoda Manning Public Market.",
    image: "/achievements/news/Hiru-News.jpg",
    link: "https://hirunews.lk/goldfmnews/444148/uda-launches-online-payment-system-at-manning-market",
  },
];

/**
 * Outlet icons, by the `source` name used above, under /public/achievements/news/logos/.
 * Outlets without one show their initials instead.
 */
export const outletLogos: Record<string, string> = {
  Newswire: "/achievements/news/logos/newswire.png",
  "News 1st": "/achievements/news/logos/news1st.png",
  "Daily Mirror": "/achievements/news/logos/dailymirror.png",
  "The Morning": "/achievements/news/logos/themorning.png",
  "Hiru News": "/achievements/news/logos/hirunews.png",
  // The organiser's emblem (CODL, University of Moratuwa), on a transparent background.
  "ICODE 2026 Proceedings": "/achievements/news/logos/icode.png",
};

/**
 * The events the press covered, in the order they're shown. Each groups the clippings above that
 * share its id as their `story`. Mother Lanka was hers end to end; FMIS payments were a team
 * effort; the ICODE paper is her own.
 */
export const newsStories: NewsStory[] = [
  {
    id: "mother-lanka",
    section: "GovTech",
    title: "Mother Lanka Digital Platform launch",
    role: "Led end-to-end",
    kind: "lead",
    impact: "Live in Sinhala, Tamil & English, with 6 of 7 modules in daily public use",
    date: "Mar 2026",
  },
  {
    id: "uda-payments",
    section: "GovTech",
    title: "UDA's first online payment system",
    role: "Part of the team",
    kind: "team",
    impact: "13,500+ residents and 1,400+ merchants moved from paper to digital payments",
    date: "Feb 2026",
  },
  {
    id: "icode-2026",
    section: "Research",
    title: "AI career-guidance research at ICODE 2026",
    role: "Author",
    kind: "author",
    impact: "Published in the official conference proceedings",
    date: "Aug 2026",
  },
];

/**
 * Volunteering — one album per organisation. Put images in /public/achievements/volunteering/.
 * Same shape as gallery albums; the first image is the cover.
 */
export const volunteering: GalleryAlbum[] = [
  {
    id: "g17-sdg-ambassador",
    title: "G17 SDG Ambassador — Goal 6",
    date: "2021",
    images: [
      {
        id: "g17-award",
        src: "/achievements/volunteering/volunteering-2.jpg",
        caption:
          "Receiving an award at the G17 University Ambassadors Consortium ceremony for SDG 6 — Clean Water and Sanitation",
      },
      {
        id: "g17-ceremony",
        src: "/achievements/volunteering/volunteering-1.jpg",
        caption: "With fellow SDG ambassadors at the G17 UAC award ceremony",
      },
      {
        id: "g17-team",
        src: "/achievements/volunteering/g17-team-1.jpg",
        caption: "With the G17 SDG ambassador team at the Road to Rights award ceremony",
      },
      {
        id: "g17-team-certificate",
        src: "/achievements/volunteering/g17-team-2.jpg",
        caption: "Fellow G17 SDG ambassadors with certificates of appreciation",
      },
      {
        id: "g17-project-completion",
        src: "/achievements/volunteering/ambassdor-project-completion.jpg",
        caption: "Completed the SDG 6 project “Drinking Water and Sanitation Issues”",
      },
      {
        id: "g17-ambassador-of-the-month",
        src: "/achievements/volunteering/ambassdor-for-month-appreciation.jpg",
        caption: "Named an SDG Ambassador of the Month (August) for Goal 6",
      },
      {
        id: "g17-ambassador-selected",
        src: "/achievements/volunteering/ambassdor-selected.jpg",
        caption: "Selected as the University of Moratuwa's SDG Ambassador for Goal 6 — 2021",
      },
    ],
  },
  {
    id: "majlis-ul-islam",
    title: "Majlis-Ul-Islam, University of Moratuwa",
    date: "2019 – 2020",
    images: [
      {
        id: "majlis-service-appreciation",
        src: "/achievements/certificates/majlis-service-appreciation.jpg",
        caption: "Volunteering Award from Majlis-Ul-Islam, University of Moratuwa, for service during 2019–2020",
      },
    ],
  },
];

/**
 * Gallery — one album per event. Put images in /public/achievements/gallery/.
 * The first image in each album is its cover.
 * Example:
 * { id: "icode-2026", title: "ICODE 2026", date: "Aug 2026", images: [
 *   { id: "icode-stage", src: "/achievements/gallery/icode-stage.jpg", caption: "Presenting at ICODE 2026" },
 * ] },
 */
export const gallery: GalleryAlbum[] = [
  {
    id: "mldw-launch",
    title: "Mother Lanka Digital Platform launch",
    date: "Mar 2026",
    images: [
      {
        id: "mldw-launch-team",
        src: "/achievements/gallery/MLDW-launch-2.jpg",
        caption:
          "With Hon. Bimal Rathnayake, Minister of Transport and Highways, and the team at the Mother Lanka Digital Platform launch",
      },
      {
        id: "mldw-launch-go-live",
        src: "/achievements/gallery/MLDW-launch-3.jpg",
        caption: "Hon. Bimal Rathnayake taking the Mother Lanka Digital Platform live",
      },
      {
        id: "mldw-launch-ceremony",
        src: "/achievements/gallery/MLDW-launch-4.jpg",
        caption: "Launch ceremony of the UDA Mother Lanka Digital Platform",
      },
      {
        id: "mldw-launch-seated",
        src: "/achievements/gallery/MLDW-launch-1.jpg",
        caption: "At the Mother Lanka Digital Platform launch",
      },
    ],
  },
  {
    id: "icode-2026",
    title: "ICODE 2026",
    date: "Aug 2026",
    images: [
      {
        id: "icode-certificate",
        src: "/achievements/gallery/conference-2.jpg",
        caption: "Receiving the Certificate of Presentation at ICODE 2026",
      },
      {
        id: "icode-presenting",
        src: "/achievements/gallery/conference-3.jpg",
        caption: "Presenting my research on AI-powered university and career guidance at ICODE 2026",
      },
      {
        id: "icode-stage",
        src: "/achievements/gallery/conference-1.jpg",
        caption: "ICODE 2026 Research Conference, University of Moratuwa",
      },
      {
        id: "icode-audience",
        src: "/achievements/gallery/conference-5.jpg",
        caption: "Opening session of ICODE 2026",
      },
      {
        id: "icode-sessions",
        src: "/achievements/gallery/conference-4.jpg",
        caption: "Among fellow presenters at ICODE 2026",
      },
      {
        id: "icode-kit",
        src: "/achievements/gallery/conference-6.jpg",
        caption: "ICODE 2026 delegate kit",
      },
    ],
  },
  {
    id: "fmis-launch",
    title: "UDA FMIS launch",
    images: [
      {
        id: "fmis-launch",
        src: "/achievements/gallery/FMIS-launch-1.jpg",
        caption: "Launch of UDA's FMIS online tenant payments via GovPay",
      },
    ],
  },
];
