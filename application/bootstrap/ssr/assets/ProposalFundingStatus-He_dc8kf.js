import { jsx } from "react/jsx-runtime";
function ProposalFundingStatus({ funding_status = "pending" }) {
  let bgColor = "";
  let textColor = "";
  let status = "";
  if (funding_status === "pending") {
    bgColor = "";
    textColor = "";
    status = "Pending";
  } else if (funding_status === "complete") {
    bgColor = "bg-success-light";
    textColor = "text-success";
    status = "Fully Paid";
  } else if (funding_status === "funded") {
    bgColor = "bg-eye-logo";
    textColor = "text-primary";
    status = "Funded";
  }
  if (funding_status === "not_approved" || funding_status === "leftover") {
    bgColor = "";
    textColor = "";
    status = "Not Funded";
  }
  return /* @__PURE__ */ jsx(
    "span",
    {
      className: `rounded-md border px-1 py-1 text-xs ${textColor} ${bgColor}`,
      children: status
    }
  );
}
export {
  ProposalFundingStatus as default
};
