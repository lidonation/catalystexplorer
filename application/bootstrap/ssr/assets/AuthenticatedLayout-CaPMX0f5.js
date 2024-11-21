import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { A as ApplicationLogo } from "./ApplicationLogo-CCCacK5I.js";
import { Transition } from "@headlessui/react";
import { Link, usePage } from "@inertiajs/react";
import { createContext, useState, useContext } from "react";
const DropDownContext = createContext({
  open: false,
  setOpen: () => {
  },
  toggleOpen: () => {
  }
});
const Dropdown = ({ children }) => {
  const [open, setOpen] = useState(false);
  const toggleOpen = () => {
    setOpen((previousState) => !previousState);
  };
  return /* @__PURE__ */ jsx(DropDownContext.Provider, { value: { open, setOpen, toggleOpen }, children: /* @__PURE__ */ jsx("div", { className: "relative", children }) });
};
const Trigger = ({ children }) => {
  const { open, setOpen, toggleOpen } = useContext(DropDownContext);
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("div", { onClick: toggleOpen, children }),
    open && /* @__PURE__ */ jsx(
      "div",
      {
        className: "fixed inset-0 z-40",
        onClick: () => setOpen(false)
      }
    )
  ] });
};
const Content = ({
  align = "right",
  width = "48",
  contentClasses = "py-1 bg-background",
  children
}) => {
  const { open, setOpen } = useContext(DropDownContext);
  let alignmentClasses = "origin-top";
  if (align === "left") {
    alignmentClasses = "ltr:origin-top-left rtl:origin-top-right start-0";
  } else if (align === "right") {
    alignmentClasses = "ltr:origin-top-right rtl:origin-top-left end-0";
  }
  let widthClasses = "";
  if (width === "48") {
    widthClasses = "w-48";
  }
  return /* @__PURE__ */ jsx(Fragment, { children: /* @__PURE__ */ jsx(
    Transition,
    {
      show: open,
      enter: "transition ease-out duration-200",
      enterFrom: "opacity-0 scale-95",
      enterTo: "opacity-100 scale-100",
      leave: "transition ease-in duration-75",
      leaveFrom: "opacity-100 scale-100",
      leaveTo: "opacity-0 scale-95",
      children: /* @__PURE__ */ jsx(
        "div",
        {
          className: `absolute z-50 mt-2 rounded-md shadow-lg ${alignmentClasses} ${widthClasses}`,
          onClick: () => setOpen(false),
          children: /* @__PURE__ */ jsx(
            "div",
            {
              className: `rounded-md ring-1 ring-black ring-opacity-5 ` + contentClasses,
              children
            }
          )
        }
      )
    }
  ) });
};
const DropdownLink = ({
  className = "",
  children,
  ...props
}) => {
  return /* @__PURE__ */ jsx(
    Link,
    {
      ...props,
      className: "block w-full px-4 py-2 text-start text-4 leading-5 text-content transition duration-150 ease-in-out hover:bg-background-lighter focus:bg-background-lighter focus:outline-none " + className,
      children
    }
  );
};
Dropdown.Trigger = Trigger;
Dropdown.Content = Content;
Dropdown.Link = DropdownLink;
function NavLink({
  active = false,
  className = "",
  children,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    Link,
    {
      ...props,
      className: "inline-flex items-center border-b-2 px-1 pt-1 text-4 font-medium leading-5 text-content transition duration-150 ease-in-out focus:outline-none " + (active ? "border-border focus:border-border-secondary" : "border-transparent hover:border-border-secondary hover:text-content focus:border-border-secondary focus:text-content-secondary") + className,
      children
    }
  );
}
function ResponsiveNavLink({
  active = false,
  className = "",
  children,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    Link,
    {
      ...props,
      className: `flex w-full items-start border-l-4 py-2 pe-4 ps-3 ${active ? "border-border bg-background-lighter text-content-accent focus:border-border-secondary focus:bg-background-lighter focus:text-content-accent" : "border-transparent text-dark hover:border-border-secondary hover:bg-border-primary hover:text-content focus:border-border-secondary focus:bg-background-lighter focus:text-content over:border-gray-600"} text-base font-medium transition duration-150 ease-in-out focus:outline-none ${className}`,
      children
    }
  );
}
function Authenticated({
  header,
  children
}) {
  var _a, _b;
  const user = (_b = (_a = usePage().props) == null ? void 0 : _a.auth) == null ? void 0 : _b.user;
  const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);
  return /* @__PURE__ */ jsxs("div", { className: "bg-gray-primary min-h-screen", children: [
    /* @__PURE__ */ jsxs("nav", { className: "border-b border-gray-100 bg-background", children: [
      /* @__PURE__ */ jsx("div", { className: "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8", children: /* @__PURE__ */ jsxs("div", { className: "flex h-16 justify-between", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex", children: [
          /* @__PURE__ */ jsx("div", { className: "flex shrink-0 items-center", children: /* @__PURE__ */ jsx(Link, { href: "/", children: /* @__PURE__ */ jsx(ApplicationLogo, { className: "block h-9 w-auto fill-current text-content" }) }) }),
          /* @__PURE__ */ jsx("div", { className: "hidden space-x-8 sm:-my-px sm:ms-10 sm:flex", children: /* @__PURE__ */ jsx(
            NavLink,
            {
              href: route("dashboard"),
              active: route().current("dashboard"),
              children: "Dashboard"
            }
          ) })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "hidden sm:ms-6 sm:flex sm:items-center", children: /* @__PURE__ */ jsx("div", { className: "relative ms-3", children: /* @__PURE__ */ jsxs(Dropdown, { children: [
          /* @__PURE__ */ jsx(Dropdown.Trigger, { children: /* @__PURE__ */ jsx("span", { className: "inline-flex rounded-md", children: /* @__PURE__ */ jsxs(
            "button",
            {
              type: "button",
              className: "false inline-flex items-center rounded-md border border-transparent secondary px-4 py-2 text-5 font-semibold uppercase tracking-widest text-content-secondary transition duration-150 ease-in-out hover:bg-background-lighter focus:bg-background-tertiary focus:outline-none  focus:ring-offset-2 active:bg-background-tertiary",
              children: [
                user == null ? void 0 : user.name,
                /* @__PURE__ */ jsx(
                  "svg",
                  {
                    className: "-me-0.5 ms-2 h-4 w-4",
                    xmlns: "http://www.w3.org/2000/svg",
                    viewBox: "0 0 20 20",
                    fill: "currentColor",
                    children: /* @__PURE__ */ jsx(
                      "path",
                      {
                        fillRule: "evenodd",
                        d: "M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z",
                        clipRule: "evenodd"
                      }
                    )
                  }
                )
              ]
            }
          ) }) }),
          /* @__PURE__ */ jsxs(Dropdown.Content, { children: [
            /* @__PURE__ */ jsx(
              Dropdown.Link,
              {
                href: route("profile.edit"),
                children: "Profile"
              }
            ),
            /* @__PURE__ */ jsx(
              Dropdown.Link,
              {
                href: route("logout"),
                method: "post",
                as: "button",
                children: "Log Out"
              }
            )
          ] })
        ] }) }) }),
        /* @__PURE__ */ jsx("div", { className: "-me-2 flex items-center sm:hidden", children: /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => setShowingNavigationDropdown(
              (previousState) => !previousState
            ),
            className: "inline-flex items-center justify-center rounded-md p-2 text-dark transition duration-150 ease-in-out hover:bg-background-lighter hover:text-content-secondary focus:bg-background-lighter focus:text-content-secondary focus:outline-none",
            children: /* @__PURE__ */ jsxs(
              "svg",
              {
                className: "h-6 w-6",
                stroke: "currentColor",
                fill: "none",
                viewBox: "0 0 24 24",
                children: [
                  /* @__PURE__ */ jsx(
                    "path",
                    {
                      className: !showingNavigationDropdown ? "inline-flex" : "hidden",
                      strokeLinecap: "round",
                      strokeLinejoin: "round",
                      strokeWidth: "2",
                      d: "M4 6h16M4 12h16M4 18h16"
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    "path",
                    {
                      className: showingNavigationDropdown ? "inline-flex" : "hidden",
                      strokeLinecap: "round",
                      strokeLinejoin: "round",
                      strokeWidth: "2",
                      d: "M6 18L18 6M6 6l12 12"
                    }
                  )
                ]
              }
            )
          }
        ) })
      ] }) }),
      /* @__PURE__ */ jsxs(
        "div",
        {
          className: (showingNavigationDropdown ? "block" : "hidden") + " sm:hidden",
          children: [
            /* @__PURE__ */ jsx("div", { className: "space-y-1 pb-3 pt-2", children: /* @__PURE__ */ jsx(
              ResponsiveNavLink,
              {
                href: route("dashboard"),
                active: route().current("dashboard"),
                children: "Dashboard"
              }
            ) }),
            /* @__PURE__ */ jsxs("div", { className: "border-t border-gray-200 pb-1 pt-4", children: [
              /* @__PURE__ */ jsxs("div", { className: "px-4", children: [
                /* @__PURE__ */ jsx("div", { className: "text-base font-medium text-gray-800", children: user == null ? void 0 : user.name }),
                /* @__PURE__ */ jsx("div", { className: "text-4 font-medium text-gray-500", children: user == null ? void 0 : user.email })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "mt-3 space-y-1", children: [
                /* @__PURE__ */ jsx(ResponsiveNavLink, { href: route("profile.edit"), children: "Profile" }),
                /* @__PURE__ */ jsx(
                  ResponsiveNavLink,
                  {
                    method: "post",
                    href: route("logout"),
                    as: "button",
                    children: "Log Out"
                  }
                )
              ] })
            ] })
          ]
        }
      )
    ] }),
    header && /* @__PURE__ */ jsx("header", { className: "bg-background shadow", children: /* @__PURE__ */ jsx("div", { className: "mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8", children: header }) }),
    /* @__PURE__ */ jsx("main", { children })
  ] });
}
export {
  Authenticated as A
};
