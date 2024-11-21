import { jsxs, jsx } from "react/jsx-runtime";
import { I as InputLabel, T as TextInput, a as InputError, P as PrimaryButton } from "../ssr.js";
import { G as Guest } from "./GuestLayout-Bg4oiqFP.js";
import { useForm, Head, Link } from "@inertiajs/react";
import "i18next";
import "react-i18next";
import "react";
import "ziggy-js";
import "axios";
import "qs";
import "@headlessui/react";
import "@inertiajs/react/server";
import "react-dom/server";
import "./ApplicationLogo-CCCacK5I.js";
function Register() {
  const { data, setData, post, processing, errors, reset } = useForm({
    name: "",
    email: "",
    password: "",
    password_confirmation: ""
  });
  const submit = (e) => {
    e.preventDefault();
    post(route("register"), {
      onFinish: () => reset("password", "password_confirmation")
    });
  };
  return /* @__PURE__ */ jsxs(Guest, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Register" }),
    /* @__PURE__ */ jsxs("form", { onSubmit: submit, children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(InputLabel, { htmlFor: "name", value: "Name" }),
        /* @__PURE__ */ jsx(
          TextInput,
          {
            id: "name",
            name: "name",
            value: data.name,
            className: "mt-1 block w-full",
            autoComplete: "name",
            isFocused: true,
            onChange: (e) => setData("name", e.target.value),
            required: true
          }
        ),
        /* @__PURE__ */ jsx(InputError, { message: errors.name, className: "mt-2" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mt-4", children: [
        /* @__PURE__ */ jsx(InputLabel, { htmlFor: "email", value: "Email" }),
        /* @__PURE__ */ jsx(
          TextInput,
          {
            id: "email",
            type: "email",
            name: "email",
            value: data.email,
            className: "mt-1 block w-full",
            autoComplete: "username",
            onChange: (e) => setData("email", e.target.value),
            required: true
          }
        ),
        /* @__PURE__ */ jsx(InputError, { message: errors.email, className: "mt-2" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mt-4", children: [
        /* @__PURE__ */ jsx(InputLabel, { htmlFor: "password", value: "Password" }),
        /* @__PURE__ */ jsx(
          TextInput,
          {
            id: "password",
            type: "password",
            name: "password",
            value: data.password,
            className: "mt-1 block w-full",
            autoComplete: "new-password",
            onChange: (e) => setData("password", e.target.value),
            required: true
          }
        ),
        /* @__PURE__ */ jsx(InputError, { message: errors.password, className: "mt-2" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mt-4", children: [
        /* @__PURE__ */ jsx(
          InputLabel,
          {
            htmlFor: "password_confirmation",
            value: "Confirm Password"
          }
        ),
        /* @__PURE__ */ jsx(
          TextInput,
          {
            id: "password_confirmation",
            type: "password",
            name: "password_confirmation",
            value: data.password_confirmation,
            className: "mt-1 block w-full",
            autoComplete: "new-password",
            onChange: (e) => setData("password_confirmation", e.target.value),
            required: true
          }
        ),
        /* @__PURE__ */ jsx(
          InputError,
          {
            message: errors.password_confirmation,
            className: "mt-2"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mt-4 flex items-center justify-end", children: [
        /* @__PURE__ */ jsx(
          Link,
          {
            href: route("login"),
            className: "rounded-md text-4 text-dark underline hover:text-content focus:outline-none focus:ring-2 focus:ring-offset-2",
            children: "Already registered?"
          }
        ),
        /* @__PURE__ */ jsx(PrimaryButton, { className: "ms-4", disabled: processing, children: "Register" })
      ] })
    ] })
  ] });
}
export {
  Register as default
};
