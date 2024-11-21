import { jsxs, jsx } from "react/jsx-runtime";
import { A as Authenticated } from "./AuthenticatedLayout-CaPMX0f5.js";
import { Head } from "@inertiajs/react";
import "./ApplicationLogo-CCCacK5I.js";
import "react-i18next";
import "@headlessui/react";
import "react";
function Dashboard() {
  return /* @__PURE__ */ jsxs(
    Authenticated,
    {
      header: /* @__PURE__ */ jsx("h2", { className: "text-1 font-semibold leading-tight text-content", children: "Dashboard" }),
      children: [
        /* @__PURE__ */ jsx(Head, { title: "Dashboard" }),
        /* @__PURE__ */ jsx("div", { className: "py-12", children: /* @__PURE__ */ jsx("div", { className: "mx-auto max-w-7xl sm:px-6 lg:px-8", children: /* @__PURE__ */ jsx("div", { className: "overflow-hidden bg-background shadow-sm sm:rounded-lg", children: /* @__PURE__ */ jsx("div", { className: "p-6 text-content", children: "You're logged in!" }) }) }) })
      ]
    }
  );
}
export {
  Dashboard as default
};
