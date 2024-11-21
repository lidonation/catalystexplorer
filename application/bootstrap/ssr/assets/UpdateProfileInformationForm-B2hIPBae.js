import { jsxs, jsx } from "react/jsx-runtime";
import { I as InputLabel, T as TextInput, a as InputError, P as PrimaryButton } from "../ssr.js";
import { Transition } from "@headlessui/react";
import { usePage, useForm, Link } from "@inertiajs/react";
import "i18next";
import "react-i18next";
import "react";
import "ziggy-js";
import "axios";
import "qs";
import "@inertiajs/react/server";
import "react-dom/server";
function UpdateProfileInformation({
  mustVerifyEmail,
  status,
  className = ""
}) {
  var _a, _b;
  const user = (_b = (_a = usePage().props) == null ? void 0 : _a.auth) == null ? void 0 : _b.user;
  const { data, setData, patch, errors, processing, recentlySuccessful } = useForm({
    name: user == null ? void 0 : user.name,
    email: user == null ? void 0 : user.email
  });
  const submit = (e) => {
    e.preventDefault();
    patch(route("profile.update"));
  };
  return /* @__PURE__ */ jsxs("section", { className, children: [
    /* @__PURE__ */ jsxs("header", { children: [
      /* @__PURE__ */ jsx("h2", { className: "text-2 font-medium text-content", children: "Profile Information" }),
      /* @__PURE__ */ jsx("p", { className: "mt-1 text-4 text-content", children: "Update your account's profile information and email address." })
    ] }),
    /* @__PURE__ */ jsxs("form", { onSubmit: submit, className: "mt-6 space-y-6", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(InputLabel, { htmlFor: "name", value: "Name" }),
        /* @__PURE__ */ jsx(
          TextInput,
          {
            id: "name",
            className: "mt-1 block w-full",
            value: data.name,
            onChange: (e) => setData("name", e.target.value),
            required: true,
            isFocused: true,
            autoComplete: "name"
          }
        ),
        /* @__PURE__ */ jsx(InputError, { className: "mt-2", message: errors.name })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(InputLabel, { htmlFor: "email", value: "Email" }),
        /* @__PURE__ */ jsx(
          TextInput,
          {
            id: "email",
            type: "email",
            className: "mt-1 block w-full",
            value: data.email,
            onChange: (e) => setData("email", e.target.value),
            required: true,
            autoComplete: "username"
          }
        ),
        /* @__PURE__ */ jsx(InputError, { className: "mt-2", message: errors.email })
      ] }),
      mustVerifyEmail && (user == null ? void 0 : user.email_verified_at) === null && /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("p", { className: "mt-2 text-4 text-content", children: [
          "Your email address is unverified.",
          /* @__PURE__ */ jsx(
            Link,
            {
              href: route("verification.send"),
              method: "post",
              as: "button",
              className: "rounded-md text-4 text-content underline hover:text-content-secondary focus:outline-none focus:ring-2 focus:border-border-secondary focus:ring-offset-2",
              children: "Click here to re-send the verification email."
            }
          )
        ] }),
        status === "verification-link-sent" && /* @__PURE__ */ jsx("div", { className: "mt-2 text-4 font-medium text-content-success", children: "A new verification link has been sent to your email address." })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
        /* @__PURE__ */ jsx(PrimaryButton, { disabled: processing, children: "Save" }),
        /* @__PURE__ */ jsx(
          Transition,
          {
            show: recentlySuccessful,
            enter: "transition ease-in-out",
            enterFrom: "opacity-0",
            leave: "transition ease-in-out",
            leaveTo: "opacity-0",
            children: /* @__PURE__ */ jsx("p", { className: "text-4 text-dark", children: "Saved." })
          }
        )
      ] })
    ] })
  ] });
}
export {
  UpdateProfileInformation as default
};
