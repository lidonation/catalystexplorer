import { jsx, jsxs } from "react/jsx-runtime";
function PostListLoader() {
  return /* @__PURE__ */ jsx("ul", { className: "content-gap scrollable snaps-scrollable", children: Array.from({ length: 4 }).map((_, index) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs("article", { className: "flex w-full flex-col gap-4", children: [
    /* @__PURE__ */ jsx("div", { className: "aspect-video h-auto w-full animate-pulse rounded-lg bg-gray-300" }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center", children: [
      /* @__PURE__ */ jsx("div", { className: "h-4 w-1/4 animate-pulse rounded-lg bg-gray-300" }),
      /* @__PURE__ */ jsx("div", { className: "ml-2 mr-2 h-1.5 w-1.5 rounded-full bg-gray-300" }),
      /* @__PURE__ */ jsx("div", { className: "h-4 w-1/5 animate-pulse rounded-lg bg-gray-300" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mb-4 flex flex-col gap-4", children: [
      /* @__PURE__ */ jsx("div", { className: "h-6 w-full animate-pulse rounded-lg bg-gray-300" }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-2", children: [
        /* @__PURE__ */ jsx("div", { className: "h-4 w-full animate-pulse rounded-lg bg-gray-300" }),
        /* @__PURE__ */ jsx("div", { className: "h-4 w-3/4 animate-pulse rounded-lg bg-gray-300" })
      ] })
    ] })
  ] }) }, index)) });
}
export {
  PostListLoader as default
};
