import type { Recommendation } from "@/lib/types";

/**
 * LinkedIn recommendations — from linkedin.com/in/irsha-farwin-0a965b177/details/recommendations/
 * (so every one is LinkedIn-verified). The featured one leads: two years together at UnicornShift,
 * naming the stack, is the strongest signal for software engineering roles.
 */
export const recommendations: Recommendation[] = [
  {
    id: "farshath-jamal",
    keyPhrase: "visually stunning and functional website",
    name: "Farshath Jamal",
    title: "Regional Director, The Institute of Financial Accountants",
    relationship: "Irsha's client",
    kind: "Client",
    date: "Jul 2023",
    verified: true,
    highlight:
      "Irsha's ability to understand our requirements and transform our vision into a visually stunning and functional website was remarkable.",
    quote:
      "I enthusiastically recommend Irsha as an exceptional web developer. She recently built a remarkable website for our BIMT Colombo Campus, and her talent, professionalism, and dedication were truly impressive. Irsha's ability to understand our requirements and transform our vision into a visually stunning and functional website was remarkable.\n\nShe delivered a user-friendly design that not only looked appealing but also provided a seamless browsing experience. Throughout the project, Irsha showcased excellent communication skills, remaining attentive to our feedback and keeping us informed of the progress. Her technical expertise and proficiency in web development were evident, as she utilized the latest tools and technologies to create a modern and optimized website. Irsha's professionalism, work ethic, and commitment to meeting deadlines were outstanding.\n\nI wholeheartedly recommend Irsha for any web development projects. Her creativity, technical prowess, and dedication make her an invaluable asset to bring your online presence to life.",
  },
  {
    id: "ramesh-kithsiri",
    keyPhrase: "quick in delivering tasks",
    name: "Ramesh Kithsiri",
    title: "Software Engineer, UnicornShift",
    relationship: "Worked with Irsha on the same team",
    kind: "Teammate",
    date: "Aug 2025",
    verified: true,
    featured: true,
    experience: "unicornshift-software-engineer",
    highlight:
      "Irsha is quick in delivering tasks and has a remarkable ability to manage multiple responsibilities in parallel.",
    quote:
      "I had the pleasure of working with Irsha for two years at UnicornShift. During that time, she consistently demonstrated strong skills in developing frontend applications using React and Next.js. She also contributed effectively to backend development using Node.js. Irsha is quick in delivering tasks and has a remarkable ability to manage multiple responsibilities in parallel. Her dedication and performance made a valuable impact on our team.",
  },
  {
    id: "akila-udara",
    keyPhrase: "both front-end and back-end development",
    name: "Akila Udara",
    title: "Full Stack .NET Software Engineer",
    relationship: "Worked with Irsha, at different companies",
    kind: "Peer",
    date: "Aug 2025",
    verified: true,
    highlight:
      "Her ability to seamlessly handle both front-end and back-end development made her an invaluable asset to our team.",
    quote:
      "I had the pleasure of working with Irsha, a talented and dedicated Full Stack Software Engineer who consistently demonstrated strong technical expertise and a proactive mindset. Her ability to seamlessly handle both front-end and back-end development made her an invaluable asset to our team.\n\nIrsha approaches each task with a problem-solving attitude and a clear understanding of system architecture, clean code practices, and modern frameworks. Whether it's developing scalable APIs, optimizing databases, or crafting intuitive user interfaces, she always delivers high-quality results on time.\n\nBeyond her technical skills, Irsha is a great team player. She communicates effectively, collaborates well with cross-functional teams, and is always open to feedback and new ideas. Her positive attitude and strong work ethic make her not just a reliable engineer but also a great colleague.",
  },
  {
    id: "sanduni-perera",
    keyPhrase: "excellent coding and problem solving skills",
    name: "Sanduni Perera",
    title: "Software Testing Professional · Lecturer, IT",
    relationship: "Worked with Irsha on the same team",
    kind: "Teammate",
    date: "Jul 2026",
    verified: true,
    experience: "uda-software-engineer",
    highlight: "She is technically strong, dedicated, and has excellent coding and problem solving skills.",
    quote:
      "I had the pleasure of working with Irsha and highly recommend her as a Software Engineer. She is technically strong, dedicated, and has excellent coding and problem solving skills. Her experience in software and web development, combined with her willingness to learn and take on new challenges, makes her a valuable team member.\n\nIrsha is also collaborative, reliable, and always committed to delivering quality work. I'm confident she'll be a great asset to any organization. Wishing her all the best in her career!",
  },
  {
    id: "kushan-kekirideniya",
    keyPhrase: "consistently delivers high-quality work",
    name: "Kushan Ravindu Kekirideniya",
    title: "Marketing Consultant, Unicornshift",
    relationship: "Worked with Irsha on the same team",
    kind: "Teammate",
    date: "Aug 2025",
    verified: true,
    experience: "unicornshift-software-engineer",
    highlight:
      "Irsha consistently delivers high-quality work, adapts quickly to challenges, and brings a positive, team-oriented attitude to everything she does.",
    quote:
      "I had the pleasure of working with Irsha at Unicornshift. She is a talented and dedicated software engineer with excellent problem-solving skills and a collaborative mindset. Irsha consistently delivers high-quality work, adapts quickly to challenges, and brings a positive, team-oriented attitude to everything she does. I highly recommend her for any future opportunity.",
  },
];
