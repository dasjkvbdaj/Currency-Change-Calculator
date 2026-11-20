import { useEffect, useMemo, useState } from "react";
import {
  calculate,
  distribute,
  parseLbpScaled,
  parseRate,
  parseUsd,
  type Currency,
  type PaymentMode,
} from "@/lib/currency";

const SAMPLE_RATE = "89000";
const RATE_STORAGE_KEY = "currency_calc_rate_v1";

function readStoredRate(): string {
  if (typeof window === "undefined") return SAMPLE_RATE;
  try {
    const saved = window.localStorage.getItem(RATE_STORAGE_KEY);
    return saved && saved.trim() !== "" ? saved : SAMPLE_RATE;
  } catch {
    return SAMPLE_RATE;
  }
}

function writeStoredRate(value: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(RATE_STORAGE_KEY, value);
  } catch {
    // Ignore storage quota or private browsing errors
  }
}

export const useCurrencyCalculator = () => {
  const [rateRaw, setRateRaw] = useState<string>(SAMPLE_RATE);
  const [savedRateRaw, setSavedRateRaw] = useState<string>(SAMPLE_RATE);
  const [invoiceRaw, setInvoiceRaw] = useState("");
  const [invoiceCurrency, setInvoiceCurrency] = useState<Currency>("LBP");
  const [paymentMode, setPaymentMode] = useState<PaymentMode>("USD");
  const [paidLbpRaw, setPaidLbpRaw] = useState("");
  const [paidUsdRaw, setPaidUsdRaw] = useState("");
  const [usdReturnRaw, setUsdReturnRaw] = useState("0");

  // Load persisted exchange rate after mount to prevent SSR hydration mismatch
  useEffect(() => {
    const stored = readStoredRate();
    setRateRaw(stored);
    setSavedRateRaw(stored);
  }, []);

  const rate = parseRate(rateRaw);

  const saveRate = () => {
    if (rate.kind !== "ok") return;
    const normalized = rateRaw.trim();
    writeStoredRate(normalized);
    setRateRaw(normalized);
    setSavedRateRaw(normalized);
  };

  const isRateDirty = rateRaw.trim() !== savedRateRaw.trim();
  const isRateSaved = !isRateDirty && rate.kind === "ok";

  const invoice =
    invoiceCurrency === "USD"
      ? parseUsd(invoiceRaw, "Invoice amount cannot be negative.")
      : parseLbpScaled(invoiceRaw, "Invoice amount cannot be negative.");

  const paidLbp = parseLbpScaled(paidLbpRaw, "Payment amount cannot be negative.");
  const paidUsd = parseUsd(paidUsdRaw, "Payment amount cannot be negative.");

  const outcome = calculate({
    rate,
    invoice,
    invoiceCurrency,
    paymentMode,
    paidLbp,
    paidUsd,
  });

  const isOver = outcome.status === "over";
  useEffect(() => {
    if (!isOver) setUsdReturnRaw("0");
  }, [isOver]);

  const usdReturn = parseUsd(
    usdReturnRaw === "" ? "0" : usdReturnRaw,
    "USD amount cannot be negative.",
  );

  const dist = useMemo(() => {
    if (outcome.status !== "over" || rate.kind !== "ok" || usdReturn.kind !== "ok") {
      return null;
    }
    return distribute(outcome.diffNum, outcome.den, rate.value, usdReturn.value);
  }, [outcome, rate, usdReturn]);

  const usdReturnError = usdReturn.kind === "error" ? usdReturn.message : dist?.error;

  const clear = () => {
    setInvoiceRaw("");
    setPaidLbpRaw("");
    setPaidUsdRaw("");
    setUsdReturnRaw("0");
  };

  return {
    rateRaw,
    setRateRaw,
    saveRate,
    isRateDirty,
    isRateSaved,
    rate,
    invoiceRaw,
    setInvoiceRaw,
    invoiceCurrency,
    setInvoiceCurrency,
    invoice,
    paymentMode,
    setPaymentMode,
    paidLbpRaw,
    setPaidLbpRaw,
    paidLbp,
    paidUsdRaw,
    setPaidUsdRaw,
    paidUsd,
    usdReturnRaw,
    setUsdReturnRaw,
    usdReturn,
    usdReturnError,
    outcome,
    dist,
    clear,
    sampleRate: SAMPLE_RATE,
  };
};
