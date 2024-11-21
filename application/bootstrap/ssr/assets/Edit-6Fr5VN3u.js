import { jsxs, jsx } from "react/jsx-runtime";
import { A as Authenticated } from "./AuthenticatedLayout-CaPMX0f5.js";
import { Head } from "@inertiajs/react";
import DeleteUserForm from "./DeleteUserForm-CWYMo3f5.js";
import UpdatePasswordForm from "./UpdatePasswordForm-CE_xCnGy.js";
import UpdateProfileInformation from "./UpdateProfileInformationForm-B2hIPBae.js";
import "./ApplicationLogo-CCCacK5I.js";
import "react-i18next";
import "@headlessui/react";
import "react";
import "../ssr.js";
import "i18next";
import "ziggy-js";
import "axios";
import "qs";
import "@inertiajs/react/server";
import "react-dom/server";
import "./SecondaryButton-Cn2Kx5jS.js";
function Edit({
  mustVerifyEmail,
  status
}) {
  return /* @__PURE__ */ jsxs(
    Authenticated,
    {
      header: /* @__PURE__ */ jsx("h2", { className: "text-1 font-semibold leading-tight text-content", children: "Profile" }),
      children: [
        /* @__PURE__ */ jsx(Head, { title: "Profile" }),
        /* @__PURE__ */ jsx("div", { className: "py-12", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8", children: [
          /* @__PURE__ */ jsx("div", { className: "bg-background p-4 shadow sm:rounded-lg sm:p-8", children: /* @__PURE__ */ jsx(
            UpdateProfileInformation,
            {
              mustVerifyEmail,
              status,
              className: "max-w-xl"
            }
          ) }),
          /* @__PURE__ */ jsx("div", { className: "bg-background p-4 shadow sm:rounded-lg sm:p-8", children: /* @__PURE__ */ jsx(UpdatePasswordForm, { className: "max-w-xl" }) }),
          /* @__PURE__ */ jsx("div", { className: "bg-background p-4 shadow sm:rounded-lg sm:p-8", children: /* @__PURE__ */ jsx(DeleteUserForm, { className: "max-w-xl" }) })
        ] }) })
      ]
    }
  );
}
export {
  Edit as default
};
