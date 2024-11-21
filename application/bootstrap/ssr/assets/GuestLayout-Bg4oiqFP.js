import { jsxs, jsx } from "react/jsx-runtime";
import { A as ApplicationLogo } from "./ApplicationLogo-CCCacK5I.js";
import { Link } from "@inertiajs/react";
function Guest({ children }) {
  return /* @__PURE__ */ jsxs("div", { className: "flex min-h-screen flex-col items-center bg-background-lighter pt-6 sm:justify-center sm:pt-0", children: [
    /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx(Link, { href: "/", children: /* @__PURE__ */ jsx(ApplicationLogo, { className: "h-20 w-20 fill-current text-content" }) }) }),
    /* @__PURE__ */ jsx("div", { className: "mt-6 w-full overflow-hidden bg-background px-6 py-4 shadow-md sm:max-w-md sm:rounded-lg", children })
  ] });
}
export {
  Guest as G
};
