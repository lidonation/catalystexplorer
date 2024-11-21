import { jsxs, jsx } from "react/jsx-runtime";
function shortNumber(value, digits = 0, locale = "en-US") {
  return Math.abs(Number(value)) >= 1e9 ? (Math.abs(Number(value)) / 1e9).toFixed(digits) + "B" : Math.abs(Number(value)) >= 1e6 ? (Math.abs(Number(value)) / 1e6).toFixed(digits) + "M" : Math.abs(Number(value)) >= 1e3 ? (Math.abs(Number(value)) / 1e3).toFixed(digits) + "K" : Math.abs(Number(value));
}
function currency(value, currency2 = "USD", locale = "en-US", maximumFractionDigits = 0) {
  if (typeof value !== "number") {
    return value;
  }
  switch (currency2) {
    case "ADA":
      return shortNumber(value, maximumFractionDigits, locale) + " ₳";
    default:
      const formatter = new Intl.NumberFormat(locale, {
        style: "currency",
        notation: "compact",
        currency: currency2,
        maximumFractionDigits
      });
      return formatter.format(value);
  }
}
function ProposalFundingPercentages({ proposal }) {
  var _a, _b;
  const calculatePercentage = (numerator, denominator) => denominator > 0 ? Math.ceil(numerator / denominator * 100) : 0;
  const formatCurrency = (amount, currencyCode2) => currency(
    amount ? parseInt(amount.toString()) : 0,
    currencyCode2 || "USD"
  );
  const getProgressBarColor = (percentage) => {
    if (percentage >= 80) return "bg-success";
    if (percentage >= 50) return "bg-accent-secondary";
    return "bg-primary";
  };
  const amountRequested = proposal.amount_requested ? proposal.amount_requested : 0;
  const amountReceived = proposal.amount_received ? proposal.amount_received : 0;
  const campaignAmount = ((_a = proposal.campaign) == null ? void 0 : _a.amount) ? proposal.campaign.amount : 0;
  const currencyCode = proposal.currency || "USD";
  const campaignCurrency = ((_b = proposal.campaign) == null ? void 0 : _b.currency) || "USD";
  const formattedAmountRequested = formatCurrency(
    amountRequested,
    currencyCode
  );
  const formattedCampaignBudget = formatCurrency(
    campaignAmount,
    campaignCurrency
  );
  const campaignPercentage = calculatePercentage(
    amountRequested,
    campaignAmount
  );
  const fundingPercentage = calculatePercentage(
    amountReceived,
    amountRequested
  );
  const progressBarColor = getProgressBarColor(fundingPercentage);
  return /* @__PURE__ */ jsxs("div", { className: "mt-4", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-baseline justify-between gap-2", children: [
      /* @__PURE__ */ jsx("span", { children: "Received" }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("span", { className: "text-lg font-semibold", children: formattedAmountRequested }),
        /* @__PURE__ */ jsx("span", { className: "text-sm text-highlight", children: `/ ${formattedCampaignBudget} (${campaignPercentage}%)` })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "mt-2 h-3 w-full overflow-hidden rounded-full bg-content-light", children: /* @__PURE__ */ jsx(
      "div",
      {
        className: `h-full rounded-full ${progressBarColor}`,
        role: "progressbar",
        "aria-valuenow": fundingPercentage,
        "aria-valuemin": 0,
        "aria-valuemax": 100,
        style: { width: `${fundingPercentage}%` }
      }
    ) })
  ] });
}
const ProposalFundingPercentages$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: ProposalFundingPercentages
}, Symbol.toStringTag, { value: "Module" }));
export {
  ProposalFundingPercentages as P,
  ProposalFundingPercentages$1 as a,
  shortNumber as s
};
