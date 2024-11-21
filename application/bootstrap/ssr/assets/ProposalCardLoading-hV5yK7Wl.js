import { jsxs, jsx } from "react/jsx-runtime";
function ProposalCardLoading() {
  return /* @__PURE__ */ jsxs("section", { className: "proposals-wrapper", children: [
    /* @__PURE__ */ jsx("div", { className: "container overflow-auto py-8", children: /* @__PURE__ */ jsx("h2", { className: "title-2", children: "Proposals" }) }),
    /* @__PURE__ */ jsx("div", { className: "container mx-auto grid max-w-7xl grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3 2xl:max-w-full", children: [1, 2, 3].map((proposal, index) => /* @__PURE__ */ jsx(
      "div",
      {
        className: "min-h-96 w-full rounded-xl bg-background p-4 shadow-lg",
        children: /* @__PURE__ */ jsxs("div", { className: "h-full animate-pulse space-y-4", children: [
          /* @__PURE__ */ jsx("div", { className: "h-36 rounded-xl bg-slate-700" }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx("div", { className: "h-4 w-3/4 rounded bg-background-light" }),
            /* @__PURE__ */ jsx("div", { className: "h-4 rounded bg-background-light" }),
            /* @__PURE__ */ jsx("div", { className: "h-4 w-5/6 rounded bg-background-light" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
            /* @__PURE__ */ jsx("div", { className: "h-4 w-24 rounded bg-background-light" }),
            /* @__PURE__ */ jsxs("div", { className: "flex -space-x-2", children: [
              /* @__PURE__ */ jsx("div", { className: "h-8 w-8 rounded-full bg-background-light" }),
              /* @__PURE__ */ jsx("div", { className: "h-8 w-8 rounded-full bg-background-light" }),
              /* @__PURE__ */ jsx("div", { className: "h-8 w-8 rounded-full bg-background-light" })
            ] })
          ] })
        ] })
      },
      index
    )) })
  ] });
}
export {
  ProposalCardLoading as default
};
