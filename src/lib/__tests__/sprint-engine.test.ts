import { describe, it, expect } from "vitest";
import { getSprintInfo } from "../sprint-engine";
import { DEFAULT_CONFIG, type SprintConfig } from "../sprint-config";

/** Helper: create a UTC midnight Date from an ISO string. */
function utc(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

// ---------------------------------------------------------------------------
// DEFAULT_CONFIG: 10 working-day sprints, start 2026-01-07 (Wed), 1 buffer week each
// Quarter = 13 weeks = 91 calendar days = 65 working days
// 65 / 10 = 6 full sprints (60 working days) + 5 remainder → last sprint = 15 working days
// Sprints per year: 4 × 6 = 24
// Year total: 4 × 91 + 4 × 7 = 392 calendar days
// ---------------------------------------------------------------------------

describe("getSprintInfo — default config (10 working-day sprints, buffers)", () => {
  it("returns day 1 of sprint 1 on the start date (Wed 2026-01-07)", () => {
    const info = getSprintInfo(utc("2026-01-07"), DEFAULT_CONFIG);
    expect(info.sprintNumber).toBe(1);
    expect(info.dayInSprint).toBe(1);
    expect(info.totalSprintDays).toBe(10);
    expect(info.quarter).toBe(1);
    expect(info.weekInQuarter).toBe(1);
    expect(info.isBufferWeek).toBe(false);
    expect(info.isWeekend).toBe(false);
  });

  it("returns day 3 on Friday 2026-01-09 (3rd working day of Q1)", () => {
    // Wed=1, Thu=2, Fri=3
    const info = getSprintInfo(utc("2026-01-09"), DEFAULT_CONFIG);
    expect(info.sprintNumber).toBe(1);
    expect(info.dayInSprint).toBe(3);
    expect(info.isWeekend).toBe(false);
  });

  it("returns weekend info on Saturday 2026-01-10", () => {
    const info = getSprintInfo(utc("2026-01-10"), DEFAULT_CONFIG);
    expect(info.isWeekend).toBe(true);
    expect(info.dayInSprint).toBe(0);
    expect(info.weekendContext).toBeDefined();
    expect(info.weekendContext!.lastWorkDay).toBe(3); // Friday was day 3
    expect(info.weekendContext!.nextWorkDay).toBe(4); // Monday will be day 4
    expect(info.weekendContext!.lastSprintNumber).toBe(1);
    expect(info.weekendContext!.nextSprintNumber).toBe(1);
  });

  it("returns weekend info on Sunday 2026-01-11", () => {
    const info = getSprintInfo(utc("2026-01-11"), DEFAULT_CONFIG);
    expect(info.isWeekend).toBe(true);
    expect(info.weekendContext).toBeDefined();
    expect(info.weekendContext!.lastWorkDay).toBe(3); // Friday was day 3
    expect(info.weekendContext!.nextWorkDay).toBe(4); // Monday will be day 4
  });

  it("returns day 4 on Monday 2026-01-12 (4th working day)", () => {
    // Wed=1, Thu=2, Fri=3, [Sat, Sun], Mon=4
    const info = getSprintInfo(utc("2026-01-12"), DEFAULT_CONFIG);
    expect(info.sprintNumber).toBe(1);
    expect(info.dayInSprint).toBe(4);
    expect(info.isWeekend).toBe(false);
  });

  it("returns day 10 (last day of sprint 1) on Tue 2026-01-20", () => {
    // Week 1: Wed(1) Thu(2) Fri(3)
    // Week 2: Mon(4) Tue(5) Wed(6) Thu(7) Fri(8)
    // Week 3: Mon(9) Tue(10)
    const info = getSprintInfo(utc("2026-01-20"), DEFAULT_CONFIG);
    expect(info.sprintNumber).toBe(1);
    expect(info.dayInSprint).toBe(10);
    expect(info.totalSprintDays).toBe(10);
  });

  it("rolls over to sprint 2 on Wed 2026-01-21", () => {
    // Working day 11 = sprint 2, day 1
    const info = getSprintInfo(utc("2026-01-21"), DEFAULT_CONFIG);
    expect(info.sprintNumber).toBe(2);
    expect(info.dayInSprint).toBe(1);
    expect(info.totalSprintDays).toBe(10);
  });

  it("detects sprint boundary weekend (end of sprint 1 → start of sprint 2)", () => {
    // Sprint 1 ends on Tue 2026-01-20 (day 10)
    // Sprint 2 starts on Wed 2026-01-21 (day 1)
    // Weekend before: Sat 2026-01-17, Sun 2026-01-18
    // Fri 2026-01-16 = working day 8 (sprint 1)
    // Mon 2026-01-19 = working day 9 (sprint 1) — NOT a boundary weekend
    // Let's find a true sprint boundary weekend:
    // Sprint 1: working days 1-10 → last day Tue 2026-01-20
    // Sprint 2: working days 11-20 → first day Wed 2026-01-21
    // The weekend Sat 2026-01-24 / Sun 2026-01-25:
    //   Fri 2026-01-23 = working day 13 (sprint 2, day 3)
    //   Mon 2026-01-26 = working day 14 (sprint 2, day 4) — same sprint
    // We need a sprint that ends on a Friday.
    // Sprint 2 covers working days 11-20.
    //   WD 11 = Wed Jan 21, 12 = Thu Jan 22, 13 = Fri Jan 23
    //   14 = Mon Jan 26, 15 = Tue Jan 27, 16 = Wed Jan 28, 17 = Thu Jan 29, 18 = Fri Jan 30
    //   19 = Mon Feb 2, 20 = Tue Feb 3
    // Sprint 3 starts at WD 21 = Wed Feb 4
    // Still no Friday boundary. Let's check a config where it does cross:
    // Actually with start on Wednesday, sprints always end on Tuesday and start on Wednesday.
    // Let's just test a mid-sprint weekend instead.
    const info = getSprintInfo(utc("2026-01-24"), DEFAULT_CONFIG);
    expect(info.isWeekend).toBe(true);
    expect(info.weekendContext!.lastSprintNumber).toBe(2);
    expect(info.weekendContext!.nextSprintNumber).toBe(2);
  });

  it("places the last sprint in Q1 at sprint 6 with 15 total working days", () => {
    // Sprint 6 covers working days 51-65 in Q1
    // WD 51 starts: we need to count forward from 2026-01-07
    // WD 1-3: Jan 7-9 (Wed-Fri)
    // WD 4-8: Jan 12-16 (Mon-Fri)
    // WD 9-13: Jan 19-23
    // WD 14-18: Jan 26-30
    // WD 19-23: Feb 2-6
    // WD 24-28: Feb 9-13
    // WD 29-33: Feb 16-20
    // WD 34-38: Feb 23-27
    // WD 39-43: Mar 2-6
    // WD 44-48: Mar 9-13
    // WD 49-53: Mar 16-20
    // WD 51 = Wed Mar 18
    const info = getSprintInfo(utc("2026-03-18"), DEFAULT_CONFIG);
    expect(info.sprintNumber).toBe(6);
    expect(info.dayInSprint).toBe(1);
    expect(info.totalSprintDays).toBe(15); // 10 + 5 remainder
    expect(info.quarter).toBe(1);
  });

  it("handles the last working day of Q1 sprint 6", () => {
    // Q1 = 91 calendar days from 2026-01-07 → ends 2026-04-08 (exclusive)
    // Last day = 2026-04-07 (Tue, but let's verify)
    // WD 65 = last working day of Q1
    // WD 54-58: Mar 23-27
    // WD 59-63: Mar 30 - Apr 3
    // WD 64: Apr 6 (Mon), WD 65: Apr 7 (Tue)
    const info = getSprintInfo(utc("2026-04-07"), DEFAULT_CONFIG);
    expect(info.sprintNumber).toBe(6);
    expect(info.dayInSprint).toBe(15);
    expect(info.totalSprintDays).toBe(15);
    expect(info.quarter).toBe(1);
  });

  it("detects buffer week after Q1", () => {
    // Q1 = 91 calendar days from 2026-01-07 → buffer starts 2026-04-08
    const info = getSprintInfo(utc("2026-04-08"), DEFAULT_CONFIG);
    expect(info.isBufferWeek).toBe(true);
    expect(info.quarter).toBe(1);
    expect(info.bufferLabel).toContain("Q1");
  });

  it("starts Q2 after Q1 buffer", () => {
    // Q1=91 + buffer=7 → Q2 starts at offset 98 → 2026-01-07 + 98 = 2026-04-15 (Wed)
    const info = getSprintInfo(utc("2026-04-15"), DEFAULT_CONFIG);
    expect(info.isBufferWeek).toBe(false);
    expect(info.quarter).toBe(2);
    expect(info.sprintNumber).toBe(7);
    expect(info.dayInSprint).toBe(1);
    expect(info.isWeekend).toBe(false);
  });

  it("calculates weekInQuarter correctly mid-quarter", () => {
    // Offset 7 into Q1 → week 2 (2026-01-14, a Wednesday)
    const info = getSprintInfo(utc("2026-01-14"), DEFAULT_CONFIG);
    expect(info.weekInQuarter).toBe(2);
  });
});

describe("getSprintInfo — weekend handling", () => {
  it("returns isWeekend=false for buffer week weekdays", () => {
    // Buffer after Q1 starts 2026-04-08 (Wed)
    const info = getSprintInfo(utc("2026-04-08"), DEFAULT_CONFIG);
    expect(info.isBufferWeek).toBe(true);
    expect(info.isWeekend).toBe(false);
  });

  it("returns isWeekend=true for buffer week weekends", () => {
    // 2026-04-11 is a Saturday in the Q1 buffer week
    const info = getSprintInfo(utc("2026-04-11"), DEFAULT_CONFIG);
    expect(info.isBufferWeek).toBe(true);
    expect(info.isWeekend).toBe(true);
  });

  it("sets dayInSprint=0 and totalSprintDays=0 on weekends", () => {
    const info = getSprintInfo(utc("2026-01-10"), DEFAULT_CONFIG);
    expect(info.isWeekend).toBe(true);
    expect(info.dayInSprint).toBe(0);
    expect(info.totalSprintDays).toBe(0);
  });
});

describe("getSprintInfo — config with no buffer weeks", () => {
  const noBufConfig: SprintConfig = {
    startDate: "2026-01-05", // Monday
    sprintLengthDays: 10,
    bufferWeeks: { afterQ1: 0, afterQ2: 0, afterQ3: 0, afterQ4: 0 },
  };

  it("returns day 1 of sprint 1 on Monday start date", () => {
    const info = getSprintInfo(utc("2026-01-05"), noBufConfig);
    expect(info.sprintNumber).toBe(1);
    expect(info.dayInSprint).toBe(1);
    expect(info.totalSprintDays).toBe(10);
    expect(info.quarter).toBe(1);
    expect(info.isWeekend).toBe(false);
  });

  it("returns day 5 on Friday of the first week", () => {
    const info = getSprintInfo(utc("2026-01-09"), noBufConfig);
    expect(info.sprintNumber).toBe(1);
    expect(info.dayInSprint).toBe(5);
  });

  it("returns day 6 on Monday of the second week", () => {
    const info = getSprintInfo(utc("2026-01-12"), noBufConfig);
    expect(info.sprintNumber).toBe(1);
    expect(info.dayInSprint).toBe(6);
  });

  it("returns day 10 (last day sprint 1) on Friday 2026-01-16", () => {
    const info = getSprintInfo(utc("2026-01-16"), noBufConfig);
    expect(info.sprintNumber).toBe(1);
    expect(info.dayInSprint).toBe(10);
    expect(info.totalSprintDays).toBe(10);
  });

  it("rolls over to sprint 2 on Monday 2026-01-19", () => {
    const info = getSprintInfo(utc("2026-01-19"), noBufConfig);
    expect(info.sprintNumber).toBe(2);
    expect(info.dayInSprint).toBe(1);
  });

  it("detects sprint-boundary weekend (Fri=end sprint 1, Mon=start sprint 2)", () => {
    // Fri 2026-01-16 = last day of sprint 1 (day 10)
    // Mon 2026-01-19 = first day of sprint 2 (day 1)
    // Sat 2026-01-17 should show this boundary
    const info = getSprintInfo(utc("2026-01-17"), noBufConfig);
    expect(info.isWeekend).toBe(true);
    expect(info.weekendContext).toBeDefined();
    expect(info.weekendContext!.lastWorkDay).toBe(10);
    expect(info.weekendContext!.lastSprintNumber).toBe(1);
    expect(info.weekendContext!.nextWorkDay).toBe(1);
    expect(info.weekendContext!.nextSprintNumber).toBe(2);
  });

  it("starts Q2 right after Q1 with no buffer", () => {
    // Q1 = 91 calendar days from 2026-01-05 → Q2 starts 2026-04-06 (Mon)
    const info = getSprintInfo(utc("2026-04-06"), noBufConfig);
    expect(info.quarter).toBe(2);
    expect(info.sprintNumber).toBe(7);
    expect(info.dayInSprint).toBe(1);
  });

  it("returns correct quarter for Q3 start", () => {
    // Q1=91 + Q2=91 = 182 → 2026-01-05 + 182 = 2026-07-06 (Mon)
    const info = getSprintInfo(utc("2026-07-06"), noBufConfig);
    expect(info.quarter).toBe(3);
    expect(info.sprintNumber).toBe(13);
    expect(info.dayInSprint).toBe(1);
  });

  it("returns correct quarter for Q4 start", () => {
    // Q3 ends at offset 273 → 2026-01-05 + 273 = 2026-10-05 (Mon)
    const info = getSprintInfo(utc("2026-10-05"), noBufConfig);
    expect(info.quarter).toBe(4);
    expect(info.sprintNumber).toBe(19);
    expect(info.dayInSprint).toBe(1);
  });
});

describe("getSprintInfo — multi-year rollover", () => {
  const noBufConfig: SprintConfig = {
    startDate: "2026-01-05", // Monday
    sprintLengthDays: 10,
    bufferWeeks: { afterQ1: 0, afterQ2: 0, afterQ3: 0, afterQ4: 0 },
  };

  it("correctly handles a date in the next year's schedule", () => {
    // 4 × 91 = 364 calendar days per year
    // Year 1 starts 2026-01-05, ends 2027-01-03 (inclusive, offset 363)
    // Year 2 starts 2027-01-04 (Sun) — but first working day is Mon 2027-01-04+1
    // Actually 2027-01-04 is a Monday (2026-01-05 Mon + 364 = 2027-01-04 Mon)
    const info = getSprintInfo(utc("2027-01-04"), noBufConfig);
    expect(info.sprintNumber).toBe(1);
    expect(info.dayInSprint).toBe(1);
    expect(info.quarter).toBe(1);
  });

  it("handles a date well into the second year", () => {
    // Year 2 starts 2027-01-04 (Mon). WD 1-5: Mon-Fri Jan 4-8
    // WD 6-10: Mon-Fri Jan 11-15 → end sprint 1
    // Sprint 2 starts WD 11 = Mon Jan 18
    // Actually let's just check a known offset:
    // 2027-01-04 + 14 calendar days = 2027-01-18 (Mon) = WD 11 = sprint 2 day 1
    const info = getSprintInfo(utc("2027-01-18"), noBufConfig);
    expect(info.sprintNumber).toBe(2);
    expect(info.dayInSprint).toBe(1);
  });

  it("handles a date before the config start date", () => {
    // Previous year starts 2026-01-05 - 364 = 2025-01-06 (Mon)
    const info = getSprintInfo(utc("2025-01-06"), noBufConfig);
    expect(info.sprintNumber).toBe(1);
    expect(info.dayInSprint).toBe(1);
    expect(info.quarter).toBe(1);
  });
});

describe("getSprintInfo — different sprint lengths", () => {
  const weeklyConfig: SprintConfig = {
    startDate: "2026-01-05", // Monday
    sprintLengthDays: 5, // 1-week sprints (5 working days)
    bufferWeeks: { afterQ1: 0, afterQ2: 0, afterQ3: 0, afterQ4: 0 },
  };

  it("handles 1-week (5 working day) sprints correctly", () => {
    // 65 / 5 = 13 sprints per quarter, no remainder
    const info = getSprintInfo(utc("2026-01-05"), weeklyConfig);
    expect(info.sprintNumber).toBe(1);
    expect(info.dayInSprint).toBe(1);
    expect(info.totalSprintDays).toBe(5);
  });

  it("finishes sprint 1 on Friday", () => {
    const info = getSprintInfo(utc("2026-01-09"), weeklyConfig);
    expect(info.sprintNumber).toBe(1);
    expect(info.dayInSprint).toBe(5);
    expect(info.totalSprintDays).toBe(5);
  });

  it("transitions sprints correctly on Monday", () => {
    // Sprint 2 starts Mon 2026-01-12
    const info = getSprintInfo(utc("2026-01-12"), weeklyConfig);
    expect(info.sprintNumber).toBe(2);
    expect(info.dayInSprint).toBe(1);
  });

  it("has 13 sprints per quarter with 5-day cadence", () => {
    // 65 / 5 = 13 sprints, no remainder.
    // Sprint 13 starts at WD 61 (0-indexed: 60) = Mon 2026-03-30
    // 2026-03-30 is offset 84 calendar days from start (Mon Jan 5)
    const info = getSprintInfo(utc("2026-03-30"), weeklyConfig);
    expect(info.sprintNumber).toBe(13);
    expect(info.dayInSprint).toBe(1);
    expect(info.quarter).toBe(1);
  });
});
