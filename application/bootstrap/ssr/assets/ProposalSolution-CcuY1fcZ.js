import { jsxs, jsx } from "react/jsx-runtime";
function truncateText(text, wordLimit) {
  if (!text) {
    return "";
  }
  const words = text.split(" ");
  if (words.length > wordLimit) {
    return words.slice(0, wordLimit).join(" ") + "...";
  }
  return text;
}
function ProposalSolution({
  solution = "",
  problem = "",
  slug
}) {
  const text = solution.length ? solution : problem;
  const wordLimit = 15;
  const truncatedSolution = truncateText(text, wordLimit);
  return /* @__PURE__ */ jsxs(
    "section",
    {
      className: "proposal-solution",
      "aria-labelledby": "solution-preview",
      children: [
        /* @__PURE__ */ jsxs("header", { className: "solution-header flex justify-between", children: [
          /* @__PURE__ */ jsx("h2", { id: "solution-heading", className: "font-medium text-content", children: "Solution" }),
          /* @__PURE__ */ jsx("nav", { "aria-label": "Go to proposal", children: /* @__PURE__ */ jsx(
            "a",
            {
              href: `proposals/${slug}`,
              target: "_blank",
              className: "text-primary hover:underline",
              children: "See more"
            }
          ) })
        ] }),
        /* @__PURE__ */ jsx("article", { className: "solution-content mt-4 text-content", children: /* @__PURE__ */ jsx("p", { children: truncatedSolution }) })
      ]
    }
  );
}
export {
  ProposalSolution as default
};
