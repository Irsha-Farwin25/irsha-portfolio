import type { LabExperiment, Publication } from "@/lib/types";

// Real — given directly in the brief.
export const publications: Publication[] = [
  {
    id: "icode-2026",
    title:
      "AI-Powered University and Career Guidance Platform for Equitable Access in Sri Lanka",
    venue: "ICODE 2026",
    year: "2026",
    area: "AI for Education / Equitable Access",
    summary:
      "Research presentation on an AI-powered platform designed to give students in Sri Lanka more equitable access to university and career guidance — part of ongoing MSc research into practical, socially-grounded applications of artificial intelligence.",
    status: "Presented",
    project: "ai-career-guidance-platform",
    resources: [
      {
        kind: "slides",
        href: "https://icode.bit.uom.lk/assets/AI-Powered%20University%20_%20Career%20Guidance%20Platform%20for%20Sri%20Lankan%20A_L%20Students-j-VPa90D.pdf",
      },
      { kind: "proceedings", href: "https://icode.bit.uom.lk/proceedings" },
    ],
  },
];

/**
 * PLACEHOLDER: no real AI Lab experiments were supplied. These illustrate the
 * intended structure (status badges, tech, links) — replace with real
 * experiments, prototypes, or coursework projects.
 */
export const labExperiments: LabExperiment[] = [
  {
    id: "snn-mnist",
    title: "Spiking Neural Network for MNIST",
    status: "Experiment",
    description:
      "An unsupervised spiking neural network that learns handwritten digits through STDP, never seeing a label while training. Reached 64% test accuracy on an MNIST sample (chance is 10%). Built in Brian2 after Diehl & Cook (2015), for MSc coursework (IT5092 Neuroscience & Neurocomputing).",
    technologies: ["Python", "Brian2", "Spiking Neural Networks", "Computational Neuroscience"],
    github: "https://github.com/Irsha-Farwin25/SNN_MNIST_Solution",
  },
  {
    id: "pos-pcfg-news",
    title: "POS Tagger & PCFG Parser for Sri Lankan News",
    status: "Experiment",
    description:
      "A bigram HMM part-of-speech tagger and probabilistic grammar (PCFG) trained on the Penn Treebank, then tested on 150 hand-tagged sentences from Sri Lankan news. 89.8% tagging accuracy against the human tags (κ = 0.89) and full parses for 98.7% of sentences, with clustering to explain where 1989 financial-news training breaks down. MSc NLP coursework.",
    technologies: ["Python", "NLTK", "Natural Language Processing", "scikit-learn"],
    github: "https://github.com/Irsha-Farwin25/MS26903156_NLP_CW1",
  },
  {
    id: "dbvae-face-detection",
    title: "Debiasing Facial Detection with a DB-VAE",
    status: "Experiment",
    description:
      "A face detector audited for bias across skin tone and gender. A debiasing variational autoencoder learns the latent structure of faces without labels and resamples rare faces during training, raising the worst-served group (darker-skinned men) from 0.47 to 0.68 mean face confidence, and darker-skinned women from 0.61 to 0.86. Based on MIT 6.S191; MSc Deep Learning coursework (IT5062).",
    technologies: ["Python", "TensorFlow", "Computer Vision", "Deep Learning"],
    github: "https://github.com/Irsha-Farwin25/DBVAE-Facial-Detection",
  },
];
