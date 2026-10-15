import { createFileRoute } from "@tanstack/react-router";
import { CurrencyChangeCalculator } from "@/components/CurrencyChangeCalculator";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Currency Change Calculator" },
      { name: "description", content: "Cashier tool to calculate change in USD and Lebanese Pounds." },
      { property: "og:title", content: "Currency Change Calculator · USD & LBP" },
      { property: "og:description", content: "Cashier tool to calculate change in USD and Lebanese Pounds." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CurrencyChangeCalculator,
});
