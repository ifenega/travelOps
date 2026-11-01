const amountFormat = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
})

/** "£9,312", "£0.32", "£9,314.88": pence only when there are any. */
export function formatAmount(amount: number) {
  const rounded = Math.round(amount * 100) / 100
  return amountFormat.format(rounded)
}
