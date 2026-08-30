/**
 * A link attempt is valid only between two available boards in the same stage.
 * @param {{ sourceId: string | null, targetId: string | null, sections: Array<{ id: string, stage: string, status: string }>, links: Array<{ from: string, to: string }> }} input
 */
export function evaluateSectionLink({ sourceId, targetId, sections, links }) {
  const source = sections.find((section) => section.id === sourceId && section.status !== "Archived");
  const target = sections.find((section) => section.id === targetId && section.status !== "Archived");
  if (!source || !target || source.stage !== target.stage) return "unavailable";
  if (source.id === target.id) return "same-section";
  if (links.some((link) => link.from === source.id && link.to === target.id)) return "duplicate";
  return "valid";
}
