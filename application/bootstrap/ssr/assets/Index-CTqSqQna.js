import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { Head } from "@inertiajs/react";
const Index = () => {
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Funds" }),
    /* @__PURE__ */ jsxs("header", { children: [
      /* @__PURE__ */ jsx("div", { className: "container", children: /* @__PURE__ */ jsx("h1", { className: "title-1", children: "Funds" }) }),
      /* @__PURE__ */ jsx("div", { className: "container", children: /* @__PURE__ */ jsx("p", { className: "text-content", children: "Search proposals and challenges by title, content, or author and co-authors" }) })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "flex flex-col h-screen w-full items-center justify-center", children: /* @__PURE__ */ jsx("h1", { children: "Coming Soon" }) })
  ] });
};
export {
  Index as default
};
