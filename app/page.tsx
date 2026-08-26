"use client";

import { useEffect, useMemo, useState } from "react";

type StageId = "discover" | "define" | "develop" | "deliver";
type NoteKind = "note" | "evidence" | "assumption" | "decision";

type Note = {
  id: string;
  text: string;
  kind: NoteKind;
};

type Section = {
  id: string;
  stage: StageId;
  title: string;
  eyebrow: string;
  status: "In progress" | "Ready for review" | "Reviewed" | "Accepted" | "Archived";
  x: number;
  y: number;
  owner: string;
  tags: string[];
  notes: Note[];
  notebook: string;
};

type BoardLink = {
  id: string;
  from: string;
  to: string;
  label: string;
};

const STAGES: Record<StageId, {
  index: string;
  name: string;
  color: string;
  soft: string;
  headline: string;
  prompt: string;
  critic: string;
  mindset: string;
}> = {
  discover: {
    index: "01",
    name: "Discover",
    color: "#e95a45",
    soft: "#fff0eb",
    headline: "Open the opportunity space",
    prompt: "Understand people, context and unmet needs before deciding what to build.",
    critic: "Research & Empathy Critic",
    mindset: "with empathy",
  },
  define: {
    index: "02",
    name: "Define",
    color: "#e9a327",
    soft: "#fff5dc",
    headline: "Frame what truly matters",
    prompt: "Turn evidence into a focused opportunity, clear principles and measurable outcomes.",
    critic: "Framing & Synthesis Critic",
    mindset: "with mindfulness",
  },
  develop: {
    index: "03",
    name: "Develop",
    color: "#65aa58",
    soft: "#eef8e9",
    headline: "Explore the solution space",
    prompt: "Generate distinct directions, compare trade-offs and choose what is worth testing.",
    critic: "Ideation & Concept Critic",
    mindset: "with joyfulness",
  },
  deliver: {
    index: "04",
    name: "Deliver",
    color: "#4297cf",
    soft: "#e9f5fc",
    headline: "Learn through making",
    prompt: "Prototype, test and iterate without becoming attached to the first answer.",
    critic: "Prototype & Validation Critic",
    mindset: "with non-attachment",
  },
};

const DEFAULT_SECTIONS: Section[] = [
  {
    id: "research-plan",
    stage: "discover",
    title: "Research questions",
    eyebrow: "Plan",
    status: "Reviewed",
    x: 88,
    y: 94,
    owner: "JS",
    tags: ["research", "scope"],
    notes: [
      { id: "n-r1", kind: "note", text: "How do visitors decide where to pause?" },
      { id: "n-r2", kind: "assumption", text: "Shade is the main factor." },
    ],
    notebook: "Observe first-time and frequent visitors at three times of day. Separate what people say from what they do.",
  },
  {
    id: "stakeholder-map",
    stage: "discover",
    title: "Stakeholder map",
    eyebrow: "People & systems",
    status: "Reviewed",
    x: 390,
    y: 58,
    owner: "AL",
    tags: ["stakeholders"],
    notes: [
      { id: "n-s1", kind: "evidence", text: "Visitors, cleaners, vendors, facilities" },
      { id: "n-s2", kind: "note", text: "Who is missing after 7pm?" },
    ],
    notebook: "Map direct users, indirect users, decision-makers and people who carry maintenance work.",
  },
  {
    id: "site-analysis",
    stage: "discover",
    title: "Site analysis",
    eyebrow: "Field study · 24 Aug",
    status: "Ready for review",
    x: 700,
    y: 116,
    owner: "JS",
    tags: ["site", "observation"],
    notes: [
      { id: "n-a1", kind: "evidence", text: "12 of 18 visitors chose the shaded edge" },
      { id: "n-a2", kind: "evidence", text: "Noise peaks between 12:10–13:20" },
      { id: "n-a3", kind: "note", text: "People create informal seats on the ledge" },
    ],
    notebook: "Three 40-minute observation sessions. Weather was dry and warm. We need a return visit after rain before treating drainage behavior as representative.",
  },
  {
    id: "persona-mei",
    stage: "discover",
    title: "Persona · Mei",
    eyebrow: "Research-backed persona",
    status: "In progress",
    x: 256,
    y: 370,
    owner: "AL",
    tags: ["persona", "needs"],
    notes: [
      { id: "n-p1", kind: "evidence", text: "Needs a short reset between appointments" },
      { id: "n-p2", kind: "assumption", text: "Prefers quiet over social contact" },
    ],
    notebook: "Mei represents a repeated behavioral pattern, not a demographic average. Validate the quiet-space preference in the next interview round.",
  },
  {
    id: "opportunity-signals",
    stage: "discover",
    title: "Opportunity signals",
    eyebrow: "Emerging synthesis",
    status: "In progress",
    x: 596,
    y: 402,
    owner: "JS",
    tags: ["patterns", "tensions"],
    notes: [
      { id: "n-o1", kind: "note", text: "Rest without feeling removed" },
      { id: "n-o2", kind: "note", text: "Flexible privacy, not permanent barriers" },
    ],
    notebook: "Early signals only. Each opportunity should link to observations from more than one research method.",
  },
  {
    id: "affinity-map",
    stage: "define",
    title: "Affinity & tensions",
    eyebrow: "Synthesis",
    status: "Reviewed",
    x: 92,
    y: 108,
    owner: "AL",
    tags: ["themes"],
    notes: [
      { id: "n-d1", kind: "evidence", text: "Visibility creates safety and exposure" },
      { id: "n-d2", kind: "note", text: "Convenience competes with calm" },
    ],
    notebook: "Clusters are built from linked field notes. Contradictions stay visible instead of being averaged away.",
  },
  {
    id: "insight-statements",
    stage: "define",
    title: "Insight statements",
    eyebrow: "Interpretation",
    status: "Ready for review",
    x: 410,
    y: 72,
    owner: "JS",
    tags: ["insights"],
    notes: [
      { id: "n-i1", kind: "note", text: "People seek a pause that still feels connected." },
      { id: "n-i2", kind: "assumption", text: "A sense of control matters more than silence." },
    ],
    notebook: "Every final insight must link backward to at least two pieces of evidence and forward to one design implication.",
  },
  {
    id: "hmw-frame",
    stage: "define",
    title: "How might we…",
    eyebrow: "Opportunity statement",
    status: "In progress",
    x: 728,
    y: 136,
    owner: "JS",
    tags: ["HMW", "framing"],
    notes: [
      { id: "n-h1", kind: "decision", text: "How might we give short-stay visitors control over connection and retreat?" },
      { id: "n-h2", kind: "note", text: "Avoid prescribing furniture or an app." },
    ],
    notebook: "The frame names a user, desired change and context while remaining open to physical, service and behavioral solutions.",
  },
  {
    id: "success-criteria",
    stage: "define",
    title: "Success criteria",
    eyebrow: "What better means",
    status: "In progress",
    x: 306,
    y: 388,
    owner: "AL",
    tags: ["metrics", "constraints"],
    notes: [
      { id: "n-c1", kind: "note", text: "Find a suitable spot in under 30 seconds" },
      { id: "n-c2", kind: "note", text: "Works without personal data collection" },
    ],
    notebook: "Include observable behavior, accessibility, maintenance and a clear definition of the test condition.",
  },
  {
    id: "idea-sprint",
    stage: "develop",
    title: "Idea sprint",
    eyebrow: "Diverge · 28 ideas",
    status: "Reviewed",
    x: 82,
    y: 98,
    owner: "ALL",
    tags: ["brainwriting", "sketches"],
    notes: [
      { id: "n-v1", kind: "note", text: "Reconfigurable shade islands" },
      { id: "n-v2", kind: "note", text: "A social signal visitors control" },
      { id: "n-v3", kind: "note", text: "Borrowable micro-boundaries" },
    ],
    notebook: "Ideas were generated silently before discussion to reduce anchoring. We are preserving unusual directions until evaluation.",
  },
  {
    id: "concept-orbit",
    stage: "develop",
    title: "Concept A · Orbit",
    eyebrow: "Spatial system",
    status: "Ready for review",
    x: 420,
    y: 62,
    owner: "JS",
    tags: ["concept", "physical"],
    notes: [
      { id: "n-ca1", kind: "note", text: "Rotating screens create adjustable enclosure" },
      { id: "n-ca2", kind: "assumption", text: "Users understand how to move them" },
    ],
    notebook: "A modular physical system. Strong on control, uncertain on maintenance and intuitive use.",
  },
  {
    id: "concept-signal",
    stage: "develop",
    title: "Concept B · Signal",
    eyebrow: "Service layer",
    status: "In progress",
    x: 734,
    y: 130,
    owner: "AL",
    tags: ["concept", "service"],
    notes: [
      { id: "n-cb1", kind: "note", text: "A subtle shared code for open / quiet" },
      { id: "n-cb2", kind: "assumption", text: "Visitors will respect the signal" },
    ],
    notebook: "Low material cost and easy to test, but it relies on new social behavior.",
  },
  {
    id: "decision-matrix",
    stage: "develop",
    title: "Concept decision",
    eyebrow: "Real · Win · Worth",
    status: "In progress",
    x: 292,
    y: 388,
    owner: "ALL",
    tags: ["selection", "trade-offs"],
    notes: [
      { id: "n-m1", kind: "decision", text: "Prototype Orbit's interaction, borrow Signal's social cue" },
      { id: "n-m2", kind: "note", text: "Test comprehension before structural fidelity" },
    ],
    notebook: "Criteria: clarity of control, accessibility, maintenance, social comfort and learning value.",
  },
  {
    id: "prototype-brief",
    stage: "deliver",
    title: "Prototype brief",
    eyebrow: "Learning goal",
    status: "Reviewed",
    x: 92,
    y: 104,
    owner: "JS",
    tags: ["hypothesis", "fidelity"],
    notes: [
      { id: "n-b1", kind: "assumption", text: "Visitors can create a preferred boundary in under 30 seconds" },
      { id: "n-b2", kind: "decision", text: "Full-size cardboard interaction mockup" },
    ],
    notebook: "The first prototype tests comprehension and perceived control, not material durability.",
  },
  {
    id: "test-plan",
    stage: "deliver",
    title: "Test plan",
    eyebrow: "6 sessions · 2 contexts",
    status: "Ready for review",
    x: 416,
    y: 64,
    owner: "AL",
    tags: ["testing", "metrics"],
    notes: [
      { id: "n-t1", kind: "note", text: "Observe first action before explaining" },
      { id: "n-t2", kind: "note", text: "Measure time, errors and confidence" },
    ],
    notebook: "Recruit a mix of first-time and frequent visitors. Do not ask whether they like the concept until after the task.",
  },
  {
    id: "test-results",
    stage: "deliver",
    title: "Prototype 01 results",
    eyebrow: "Evidence · 4 of 6 sessions",
    status: "In progress",
    x: 730,
    y: 132,
    owner: "JS",
    tags: ["results", "behavior"],
    notes: [
      { id: "n-tr1", kind: "evidence", text: "3 users rotated the wrong panel first" },
      { id: "n-tr2", kind: "evidence", text: "All users understood the open / quiet cue" },
    ],
    notebook: "Early evidence suggests the signal is clear but the physical affordance is not. Complete the remaining sessions before concluding.",
  },
  {
    id: "iteration-log",
    stage: "deliver",
    title: "Iteration log",
    eyebrow: "Version 01 → 02",
    status: "In progress",
    x: 318,
    y: 390,
    owner: "ALL",
    tags: ["iteration", "decision"],
    notes: [
      { id: "n-l1", kind: "decision", text: "Add grip cue and reduce rotation range" },
      { id: "n-l2", kind: "note", text: "Retest without verbal instruction" },
    ],
    notebook: "Each change must point to a test observation and state what result would count as improvement.",
  },
];

const DEFAULT_LINKS: BoardLink[] = [
  { id: "l1", from: "research-plan", to: "stakeholder-map", label: "guides" },
  { id: "l2", from: "stakeholder-map", to: "site-analysis", label: "focuses" },
  { id: "l3", from: "persona-mei", to: "opportunity-signals", label: "reveals" },
  { id: "l4", from: "affinity-map", to: "insight-statements", label: "becomes" },
  { id: "l5", from: "insight-statements", to: "hmw-frame", label: "frames" },
  { id: "l6", from: "idea-sprint", to: "concept-orbit", label: "develops" },
  { id: "l7", from: "concept-orbit", to: "concept-signal", label: "compares" },
  { id: "l8", from: "prototype-brief", to: "test-plan", label: "shapes" },
  { id: "l9", from: "test-plan", to: "test-results", label: "produces" },
];

const CRITIQUES: Record<StageId, { strengths: string; concern: string; question: string; action: string }> = {
  discover: {
    strengths: "The site observations use concrete behavior and time-based evidence. The team has also kept one contradictory signal visible instead of averaging it away.",
    concern: "The claim about visitors preferring quiet is still an assumption. Current evidence shows where people sit, but not why they chose that location.",
    question: "What would you need to observe or ask to separate shade preference from privacy, noise and habit?",
    action: "Run one short intercept interview at each observation period and link each answer to the matching field note.",
  },
  define: {
    strengths: "The opportunity focuses on user control and leaves room for physical, service and behavioral responses.",
    concern: "‘Short-stay visitor’ is not yet bounded. The success criteria may change significantly between a five-minute pause and a forty-minute wait.",
    question: "Which duration and context are most strongly supported by the Discover evidence?",
    action: "Add a scope statement and connect each success criterion to at least one insight and one observable behavior.",
  },
  develop: {
    strengths: "Orbit and Signal use meaningfully different mechanisms. The selection record also keeps rejected directions visible.",
    concern: "Both concepts assume users are comfortable signaling social intent in public. No alternative currently avoids that behavior change.",
    question: "What concept could create control without requiring users to announce a preference?",
    action: "Generate one low-technology alternative, then compare all three against accessibility and maintenance criteria.",
  },
  deliver: {
    strengths: "The prototype fidelity matches the immediate question: comprehension before durability. Behavioral measures are stronger than preference alone.",
    concern: "Four completed sessions are not enough to claim the interaction is broadly intuitive, and the first-action errors are clustered around one affordance.",
    question: "Will prototype 02 test the changed grip cue in the same conditions, so the result is comparable?",
    action: "Finish the two planned sessions, document the version change, then repeat the first-action measure without explanation.",
  },
};

function makeId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export default function Home() {
  const [stage, setStage] = useState<StageId>("discover");
  const [sections, setSections] = useState<Section[]>(DEFAULT_SECTIONS);
  const [links, setLinks] = useState<BoardLink[]>(DEFAULT_LINKS);
  const [selectedId, setSelectedId] = useState("site-analysis");
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"board" | "outline">("board");
  const [showNotebook, setShowNotebook] = useState(false);
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [composer, setComposer] = useState<NoteKind | null>(null);
  const [newText, setNewText] = useState("");
  const [newSectionTitle, setNewSectionTitle] = useState("");
  const [linkMode, setLinkMode] = useState(false);
  const [linkSource, setLinkSource] = useState<string | null>(null);
  const [critiqueBusy, setCritiqueBusy] = useState(false);
  const [critiqueReady, setCritiqueReady] = useState(true);
  const [savedFeedback, setSavedFeedback] = useState<Record<string, boolean>>({});
  const [toast, setToast] = useState("");
  const [hydrated, setHydrated] = useState(false);

  const stageMeta = STAGES[stage];
  const stageSections = useMemo(
    () => sections.filter((section) => section.stage === stage && section.status !== "Archived"),
    [sections, stage],
  );
  const visibleSections = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return stageSections;
    return stageSections.filter((section) =>
      [section.title, section.eyebrow, section.tags.join(" "), section.notes.map((note) => note.text).join(" ")]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [search, stageSections]);
  const selected = sections.find((section) => section.id === selectedId && section.status !== "Archived") ?? stageSections[0];
  const stageLinks = links.filter((link) => {
    const from = stageSections.find((section) => section.id === link.from);
    const to = stageSections.find((section) => section.id === link.to);
    return Boolean(from && to);
  });

  useEffect(() => {
    const saved = window.localStorage.getItem("4d-studio-board");
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as { sections: Section[]; links: BoardLink[] };
        if (Array.isArray(parsed.sections) && Array.isArray(parsed.links)) {
          setSections(parsed.sections);
          setLinks(parsed.links);
        }
      } catch {
        // Keep the carefully designed starter project if stored data is invalid.
      }
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem("4d-studio-board", JSON.stringify({ sections, links }));
  }, [sections, links, hydrated]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setComposer(null);
        setShowSectionModal(false);
        setLinkMode(false);
        setShowNotebook(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!selected || selected.stage === stage) return;
    const first = stageSections[0];
    if (first) setSelectedId(first.id);
  }, [stage, selected, stageSections]);

  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2600);
  };

  const chooseSection = (section: Section) => {
    if (linkMode && linkSource && linkSource !== section.id) {
      setLinks((current) => [
        ...current,
        { id: makeId("link"), from: linkSource, to: section.id, label: "supports" },
      ]);
      setLinkMode(false);
      setLinkSource(null);
      notify(`Linked to ${section.title}`);
      return;
    }
    setSelectedId(section.id);
    setCritiqueReady(false);
  };

  const beginLink = () => {
    if (!selected) return;
    setLinkMode(true);
    setLinkSource(selected.id);
    notify("Choose another section to create a ‘supports’ link");
  };

  const addNote = () => {
    if (!selected || !composer || !newText.trim()) return;
    setSections((current) =>
      current.map((section) =>
        section.id === selected.id
          ? { ...section, notes: [...section.notes, { id: makeId("note"), kind: composer, text: newText.trim() }] }
          : section,
      ),
    );
    setNewText("");
    setComposer(null);
    setCritiqueReady(false);
    notify(`${composer === "evidence" ? "Evidence" : "Note"} added to ${selected.title}`);
  };

  const addSection = () => {
    if (!newSectionTitle.trim()) return;
    const count = stageSections.length;
    const section: Section = {
      id: makeId("section"),
      stage,
      title: newSectionTitle.trim(),
      eyebrow: "Custom thinking section",
      status: "In progress",
      x: 104 + (count % 3) * 304,
      y: 110 + Math.floor(count / 3) * 240,
      owner: "JS",
      tags: [stage],
      notes: [],
      notebook: "State the purpose, method, evidence, assumptions and decisions for this section.",
    };
    setSections((current) => [...current, section]);
    setSelectedId(section.id);
    setNewSectionTitle("");
    setShowSectionModal(false);
    notify("New thinking section created");
  };

  const updateNotebook = (value: string) => {
    if (!selected) return;
    setSections((current) => current.map((section) => section.id === selected.id ? { ...section, notebook: value } : section));
  };

  const updateNote = (noteId: string, text: string) => {
    if (!selected) return;
    setSections((current) => current.map((section) => section.id === selected.id
      ? { ...section, notes: section.notes.map((note) => note.id === noteId ? { ...note, text } : note) }
      : section));
  };

  const archiveSection = () => {
    if (!selected) return;
    setSections((current) => current.map((section) => section.id === selected.id ? { ...section, status: "Archived" } : section));
    setShowNotebook(false);
    const next = stageSections.find((section) => section.id !== selected.id);
    if (next) setSelectedId(next.id);
    notify("Section archived — its history is preserved");
  };

  const runCritique = () => {
    setCritiqueBusy(true);
    setCritiqueReady(false);
    window.setTimeout(() => {
      setCritiqueBusy(false);
      setCritiqueReady(true);
      if (selected) {
        setSections((current) => current.map((section) => section.id === selected.id ? { ...section, status: "Reviewed" } : section));
      }
    }, 900);
  };

  const exportProject = () => {
    const lines = [
      "# Fieldwork Sprint — 4D Project Export",
      "",
      `Exported ${new Date().toLocaleDateString()}`,
      "",
      ...Object.keys(STAGES).flatMap((key) => {
        const stageKey = key as StageId;
        const items = sections.filter((section) => section.stage === stageKey && section.status !== "Archived");
        return [
          `## ${STAGES[stageKey].name}`,
          "",
          ...items.flatMap((section) => [
            `### ${section.title}`,
            "",
            `Status: ${section.status}`,
            "",
            section.notebook,
            "",
            ...section.notes.map((note) => `- **${note.kind}:** ${note.text}`),
            "",
          ]),
        ];
      }),
      "## AI use disclosure",
      "",
      "Stage-specific AI critics were used to challenge assumptions and identify next actions. All accepted project content and stage decisions were reviewed by the human team.",
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "fieldwork-sprint-4d-export.md";
    anchor.click();
    URL.revokeObjectURL(url);
    notify("Markdown process report exported");
  };

  const progress = Math.round((stageSections.filter((section) => ["Reviewed", "Accepted"].includes(section.status)).length / Math.max(stageSections.length, 1)) * 100);

  return (
    <main className="studio-shell" style={{ "--stage": stageMeta.color, "--stage-soft": stageMeta.soft } as React.CSSProperties}>
      <header className="topbar">
        <div className="brand-lockup">
          <div className="brand-mark" aria-hidden="true"><span>4</span><span>D</span></div>
          <div>
            <div className="brand-name">Design Studio</div>
            <div className="project-switch">Fieldwork Sprint <span>⌄</span></div>
          </div>
        </div>
        <label className="global-search">
          <span aria-hidden="true">⌕</span>
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search this stage" aria-label="Search sections" />
          <kbd>⌘ K</kbd>
        </label>
        <div className="top-actions">
          <div className="presence" aria-label="2 collaborators online">
            <span className="avatar avatar-dark">JS</span>
            <span className="avatar avatar-warm">AL</span>
            <i />
          </div>
          <button className="button button-quiet" onClick={() => notify("Review link copied to clipboard")}>Share</button>
          <button className="button button-dark" onClick={exportProject}>Export <span>↗</span></button>
        </div>
      </header>

      <aside className="stage-rail" aria-label="Design stages">
        <div className="project-mini">
          <span>PROJECT</span>
          <strong>Public pause spaces</strong>
          <div className="mini-progress"><i style={{ width: "42%" }} /></div>
          <small>Week 4 of 9</small>
        </div>
        <nav>
          {(Object.keys(STAGES) as StageId[]).map((key) => {
            const item = STAGES[key];
            const active = stage === key;
            const complete = key === "discover";
            return (
              <button
                key={key}
                className={`stage-button ${active ? "active" : ""}`}
                style={{ "--item": item.color, "--item-soft": item.soft } as React.CSSProperties}
                onClick={() => {
                  setStage(key);
                  const first = sections.find((section) => section.stage === key && section.status !== "Archived");
                  if (first) setSelectedId(first.id);
                  setCritiqueReady(false);
                  setShowNotebook(false);
                }}
              >
                <span className="stage-number">{complete ? "✓" : item.index}</span>
                <span className="stage-copy"><strong>{item.name}</strong><small>{item.mindset}</small></span>
                {active && <span className="stage-arrow">→</span>}
              </button>
            );
          })}
        </nav>
        <div className="rail-footer">
          <button onClick={() => notify("Activity: 14 edits, 3 comments, 2 reviews this week")}><span>↻</span> Activity</button>
          <button onClick={() => notify("Project settings are ready for your team") }><span>⚙</span> Project settings</button>
          <div className="human-led"><i /><span><strong>Human-led</strong>AI-assisted process</span></div>
        </div>
      </aside>

      <section className="workspace">
        <header className="workspace-header">
          <div className="stage-title-row">
            <div className="stage-kicker"><span>{stageMeta.index}</span> {stageMeta.name.toUpperCase()}</div>
            <div className="view-toggle" aria-label="View options">
              <button className={view === "board" ? "active" : ""} onClick={() => setView("board")}>Board</button>
              <button className={view === "outline" ? "active" : ""} onClick={() => setView("outline")}>Outline</button>
            </div>
          </div>
          <div className="stage-heading">
            <div>
              <h1>{stageMeta.headline}<span>.</span></h1>
              <p>{stageMeta.prompt}</p>
            </div>
            <div className="stage-health">
              <div className="health-top"><span>Stage readiness</span><strong>{progress}%</strong></div>
              <div className="health-bar"><i style={{ width: `${progress}%` }} /></div>
              <small>{stageSections.filter((section) => section.status === "Reviewed").length} reviewed · {stageSections.filter((section) => section.status === "Ready for review").length} awaiting critique</small>
            </div>
          </div>
        </header>

        <div className="board-toolbar" aria-label="Board tools">
          <button className="tool-active" aria-label="Select tool"><span>↖</span><small>Select</small></button>
          <button onClick={() => selected ? setComposer("note") : notify("Select a section first")}><span>▰</span><small>Note</small></button>
          <button onClick={() => selected ? setComposer("evidence") : notify("Select a section first")}><span>◈</span><small>Evidence</small></button>
          <button className={linkMode ? "tool-active" : ""} onClick={beginLink}><span>↗</span><small>Link</small></button>
          <button onClick={() => selected ? setShowNotebook(true) : notify("Select a section first")}><span>≡</span><small>Notebook</small></button>
          <i />
          <button onClick={() => setShowSectionModal(true)}><span>＋</span><small>Section</small></button>
        </div>

        {view === "board" ? (
          <div className={`canvas ${linkMode ? "linking" : ""}`}>
            <div className="canvas-label"><span>{stageMeta.name} canvas</span><small>{stageSections.length} thinking sections · autosaved</small></div>
            {stageLinks.map((link) => {
              const from = stageSections.find((section) => section.id === link.from);
              const to = stageSections.find((section) => section.id === link.to);
              if (!from || !to) return null;
              const x1 = from.x + 224;
              const y1 = from.y + 80;
              const x2 = to.x;
              const y2 = to.y + 80;
              const width = Math.hypot(x2 - x1, y2 - y1);
              const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
              return (
                <div key={link.id} className="board-connection" style={{ left: x1, top: y1, width, transform: `rotate(${angle}deg)` }}>
                  <span>{link.label}</span><i />
                </div>
              );
            })}
            {visibleSections.map((section) => (
              <article
                key={section.id}
                className={`section-card ${selected?.id === section.id ? "selected" : ""}`}
                style={{ left: section.x, top: section.y }}
                onClick={() => chooseSection(section)}
                tabIndex={0}
                onKeyDown={(event) => { if (event.key === "Enter") chooseSection(section); }}
              >
                <div className="section-topline"><span>{section.eyebrow}</span><div className="owner">{section.owner}</div></div>
                <h2>{section.title}</h2>
                <div className="note-stack">
                  {section.notes.slice(0, 3).map((note) => <span key={note.id} className={`mini-note ${note.kind}`}>{note.text}</span>)}
                  {section.notes.length === 0 && <span className="empty-note">Add the first thought →</span>}
                </div>
                <footer>
                  <span className={`status-dot ${section.status.toLowerCase().replaceAll(" ", "-")}`} />
                  <span>{section.status}</span>
                  <button aria-label={`Add note to ${section.title}`} onClick={(event) => { event.stopPropagation(); setSelectedId(section.id); setComposer("note"); }}>＋</button>
                </footer>
              </article>
            ))}
            {visibleSections.length === 0 && <div className="empty-search">No sections match “{search}” in {stageMeta.name}.</div>}
            <button className="add-floating" onClick={() => setShowSectionModal(true)}><span>＋</span> Add thinking section</button>
            <div className="zoom-controls"><button aria-label="Zoom out">−</button><span>82%</span><button aria-label="Zoom in">＋</button><button aria-label="Fit canvas">⌗</button></div>
          </div>
        ) : (
          <div className="outline-view">
            <div className="outline-intro"><span>PROCESS OUTLINE</span><strong>{stageMeta.name} evidence and decisions</strong></div>
            {visibleSections.map((section, index) => (
              <button key={section.id} onClick={() => chooseSection(section)} className={selected?.id === section.id ? "active" : ""}>
                <span className="outline-index">{String(index + 1).padStart(2, "0")}</span>
                <span><strong>{section.title}</strong><small>{section.notebook}</small></span>
                <span className="outline-count">{section.notes.length} items</span>
                <span>→</span>
              </button>
            ))}
          </div>
        )}
      </section>

      <aside className="critic-panel" aria-label="AI critic">
        <header>
          <div className="critic-orb"><span>✦</span><i /></div>
          <div><span>{stageMeta.name.toUpperCase()} AGENT</span><h2>{stageMeta.critic}</h2></div>
          <button aria-label="Collapse critic" onClick={() => notify("The critic stays beside your selected section")}>•••</button>
        </header>
        <div className="critic-scope">
          <span>Reviewing</span>
          <strong>{selected?.title ?? `All ${stageMeta.name} sections`}</strong>
          <small>{selected?.notes.length ?? 0} board items · notebook · linked context</small>
        </div>

        {!critiqueReady && !critiqueBusy && (
          <div className="critique-empty">
            <div>✦</div>
            <h3>Ready for a fresh look</h3>
            <p>Review this section against the {stageMeta.name} stage, its linked evidence and the project brief.</p>
            <button onClick={runCritique}>Run section critique <span>→</span></button>
          </div>
        )}

        {critiqueBusy && (
          <div className="critique-loading">
            <div className="thinking-ring" />
            <strong>Reading the reasoning trail</strong>
            <span>Checking evidence, assumptions and stage fit…</span>
          </div>
        )}

        {critiqueReady && !critiqueBusy && (
          <div className="critique-content">
            <div className="readiness-card">
              <div><span>READINESS SIGNAL</span><strong>Nearly ready</strong></div>
              <div className="readiness-score">74</div>
              <p>Strong behavioral evidence. One key assumption needs a direct research check.</p>
            </div>

            <CritiqueCard number="01" kind="strength" title="What is working" text={CRITIQUES[stage].strengths} />
            <CritiqueCard number="02" kind="concern" title="Needs attention" text={CRITIQUES[stage].concern} />
            <CritiqueCard number="03" kind="question" title="Question for the team" text={CRITIQUES[stage].question} />

            <div className="next-action">
              <span>NEXT BEST ACTION</span>
              <p>{CRITIQUES[stage].action}</p>
              <button
                className={savedFeedback[stage] ? "saved" : ""}
                onClick={() => {
                  setSavedFeedback((current) => ({ ...current, [stage]: !current[stage] }));
                  notify(savedFeedback[stage] ? "Action removed" : "Action added to the section");
                }}
              >
                {savedFeedback[stage] ? "✓ Added to actions" : "+ Add as action"}
              </button>
            </div>
            <button className="rerun" onClick={runCritique}>↻ Review latest changes</button>
            <p className="critic-note">AI feedback is advisory. Your team decides what to accept and when to move forward.</p>
          </div>
        )}
      </aside>

      {showNotebook && selected && (
        <div className="notebook-backdrop" onMouseDown={(event) => { if (event.currentTarget === event.target) setShowNotebook(false); }}>
          <section className="notebook-panel" aria-label={`${selected.title} notebook`}>
            <header>
              <div><span>SECTION NOTEBOOK</span><h2>{selected.title}</h2></div>
              <button onClick={() => setShowNotebook(false)} aria-label="Close notebook">×</button>
            </header>
            <div className="notebook-grid">
              <div className="notebook-main">
                <label>Purpose, method and reflection</label>
                <textarea value={selected.notebook} onChange={(event) => updateNotebook(event.target.value)} />
                <div className="notebook-subhead"><span>Board items</span><button onClick={() => setComposer("note")}>＋ Add item</button></div>
                <div className="editable-notes">
                  {selected.notes.map((note) => (
                    <label key={note.id} className={`editable-note ${note.kind}`}>
                      <span>{note.kind}</span>
                      <textarea value={note.text} onChange={(event) => updateNote(note.id, event.target.value)} />
                    </label>
                  ))}
                </div>
              </div>
              <aside className="notebook-meta">
                <div><span>STATUS</span><strong>{selected.status}</strong></div>
                <div><span>OWNER</span><strong>{selected.owner}</strong></div>
                <div><span>TAGS</span><p>{selected.tags.map((tag) => <i key={tag}>{tag}</i>)}</p></div>
                <div><span>TRACEABILITY</span><strong>{selected.notes.filter((note) => note.kind === "evidence").length} evidence links</strong><small>{links.filter((link) => link.from === selected.id || link.to === selected.id).length} section connections</small></div>
                <button className="archive" onClick={archiveSection}>Archive section</button>
              </aside>
            </div>
          </section>
        </div>
      )}

      {(composer || showSectionModal) && (
        <div className="modal-backdrop" onMouseDown={(event) => { if (event.currentTarget === event.target) { setComposer(null); setShowSectionModal(false); } }}>
          <section className="compact-modal" role="dialog" aria-modal="true">
            <header>
              <div><span>{composer ? `ADD ${composer.toUpperCase()}` : `NEW ${stageMeta.name.toUpperCase()} SECTION`}</span><h2>{composer ? selected?.title : "Name this thinking space"}</h2></div>
              <button onClick={() => { setComposer(null); setShowSectionModal(false); }}>×</button>
            </header>
            {composer ? (
              <>
                <textarea autoFocus value={newText} onChange={(event) => setNewText(event.target.value)} placeholder={composer === "evidence" ? "Capture what you observed, measured or sourced…" : "Add a thought, question or interpretation…"} />
                <div className="kind-switch">
                  {(["note", "evidence", "assumption", "decision"] as NoteKind[]).map((kind) => <button key={kind} className={composer === kind ? "active" : ""} onClick={() => setComposer(kind)}>{kind}</button>)}
                </div>
                <button className="modal-primary" disabled={!newText.trim()} onClick={addNote}>Add to section</button>
              </>
            ) : (
              <>
                <input autoFocus value={newSectionTitle} onChange={(event) => setNewSectionTitle(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") addSection(); }} placeholder="e.g. Interview synthesis" />
                <p>The section starts with a visual board, notebook, history and the {stageMeta.critic}.</p>
                <button className="modal-primary" disabled={!newSectionTitle.trim()} onClick={addSection}>Create section</button>
              </>
            )}
          </section>
        </div>
      )}

      {toast && <div className="toast" role="status"><span>✓</span>{toast}</div>}
    </main>
  );
}

function CritiqueCard({ number, kind, title, text }: { number: string; kind: string; title: string; text: string }) {
  return (
    <article className={`critique-card ${kind}`}>
      <div className="critique-label"><span>{number}</span><strong>{title}</strong></div>
      <p>{text}</p>
    </article>
  );
}
