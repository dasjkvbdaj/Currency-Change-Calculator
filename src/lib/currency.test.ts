import { describe, expect, it } from "vitest";
import { calculate, distribute, parseLbp, parseRate, parseUsd, type Currency } from "./currency";

const run = (rate: string, inv: string, paid: string, cur: Currency) =>
  calculate({
    rate: parseRate(rate),
    invoice: parseLbp(inv, "neg"),
    paid: cur === "USD" ? parseUsd(paid, "neg") : parseLbp(paid, "neg"),
    currency: cur,
  });

describe("change calculator", () => {
  it("sample: 90000 rate, 1.5M invoice, 50 USD, 20 USD back -> 1,200,000 LBP", () => {
    const o = run("90000", "1500000", "50", "USD");
    if (o.status !== "over") throw new Error(o.status);
    expect(o.changeLbp).toBe(3000000n);
    const d = distribute(o.diffNum, o.den, { num: 90000n, scale: 0 }, 2000n);
    expect(d.ok).toBe(true);
    expect(d.lbpReturn).toBe(1200000n);
    expect(d.residualNum).toBe(0n);
  });
  it("exact LBP payment", () => expect(run("90000", "500000", "500000", "LBP").status).toBe("exact"));
  it("underpayment 20 USD on 2.5M", () => {
    const o = run("90000", "2500000", "20", "USD");
    expect(o.status).toBe("under");
    if (o.status === "under") {
      expect(o.changeLbp).toBe(700000n);
      expect(o.usdEquivCents).toBe(778n);
    }
  });
  it("rejects USD return above change", () => {
    const o = run("90000", "1500000", "50", "USD");
    if (o.status !== "over") throw new Error();
    expect(o.maxUsdCents).toBe(3333n);
    expect(distribute(o.diffNum, o.den, { num: 90000n, scale: 0 }, 3334n).ok).toBe(false);
  });
  it("all-USD max leaves 30 LBP remainder", () => {
    const o = run("90000", "1500000", "50", "USD");
    if (o.status !== "over") throw new Error();
    expect(distribute(o.diffNum, o.den, { num: 90000n, scale: 0 }, 3333n).lbpReturn).toBe(300n);
  });
  it("fractional rate produces explicit residual", () => {
    const o = run("89500.5", "0", "1", "USD");
    if (o.status !== "over") throw new Error();
    const d = distribute(o.diffNum, o.den, { num: 895005n, scale: 1 }, 0n);
    expect(d.lbpReturn).toBe(89501n); // 89500.5 rounds half up
    expect(d.residualNum).not.toBe(0n);
  });
  it("validation", () => {
    expect(parseRate("0").kind).toBe("error");
    expect(parseRate("-5").kind).toBe("error");
    expect(parseUsd("1.234", "n").kind).toBe("error");
    expect(parseLbp("abc", "n").kind).toBe("error");
    expect(run("0", "1", "1", "LBP").status).toBe("invalid");
    expect(run("90000", "", "1", "LBP").status).toBe("incomplete");
  });
  it("zero invoice and zero payment", () => {
    expect(run("90000", "0", "0", "LBP").status).toBe("exact");
    expect(run("90000", "100", "0", "USD").status).toBe("under");
  });
  it("very large numbers stay exact", () => {
    const o = run("89500", "1500000000", "20000", "USD");
    if (o.status !== "over") throw new Error();
    expect(o.changeLbp).toBe(290000000n);
  });

  describe("payment options and invoice currencies", () => {
    it("handles invoice in USD with LBP payment", () => {
      // Invoice: $10.00 at 89,000 = 890,000 LBP. Paid: 1,000,000 LBP. Change: 110,000 LBP
      const o = calculate({
        rate: parseRate("89000"),
        invoice: parseUsd("10.00", "neg"),
        invoiceCurrency: "USD",
        paymentMode: "LBP",
        paidLbp: parseLbp("1000000", "neg"),
      });
      expect(o.status).toBe("over");
      if (o.status === "over") {
        expect(o.changeLbp).toBe(110000n);
        expect(o.invoiceLbp).toBe(890000n);
      }
    });

    it("handles invoice in USD with USD payment", () => {
      // Invoice: $25.50 at 90,000. Paid: $50.00. Change: $24.50 = 2,205,000 LBP
      const o = calculate({
        rate: parseRate("90000"),
        invoice: parseUsd("25.50", "neg"),
        invoiceCurrency: "USD",
        paymentMode: "USD",
        paidUsd: parseUsd("50.00", "neg"),
      });
      expect(o.status).toBe("over");
      if (o.status === "over") {
        expect(o.changeLbp).toBe(2205000n);
        expect(o.usdEquivCents).toBe(2450n);
      }
    });

    it("handles payment in both currencies (mixed USD + LBP)", () => {
      // Invoice: 1,500,000 LBP at 90,000. Customer gives $10.00 (= 900,000 LBP) + 700,000 LBP
      // Total paid = 1,600,000 LBP -> Change: 100,000 LBP
      const o = calculate({
        rate: parseRate("90000"),
        invoice: parseLbp("1500000", "neg"),
        invoiceCurrency: "LBP",
        paymentMode: "MIXED",
        paidUsd: parseUsd("10.00", "neg"),
        paidLbp: parseLbp("700000", "neg"),
      });
      expect(o.status).toBe("over");
      if (o.status === "over") {
        expect(o.changeLbp).toBe(100000n);
        expect(o.paidUsdCents).toBe(1000n);
        expect(o.paidLbpCash).toBe(700000n);
      }
    });

    it("handles underpayment with mixed currencies", () => {
      // Invoice: 1,000,000 LBP at 90,000. Customer gives $5.00 (= 450,000 LBP) + 200,000 LBP = 650,000 LBP
      // Remaining: 350,000 LBP
      const o = calculate({
        rate: parseRate("90000"),
        invoice: parseLbp("1000000", "neg"),
        invoiceCurrency: "LBP",
        paymentMode: "MIXED",
        paidUsd: parseUsd("5.00", "neg"),
        paidLbp: parseLbp("200000", "neg"),
      });
      expect(o.status).toBe("under");
      if (o.status === "under") {
        expect(o.changeLbp).toBe(350000n);
      }
    });
  });
});
