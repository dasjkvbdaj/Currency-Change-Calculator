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
    <div className="mx-auto max-w-6xl px-4 py-6 sm:py-8 relative">
      {/* زر الـ Clear الثابت في الأعلى على اليمين مع خاصية Fixed */}
      <div className="fixed top-4 right-4 z-50 sm:top-6 sm:right-6">
        <button
          type="button"
          onClick={clear}
          className="calc-btn-base flex items-center gap-1.5 h-10 px-4 rounded-lg border bg-card/90 backdrop-blur-md font-medium shadow-md hover:bg-muted text-sm text-foreground border-border transition-all"
          title="Clear Calculator"
        >
          <span>Clear Calculator</span>
        </button>
      </div>

      <header className="mb-6 flex flex-wrap items-end justify-between gap-3 border-b pb-4 pr-32 sm:pr-40">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl text-foreground">
            Currency Change Calculator
          </h1>
          <p className="text-sm text-muted-foreground">Dual-Currency Cashier System · USD &amp; LBP</p>
        </div>
        <span className="tabular rounded-md border bg-card px-3 py-1.5 text-sm font-semibold text-foreground shadow-xs">
          {rateLabel}
        </span>
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
