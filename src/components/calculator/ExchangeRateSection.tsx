import type { Parsed, Rate } from "@/lib/currency";
import { cn } from "@/lib/utils";
import { CurrencyInputField } from "./CurrencyInputField";
import { SectionCard } from "./SectionCard";

interface ExchangeRateSectionProps {
  rateRaw: string;
  onChangeRate: (val: string) => void;
  onSaveRate: () => void;
  isRateDirty: boolean;
  isRateSaved: boolean;
  rate: Parsed<Rate>;
  sampleRate: string;
}

export const ExchangeRateSection = ({
  rateRaw,
  onChangeRate,
  onSaveRate,
  isRateDirty,
  isRateSaved,
  rate,
  sampleRate,
}: ExchangeRateSectionProps) => {
  const errorMessage = rate.kind === "error" ? rate.message : undefined;
  const canSave = rate.kind === "ok" && isRateDirty;

  return (
    <SectionCard title="Exchange Rate">
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <CurrencyInputField
            label="1 USD = ? LBP"
            value={rateRaw}
            onChange={onChangeRate}
            placeholder="Enter current exchange rate"
            unit="LBP"
            error={errorMessage}
            helper={
              <>
                Daily market rate. Click &ldquo;Set &amp; Save&rdquo; to keep this rate after
                reloading.
                {rateRaw === sampleRate && " (89,000 is default sample rate)"}
              </>
            }
          />
        </div>

        <button
          type="button"
          onClick={onSaveRate}
          disabled={!canSave}
          className={cn(
            "calc-btn-base mt-[26px] h-12 shrink-0 rounded-md border px-4 text-sm font-semibold",
            canSave
              ? "bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer shadow-xs"
              : "bg-muted text-muted-foreground opacity-80 cursor-not-allowed",
          )}
        >
          {isRateSaved ? "Saved ✓" : "Set & Save"}
        </button>
      </div>
    </SectionCard>
  );
};
