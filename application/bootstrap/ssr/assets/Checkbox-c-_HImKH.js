import { jsx } from "react/jsx-runtime";
function Checkbox({
  className = "",
  ...props
}) {
  return /* @__PURE__ */ jsx(
    "input",
    {
      ...props,
      type: "checkbox",
      className: "rounded border-border bg-background text-content-accent shadow-sm " + className
    }
  );
}
export {
  Checkbox as C
};
