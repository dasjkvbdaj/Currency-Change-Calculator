import { fmtLbp, fmtUsdCents, type Parsed, type PaymentMode, type Rate } from "@/lib/currency";
import { cn } from "@/lib/utils";
import { CurrencyInputField } from "./CurrencyInputField";

interface PaymentOptionsSectionProps {
  paymentMode: PaymentMode;
  onSelectPaymentMode: (mode: PaymentMode) => void;
  paidLbpRaw: string;
  onChangePaidLbp: (val: string) => void;
  paidLbp: Parsed<bigint>;
  paidUsdRaw: string;
  onChangePaidUsd: (val: string) => void;
  paidUsd: Parsed<bigint>;
  rate: Parsed<Rate>;
}

export const PaymentOptionsSection = ({
  paymentMode,
  onSelectPaymentMode,
  paidLbpRaw,
  onChangePaidLbp,
  paidLbp,
  paidUsdRaw,
  onChangePaidUsd,
  paidUsd,
  rate,
}: PaymentOptionsSectionProps) => {
  const modes: { id: PaymentMode; title: string; subtitle: string }[] = [
    { id: "LBP", title: "LBP Only", subtitle: "Pay entirely in Lebanese pounds" },
    { id: "USD", title: "USD Only", subtitle: "Pay entirely in US dollars" },
    { id: "MIXED", title: "Both Currencies", subtitle: "Pay with USD and LBP" },
  ];

  // Calculate live combined preview when both currencies are selected
  let mixedTotalSummary: string | null = null;
  if (paymentMode === "MIXED" && rate.kind === "ok") {
    const usdVal = paidUsd.kind === "ok" ? paidUsd.value : 0n;
    const lbpVal = paidLbp.kind === "ok" ? paidLbp.value : 0n;
    if (usdVal > 0n || lbpVal > 0n) {
      const den = 100n * 10n ** BigInt(rate.value.scale);
      const totalLbp = (usdVal * rate.value.num) / den + lbpVal;
      mixedTotalSummary = `Total Received: ${fmtUsdCents(usdVal)} + ${fmtLbp(lbpVal)} = ${fmtLbp(totalLbp)}`;
    }
  }

  return (
    <div className="space-y-4 pt-2">
      <fieldset className="space-y-1.5">
        <legend className="mb-2 text-sm font-semibold tracking-wide">Customer Payment Method</legend>
        <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-3 rounded-md border bg-muted p-1" role="radiogroup">
          {modes.map((m) => (
            <button
              key={m.id}
              type="button"
              role="radio"
              aria-checked={paymentMode === m.id}
              onClick={() => onSelectPaymentMode(m.id)}
              className={cn(
                "calc-btn-base flex flex-col items-center justify-center rounded p-2 text-center",
                paymentMode === m.id
                  ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:bg-card hover:text-foreground",
              )}
            >
              <span className="text-sm font-bold">{m.title}</span>
              <span className="text-[11px] opacity-80">{m.subtitle}</span>
            </button>
          ))}
        </div>
      </fieldset>

      {paymentMode === "LBP" && (
        <CurrencyInputField
          label="Amount Paid (Lebanese Pounds)"
          value={paidLbpRaw}
          onChange={onChangePaidLbp}
          placeholder="e.g. 1,500"
          unit="LBP"
          decimal={false}
          error={paidLbp.kind === "error" ? paidLbp.message : undefined}
          helper={paidLbp.kind === "ok" ? fmtLbp(paidLbp.value) : undefined}
        />
      )}

      {paymentMode === "USD" && (
        <CurrencyInputField
          label="Amount Paid (US Dollars)"
          value={paidUsdRaw}
          onChange={onChangePaidUsd}
          placeholder="e.g. 50.00"
          unit="USD"
          decimal={true}
          error={paidUsd.kind === "error" ? paidUsd.message : undefined}
          helper={
            paidUsd.kind === "ok" && rate.kind === "ok"
              ? `${fmtUsdCents(paidUsd.value)} (= ${fmtLbp(
                  (paidUsd.value * rate.value.num) / (100n * 10n ** BigInt(rate.value.scale)),
                )})`
              : undefined
          }
        />
      )}

      {paymentMode === "MIXED" && (
        <div className="space-y-3 rounded-lg border border-dashed p-3 bg-muted/30">
          <div className="grid gap-3 sm:grid-cols-2">
            <CurrencyInputField
              label="1. Paid in USD"
              value={paidUsdRaw}
              onChange={onChangePaidUsd}
              placeholder="e.g. 20.00"
              unit="USD"
              decimal={true}
              error={paidUsd.kind === "error" ? paidUsd.message : undefined}
              helper={paidUsd.kind === "ok" ? fmtUsdCents(paidUsd.value) : "Enter dollar bills"}
            />
            <CurrencyInputField
              label="2. Paid in LBP"
              value={paidLbpRaw}
              onChange={onChangePaidLbp}
              placeholder="e.g. 250"
              unit="LBP"
              decimal={false}
              error={paidLbp.kind === "error" ? paidLbp.message : undefined}
              helper={paidLbp.kind === "ok" ? fmtLbp(paidLbp.value) : "Enter Lebanese notes"}
            />
          </div>
          {mixedTotalSummary && (
            <div className="rounded-md bg-card p-2.5 text-center text-xs font-semibold text-foreground border shadow-xs">
              {mixedTotalSummary}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
