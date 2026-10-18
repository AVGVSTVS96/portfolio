export interface Project {
  id: string;
  repo: string;
  blurb: string;
  npm?: string;
  site?: string;
}

export const projects: Project[] = [
  {
    id: "react-shiki",
    repo: "AVGVSTVS96/react-shiki",
    blurb:
      "Syntax highlighting hook and component for React, powered by Shiki.",
    npm: "react-shiki",
    site: "https://react-shiki.vercel.app",
  },
  {
    id: "assistant-ui",
    repo: "assistant-ui/assistant-ui",
    blurb: "React primitives and components for AI chat apps.",
    npm: "@assistant-ui/react",
    site: "https://www.assistant-ui.com",
  },
  {
    id: "autofork",
    repo: "AVGVSTVS96/autofork",
    blurb: "Customized forks that maintain themselves.",
    npm: "autofork",
    site: "https://autofork.com",
  },
  {
    id: "hex",
    repo: "AVGVSTVS96/hex",
    blurb: "Claude Code as your personal assistant, in the chat app you pick.",
    site: "https://hex-sand.vercel.app",
  },
  {
    id: "better-github-skill",
    repo: "AVGVSTVS96/better-github-skill",
    blurb: "A GitHub skill for coding agents. One bounded call per question.",
  },
  {
    id: "patch-md",
    repo: "AVGVSTVS96/PATCH.md",
    blurb: "Agent-healable source patches, written in markdown.",
    site: "https://patchmd.vercel.app",
  },
  {
    id: "commonplace",
    repo: "AVGVSTVS96/commonplace",
    blurb: "Your personal data kit for agents.",
    site: "https://commonplace-eight-sable.vercel.app",
  },
  {
    id: "enclave",
    repo: "AVGVSTVS96/enclave",
    blurb: "Agents ask for a password with a one-time link only they can open.",
    site: "https://enclave-pink.vercel.app",
  },
  {
    id: "herdr-drovr",
    repo: "AVGVSTVS96/herdr-drovr",
    blurb: "Move herdr panes and tabs between workspaces.",
  },
  {
    id: "seqno",
    repo: "AVGVSTVS96/seqno",
    blurb: "A local-first outliner. Logseq, rebuilt on Effect and Loro.",
    site: "https://seqno.vercel.app",
  },
  {
    id: "retake",
    repo: "AVGVSTVS96/retake",
    blurb: "Apple's Voice Memos, rebuilt in SwiftUI. Never loses a take.",
    site: "https://retake-seven.vercel.app",
  },
  {
    id: "hex-keyboard",
    repo: "AVGVSTVS96/hex-keyboard",
    blurb:
      "An iPhone keyboard that feels like Apple's and learns where you tap.",
    site: "https://hex-keyboard.vercel.app",
  },
  {
    id: "brand-it",
    repo: "AVGVSTVS96/brand-it",
    blurb: "A skill that brands a project from its own parts, all as code.",
  },
  {
    id: "pi-context-control",
    repo: "AVGVSTVS96/pi-context-control",
    blurb: "See and edit what's in a pi agent's context window.",
  },
  {
    id: "lakhs",
    repo: "AVGVSTVS96/lakhs",
    blurb: "A minimal INR/USD converter that speaks lakhs and crores.",
    site: "https://lakhs.app",
  },
  {
    id: "openleaf",
    repo: "AVGVSTVS96/openleaf",
    blurb: "Minimal, end-to-end encrypted markdown notes.",
    site: "https://openleaf-peach.vercel.app",
  },
];
