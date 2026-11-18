import { fmtRate } from "@/lib/currency";
import { useCurrencyCalculator } from "@/hooks/useCurrencyCalculator";
import { SectionCard } from "./calculator/SectionCard";
import { ExchangeRateSection } from "./calculator/ExchangeRateSection";
import { InvoiceInputSection } from "./calculator/InvoiceInputSection";
import { PaymentOptionsSection } from "./calculator/PaymentOptionsSection";
import { CalculationSummarySection } from "./calculator/CalculationSummarySection";
import { ChangeReturnSection } from "./calculator/ChangeReturnSection";

export const CurrencyChangeCalculator = () => {
  const {
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
    sampleRate,
  } = useCurrencyCalculator();

  const rateLabel = rate.kind === "ok" ? `1 USD = ${fmtRate(rate.value)} LBP` : "Rate not set";

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
      {/* Header with sticky/fixed clear button at top right */}
      <header className="sticky top-4 z-20 mb-6 flex flex-wrap items-center justify-between gap-3 border-b bg-background/95 pb-4 backdrop-blur-sm">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl text-foreground">
            Currency Change Calculator
          </h1>
          <p className="text-sm text-muted-foreground">Dual-Currency Cashier System · USD &amp; LBP</p>
        </div>

        <div className="flex items-center gap-3">
          <span className="tabular rounded-md border bg-card px-3 py-1.5 text-sm font-semibold text-foreground shadow-xs">
            {rateLabel}
          </span>
          <button
            type="button"
            onClick={clear}
            className="calc-btn-base h-9 rounded-md bg-destructive px-3.5 text-xs font-semibold text-destructive-foreground shadow-xs hover:bg-destructive/90 cursor-pointer"
            title="Clear Calculator"
          >
            Clear Calculator
          </button>
        </div>
      </header>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="space-y-5">
          <ExchangeRateSection
            rateRaw={rateRaw}
            onChangeRate={setRateRaw}
            rate={rate}
            sampleRate={sampleRate}
          />

          <SectionCard title="Invoice & Payment">
            <InvoiceInputSection
              invoiceRaw={invoiceRaw}
              onChangeInvoice={setInvoiceRaw}
              invoiceCurrency={invoiceCurrency}
              onSelectCurrency={setInvoiceCurrency}
              invoice={invoice}
              rate={rate}
            />

            <PaymentOptionsSection
              paymentMode={paymentMode}
              onSelectPaymentMode={setPaymentMode}
              paidLbpRaw={paidLbpRaw}
              onChangePaidLbp={setPaidLbpRaw}
              paidLbp={paidLbp}
              paidUsdRaw={paidUsdRaw}
              onChangePaidUsd={setPaidUsdRaw}
              paidUsd={paidUsd}
              rate={rate}
            />
          </SectionCard>
        </div>

        <div className="space-y-5">
          <CalculationSummarySection
            outcome={outcome}
            invoiceCurrency={invoiceCurrency}
            paymentMode={paymentMode}
            rateLabel={rateLabel}
          />

          <ChangeReturnSection
            outcome={outcome}
            usdReturnRaw={usdReturnRaw}
            onChangeUsdReturn={setUsdReturnRaw}
            usdReturn={usdReturn}
            usdReturnError={usdReturnError}
            dist={dist}
          />
        </div>
      </div>
    </div>
  );
};
