/**
 * Exact money math for the USD/LBP change calculator.
 *
 * Precision policy:
 * - Exchange rate is kept exactly as entered (decimal string -> scaled BigInt).
 * - USD amounts are integer cents (max 2 decimals, never silently rounded).
 * - LBP cash amounts are whole pounds.
 * - All intermediate LBP values are exact fractions over a common denominator D.
 * - Physical LBP returned = nearest whole pound, half-pound ties rounded up.
 */

export type Currency = "USD" | "LBP";

export type Parsed<T> =
  | { kind: "empty" }
  | { kind: "error"; message: string }
  | { kind: "ok"; value: T };

const NUM_RE = /^\d*\.?\d*$/;

/** Parse a non-negative decimal string into { int, scale } meaning int / 10^scale. */
function parseDecimal(raw: string): { int: bigint; scale: number } | null {
  const s = raw.trim();
  if (s === "" || s === "." || !NUM_RE.test(s)) return null;
  const [w, f = ""] = s.split(".");
  return { int: BigInt((w || "0") + f), scale: f.length };
}

function check(raw: string, negMsg: string): Parsed<{ int: bigint; scale: number }> {
  const s = raw.trim();
  if (s === "") return { kind: "empty" };
  if (s.startsWith("-")) return { kind: "error", message: negMsg };
  const d = parseDecimal(s);
  if (!d) return { kind: "error", message: "Enter a valid number." };
  return { kind: "ok", value: d };
}

export interface Rate {
  num: bigint; // rate = num / 10^scale
  scale: number;
}

export function parseRate(raw: string): Parsed<Rate> {
  if (raw.trim() === "") return { kind: "error", message: "Enter the current exchange rate." };
  const r = check(raw, "The exchange rate must be greater than zero.");
  if (r.kind !== "ok") return r;
  if (r.value.int <= 0n) return { kind: "error", message: "The exchange rate must be greater than zero." };
  return { kind: "ok", value: { num: r.value.int, scale: r.value.scale } };
}

export function parseLbp(raw: string, negMsg: string): Parsed<bigint> {
  const r = check(raw, negMsg);
  if (r.kind !== "ok") return r;
  const { int, scale } = r.value;
  const div = 10n ** BigInt(scale);
  if (int % div !== 0n) return { kind: "error", message: "LBP amounts must be whole pounds." };
  return { kind: "ok", value: int / div };
}

/** Returns USD as integer cents. */
export function parseUsd(raw: string, negMsg: string): Parsed<bigint> {
  const r = check(raw, negMsg);
  if (r.kind !== "ok") return r;
  let { int, scale } = r.value;
  // strip trailing zeros beyond 2 decimals (e.g. 1.500 is fine)
  while (scale > 2 && int % 10n === 0n) {
    int /= 10n;
    scale--;
  }
  if (scale > 2)
    return { kind: "error", message: "Enter USD amounts with no more than two decimal places." };
  return { kind: "ok", value: int * 10n ** BigInt(2 - scale) };
}

/** Round num/den to nearest integer, half up (num may be negative). */
export function roundHalfUp(num: bigint, den: bigint): bigint {
  const twice = 2n * num + den;
  const d2 = 2n * den;
  // floor division
  const q = twice / d2;
  return twice % d2 !== 0n && twice < 0n ? q - 1n : q;
}

export type PaymentMode = "LBP" | "USD" | "MIXED";

export type Outcome =
  | { status: "incomplete" }
  | { status: "invalid" }
  | {
      status: "over" | "exact" | "under";
      den: bigint; // common denominator for exact LBP fractions
      invoiceLbpNum: bigint;
      invoiceLbp: bigint;
      invoiceUsdCents: bigint;
      paymentLbpNum: bigint;
      paidUsdCents: bigint;
      paidLbpCash: bigint;
      diffNum: bigint; // payment - invoice (exact, over den)
      changeLbp: bigint; // whole-pound display of |diff|
      usdEquivCents: bigint; // |diff| in USD, rounded to cents (informational)
      maxUsdCents: bigint; // largest USD return not exceeding change
    };

export interface Inputs {
  rate: Parsed<Rate>;
  invoice: Parsed<bigint>; // LBP if invoiceCurrency is LBP, cents if USD
  invoiceCurrency?: Currency;
  paymentMode?: PaymentMode;
  paid?: Parsed<bigint>; // legacy single paid
  currency?: Currency; // legacy single currency
  paidLbp?: Parsed<bigint>;
  paidUsd?: Parsed<bigint>;
}

export function calculate({
  rate,
  invoice,
  invoiceCurrency = "LBP",
  paymentMode,
  paid,
  currency,
  paidLbp,
  paidUsd,
}: Inputs): Outcome {
  // Determine effective mode: paymentMode takes precedence, fallback to currency or "USD"
  const mode: PaymentMode = paymentMode ?? (currency === "LBP" ? "LBP" : "USD");

  const effectivePaidUsd = paidUsd ?? (mode === "USD" ? paid : undefined);
  const effectivePaidLbp = paidLbp ?? (mode === "LBP" ? paid : undefined);

  if (rate.kind === "error" || invoice.kind === "error") return { status: "invalid" };

  if (mode === "USD") {
    if (effectivePaidUsd?.kind === "error") return { status: "invalid" };
    if (rate.kind !== "ok" || invoice.kind !== "ok" || effectivePaidUsd?.kind !== "ok")
      return { status: "incomplete" };
  } else if (mode === "LBP") {
    if (effectivePaidLbp?.kind === "error") return { status: "invalid" };
    if (rate.kind !== "ok" || invoice.kind !== "ok" || effectivePaidLbp?.kind !== "ok")
      return { status: "incomplete" };
  } else {
    // MIXED payment: either USD, LBP, or both can be provided
    const hasUsdErr = effectivePaidUsd?.kind === "error";
    const hasLbpErr = effectivePaidLbp?.kind === "error";
    if (hasUsdErr || hasLbpErr) return { status: "invalid" };

    const usdEmpty = !effectivePaidUsd || effectivePaidUsd.kind === "empty";
    const lbpEmpty = !effectivePaidLbp || effectivePaidLbp.kind === "empty";
    if (rate.kind !== "ok" || invoice.kind !== "ok" || (usdEmpty && lbpEmpty))
      return { status: "incomplete" };
  }

  const r = rate.value;
  // den = 100 * 10^scale; 1 LBP = den units; 1 cent = r.num units.
  const den = 100n * 10n ** BigInt(r.scale);

  const invoiceLbpNum = invoiceCurrency === "USD" ? invoice.value * r.num : invoice.value * den;
  const invoiceLbp = invoiceCurrency === "USD" ? roundHalfUp(invoiceLbpNum, den) : invoice.value;
  const invoiceUsdCents = invoiceCurrency === "USD" ? invoice.value : roundHalfUp(invoiceLbpNum, r.num);

  let paidUsdCents = 0n;
  let paidLbpCash = 0n;

  if (mode === "USD") {
    paidUsdCents = effectivePaidUsd?.kind === "ok" ? effectivePaidUsd.value : 0n;
  } else if (mode === "LBP") {
    paidLbpCash = effectivePaidLbp?.kind === "ok" ? effectivePaidLbp.value : 0n;
  } else {
    paidUsdCents = effectivePaidUsd?.kind === "ok" ? effectivePaidUsd.value : 0n;
    paidLbpCash = effectivePaidLbp?.kind === "ok" ? effectivePaidLbp.value : 0n;
  }

  const paymentLbpNum = paidUsdCents * r.num + paidLbpCash * den;
  const diffNum = paymentLbpNum - invoiceLbpNum;
  const abs = diffNum < 0n ? -diffNum : diffNum;
  const changeLbp = roundHalfUp(abs, den);
  const status = diffNum === 0n ? "exact" : diffNum > 0n ? "over" : "under";

  return {
    status,
    den,
    invoiceLbpNum,
    invoiceLbp,
    invoiceUsdCents,
    paymentLbpNum,
    paidUsdCents,
    paidLbpCash,
    diffNum,
    changeLbp,
    usdEquivCents: roundHalfUp(abs, r.num),
    maxUsdCents: diffNum > 0n ? diffNum / r.num : 0n,
  };
}

export interface Distribution {
  ok: boolean;
  error?: string;
  usdValueNum: bigint; // over den
  lbpReturn: bigint; // whole pounds to hand over
  residualNum: bigint; // change - (usd value + lbpReturn), over den
}

export function distribute(diffNum: bigint, den: bigint, rate: Rate, usdCents: bigint): Distribution {
  const usdValueNum = usdCents * rate.num;
  if (usdValueNum > diffNum)
    return { ok: false, error: "The USD amount exceeds the change owed.", usdValueNum, lbpReturn: 0n, residualNum: 0n };
  const rem = diffNum - usdValueNum;
  const lbpReturn = roundHalfUp(rem, den);
  return { ok: true, usdValueNum, lbpReturn, residualNum: rem - lbpReturn * den };
}

const lbpFmt = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
const usdFmt = new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const fmtLbp = (n: bigint) => `${lbpFmt.format(n)} LBP`;
export const fmtUsdCents = (c: bigint) => {
  const neg = c < 0n;
  const a = neg ? -c : c;
  const s = `${lbpFmt.format(a / 100n)}.${(a % 100n).toString().padStart(2, "0")}`;
  return `${neg ? "-" : ""}${s} USD`;
};
/** Format an exact fraction num/den as LBP, up to 2 decimals (for residuals). */
export const fmtLbpFrac = (num: bigint, den: bigint) => {
  const cents = roundHalfUp(num * 100n, den);
  const neg = cents < 0n;
  const a = neg ? -cents : cents;
  const frac = a % 100n;
  return `${neg ? "-" : ""}${lbpFmt.format(a / 100n)}${frac ? "." + frac.toString().padStart(2, "0") : ""} LBP`;
};
export const fmtRate = (r: Rate) => {
  const s = r.num.toString().padStart(r.scale + 1, "0");
  const w = s.slice(0, s.length - r.scale);
  const f = r.scale ? s.slice(-r.scale) : "";
  return `${lbpFmt.format(BigInt(w))}${f ? "." + f : ""}`;
};
export { usdFmt };
