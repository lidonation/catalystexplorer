import { jsxs, jsx } from "react/jsx-runtime";
import { s as shortNumber, P as ProposalFundingPercentages } from "./ProposalFundingPercentages-CxBTpmbB.js";
import { useState } from "react";
import ProposalBookmark from "./ProposalBookmark-BLtuiLfr.js";
import ProposalFundingStatus from "./ProposalFundingStatus-He_dc8kf.js";
import ProposalQuickpitch from "./ProposalQuickpitch-Cz23jxgj.js";
import ProposalSolution from "./ProposalSolution-CcuY1fcZ.js";
import ProposalStatus from "./ProposalStatus-DS8PUNFf.js";
import ProposalUsers from "./ProposalUsers-B9XTwuaf.js";
import "plyr-react";
import "react-i18next";
import "../ssr.js";
import "i18next";
import "@inertiajs/react";
import "ziggy-js";
import "axios";
import "qs";
import "@headlessui/react";
import "@inertiajs/react/server";
import "react-dom/server";
function ProposalCard({ proposal }) {
  const gradientColors = {
    complete: "from-[var(--success-gradient-color-1)] to-[var(--success-gradient-color-2)]",
    default: "from-[var(--cx-background-gradient-1-dark)] to-[var(--cx-background-gradient-2-dark)]"
  };
  const headerBGColor = gradientColors[proposal.status] || gradientColors.default;
  const abstainVotes = shortNumber(proposal == null ? void 0 : proposal.abstain_votes_count) ?? "(N/A)";
  const yesVotes = shortNumber(proposal == null ? void 0 : proposal.yes_votes_count) ?? "(N/A)";
  const [quickPitchView, setQuickPitchView] = useState(false);
  const hasQuickPitch = Boolean(proposal.quickpitch);
  const handleQuickPitchClick = () => {
    if (hasQuickPitch) {
      setQuickPitchView(true);
    }
  };
  return /* @__PURE__ */ jsxs("article", { className: "h-full rounded-xl bg-background p-2 shadow-lg", children: [
    /* @__PURE__ */ jsxs(
      "header",
      {
        className: `mb-2 min-h-40 rounded-xl bg-gradient-to-tr text-content-light ${headerBGColor}`,
        children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between p-4", children: [
            /* @__PURE__ */ jsx(ProposalStatus, { status: proposal.status }),
            /* @__PURE__ */ jsx(ProposalBookmark, {})
          ] }),
          /* @__PURE__ */ jsx("div", { className: "mb-4 p-2 px-4", children: /* @__PURE__ */ jsx(
            "a",
            {
              href: "#",
              className: "text-2 font-medium leading-tight hover:text-primary",
              children: proposal.title
            }
          ) }),
          (proposal.ideascale_link || proposal.projectcatalyst_io_link) && /* @__PURE__ */ jsxs(
            "nav",
            {
              className: "flex items-center justify-evenly rounded-b-xl bg-white bg-opacity-10 p-2 font-semibold text-content-light",
              "aria-label": "Related Platforms",
              children: [
                proposal.ideascale_link && /* @__PURE__ */ jsx(
                  "a",
                  {
                    href: proposal.ideascale_link,
                    className: "text-4 flex w-full items-center justify-center text-opacity-100",
                    target: "_blank",
                    rel: "noopener noreferrer",
                    children: /* @__PURE__ */ jsx("span", { children: "Ideascale" })
                  }
                ),
                proposal.ideascale_link && proposal.projectcatalyst_io_link && /* @__PURE__ */ jsx("div", { className: "mx-2 h-3 border-r" }),
                proposal.projectcatalyst_io_link && /* @__PURE__ */ jsx(
                  "a",
                  {
                    href: proposal.projectcatalyst_io_link,
                    className: "text-4 flex w-full items-center justify-center text-opacity-100",
                    target: "_blank",
                    rel: "noopener noreferrer",
                    children: /* @__PURE__ */ jsx("span", { children: "Projectcatalyst.io" })
                  }
                )
              ]
            }
          )
        ]
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "p-2", children: [
      /* @__PURE__ */ jsx(
        "nav",
        {
          className: "border-b",
          "aria-label": "Project details navigation",
          children: /* @__PURE__ */ jsxs("ul", { className: "flex justify-between", children: [
            /* @__PURE__ */ jsx("li", { className: "w-1/2", children: /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => setQuickPitchView(false),
                className: `w-full border-b-2 pb-3 font-semibold ${!quickPitchView ? "border-primary text-primary" : "border-transparent text-content"}`,
                "aria-current": !quickPitchView ? "page" : void 0,
                children: "Details"
              }
            ) }),
            /* @__PURE__ */ jsx("li", { className: "flex w-1/2 items-center justify-center", children: /* @__PURE__ */ jsxs(
              "button",
              {
                type: "button",
                onClick: handleQuickPitchClick,
                disabled: !hasQuickPitch,
                className: `flex items-center gap-1 pb-3 font-semibold ${quickPitchView ? "border-b-2 border-primary text-primary" : "border-transparent"} ${!hasQuickPitch ? "cursor-not-allowed opacity-60" : "text-content hover:text-primary"}`,
                "aria-current": quickPitchView ? "page" : void 0,
                children: [
                  /* @__PURE__ */ jsx("span", { children: "Quick Pitch" }),
                  !hasQuickPitch && /* @__PURE__ */ jsx("span", { className: "text-dark-persist rounded-full bg-content-light px-2 py-1 text-xs", children: "Not set" })
                ]
              }
            ) })
          ] })
        }
      ),
      /* @__PURE__ */ jsxs("section", { className: "mt-6", "aria-labelledby": "funding-heading", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx("h3", { className: "font-semibold", children: "Funding" }),
          /* @__PURE__ */ jsx(
            ProposalFundingStatus,
            {
              funding_status: proposal.funding_status
            }
          )
        ] }),
        /* @__PURE__ */ jsx(ProposalFundingPercentages, { proposal })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "my-4 border-b" }),
      /* @__PURE__ */ jsx("div", { className: "relative mb-4 min-h-40", children: quickPitchView ? /* @__PURE__ */ jsx(ProposalQuickpitch, { quickpitch: proposal.quickpitch }) : /* @__PURE__ */ jsx(
        ProposalSolution,
        {
          solution: proposal.solution,
          slug: proposal.slug
        }
      ) }),
      proposal.users && /* @__PURE__ */ jsx(ProposalUsers, { users: proposal.users }),
      /* @__PURE__ */ jsx("div", { className: "my-4 border-b" }),
      /* @__PURE__ */ jsxs("footer", { className: "mt-4 flex items-center justify-between rounded-lg border border-t", children: [
        /* @__PURE__ */ jsxs("button", { className: "text-4 flex w-1/2 items-center justify-center border-r p-2", children: [
          /* @__PURE__ */ jsx(
            "svg",
            {
              xmlns: "http://www.w3.org/2000/svg",
              fill: "none",
              viewBox: "0 0 24 24",
              strokeWidth: 1.5,
              stroke: "currentColor",
              className: "size-6 font-medium text-success",
              children: /* @__PURE__ */ jsx(
                "path",
                {
                  strokeLinecap: "round",
                  strokeLinejoin: "round",
                  d: "M6.633 10.25c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75a.75.75 0 0 1 .75-.75 2.25 2.25 0 0 1 2.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282m0 0h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23H5.904m10.598-9.75H14.25M5.904 18.5c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 0 1-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 9.953 4.167 9.5 5 9.5h1.053c.472 0 .745.556.5.96a8.958 8.958 0 0 0-1.302 4.665c0 1.194.232 2.333.654 3.375Z"
                }
              )
            }
          ),
          /* @__PURE__ */ jsxs("span", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsx("span", { className: "font-semibold", children: "Yes" }),
            /* @__PURE__ */ jsxs("span", { className: "text-highlight", children: [
              "(",
              yesVotes,
              ")"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "h-full border-r" }),
        /* @__PURE__ */ jsxs("button", { className: "text-4 flex w-1/2 items-center justify-center p-2", children: [
          /* @__PURE__ */ jsx(
            "svg",
            {
              xmlns: "http://www.w3.org/2000/svg",
              fill: "none",
              viewBox: "0 0 24 24",
              strokeWidth: 1.5,
              stroke: "currentColor",
              className: "size-6 font-medium",
              children: /* @__PURE__ */ jsx(
                "path",
                {
                  strokeLinecap: "round",
                  strokeLinejoin: "round",
                  d: "M10.05 4.575a1.575 1.575 0 1 0-3.15 0v3m3.15-3v-1.5a1.575 1.575 0 0 1 3.15 0v1.5m-3.15 0 .075 5.925m3.075.75V4.575m0 0a1.575 1.575 0 0 1 3.15 0V15M6.9 7.575a1.575 1.575 0 1 0-3.15 0v8.175a6.75 6.75 0 0 0 6.75 6.75h2.018a5.25 5.25 0 0 0 3.712-1.538l1.732-1.732a5.25 5.25 0 0 0 1.538-3.712l.003-2.024a.668.668 0 0 1 .198-.471 1.575 1.575 0 1 0-2.228-2.228 3.818 3.818 0 0 0-1.12 2.687M6.9 7.575V12m6.27 4.318A4.49 4.49 0 0 1 16.35 15m.002 0h-.002"
                }
              )
            }
          ),
          /* @__PURE__ */ jsxs("span", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsx("span", { className: "font-semibold", children: "Abstain" }),
            /* @__PURE__ */ jsxs("span", { className: "text-highlight", children: [
              "(",
              abstainVotes,
              ")"
            ] })
          ] })
        ] })
      ] })
    ] })
  ] });
}
export {
  ProposalCard as default
};
