import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { Head } from "@inertiajs/react";
const SearchResults = () => {
  const search = window.location.search;
  const params = new URLSearchParams(search);
  const query = params.get("q");
  const filters = params.get("f");
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Search Results" }),
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col h-screen w-full items-center justify-center", children: [
      /* @__PURE__ */ jsx("h1", { children: "Search Results" }),
      /* @__PURE__ */ jsxs("p", { children: [
        "Query: ",
        query
      ] }),
      /* @__PURE__ */ jsxs("p", { children: [
        "Filters: ",
        filters
      ] })
    ] })
  ] });
};
export {
  SearchResults as default
};
