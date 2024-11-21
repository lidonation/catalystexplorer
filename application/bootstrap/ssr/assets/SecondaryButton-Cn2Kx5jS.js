import { jsx } from "react/jsx-runtime";
function SecondaryButton({
  type = "button",
  className = "",
  disabled,
  children,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    "button",
    {
      ...props,
      type,
      className: `inline-flex items-center rounded-md border border-border border-opacity-50 bg-background px-4 py-2 text-5 font-semibold uppercase tracking-widest text-content-secondary shadow-sm transition duration-150 ease-in-out hover:bg-background-tertiary hover:text-content-secondary focus:outline-none focus:ring-2 focus:border-border-secondary focus:ring-offset-2 disabled:opacity-25  ${disabled && "opacity-25"} ` + className,
      disabled,
      children
    }
  );
}
export {
  SecondaryButton as S
};
