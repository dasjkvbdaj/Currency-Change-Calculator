import type { Parsed, Rate } from "@/lib/currency";
import { CurrencyInputField } from "./CurrencyInputField";
import { SectionCard } from "./SectionCard";

interface ExchangeRateSectionProps {
  rateRaw: string;
  onChangeRate: (val: string) => void;
  rate: Parsed<Rate>;
  sampleRate: string;
}

export const ExchangeRateSection = ({
  rateRaw,
  onChangeRate,
  rate,
  sampleRate,
}: ExchangeRateSectionProps) => {
  const errorMessage = rate.kind === "error" ? rate.message : undefined;

  return (
    <SectionCard title="Exchange Rate">
      <CurrencyInputField
        label="1 USD = ? LBP"
        value={rateRaw}
        onChange={onChangeRate}
        placeholder="Enter current exchange rate"
        unit="LBP"
        error={errorMessage}
        helper={
          <>
            Daily market rate. All conversions and change splits recalculate live.
            {rateRaw === sampleRate && " (89,000 is default sample rate)"}
          </>
        }
      />
    </SectionCard>
  );
};
