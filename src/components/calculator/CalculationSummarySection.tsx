import {
  fmtLbp,
  fmtLbpFrac,
  fmtUsdCents,
  type Currency,
  type Outcome,
  type PaymentMode,
} from "@/lib/currency";
import { cn } from "@/lib/utils";
import { SectionCard } from "./SectionCard";

interface CalculationSummarySectionProps {
  outcome: Outcome;
  invoiceCurrency: Currency;
  paymentMode: PaymentMode;
  rateLabel: string;
}

const SummaryRow = ({ label, value, strong }: { label: string; value: string; strong?: boolean }) => (
  <div className="flex flex-wrap justify-between gap-x-4 py-1.5 text-sm">
    <dt className="text-muted-foreground">{label}</dt>
    <dd className={cn("tabular text-right", strong && "font-semibold")}>{value}</dd>
  </div>
);

export const CalculationSummarySection = ({
  outcome,
  invoiceCurrency,
  paymentMode,
  rateLabel,
}: CalculationSummarySectionProps) => {
  if (outcome.status === "incomplete" || outcome.status === "invalid") {
    return (
      <SectionCard title="Calculation Result">
        <p className="rounded-md bg-muted p-4 text-sm text-muted-foreground">
          {outcome.status === "invalid"
            ? "Fix the highlighted fields to see the payment calculation."
            : "Enter the invoice total and customer payment amount."}
        </p>
      </SectionCard>
    );
  }

  const isExact = outcome.status === "exact";
  const isOver = outcome.status === "over";
  const isUnder = outcome.status === "under";

  const paymentDesc =
    paymentMode === "USD"
      ? fmtUsdCents(outcome.paidUsdCents)
      : paymentMode === "LBP"
        ? fmtLbp(outcome.paidLbpCash)
        : `${fmtUsdCents(outcome.paidUsdCents)} + ${fmtLbp(outcome.paidLbpCash)}`;

  return (
    <SectionCard title="Calculation Result">
      <dl className="mb-4 divide-y">
        <SummaryRow
          label="Invoice total"
          value={
            invoiceCurrency === "USD"
              ? `${fmtUsdCents(outcome.invoiceUsdCents)} (${fmtLbp(outcome.invoiceLbp)})`
              : `${fmtLbp(outcome.invoiceLbp)} (≈ ${fmtUsdCents(outcome.invoiceUsdCents)})`
          }
        />
        <SummaryRow label="Payment received" value={paymentDesc} />
        <SummaryRow label="Total payment in LBP" value={fmtLbpFrac(outcome.paymentLbpNum, outcome.den)} />
        <SummaryRow label="Exchange rate" value={rateLabel} />
      </dl>

      <div
        role="status"
        className={cn(
          "rounded-md p-4 transition-colors",
          isUnder && "bg-danger-soft text-destructive",
          (isOver || isExact) && "bg-success-soft text-success",
        )}
      >
        {isExact ? (
          <p className="text-xl font-bold">✓ Exact Payment — No Change Required</p>
        ) : (
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider">
              {isOver ? "Change to return" : "⚠ Additional payment required"}
            </p>
            <p className="tabular break-words text-3xl font-bold sm:text-4xl">{fmtLbp(outcome.changeLbp)}</p>
            <p className="tabular text-sm font-medium opacity-90">
              Approximate equivalent: {fmtUsdCents(outcome.usdEquivCents)}
            </p>
          </div>
        )}
      </div>
    </SectionCard>
  );
};
