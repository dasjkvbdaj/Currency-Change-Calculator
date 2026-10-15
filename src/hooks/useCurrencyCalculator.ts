import { useEffect, useMemo, useState } from "react";
import {
  calculate,
  distribute,
  parseLbp,
  parseRate,
  parseUsd,
  type Currency,
  type PaymentMode,
} from "@/lib/currency";

const SAMPLE_RATE = "89000";

export const useCurrencyCalculator = () => {
  const [rateRaw, setRateRaw] = useState(SAMPLE_RATE);
  const [invoiceRaw, setInvoiceRaw] = useState("");
  const [invoiceCurrency, setInvoiceCurrency] = useState<Currency>("LBP");
  const [paymentMode, setPaymentMode] = useState<PaymentMode>("USD");
  const [paidLbpRaw, setPaidLbpRaw] = useState("");
  const [paidUsdRaw, setPaidUsdRaw] = useState("");
  const [usdReturnRaw, setUsdReturnRaw] = useState("0");

  const rate = parseRate(rateRaw);
  const invoice =
    invoiceCurrency === "USD"
      ? parseUsd(invoiceRaw, "Invoice amount cannot be negative.")
      : parseLbp(invoiceRaw, "Invoice amount cannot be negative.");

  const paidLbp = parseLbp(paidLbpRaw, "Payment amount cannot be negative.");
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
