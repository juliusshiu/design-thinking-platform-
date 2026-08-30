"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type StageId = "discover" | "define" | "develop" | "deliver";
type NoteKind = "note" | "evidence" | "assumption" | "decision";

type Note = {
  id: string;
  text: string;
  kind: NoteKind;
  x?: number;
  y?: number;
};

type Section = {
  id: string;
  stage: StageId;
  title: string;
  eyebrow: string;
  status: "In progress" | "Ready for review" | "Reviewed" | "Accepted" | "Archived";
  x: number;
  y: number;
  width?: number;
  height?: number;
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
  checkpoint: string;
}> = {
  discover: {
    index: "D1",
    name: "Discover",
    color: "#e95a45",
    soft: "#fff0eb",
    headline: "Open the opportunity space",
    prompt: "Understand people, context and unmet needs before deciding what to build.",
    critic: "Research & Empathy Critic",
    mindset: "with empathy",
    checkpoint: "Separate what people did from what we think it means.",
  },
  define: {
    index: "D2",
    name: "Define",
    color: "#e9a327",
    soft: "#fff5dc",
    headline: "Frame what truly matters",
    prompt: "Turn evidence into a focused opportunity, clear principles and measurable outcomes.",
    critic: "Framing & Synthesis Critic",
    mindset: "with mindfulness",
    checkpoint: "Keep every insight traceable to more than one signal.",
  },
  develop: {
    index: "D3",
    name: "Develop",
    color: "#65aa58",
    soft: "#eef8e9",
    headline: "Explore the solution space",
    prompt: "Generate distinct directions, compare trade-offs and choose what is worth testing.",
    critic: "Ideation & Concept Critic",
    mindset: "with joyfulness",
    checkpoint: "Make space for genuinely different directions before choosing.",
  },
  deliver: {
    index: "D4",
    name: "Deliver",
    color: "#4297cf",
    soft: "#e9f5fc",
    headline: "Learn through making",
    prompt: "Prototype, test and iterate without becoming attached to the first answer.",
    critic: "Prototype & Validation Critic",
    mindset: "with non-attachment",
    checkpoint: "Design each test around one learning question, not approval.",
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
    stage: "define",
    title: "Persona · Mei",
    eyebrow: "Research-backed persona",
    status: "In progress",
    x: 82,
    y: 378,
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
    stage: "develop",
    title: "Opportunities",
    eyebrow: "Develop opportunity space",
    status: "In progress",
    x: 696,
    y: 390,
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
    title: "Brainstorming",
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

function apply4DStageTaxonomy(items: Section[]) {
  return items.map((section) => {
    if (section.id === "persona-mei" && section.stage !== "define") {
      return { ...section, stage: "define" as StageId, x: 82, y: 378 };
    }
    if (section.id === "opportunity-signals") {
      return {
        ...section,
        stage: "develop" as StageId,
        title: section.title === "Opportunity signals" ? "Opportunities" : section.title,
        eyebrow: section.eyebrow === "Emerging synthesis" ? "Develop opportunity space" : section.eyebrow,
        x: section.stage === "develop" ? section.x : 696,
        y: section.stage === "develop" ? section.y : 390,
      };
    }
    if (section.id === "idea-sprint" && section.title === "Idea sprint") {
      return { ...section, title: "Brainstorming" };
    }
    return section;
  });
}

function getTopicPreviewPosition(note: Note, index: number) {
  const boardX = note.x ?? 86 + (index % 3) * 246;
  const boardY = note.y ?? 102 + Math.floor(index / 3) * 176;

  return {
    left: `${Math.max(4, Math.min(72, (boardX / 1500) * 100))}%`,
    top: `${Math.max(7, Math.min(66, (boardY / 940) * 100))}%`,
  };
}

export default function Home() {
  const [stage, setStage] = useState<StageId>("discover");
  const [sections, setSections] = useState<Section[]>(DEFAULT_SECTIONS);
  const [links, setLinks] = useState<BoardLink[]>(DEFAULT_LINKS);
  const [selectedId, setSelectedId] = useState("site-analysis");
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"board" | "outline">("board");
  const [canvasTool, setCanvasTool] = useState<"select" | "hand">("select");
  const [spacePressed, setSpacePressed] = useState(false);
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [criticCollapsed, setCriticCollapsed] = useState(false);
  const [canvasZoom, setCanvasZoom] = useState(0.82);
  const [canvasPan, setCanvasPan] = useState({ x: 0, y: 0 });
  const [canvasPanning, setCanvasPanning] = useState(false);
  const [draggingSectionId, setDraggingSectionId] = useState<string | null>(null);
  const [resizingSectionId, setResizingSectionId] = useState<string | null>(null);
  const [focusSectionId, setFocusSectionId] = useState<string | null>(null);
  const [focusZoom, setFocusZoom] = useState(1);
  const [focusPan, setFocusPan] = useState({ x: 0, y: 0 });
  const [focusPanning, setFocusPanning] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const sectionDrag = useRef<{ id: string; startX: number; startY: number; originX: number; originY: number } | null>(null);
  const sectionResize = useRef<{ id: string; startX: number; startY: number; originWidth: number; originHeight: number } | null>(null);
  const sectionDragMoved = useRef(false);
  const noteDrag = useRef<{ sectionId: string; noteId: string; startX: number; startY: number; originX: number; originY: number } | null>(null);
  const canvasPanDrag = useRef<{ startX: number; startY: number; originX: number; originY: number } | null>(null);
  const focusPanDrag = useRef<{ startX: number; startY: number; originX: number; originY: number } | null>(null);
  const searchInput = useRef<HTMLInputElement | null>(null);

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
  const focusSection = sections.find((section) => section.id === focusSectionId && section.status !== "Archived");
  const stageLinks = links.filter((link) => {
    const from = stageSections.find((section) => section.id === link.from);
    const to = stageSections.find((section) => section.id === link.to);
    return Boolean(from && to);
  });

  useEffect(() => {
    const saved = window.localStorage.getItem("4d-studio-board");
    setSidebarCollapsed(window.localStorage.getItem("4d-studio-sidebar-collapsed") === "true");
    setCriticCollapsed(window.localStorage.getItem("4d-studio-critic-collapsed") === "true");
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as { sections: Section[]; links: BoardLink[] };
        if (Array.isArray(parsed.sections) && Array.isArray(parsed.links)) {
          setSections(apply4DStageTaxonomy(parsed.sections));
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
    window.localStorage.setItem("4d-studio-sidebar-collapsed", String(sidebarCollapsed));
    window.localStorage.setItem("4d-studio-critic-collapsed", String(criticCollapsed));
  }, [sections, links, sidebarCollapsed, criticCollapsed, hydrated]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing = Boolean(target?.closest("input, textarea, [contenteditable='true']"));
      if (!typing && event.code === "Space") {
        event.preventDefault();
        setSpacePressed(true);
      }
      if (!typing && event.key.toLowerCase() === "v") setCanvasTool("select");
      if (!typing && event.key.toLowerCase() === "h") setCanvasTool("hand");
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchInput.current?.focus();
        searchInput.current?.select();
      }
      if (event.key === "Escape") {
        setComposer(null);
        setShowSectionModal(false);
        setLinkMode(false);
        setShowNotebook(false);
        setFocusSectionId(null);
      }
    };
    const onKeyUp = (event: KeyboardEvent) => {
      if (event.code === "Space") setSpacePressed(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("keyup", onKeyUp);
    };
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
    if (sectionDragMoved.current) {
      sectionDragMoved.current = false;
      return;
    }
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

  const openSectionFocus = (section: Section) => {
    setSelectedId(section.id);
    setFocusSectionId(section.id);
    setFocusZoom(1);
    setFocusPan({ x: 0, y: 0 });
    setCritiqueReady(false);
  };

  const beginSectionDrag = (event: React.PointerEvent<HTMLElement>, section: Section) => {
    if (canvasTool === "hand" || spacePressed || linkMode || event.button !== 0 || (event.target as HTMLElement).closest("button")) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    sectionDrag.current = {
      id: section.id,
      startX: event.clientX,
      startY: event.clientY,
      originX: section.x,
      originY: section.y,
    };
    sectionDragMoved.current = false;
    setDraggingSectionId(section.id);
    setSelectedId(section.id);
  };

  const moveSection = (event: React.PointerEvent<HTMLElement>) => {
    const drag = sectionDrag.current;
    if (!drag) return;
    const dx = (event.clientX - drag.startX) / canvasZoom;
    const dy = (event.clientY - drag.startY) / canvasZoom;
    if (Math.abs(dx) > 2 || Math.abs(dy) > 2) sectionDragMoved.current = true;
    setSections((current) => current.map((section) => section.id === drag.id
      ? { ...section, x: Math.max(18, drag.originX + dx), y: Math.max(42, drag.originY + dy) }
      : section));
  };

  const endSectionDrag = (event: React.PointerEvent<HTMLElement>) => {
    if (!sectionDrag.current) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    sectionDrag.current = null;
    setDraggingSectionId(null);
  };

  const beginSectionResize = (event: React.PointerEvent<HTMLButtonElement>, section: Section) => {
    if (event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    sectionResize.current = {
      id: section.id,
      startX: event.clientX,
      startY: event.clientY,
      originWidth: section.width ?? 286,
      originHeight: section.height ?? 236,
    };
    setResizingSectionId(section.id);
    setSelectedId(section.id);
  };

  const moveSectionResize = (event: React.PointerEvent<HTMLButtonElement>) => {
    const resize = sectionResize.current;
    if (!resize) return;
    const width = Math.min(540, Math.max(240, resize.originWidth + (event.clientX - resize.startX) / canvasZoom));
    const height = Math.min(460, Math.max(210, resize.originHeight + (event.clientY - resize.startY) / canvasZoom));
    setSections((current) => current.map((section) => section.id === resize.id ? { ...section, width, height } : section));
  };

  const endSectionResize = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (!sectionResize.current) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    sectionResize.current = null;
    setResizingSectionId(null);
    notify("Topic board size saved");
  };

  const zoomBoard = (amount: number) => {
    setCanvasZoom((current) => Math.min(1.45, Math.max(0.45, Number((current + amount).toFixed(2)))));
  };

  const handleCanvasWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    event.preventDefault();
    const bounds = event.currentTarget.getBoundingClientRect();
    const pointer = { x: event.clientX - bounds.left, y: event.clientY - bounds.top };
    const next = Math.min(1.45, Math.max(0.45, Number((canvasZoom + (event.deltaY > 0 ? -0.08 : 0.08)).toFixed(2))));
    setCanvasPan((pan) => ({
      x: pointer.x - (pointer.x - pan.x) * (next / canvasZoom),
      y: pointer.y - (pointer.y - pan.y) * (next / canvasZoom),
    }));
    setCanvasZoom(next);
  };

  const beginCanvasPan = (event: React.PointerEvent<HTMLDivElement>) => {
    const canPan = event.button === 2 || event.button === 1 || (event.button === 0 && (canvasTool === "hand" || spacePressed));
    if (!canPan) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    canvasPanDrag.current = {
      startX: event.clientX,
      startY: event.clientY,
      originX: canvasPan.x,
      originY: canvasPan.y,
    };
    setCanvasPanning(true);
  };

  const moveCanvasPan = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = canvasPanDrag.current;
    if (!drag) return;
    setCanvasPan({
      x: drag.originX + event.clientX - drag.startX,
      y: drag.originY + event.clientY - drag.startY,
    });
  };

  const endCanvasPan = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!canvasPanDrag.current) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    canvasPanDrag.current = null;
    setCanvasPanning(false);
  };

  const handleFocusWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    event.preventDefault();
    const bounds = event.currentTarget.getBoundingClientRect();
    const pointer = { x: event.clientX - bounds.left, y: event.clientY - bounds.top };
    const next = Math.min(1.5, Math.max(0.55, Number((focusZoom + (event.deltaY > 0 ? -0.08 : 0.08)).toFixed(2))));
    setFocusPan((pan) => ({
      x: pointer.x - (pointer.x - pan.x) * (next / focusZoom),
      y: pointer.y - (pointer.y - pan.y) * (next / focusZoom),
    }));
    setFocusZoom(next);
  };

  const beginFocusPan = (event: React.PointerEvent<HTMLDivElement>) => {
    const canPan = event.button === 2 || event.button === 1 || (event.button === 0 && spacePressed);
    if (!canPan) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    focusPanDrag.current = {
      startX: event.clientX,
      startY: event.clientY,
      originX: focusPan.x,
      originY: focusPan.y,
    };
    setFocusPanning(true);
  };

  const moveFocusPan = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = focusPanDrag.current;
    if (!drag) return;
    setFocusPan({
      x: drag.originX + event.clientX - drag.startX,
      y: drag.originY + event.clientY - drag.startY,
    });
  };

  const endFocusPan = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!focusPanDrag.current) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    focusPanDrag.current = null;
    setFocusPanning(false);
  };

  const beginLink = () => {
    if (!selected) return;
    setLinkMode(true);
    setLinkSource(selected.id);
    notify("Choose another section to create a ‘supports’ link");
  };

  const addNote = () => {
    if (!selected || !composer || !newText.trim()) return;
    const noteIndex = selected.notes.length;
    setSections((current) =>
      current.map((section) =>
        section.id === selected.id
          ? { ...section, notes: [...section.notes, {
              id: makeId("note"),
              kind: composer,
              text: newText.trim(),
              x: 86 + (noteIndex % 3) * 246,
              y: 102 + Math.floor(noteIndex / 3) * 176,
            }] }
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

  const updateNote = (sectionId: string, noteId: string, text: string) => {
    setSections((current) => current.map((section) => section.id === sectionId
      ? { ...section, notes: section.notes.map((note) => note.id === noteId ? { ...note, text } : note) }
      : section));
  };

  const addFreeNote = (sectionId: string, x = 160, y = 120, kind: NoteKind = "note") => {
    const id = makeId("free-note");
    setSections((current) => current.map((section) => section.id === sectionId
      ? { ...section, notes: [...section.notes, { id, kind, text: "", x, y }] }
      : section));
    setEditingNoteId(id);
    setCritiqueReady(false);
  };

  const beginNoteDrag = (
    event: React.PointerEvent<HTMLButtonElement>,
    sectionId: string,
    note: Note,
    index: number,
  ) => {
    if (event.button !== 0) return;
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    noteDrag.current = {
      sectionId,
      noteId: note.id,
      startX: event.clientX,
      startY: event.clientY,
      originX: note.x ?? 86 + (index % 3) * 246,
      originY: note.y ?? 102 + Math.floor(index / 3) * 176,
    };
  };

  const moveNote = (event: React.PointerEvent<HTMLButtonElement>) => {
    const drag = noteDrag.current;
    if (!drag) return;
    const x = Math.max(22, drag.originX + (event.clientX - drag.startX) / focusZoom);
    const y = Math.max(52, drag.originY + (event.clientY - drag.startY) / focusZoom);
    setSections((current) => current.map((section) => section.id === drag.sectionId
      ? { ...section, notes: section.notes.map((note) => note.id === drag.noteId ? { ...note, x, y } : note) }
      : section));
  };

  const endNoteDrag = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (!noteDrag.current) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    noteDrag.current = null;
  };

  const cycleNoteKind = (sectionId: string, noteId: string) => {
    const order: NoteKind[] = ["note", "evidence", "assumption", "decision"];
    setSections((current) => current.map((section) => section.id === sectionId
      ? { ...section, notes: section.notes.map((note) => note.id === noteId
          ? { ...note, kind: order[(order.indexOf(note.kind) + 1) % order.length] }
          : note) }
      : section));
  };

  const deleteFreeNote = (sectionId: string, noteId: string) => {
    setSections((current) => current.map((section) => section.id === sectionId
      ? { ...section, notes: section.notes.filter((note) => note.id !== noteId) }
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

  const shareProject = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      notify("Review link copied — ready to share");
    } catch {
      notify("Your review link is ready in the address bar");
    }
  };

  const progress = Math.round((stageSections.filter((section) => ["Reviewed", "Accepted"].includes(section.status)).length / Math.max(stageSections.length, 1)) * 100);

  return (
    <main className={`studio-shell ${sidebarCollapsed ? "sidebar-collapsed" : ""} ${criticCollapsed ? "critic-collapsed" : ""}`} style={{ "--stage": stageMeta.color, "--stage-soft": stageMeta.soft } as React.CSSProperties}>
      <header className="topbar">
        <div className="brand-lockup">
          <div className="brand-mark" aria-hidden="true"><span>4</span><span>D</span></div>
          <div>
            <div className="brand-name">4D Design Studio</div>
            <div className="project-switch">Fieldwork Sprint <span>⌄</span></div>
          </div>
        </div>
        <label className="global-search">
          <span aria-hidden="true">⌕</span>
          <input ref={searchInput} value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search boards, notes and evidence…" aria-label="Search boards, notes and evidence" />
          <kbd>Ctrl K</kbd>
        </label>
        <div className="save-state"><i /> All changes saved</div>
        <div className="top-actions">
          <div className="presence" aria-label="2 collaborators online">
            <span className="avatar avatar-dark">JS</span>
            <span className="avatar avatar-warm">AL</span>
            <i />
          </div>
          <button className="button button-quiet" onClick={shareProject}>Share</button>
          <button className="button button-dark" onClick={exportProject}>Export <span>↗</span></button>
        </div>
      </header>

      <aside className="stage-rail" aria-label="Design stages">
        <button
          className="rail-collapse"
          onClick={() => setSidebarCollapsed((value) => !value)}
          aria-label={sidebarCollapsed ? "Expand stage sidebar" : "Collapse stage sidebar"}
          title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <span>{sidebarCollapsed ? "→" : "←"}</span><small>Collapse</small>
        </button>
        <div className="project-mini">
          <span>PROJECT</span>
          <strong>Public pause spaces</strong>
          <div className="mini-progress"><i style={{ width: "42%" }} /></div>
          <small>Week 4 of 9</small>
        </div>
        <div className="rail-section-label"><span>4D WORKFLOW</span><button onClick={() => setShowSectionModal(true)} aria-label="Add thinking section">＋</button></div>
        <nav>
          {(Object.keys(STAGES) as StageId[]).map((key) => {
            const item = STAGES[key];
            const active = stage === key;
            const complete = key === "discover";
            return (
              <button
                key={key}
                className={`stage-button ${active ? "active" : ""}`}
                aria-current={active ? "step" : undefined}
                style={{ "--item": item.color, "--item-soft": item.soft } as React.CSSProperties}
                onClick={() => {
                  setStage(key);
                  const first = sections.find((section) => section.stage === key && section.status !== "Archived");
                  if (first) setSelectedId(first.id);
                  setCritiqueReady(false);
                  setShowNotebook(false);
                  setCanvasZoom(0.82);
                  setCanvasPan({ x: 0, y: 0 });
                  setCanvasTool("select");
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
            <div className="stage-controls">
              <div className="view-toggle" aria-label="View options">
                <button aria-pressed={view === "board"} className={view === "board" ? "active" : ""} onClick={() => setView("board")}>Board</button>
                <button aria-pressed={view === "outline"} className={view === "outline" ? "active" : ""} onClick={() => setView("outline")}>Outline</button>
              </div>
            </div>
          </div>
          <div className="stage-heading">
            <div>
              <h1>{stageMeta.headline}<span>.</span></h1>
              <p>{stageMeta.prompt}</p>
              <div className="stage-checkpoint"><i /><strong>Human checkpoint</strong><span>{stageMeta.checkpoint}</span></div>
            </div>
            <div className="stage-health">
              <div className="health-top"><span>Stage readiness</span><strong>{progress}%</strong></div>
              <div className="health-bar"><i style={{ width: `${progress}%` }} /></div>
              <small>{stageSections.filter((section) => section.status === "Reviewed").length} reviewed · {stageSections.filter((section) => section.status === "Ready for review").length} awaiting critique</small>
            </div>
          </div>
        </header>

        <div className="board-toolbar" aria-label="Board tools">
          <button
            className={canvasTool === "select" ? "tool-active" : ""}
            aria-label={canvasTool === "select" ? "Switch to hand tool" : "Switch to select tool"}
            title={canvasTool === "select" ? "Select tool (V)" : "Hand tool (H)"}
            onClick={() => setCanvasTool((tool) => tool === "select" ? "hand" : "select")}
            aria-pressed={canvasTool === "select"}
          ><span>{canvasTool === "select" ? "↖" : "✋"}</span><small>{canvasTool === "select" ? "Select" : "Hand"}</small></button>
          <button title="Add an idea to the selected section" onClick={() => selected ? setComposer("note") : notify("Select a section first")}><span>▰</span><small>Note</small></button>
          <button title="Add research evidence to the selected section" onClick={() => selected ? setComposer("evidence") : notify("Select a section first")}><span>◈</span><small>Evidence</small></button>
          <button aria-pressed={linkMode} title="Connect the selected section to another" className={linkMode ? "tool-active" : ""} onClick={beginLink}><span>↗</span><small>Link</small></button>
          <button title="Open notes and details for the selected section" onClick={() => selected ? setShowNotebook(true) : notify("Select a section first")}><span>≡</span><small>Details</small></button>
          <i />
          <button title="Create a new thinking section" onClick={() => setShowSectionModal(true)}><span>＋</span><small>Section</small></button>
        </div>

        {view === "board" ? (
          <div
            className={`canvas tool-${canvasTool} ${spacePressed ? "space-pan" : ""} ${linkMode ? "linking" : ""} ${canvasPanning ? "panning" : ""}`}
            onWheel={handleCanvasWheel}
            onContextMenu={(event) => event.preventDefault()}
            onPointerDown={beginCanvasPan}
            onPointerMove={moveCanvasPan}
            onPointerUp={endCanvasPan}
            onPointerCancel={endCanvasPan}
          >
            <div className="canvas-label"><span>{stageMeta.name} canvas</span><small>{stageSections.length} thinking sections</small><em>Selected: {selected?.title ?? "None"}</em></div>
            <div className="canvas-world" style={{ transform: `translate(${canvasPan.x}px, ${canvasPan.y}px) scale(${canvasZoom})` }}>
            {stageLinks.map((link) => {
              const from = stageSections.find((section) => section.id === link.from);
              const to = stageSections.find((section) => section.id === link.to);
              if (!from || !to) return null;
              const x1 = from.x + (from.width ?? 286);
              const y1 = from.y + (from.height ?? 236) / 2;
              const x2 = to.x;
              const y2 = to.y + (to.height ?? 236) / 2;
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
                className={`section-card topic-board ${selected?.id === section.id ? "selected" : ""} ${draggingSectionId === section.id ? "dragging" : ""} ${resizingSectionId === section.id ? "resizing" : ""}`}
                style={{ left: section.x, top: section.y, width: section.width ?? 286, height: section.height ?? 236 }}
                onClick={() => chooseSection(section)}
                onDoubleClick={() => openSectionFocus(section)}
                onPointerDown={(event) => beginSectionDrag(event, section)}
                onPointerMove={moveSection}
                onPointerUp={endSectionDrag}
                onPointerCancel={endSectionDrag}
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === "Enter") openSectionFocus(section);
                  if (event.key === " ") chooseSection(section);
                }}
              >
                <div className="topic-board-header">
                  <div className="topic-board-title">
                    <div className="section-labels"><b>{STAGES[section.stage].index}</b><span>{STAGES[section.stage].name}</span><i />{section.eyebrow}</div>
                    <h2>{section.title}</h2>
                  </div>
                  <button
                    className="topic-expand"
                    aria-label={`Expand ${section.title} board`}
                    title="Expand board"
                    onClick={(event) => { event.stopPropagation(); openSectionFocus(section); }}
                  >↗</button>
                </div>
                <div className="mini-board-preview" aria-label={`${section.title} board preview`}>
                  <div className="mini-board-origin"><span>BOARD</span><i /></div>
                  {section.notes.slice(0, 12).map((note, index) => {
                    const previewPosition = getTopicPreviewPosition(note, index);
                    return (
                      <span
                        key={note.id}
                        className={`mini-board-item ${note.kind}`}
                        style={{ left: previewPosition.left, top: previewPosition.top }}
                        title={note.text || `Empty ${note.kind}`}
                      >
                        {note.text || `New ${note.kind}`}
                      </span>
                    );
                  })}
                  {section.notes.length === 0 && <span className="mini-board-empty">Double-click to open this board and add your first idea</span>}
                  {section.notes.length > 12 && <span className="mini-board-overflow">+{section.notes.length - 12}</span>}
                </div>
                <footer>
                  <span className={`status-dot ${section.status.toLowerCase().replaceAll(" ", "-")}`} />
                  <span>{section.status}</span>
                  <span className="topic-item-count">{section.notes.length} items</span>
                  <div className="card-actions">
                    <button aria-label={`Add note to ${section.title}`} title="Add note" onClick={(event) => { event.stopPropagation(); setSelectedId(section.id); setComposer("note"); }}>＋</button>
                  </div>
                </footer>
                <button
                  className="topic-resize-handle"
                  aria-label={`Resize ${section.title} board`}
                  title="Drag to resize topic board"
                  onPointerDown={(event) => beginSectionResize(event, section)}
                  onPointerMove={moveSectionResize}
                  onPointerUp={endSectionResize}
                  onPointerCancel={endSectionResize}
                  onDoubleClick={(event) => event.stopPropagation()}
                />
              </article>
            ))}
            {visibleSections.length === 0 && <div className="empty-search">No sections match “{search}” in {stageMeta.name}.</div>}
            <button className="add-floating" onClick={() => setShowSectionModal(true)}><span>＋</span> Add thinking section</button>
            </div>
            <div className="canvas-help"><span>V select</span><i /><span>H hand</span><i /><span>Space or right-drag to pan</span><i /><span>Scroll to zoom</span><i /><span>Double-click to open</span></div>
            <div className="zoom-controls">
              <button aria-label="Zoom out" onClick={() => zoomBoard(-0.1)}>−</button>
              <span>{Math.round(canvasZoom * 100)}%</span>
              <button aria-label="Zoom in" onClick={() => zoomBoard(0.1)}>＋</button>
              <button aria-label="Fit canvas" onClick={() => { setCanvasZoom(0.82); setCanvasPan({ x: 0, y: 0 }); }}>⌗</button>
            </div>
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

      <aside className={`critic-panel ${criticCollapsed ? "collapsed" : ""}`} aria-label={`${stageMeta.name} AI critic`}>
        <header>
          <div className="critic-orb"><span>✦</span><i /></div>
          <div><span>{stageMeta.name.toUpperCase()} REFLECTION PARTNER <em>PRESET</em></span><h2>{stageMeta.critic}</h2></div>
          <button
            aria-label={criticCollapsed ? `Expand ${stageMeta.name} agent` : `Collapse ${stageMeta.name} agent`}
            title={criticCollapsed ? "Expand AI critic" : "Collapse AI critic"}
            onClick={() => setCriticCollapsed((value) => !value)}
          >{criticCollapsed ? "←" : "→"}</button>
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

      {focusSection && (
        <section className="focus-space" aria-label={`${focusSection.title} focused workspace`}>
          <header className="focus-header">
            <button className="focus-back" onClick={() => setFocusSectionId(null)}><span>←</span> Back to {stageMeta.name} board</button>
            <div className="focus-title">
              <span><b>{STAGES[focusSection.stage].index}</b> {STAGES[focusSection.stage].name} · {focusSection.eyebrow}</span>
              <h1>{focusSection.title}</h1>
            </div>
            <div className="focus-actions">
              <button className="focus-quiet" onClick={() => setShowNotebook(true)}>≡ Notebook</button>
              <button className="focus-add" onClick={() => addFreeNote(focusSection.id, 150, 120)}>＋ Text note</button>
              <button className="focus-add evidence" onClick={() => addFreeNote(focusSection.id, 400, 150, "evidence")}>＋ Evidence</button>
            </div>
          </header>
          <div className="focus-subbar">
            <div><i /> Autosaved locally</div>
            <strong>Right-drag to pan · scroll to zoom · move notes by their handle · type directly</strong>
            <span>{focusSection.notes.length} items</span>
          </div>
          <div
            className={`focus-canvas ${focusPanning ? "panning" : ""} ${spacePressed ? "pan-ready" : ""}`}
            onWheel={handleFocusWheel}
            onContextMenu={(event) => event.preventDefault()}
            onPointerDown={beginFocusPan}
            onPointerMove={moveFocusPan}
            onPointerUp={endFocusPan}
            onPointerCancel={endFocusPan}
          >
            <div
              className="focus-world"
              style={{ transform: `translate(${focusPan.x}px, ${focusPan.y}px) scale(${focusZoom})` }}
              onDoubleClick={(event) => {
                if (event.currentTarget !== event.target) return;
                const bounds = event.currentTarget.getBoundingClientRect();
                addFreeNote(
                  focusSection.id,
                  (event.clientX - bounds.left) / focusZoom,
                  (event.clientY - bounds.top) / focusZoom,
                );
              }}
            >
              <div className="focus-prompt">
                <span>THINKING SPACE</span>
                <p>{focusSection.notebook}</p>
              </div>
              {focusSection.notes.map((note, index) => (
                <article
                  key={note.id}
                  className={`focus-note ${note.kind}`}
                  style={{
                    left: note.x ?? 86 + (index % 3) * 246,
                    top: note.y ?? 102 + Math.floor(index / 3) * 176,
                  }}
                  onDoubleClick={(event) => event.stopPropagation()}
                >
                  <header>
                    <button
                      className="focus-note-handle"
                      aria-label="Move note"
                      title="Drag to move"
                      onPointerDown={(event) => beginNoteDrag(event, focusSection.id, note, index)}
                      onPointerMove={moveNote}
                      onPointerUp={endNoteDrag}
                      onPointerCancel={endNoteDrag}
                    ><i /><i /><i /></button>
                    <button className="focus-kind" onClick={() => cycleNoteKind(focusSection.id, note.id)} title="Change item type">{note.kind}</button>
                    <button className="focus-delete" onClick={() => deleteFreeNote(focusSection.id, note.id)} aria-label="Delete note">×</button>
                  </header>
                  <textarea
                    autoFocus={editingNoteId === note.id}
                    value={note.text}
                    onFocus={() => setEditingNoteId(note.id)}
                    onChange={(event) => updateNote(focusSection.id, note.id, event.target.value)}
                    placeholder="Type your idea…"
                    aria-label={`${note.kind} text`}
                  />
                  <footer><span>{note.text.trim().split(/\s+/).filter(Boolean).length} words</span><span>{focusSection.owner}</span></footer>
                </article>
              ))}
              {focusSection.notes.length === 0 && (
                <button className="focus-empty" onClick={() => addFreeNote(focusSection.id, 260, 180)}>
                  <span>＋</span><strong>Start brainstorming</strong><small>Add your first text note</small>
                </button>
              )}
            </div>
            <div className="focus-legend">
              <span><i className="note" />Note</span>
              <span><i className="evidence" />Evidence</span>
              <span><i className="assumption" />Assumption</span>
              <span><i className="decision" />Decision</span>
            </div>
            <div className="zoom-controls focus-zoom">
              <button aria-label="Zoom focused workspace out" onClick={() => setFocusZoom((value) => Math.max(0.55, value - 0.1))}>−</button>
              <span>{Math.round(focusZoom * 100)}%</span>
              <button aria-label="Zoom focused workspace in" onClick={() => setFocusZoom((value) => Math.min(1.5, value + 0.1))}>＋</button>
              <button aria-label="Reset focused workspace zoom" onClick={() => { setFocusZoom(1); setFocusPan({ x: 0, y: 0 }); }}>⌗</button>
            </div>
          </div>
        </section>
      )}

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
                      <textarea value={note.text} onChange={(event) => updateNote(selected.id, note.id, event.target.value)} />
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
