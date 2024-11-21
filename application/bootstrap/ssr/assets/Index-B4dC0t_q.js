import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { Head, WhenVisible } from "@inertiajs/react";
import { useTranslation } from "react-i18next";
import ProposalCardLoading from "./ProposalCardLoading-hV5yK7Wl.js";
import ProposalResults from "./ProposalResults-yLMDQMmi.js";
import "./ProposalCard-B6WIhqMj.js";
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
function Index({ proposals }) {
  const { t } = useTranslation();
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Proposals" }),
    /* @__PURE__ */ jsxs("header", { children: [
      /* @__PURE__ */ jsx("div", { className: "container", children: /* @__PURE__ */ jsx("h1", { className: "title-1", children: t("proposals.proposals") }) }),
      /* @__PURE__ */ jsx("div", { className: "container", children: /* @__PURE__ */ jsx("p", { className: "text-content", children: t("proposals.pageSubtitle") }) })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "flex flex-col w-full items-center justify-center", children: /* @__PURE__ */ jsx(
      WhenVisible,
      {
        fallback: /* @__PURE__ */ jsx(ProposalCardLoading, {}),
        data: "proposals",
        children: /* @__PURE__ */ jsx("div", { className: "container py-8", children: /* @__PURE__ */ jsx(ProposalResults, { proposals }) })
      }
    ) })
  ] });
}
export {
  Index as default
};
