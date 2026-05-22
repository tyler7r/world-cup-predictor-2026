import { Team } from "./types"; // Adjust import based on your setup

export type ProjectedSource = {
  type: "winner" | "runnerUp" | "third";
  group: string;
};

export type MatchupSlot = {
  id: number;
  label: string;
  homeProjected: ProjectedSource;
  awayProjected: ProjectedSource;
};

// The Base 16 Matchups for a 12-Group / 32-Team Format
export const ROUND_OF_32_MATRIX: MatchupSlot[] = [
  // 8 Matches: Group Winners vs 3rd Place Teams (To be dynamically resolved)
  {
    id: 1,
    label: "Match 73",
    homeProjected: { type: "runnerUp", group: "A" },
    awayProjected: { type: "runnerUp", group: "B" },
  },
  {
    id: 2,
    label: "Match 74",
    homeProjected: { type: "winner", group: "E" }, // Capitalized "e"
    awayProjected: { type: "third", group: "ANY" },
  },
  {
    id: 3,
    label: "Match 75",
    homeProjected: { type: "winner", group: "F" },
    awayProjected: { type: "runnerUp", group: "C" },
  },
  {
    id: 4,
    label: "Match 76",
    homeProjected: { type: "winner", group: "C" },
    awayProjected: { type: "runnerUp", group: "F" },
  },
  {
    id: 5,
    label: "Match 77",
    homeProjected: { type: "winner", group: "I" },
    awayProjected: { type: "third", group: "ANY" },
  },
  {
    id: 6,
    label: "Match 78",
    homeProjected: { type: "runnerUp", group: "E" },
    awayProjected: { type: "runnerUp", group: "I" },
  },
  {
    id: 7,
    label: "Match 79",
    homeProjected: { type: "winner", group: "A" },
    awayProjected: { type: "third", group: "ANY" },
  },
  {
    id: 8,
    label: "Match 80",
    homeProjected: { type: "winner", group: "L" },
    awayProjected: { type: "third", group: "ANY" },
  },
  {
    id: 9,
    label: "Match 81",
    homeProjected: { type: "winner", group: "D" },
    awayProjected: { type: "third", group: "ANY" },
  },
  {
    id: 10,
    label: "Match 82",
    homeProjected: { type: "winner", group: "G" },
    awayProjected: { type: "third", group: "ANY" },
  },
  {
    id: 11,
    label: "Match 83",
    homeProjected: { type: "runnerUp", group: "K" },
    awayProjected: { type: "runnerUp", group: "L" },
  },
  {
    id: 12,
    label: "Match 84",
    homeProjected: { type: "winner", group: "H" },
    awayProjected: { type: "runnerUp", group: "J" },
  },
  {
    id: 13,
    label: "Match 85",
    homeProjected: { type: "winner", group: "B" },
    awayProjected: { type: "third", group: "ANY" },
  },
  {
    id: 14,
    label: "Match 86",
    homeProjected: { type: "winner", group: "J" },
    awayProjected: { type: "runnerUp", group: "H" },
  },
  {
    id: 15,
    label: "Match 87",
    homeProjected: { type: "winner", group: "K" },
    awayProjected: { type: "third", group: "ANY" },
  },
  {
    id: 16,
    label: "Match 88",
    homeProjected: { type: "runnerUp", group: "D" },
    awayProjected: { type: "runnerUp", group: "G" },
  },
];

// Mapping the matrix IDs to your specific Wikipedia constraints
const THIRD_PLACE_CONSTRAINTS: Record<number, string[]> = {
  2: ["A", "B", "C", "D", "F"], // Match 74
  5: ["C", "D", "F", "G", "H"], // Match 77
  7: ["C", "E", "F", "H", "I"], // Match 79
  8: ["E", "H", "I", "J", "K"], // Match 80
  9: ["B", "E", "F", "I", "J"], // Match 81
  10: ["A", "E", "H", "I", "J"], // Match 82
  13: ["E", "F", "G", "I", "J"], // Match 85
  15: ["D", "E", "I", "J", "L"], // Match 87
};

/**
 * Programmatic FIFA Permutation Resolver
 * Uses a backtracking algorithm to find the exact legal arrangement
 * of the 8 third-place teams based on FIFA's collision rules.
 */
export const resolveThirdPlaceAssignments = (
  baseMatrix: MatchupSlot[],
  advancingThirdTeams: Team[],
): MatchupSlot[] => {
  const matrixCopy = JSON.parse(JSON.stringify(baseMatrix)) as MatchupSlot[];

  // Isolate the 8 specific slots that need a 3rd place team assigned
  const thirdPlaceSlots = matrixCopy.filter(
    (m) => m.awayProjected.type === "third",
  );

  // Helper to extract "A" from "Group A"
  const getGroupLetter = (team: Team) => team.group_name;

  // Recursive Backtracking function
  const solve = (slotIndex: number, availableTeams: Team[]): boolean => {
    // Base Case: If we've successfully filled all 8 slots, the puzzle is solved!
    if (slotIndex >= thirdPlaceSlots.length) {
      return true;
    }

    const currentSlot = thirdPlaceSlots[slotIndex];
    const allowedGroups = THIRD_PLACE_CONSTRAINTS[currentSlot.id] || [];
    const winnerGroup = currentSlot.homeProjected.group.toUpperCase();

    // Iterate through remaining available teams to find a fit for this slot
    for (let i = 0; i < availableTeams.length; i++) {
      const team = availableTeams[i];
      const teamGroup = getGroupLetter(team);

      // Rule 1: Must be in the Wikipedia constraint list
      const isAllowedByMatrix =
        allowedGroups.length > 0 ? allowedGroups.includes(teamGroup) : true;
      // Rule 2: Cannot play the winner of their own group
      const isNotSameGroup = teamGroup !== winnerGroup;

      if (isAllowedByMatrix && isNotSameGroup) {
        // 1. Assign the team to the slot
        currentSlot.awayProjected.group = teamGroup;

        // 2. Remove from available pool and move to the next slot (Recurse)
        const nextAvailable = [...availableTeams];
        nextAvailable.splice(i, 1);

        if (solve(slotIndex + 1, nextAvailable)) {
          return true; // Found a valid path down the tree
        }

        // 3. Backtrack: If the path failed, reset the slot and try the next team
        currentSlot.awayProjected.group = "ANY";
      }
    }

    // No valid team found for this slot given current arrangement
    return false;
  };

  // Run the algorithm
  const success = solve(0, advancingThirdTeams);

  // Fallback Rule (In case of an extremely rare group combination not covered by standard matrix)
  // This just ensures they don't play their own group winner.
  if (!success) {
    console.warn(
      "Strict matrix resolution failed. Falling back to base FIFA collision rules.",
    );
    const fallbackSolve = (
      slotIndex: number,
      availableTeams: Team[],
    ): boolean => {
      if (slotIndex >= thirdPlaceSlots.length) return true;
      const currentSlot = thirdPlaceSlots[slotIndex];
      const winnerGroup = currentSlot.homeProjected.group.toUpperCase();

      for (let i = 0; i < availableTeams.length; i++) {
        const team = availableTeams[i];
        const teamGroup = getGroupLetter(team);
        if (teamGroup !== winnerGroup) {
          currentSlot.awayProjected.group = teamGroup;
          const nextAvailable = [...availableTeams];
          nextAvailable.splice(i, 1);
          if (fallbackSolve(slotIndex + 1, nextAvailable)) return true;
          currentSlot.awayProjected.group = "ANY";
        }
      }
      return false;
    };
    fallbackSolve(0, advancingThirdTeams);
  }

  return matrixCopy;
};
