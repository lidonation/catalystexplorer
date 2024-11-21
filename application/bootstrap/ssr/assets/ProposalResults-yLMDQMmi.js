import { jsx } from "react/jsx-runtime";
import ProposalCard from "./ProposalCard-B6WIhqMj.js";
import "@inertiajs/react";
import { useTranslation } from "react-i18next";
import "./ProposalFundingPercentages-CxBTpmbB.js";
import "react";
import "./ProposalBookmark-BLtuiLfr.js";
import "./ProposalFundingStatus-He_dc8kf.js";
import "./ProposalQuickpitch-Cz23jxgj.js";
import "plyr-react";
import "./ProposalSolution-CcuY1fcZ.js";
import "./ProposalStatus-DS8PUNFf.js";
import "./ProposalUsers-B9XTwuaf.js";
import "../ssr.js";
import "i18next";
import "ziggy-js";
import "axios";
import "qs";
import "@headlessui/react";
import "@inertiajs/react/server";
import "react-dom/server";
const ProposalResults = ({ proposals }) => {
  useTranslation();
  return /* @__PURE__ */ jsx("section", { className: "proposals-wrapper", children: /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3 2xl:max-w-full", children: proposals && proposals.map((proposal) => /* @__PURE__ */ jsx(
    ProposalCard,
    {
      proposal
    },
    proposal.id
  )) }) });
};
export {
  ProposalResults as default
};
