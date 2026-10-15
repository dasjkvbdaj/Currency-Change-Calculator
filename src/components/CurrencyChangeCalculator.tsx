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
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3 border-b pb-4">
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

          <button
            type="button"
            onClick={clear}
            className="calc-btn-base hidden h-11 w-full rounded-md border bg-card font-medium hover:bg-muted lg:block"
          >
            Clear Calculator
          </button>
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

          <button
            type="button"
            onClick={clear}
            className="calc-btn-base h-11 w-full rounded-md border bg-card font-medium hover:bg-muted lg:hidden"
          >
            Clear Calculator
          </button>
        </div>
      </div>
    </div>
  );
};
