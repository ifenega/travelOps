import { describe, expect, it } from "vitest"
import { pageItems } from "./pagination"

const pages = (current: number, count: number) =>
  pageItems(current, count).map((item) => (item.gapBefore ? `…${item.page}` : `${item.page}`))

describe("pageItems", () => {
  it("shows every page when there are few", () => {
    expect(pages(1, 4)).toEqual(["1", "2", "3", "4"])
  })
  it("skips the middle: 1 2 … 10 11", () => {
    expect(pages(1, 11)).toEqual(["1", "2", "…10", "11"])
  })
  it("keeps the current page and its neighbours", () => {
    expect(pages(6, 11)).toEqual(["1", "2", "…5", "6", "7", "…10", "11"])
  })
})
