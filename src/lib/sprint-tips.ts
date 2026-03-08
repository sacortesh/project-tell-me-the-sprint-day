export interface AlignmentTips {
  lawful: string;
  neutral: string;
  chaotic: string;
}

/**
 * Tips indexed by dayInSprint (1-15).
 * Days 1-10 = regular sprint, 11-15 = remainder days in last sprint of quarter.
 */
const sprintDayTips: Record<number, AlignmentTips> = {
  1: {
    lawful: "Review sprint goals and accept your tickets",
    neutral: "Skim the backlog, nod thoughtfully",
    chaotic: "Rewrite the entire backlog before standup",
  },
  2: {
    lawful: "Break down your first task into subtasks",
    neutral: "Start coding whatever feels right",
    chaotic: "Refactor the build system instead",
  },
  3: {
    lawful: "Push your first PR of the sprint",
    neutral: "Draft a PR, mark it as WIP forever",
    chaotic: "Push straight to main, no review needed",
  },
  4: {
    lawful: "Review a teammate's PR thoroughly",
    neutral: "Approve the PR after reading the title",
    chaotic: "Request changes on every single PR",
  },
  5: {
    lawful: "Update your ticket statuses honestly",
    neutral: "Move everything to 'In Progress'",
    chaotic: "Close all tickets, open new ones",
  },
  6: {
    lawful: "Check sprint burndown and adjust pace",
    neutral: "Ignore the burndown chart's existence",
    chaotic: "Add 5 more tickets to the sprint scope",
  },
  7: {
    lawful: "Flag blockers early in standup",
    neutral: "Mention blockers casually after standup",
    chaotic: "Become the blocker",
  },
  8: {
    lawful: "Start wrapping up open PRs",
    neutral: "Promise to finish tomorrow",
    chaotic: "Start a brand new feature branch",
  },
  9: {
    lawful: "Groom next sprint's backlog",
    neutral: "Glance at next sprint, close the tab",
    chaotic: "Pressure the team for results",
  },
  10: {
    lawful: "Demo your work in sprint review",
    neutral: "Say 'it works on my machine'",
    chaotic: "Deploy to prod during the retro",
  },
  // Remainder days (last sprint of quarter gets days 11-15)
  11: {
    lawful: "Polish documentation for the quarter",
    neutral: "Update the README date to this year",
    chaotic: "Delete all comments from the codebase",
  },
  12: {
    lawful: "Write missing test coverage",
    neutral: "Run tests, hope they pass",
    chaotic: "Skip tests, ship with confidence",
  },
  13: {
    lawful: "Prepare the quarterly report",
    neutral: "Copy last quarter's report, change the dates",
    chaotic: "Present the report entirely in memes",
  },
  14: {
    lawful: "Tie up loose ends and close stale PRs",
    neutral: "Mark stale PRs as 'will revisit'",
    chaotic: "Merge every open PR simultaneously",
  },
  15: {
    lawful: "Reflect on the quarter and write learnings",
    neutral: "Think about reflecting, do it next quarter",
    chaotic: "Declare technical bankruptcy",
  },
};

const weekendTips: AlignmentTips = {
  lawful: "Rest. Monday you will return stronger",
  neutral: "Think about work, do nothing about it",
  chaotic: "Push a hotfix from your phone at brunch",
};

const bufferTips: AlignmentTips = {
  lawful: "Plan next quarter's roadmap carefully",
  neutral: "Attend the planning meeting on mute",
  chaotic: "Propose pivoting the entire product",
};

export function getTips(
  dayInSprint: number,
  isWeekend: boolean,
  isBufferWeek: boolean
): AlignmentTips {
  if (isBufferWeek) return bufferTips;
  if (isWeekend) return weekendTips;
  return sprintDayTips[dayInSprint] ?? sprintDayTips[10];
}
