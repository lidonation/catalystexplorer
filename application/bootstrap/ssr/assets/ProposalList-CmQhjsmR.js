import { jsxs, jsx } from "react/jsx-runtime";
import ProposalCard from "./ProposalCard-B6WIhqMj.js";
import { S as SecondaryButton } from "./SecondaryButton-Cn2Kx5jS.js";
import { router } from "@inertiajs/react";
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
const ProposalList = ({ proposals }) => {
  const { t } = useTranslation();
  function navigate() {
    router.get("/proposals");
  }
  return /* @__PURE__ */ jsxs("section", { className: "proposals-wrapper", children: [
    /* @__PURE__ */ jsxs("div", { className: "container py-8 flex justify-between items-center", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h2", { className: "title-2", children: t("proposals.proposals") }),
        /* @__PURE__ */ jsx("p", { className: "text-4 text-content-dark opacity-70", children: t("proposals.listSubtitle") })
      ] }),
      /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx(SecondaryButton, { className: "font-bold text-content-dark", onClick: navigate, children: t("proposals.seeMoreProposals") }) })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "container mx-auto grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3 2xl:max-w-full", children: proposals && proposals.map((proposal) => /* @__PURE__ */ jsx(
      ProposalCard,
      {
        proposal
      },
      proposal.id
    )) })
  ] });
};
export {
  ProposalList as default
};
