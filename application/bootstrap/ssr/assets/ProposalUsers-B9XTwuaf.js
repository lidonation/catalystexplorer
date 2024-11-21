import { jsxs, jsx } from "react/jsx-runtime";
import { U as UserAvatar } from "../ssr.js";
import "i18next";
import "react-i18next";
import "react";
import "@inertiajs/react";
import "ziggy-js";
import "axios";
import "qs";
import "@headlessui/react";
import "@inertiajs/react/server";
import "react-dom/server";
function ProposalUsers({ users }) {
  const visibleUsers = users.slice(0, 5);
  const remainingCount = users.length - visibleUsers.length;
  return /* @__PURE__ */ jsxs(
    "section",
    {
      className: "flex justify-between border-t pt-3",
      "aria-labelledby": "team-heading",
      children: [
        /* @__PURE__ */ jsx("h3", { id: "team-heading", className: "mb-2 font-medium", children: "Team" }),
        /* @__PURE__ */ jsxs("ul", { className: "flex -space-x-2", children: [
          visibleUsers.map((user) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(
            UserAvatar,
            {
              size: "size-8",
              imageUrl: user.profile_photo_url
            }
          ) }, user.id)),
          remainingCount > 0 && /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx("div", { className: "flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-content-light text-sm text-gray-600", children: `+${remainingCount}` }) })
        ] })
      ]
    }
  );
}
export {
  ProposalUsers as default
};
