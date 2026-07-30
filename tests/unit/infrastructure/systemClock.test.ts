import { afterEach, describe, expect, it, vi } from "vitest";

import { SYSTEM_CLOCK } from "@infrastructure/index";

describe("SYSTEM_CLOCK", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("now_withFixedSystemTime_returnsCurrentDate", () => {
    // Given
    const expectedDate = new Date("2026-07-30T12:34:56.000Z");
    vi.useFakeTimers();
    vi.setSystemTime(expectedDate);

    // When
    const actualDate = SYSTEM_CLOCK.now();

    // Then
    expect(actualDate).toEqual(expectedDate);
  });
});
