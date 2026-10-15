import { useId, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CurrencyInputFieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  unit: string;
  error?: string | undefined;
  helper?: ReactNode | undefined;
  decimal?: boolean;
}

export const CurrencyInputField = ({
  label,
  value,
  onChange,
  placeholder,
  unit,
  error,
  helper,
  decimal = true,
}: CurrencyInputFieldProps) => {
  const id = useId();

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-foreground">
        {label}
      </label>
      <div className={cn("calc-input-row", error && "border-destructive ring-1 ring-destructive")}>
        <input
          id={id}
          type="number"
          inputMode={decimal ? "decimal" : "numeric"}
          min={0}
          step="any"
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={!!error}
          aria-describedby={`${id}-msg`}
          className="tabular h-12 w-full min-w-0 bg-transparent px-3 text-lg font-medium outline-none"
        />
        <span className="px-3 text-sm font-semibold tracking-wide text-muted-foreground">{unit}</span>
      </div>
      <div id={`${id}-msg`} aria-live="polite" className="min-h-5 text-sm">
        {error ? (
          <p className="text-destructive font-medium">{error}</p>
        ) : (
          helper && <p className="text-muted-foreground">{helper}</p>
        )}
      </div>
    </div>
  );
};
