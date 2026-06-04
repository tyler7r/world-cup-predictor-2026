import { KnockoutData, StandingPredictions } from "./types";

export function pruneGhostPicks(
  prevPicks: KnockoutData,
  standings: StandingPredictions[],
  advancingThirdPlaceIds: number[],
): KnockoutData {
  // 1. Gather all valid team IDs that actually made it out of the group stages
  const validGroupStageIds = new Set([
    ...standings.map((s) => s.w_id),
    ...standings.map((s) => s.r_id),
    ...advancingThirdPlaceIds,
  ]);

  // 2. Filter using .id since the arrays now contain full Team objects
  const r32 = prevPicks.r32.filter((team) => validGroupStageIds.has(team.id));
  const r16 = prevPicks.r16.filter((team) => validGroupStageIds.has(team.id));
  const qf = prevPicks.qf.filter((team) => validGroupStageIds.has(team.id));
  const sf = prevPicks.sf.filter((team) => validGroupStageIds.has(team.id));
  const final = prevPicks.final.filter((team) =>
    validGroupStageIds.has(team.id),
  );
  const thirdPlaceMatch = prevPicks.thirdPlaceMatch.filter((team) =>
    validGroupStageIds.has(team.id),
  );

  const champion =
    prevPicks.champion && validGroupStageIds.has(prevPicks.champion.id)
      ? prevPicks.champion
      : null;

  const runnerUp =
    prevPicks.runnerUp && validGroupStageIds.has(prevPicks.runnerUp.id)
      ? prevPicks.runnerUp
      : undefined;

  return {
    r32,
    r16,
    qf,
    sf,
    final,
    thirdPlaceMatch,
    champion,
    runnerUp,
  };
}
