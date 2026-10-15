import {
  fmtLbp,
  fmtLbpFrac,
  fmtUsdCents,
  type Distribution,
  type Outcome,
  type Parsed,
} from "@/lib/currency";
import { CurrencyInputField } from "./CurrencyInputField";
import { SectionCard } from "./SectionCard";

interface ChangeReturnSectionProps {
  outcome: Outcome;
  usdReturnRaw: string;
  onChangeUsdReturn: (val: string) => void;
  usdReturn: Parsed<bigint>;
  usdReturnError?: string | undefined;
  dist: Distribution | null;
}

export const ChangeReturnSection = ({
  outcome,
  usdReturnRaw,
  onChangeUsdReturn,
  usdReturn,
  usdReturnError,
  dist,
}: ChangeReturnSectionProps) => {
  if (outcome.status !== "over") return null;

  const quickButtons = [0n, 500n, 1000n, 2000n, 3000n];

  return (
    <>
      <SectionCard title="How Would You Like to Return the Change?">
        <CurrencyInputField
          label="Return in USD"
          value={usdReturnRaw}
          onChange={onChangeUsdReturn}
          placeholder="Enter USD amount"
          unit="USD"
          error={usdReturnError}
          helper={`Maximum: ${fmtUsdCents(outcome.maxUsdCents)}`}
        />
        <div className="mb-4 flex flex-wrap gap-2">
          {quickButtons.map((cents) => (
            <button
              key={cents.toString()}
              type="button"
              disabled={cents > outcome.maxUsdCents}
              title={cents > outcome.maxUsdCents ? "More than the change owed" : undefined}
              onClick={() => onChangeUsdReturn((Number(cents) / 100).toString())}
              className="calc-btn-base tabular h-9 rounded-md border px-3 text-xs font-semibold hover:bg-muted disabled:cursor-not-allowed disabled:opacity-30"
            >
              {Number(cents) / 100} USD
            </button>
          ))}
          <button
            type="button"
            onClick={() => onChangeUsdReturn((Number(outcome.maxUsdCents) / 100).toFixed(2))}
            className="calc-btn-base h-9 rounded-md border px-3 text-xs font-semibold hover:bg-muted"
          >
            Exact USD Equivalent
          </button>
        </div>
        <div className="space-y-1.5">
          <p className="text-sm font-medium text-foreground" id="lbp-return-label">
            Return in LBP
          </p>
          <output
            aria-labelledby="lbp-return-label"
            className="tabular flex h-12 items-center rounded-md border bg-muted px-3 text-lg font-semibold text-foreground"
          >
            {dist?.ok ? fmtLbp(dist.lbpReturn) : "—"}
          </output>
        </div>
      </SectionCard>

      {dist?.ok && usdReturn.kind === "ok" && (
        <SectionCard title="Give the Customer" className="border-success/60 bg-success-soft/20">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="tabular text-3xl font-bold sm:text-4xl text-foreground">
              {fmtUsdCents(usdReturn.value)}
            </span>
            <span className="text-2xl font-bold text-muted-foreground">+</span>
            <span className="tabular break-words text-3xl font-bold sm:text-4xl text-foreground">
              {fmtLbp(dist.lbpReturn)}
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Cash breakdown to hand to the customer.</p>
          <dl className="mt-4 divide-y border-t text-sm">
            <div className="flex justify-between py-1.5">
              <dt className="text-muted-foreground">Total change owed</dt>
              <dd className="tabular font-medium">{fmtLbpFrac(outcome.diffNum, outcome.den)}</dd>
            </div>
            <div className="flex justify-between py-1.5">
              <dt className="text-muted-foreground">Value of USD returned</dt>
              <dd className="tabular font-medium">{fmtLbpFrac(dist.usdValueNum, outcome.den)}</dd>
            </div>
            <div className="flex justify-between py-1.5">
              <dt className="text-muted-foreground">Remaining LBP returned</dt>
              <dd className="tabular font-medium">{fmtLbp(dist.lbpReturn)}</dd>
            </div>
          </dl>
          {dist.residualNum !== 0n ? (
            <p role="alert" className="mt-3 rounded-md bg-danger-soft p-3 text-xs font-medium text-destructive">
              ⚠ The proposed return includes a rounding adjustment of {fmtLbpFrac(dist.residualNum, outcome.den)} to
              nearest whole LBP.
            </p>
          ) : (
            <p className="mt-3 text-xs font-semibold text-success">✓ Matches the change owed exactly.</p>
          )}
        </SectionCard>
      )}
    </>
  );
};
