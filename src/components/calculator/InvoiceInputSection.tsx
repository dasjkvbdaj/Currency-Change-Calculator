import { fmtLbp, fmtUsdCents, type Currency, type Parsed, type Rate } from "@/lib/currency";
import { cn } from "@/lib/utils";
import { CurrencyInputField } from "./CurrencyInputField";

interface InvoiceInputSectionProps {
  invoiceRaw: string;
  onChangeInvoice: (val: string) => void;
  invoiceCurrency: Currency;
  onSelectCurrency: (c: Currency) => void;
  invoice: Parsed<bigint>;
  rate: Parsed<Rate>;
}

export const InvoiceInputSection = ({
  invoiceRaw,
  onChangeInvoice,
  invoiceCurrency,
  onSelectCurrency,
  invoice,
  rate,
}: InvoiceInputSectionProps) => {
  const isUsd = invoiceCurrency === "USD";
  const errorMessage = invoice.kind === "error" ? invoice.message : undefined;

  // Derive secondary currency preview
  let convertedPreview: string | undefined;
  if (invoice.kind === "ok" && rate.kind === "ok") {
    if (isUsd) {
      const lbpVal = (invoice.value * rate.value.num) / (100n * 10n ** BigInt(rate.value.scale));
      convertedPreview = `${fmtUsdCents(invoice.value)} = ${fmtLbp(lbpVal)}`;
    } else {
      const usdCents = (invoice.value * 100n * 10n ** BigInt(rate.value.scale)) / rate.value.num;
      convertedPreview = `${fmtLbp(invoice.value)} ≈ ${fmtUsdCents(usdCents)}`;
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold tracking-wide">Invoice Total</label>
        <div className="flex rounded-md border bg-muted p-0.5 text-xs font-semibold" role="group">
          {(["LBP", "USD"] as const).map((curr) => (
            <button
              key={curr}
              type="button"
              onClick={() => onSelectCurrency(curr)}
              className={cn(
                "calc-btn-base px-2.5 py-1 rounded",
                invoiceCurrency === curr
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {curr}
            </button>
          ))}
        </div>
      </div>

      <CurrencyInputField
        label={`Amount in ${invoiceCurrency}`}
        value={invoiceRaw}
        onChange={onChangeInvoice}
        placeholder={isUsd ? "e.g. 25.50" : "e.g. 1500000"}
        unit={invoiceCurrency}
        decimal={isUsd}
        error={errorMessage}
        helper={convertedPreview}
      />
    </div>
  );
};
