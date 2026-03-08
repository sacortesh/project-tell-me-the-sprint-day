import { describe, it, expect } from "vitest";
import { getSprintInfo } from "../sprint-engine";
import { DEFAULT_CONFIG, type SprintConfig } from "../sprint-config";

/** Helper: create a UTC midnight Date from an ISO string. */
function utc(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

// ---------------------------------------------------------------------------
// DEFAULT_CONFIG: 2-week sprints, start 2025-01-06, zero buffer weeks
// Quarter = 13 weeks = 91 days
// 91 / 14 = 6 full sprints (84 days) + 7 remainder days → last sprint = 21 days
// ---------------------------------------------------------------------------

describe("getSprintInfo — default config (2-week sprints, no buffers)", () => {
  it("returns day 1 of sprint 1 on the start date", () => {
    const info = getSprintInfo(utc("2025-01-06"), DEFAULT_CONFIG);
    expect(info.sprintNumber).toBe(1);
    expect(info.dayInSprint).toBe(1);
    expect(info.totalSprintDays).toBe(14);
    expect(info.quarter).toBe(1);
    expect(info.weekInQuarter).toBe(1);
    expect(info.isBufferWeek).toBe(false);
  });

  it("returns day 14 at the end of the first sprint", () => {
    const info = getSprintInfo(utc("2025-01-19"), DEFAULT_CONFIG);
    expect(info.sprintNumber).toBe(1);
    expect(info.dayInSprint).toBe(14);
    expect(info.totalSprintDays).toBe(14);
  });

  it("rolls over to sprint 2 on day 15", () => {
    const info = getSprintInfo(utc("2025-01-20"), DEFAULT_CONFIG);
    expect(info.sprintNumber).toBe(2);
    expect(info.dayInSprint).toBe(1);
    expect(info.totalSprintDays).toBe(14);
  });

  it("places the last sprint in Q1 at sprint 6 with 21 total days (14+7 remainder)", () => {
    // Sprint 6 starts at day offset 70 (5 * 14) → 2025-01-06 + 70 days = 2025-03-17
    const info = getSprintInfo(utc("2025-03-17"), DEFAULT_CONFIG);
    expect(info.sprintNumber).toBe(6);
    expect(info.dayInSprint).toBe(1);
    expect(info.totalSprintDays).toBe(21); // 14 + 7 remainder
    expect(info.quarter).toBe(1);
  });

  it("handles the last day of the remainder in Q1 sprint 6", () => {
    // Sprint 6 covers days 70–90 (21 days). Day 91 is day offset 90.
    // 2025-01-06 + 90 = 2025-04-06
    const info = getSprintInfo(utc("2025-04-06"), DEFAULT_CONFIG);
    expect(info.sprintNumber).toBe(6);
    expect(info.dayInSprint).toBe(21);
    expect(info.totalSprintDays).toBe(21);
    expect(info.quarter).toBe(1);
  });

  it("starts Q2 on the correct date", () => {
    // Q1 = 91 days from 2025-01-06 → Q2 starts 2025-04-07
    const info = getSprintInfo(utc("2025-04-07"), DEFAULT_CONFIG);
    expect(info.sprintNumber).toBe(7);
    expect(info.dayInSprint).toBe(1);
    expect(info.quarter).toBe(2);
    expect(info.weekInQuarter).toBe(1);
  });

  it("returns correct quarter for Q3 start", () => {
    // Q1 = 91, Q2 = 91 → Q3 starts at offset 182 → 2025-01-06 + 182 = 2025-07-07
    const info = getSprintInfo(utc("2025-07-07"), DEFAULT_CONFIG);
    expect(info.quarter).toBe(3);
    expect(info.sprintNumber).toBe(13);
    expect(info.dayInSprint).toBe(1);
  });

  it("returns correct quarter for Q4 start", () => {
    // Q3 starts at offset 182, Q4 at 273 → 2025-01-06 + 273 = 2025-10-06
    const info = getSprintInfo(utc("2025-10-06"), DEFAULT_CONFIG);
    expect(info.quarter).toBe(4);
    expect(info.sprintNumber).toBe(19);
    expect(info.dayInSprint).toBe(1);
  });

  it("handles the very last day of the year schedule", () => {
    // 4 quarters × 91 days = 364 days total. Last day = offset 363.
    // 2025-01-06 + 363 = 2026-01-04
    const info = getSprintInfo(utc("2026-01-04"), DEFAULT_CONFIG);
    expect(info.quarter).toBe(4);
    expect(info.isBufferWeek).toBe(false);
  });

  it("calculates weekInQuarter correctly mid-quarter", () => {
    // Offset 7 into Q1 → week 2
    const info = getSprintInfo(utc("2025-01-13"), DEFAULT_CONFIG);
    expect(info.weekInQuarter).toBe(2);
  });
});

describe("getSprintInfo — config with buffer weeks", () => {
  const configWithBuffers: SprintConfig = {
    startDate: "2025-01-06",
    sprintLengthDays: 14,
    bufferWeeks: {
      afterQ1: 1,
      afterQ2: 1,
      afterQ3: 1,
      afterQ4: 0,
    },
  };

  it("detects buffer week after Q1", () => {
    // Q1 = 91 days → buffer starts at offset 91 → 2025-01-06 + 91 = 2025-04-07
    const info = getSprintInfo(utc("2025-04-07"), configWithBuffers);
    expect(info.isBufferWeek).toBe(true);
    expect(info.quarter).toBe(1);
    expect(info.bufferLabel).toContain("Q1");
  });

  it("starts Q2 after the Q1 buffer", () => {
    // Q1 = 91 + 7 buffer = 98 days → Q2 starts at offset 98 → 2025-01-06 + 98 = 2025-04-14
    const info = getSprintInfo(utc("2025-04-14"), configWithBuffers);
    expect(info.isBufferWeek).toBe(false);
    expect(info.quarter).toBe(2);
    expect(info.sprintNumber).toBe(7);
    expect(info.dayInSprint).toBe(1);
  });

  it("detects buffer week after Q2", () => {
    // Q2 starts at offset 98, Q2 = 91 days → buffer at offset 189 → 2025-01-06 + 189 = 2025-07-14
    const info = getSprintInfo(utc("2025-07-14"), configWithBuffers);
    expect(info.isBufferWeek).toBe(true);
    expect(info.quarter).toBe(2);
    expect(info.bufferLabel).toContain("Q2");
  });

  it("returns zero for sprintNumber/dayInSprint/totalSprintDays during buffer", () => {
    const info = getSprintInfo(utc("2025-04-07"), configWithBuffers);
    expect(info.sprintNumber).toBe(0);
    expect(info.dayInSprint).toBe(0);
    expect(info.totalSprintDays).toBe(0);
  });
});

describe("getSprintInfo — multi-year rollover", () => {
  it("correctly handles a date in the next year's schedule", () => {
    // Default config: 4 × 91 = 364 days per year.
    // Year 1 starts 2025-01-06, ends 2026-01-04 (inclusive).
    // Year 2 starts 2026-01-05.
    const info = getSprintInfo(utc("2026-01-05"), DEFAULT_CONFIG);
    expect(info.sprintNumber).toBe(1);
    expect(info.dayInSprint).toBe(1);
    expect(info.quarter).toBe(1);
  });

  it("handles a date well into the second year", () => {
    // Year 2 starts 2026-01-05. Offset 14 → sprint 2 day 1.
    const info = getSprintInfo(utc("2026-01-19"), DEFAULT_CONFIG);
    expect(info.sprintNumber).toBe(2);
    expect(info.dayInSprint).toBe(1);
  });

  it("handles a date before the config start date", () => {
    // Default starts 2025-01-06. Previous year schedule also 364 days.
    // Previous year starts 2025-01-06 - 364 = 2024-01-08 (2024 is a leap year).
    const info = getSprintInfo(utc("2024-01-08"), DEFAULT_CONFIG);
    expect(info.sprintNumber).toBe(1);
    expect(info.dayInSprint).toBe(1);
    expect(info.quarter).toBe(1);
  });
});

describe("getSprintInfo — different sprint lengths", () => {
  const weeklyConfig: SprintConfig = {
    startDate: "2025-01-06",
    sprintLengthDays: 7,
    bufferWeeks: { afterQ1: 0, afterQ2: 0, afterQ3: 0, afterQ4: 0 },
  };

  it("handles 1-week sprints correctly", () => {
    // 91 / 7 = 13 sprints per quarter, no remainder
    const info = getSprintInfo(utc("2025-01-06"), weeklyConfig);
    expect(info.sprintNumber).toBe(1);
    expect(info.dayInSprint).toBe(1);
    expect(info.totalSprintDays).toBe(7);
  });

  it("transitions sprints correctly with 1-week cadence", () => {
    // Sprint 2 starts 2025-01-13
    const info = getSprintInfo(utc("2025-01-13"), weeklyConfig);
    expect(info.sprintNumber).toBe(2);
    expect(info.dayInSprint).toBe(1);
  });

  it("has 13 sprints per quarter with 1-week cadence", () => {
    // Last sprint in Q1 is sprint 13, starts at day offset 84 → 2025-01-06 + 84 = 2025-03-31
    const info = getSprintInfo(utc("2025-03-31"), weeklyConfig);
    expect(info.sprintNumber).toBe(13);
    expect(info.dayInSprint).toBe(1);
    expect(info.quarter).toBe(1);
  });

  const threeWeekConfig: SprintConfig = {
    startDate: "2025-01-06",
    sprintLengthDays: 21,
    bufferWeeks: { afterQ1: 0, afterQ2: 0, afterQ3: 0, afterQ4: 0 },
  };

  it("handles 3-week sprints correctly", () => {
    // 91 / 21 = 4 full sprints (84 days) + 7 remainder → last sprint = 28 days
    const info = getSprintInfo(utc("2025-01-06"), threeWeekConfig);
    expect(info.sprintNumber).toBe(1);
    expect(info.totalSprintDays).toBe(21);
  });

  it("gives the last sprint in Q1 extra remainder days for 3-week sprints", () => {
    // Sprint 4 starts at offset 63 → 2025-01-06 + 63 = 2025-03-10
    const info = getSprintInfo(utc("2025-03-10"), threeWeekConfig);
    expect(info.sprintNumber).toBe(4);
    expect(info.totalSprintDays).toBe(28); // 21 + 7 remainder
  });
});
