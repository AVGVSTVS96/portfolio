export interface Project {
  id: string;
  repo: string;
  also?: string[];
  blurb: string;
  npm?: string;
  site?: string;
}

export const projects: Project[] = [
  {
    id: "react-shiki",
    repo: "AVGVSTVS96/react-shiki",
    blurb: "Syntax highlighting hook and component for React, powered by Shiki.",
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
    also: ["AVGVSTVS96/autofork-app", "AVGVSTVS96/autofork-site"],
    blurb: "Customized forks that maintain themselves.",
    npm: "autofork",
    site: "https://autofork.com",
  },
  {
    id: "patch-md",
    repo: "AVGVSTVS96/PATCH.md",
    blurb: "Agent-healable source patches, written in markdown.",
    site: "https://patchmd.vercel.app",
  },
  {
    id: "hex",
    repo: "AVGVSTVS96/hex",
    blurb: "Claude Code as your personal assistant, in the chat app you pick.",
    site: "https://hex-sand.vercel.app",
  },
  {
    id: "hex-voice",
    repo: "AVGVSTVS96/hex-voice",
    blurb: "Call hex from your iPhone. GPT-Live talks, Claude Code does the work.",
  },
  {
    id: "enclave",
    repo: "AVGVSTVS96/enclave",
    blurb: "Agents ask for a password with a one-time link only they can open.",
    site: "https://enclave-pink.vercel.app",
  },
  {
    id: "commonplace",
    repo: "AVGVSTVS96/commonplace",
    blurb: "Your personal data kit for agents.",
    site: "https://commonplace-eight-sable.vercel.app",
  },
  {
    id: "pigeon",
    repo: "AVGVSTVS96/pigeon",
    blurb: "iMessage from the terminal, with filters on what agents can see.",
  },
  {
    id: "better-github-skill",
    repo: "AVGVSTVS96/better-github-skill",
    blurb: "A GitHub skill for coding agents. One bounded call per question.",
  },
  {
    id: "brand-it",
    repo: "AVGVSTVS96/brand-it",
    blurb: "A skill that brands a project from its own parts, all as code.",
    site: "https://brand-it-seven.vercel.app",
  },
  {
    id: "comet-kvm-plugin",
    repo: "AVGVSTVS96/comet-kvm-plugin",
    blurb: "Gives coding agents eyes and hands on a real computer, through a KVM.",
  },
  {
    id: "oomph",
    repo: "AVGVSTVS96/oomph",
    blurb: "Keeps coding agents from running Linux out of memory.",
  },
  {
    id: "prompt-picker",
    repo: "AVGVSTVS96/prompt-picker",
    blurb: "Search every prompt you've sent to Claude Code, Codex and pi.",
  },
  {
    id: "pi-context-control",
    repo: "AVGVSTVS96/pi-context-control",
    blurb: "See and edit what's in a pi agent's context window.",
  },
  {
    id: "herdr-drovr",
    repo: "AVGVSTVS96/herdr-drovr",
    blurb: "Move herdr panes and tabs between workspaces.",
  },
  {
    id: "vim-herdr-navigator",
    repo: "AVGVSTVS96/vim-herdr-navigator",
    blurb: "Move between Vim splits and herdr panes as if they were one grid.",
  },
  {
    id: "persistence-scope.nvim",
    repo: "AVGVSTVS96/persistence-scope.nvim",
    blurb: "One repo, many Neovim sessions, each scoped to its tmux window.",
  },
  {
    id: "seqno",
    repo: "AVGVSTVS96/seqno",
    blurb: "A local-first outliner. Logseq, rebuilt on Effect and Loro.",
    site: "https://seqno.vercel.app",
  },
  {
    id: "iikb",
    repo: "AVGVSTVS96/iikb",
    blurb: "An iPhone keyboard that types like Apple's and learns where you tap.",
    site: "https://iikb.vercel.app",
  },
  {
    id: "retake",
    repo: "AVGVSTVS96/retake",
    blurb: "Apple's Voice Memos, rebuilt in SwiftUI. Never loses a take.",
    site: "https://retake-seven.vercel.app",
  },
  {
    id: "said",
    repo: "AVGVSTVS96/said",
    blurb: "Dictation that doesn't edit you.",
  },
  {
    id: "snailmail",
    repo: "AVGVSTVS96/snailmail",
    blurb: "A letter, sent as a link, that opens like real mail.",
    site: "https://snailmail-olive.vercel.app",
  },
  {
    id: "survay",
    repo: "AVGVSTVS96/survay",
    blurb: "A survey app you run yourself: one question at a time, one SQLite file.",
    site: "https://survay-site.vercel.app",
  },
  {
    id: "detour",
    repo: "AVGVSTVS96/detour",
    blurb: "The best drives near you: twisty, scenic, quiet roads, ranked.",
    site: "https://detour-steel.vercel.app",
  },
  {
    id: "antibody",
    repo: "AVGVSTVS96/antibody",
    blurb: "X-ray any US federal bill: what's buried, who paid, who profits.",
  },
  {
    id: "openleaf",
    repo: "AVGVSTVS96/openleaf",
    blurb: "Minimal, end-to-end encrypted markdown notes.",
    site: "https://openleaf-peach.vercel.app",
  },
  {
    id: "lakhs",
    repo: "AVGVSTVS96/lakhs",
    blurb: "A minimal INR/USD converter that speaks lakhs and crores.",
    site: "https://lakhs.app",
  },
];
