import { describe, expect, it } from "vitest"
import { pageNumbers } from "./page-numbers"

describe("pageNumbers", () => {
  it("shows every page when there are seven or fewer", () => {
    expect(pageNumbers(1, 1)).toEqual([1])
    expect(pageNumbers(3, 7)).toEqual([1, 2, 3, 4, 5, 6, 7])
  })

  it("matches the design on page 1 of 10", () => {
    expect(pageNumbers(1, 10)).toEqual([1, 2, 3, "…", 8, 9, 10])
  })

  it("keeps the current page and its neighbours in view", () => {
    expect(pageNumbers(5, 10)).toEqual([1, 2, 3, 4, 5, 6, "…", 8, 9, 10])
    expect(pageNumbers(6, 20)).toEqual([1, 2, 3, "…", 5, 6, 7, "…", 18, 19, 20])
  })

  it("handles the last page", () => {
    expect(pageNumbers(10, 10)).toEqual([1, 2, 3, "…", 8, 9, 10])
  })
})
