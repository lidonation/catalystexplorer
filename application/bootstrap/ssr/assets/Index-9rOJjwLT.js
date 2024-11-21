import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import CatalystIntro from "./CatalystIntro-toD6BFXr.js";
import PostCard from "./PostCard-C4XRiHQd.js";
import { Head, WhenVisible } from "@inertiajs/react";
import PostListLoader from "./PostListLoader-3nwOgI6a.js";
import ProposalList from "./ProposalList-CmQhjsmR.js";
import ProposalCardLoading from "./ProposalCardLoading-hV5yK7Wl.js";
import { useTranslation } from "react-i18next";
import "react";
import "../ssr.js";
import "i18next";
import "ziggy-js";
import "axios";
import "qs";
import "@headlessui/react";
import "@inertiajs/react/server";
import "react-dom/server";
import "./Checkbox-c-_HImKH.js";
import "clsx";
import "tailwind-merge";
import "./ProposalCard-B6WIhqMj.js";
import "./ProposalFundingPercentages-CxBTpmbB.js";
import "./ProposalBookmark-BLtuiLfr.js";
import "./ProposalFundingStatus-He_dc8kf.js";
import "./ProposalQuickpitch-Cz23jxgj.js";
import "plyr-react";
import "./ProposalSolution-CcuY1fcZ.js";
import "./ProposalStatus-DS8PUNFf.js";
import "./ProposalUsers-B9XTwuaf.js";
import "./SecondaryButton-Cn2Kx5jS.js";
function Index({ posts, proposals, metrics, announcements, specialAnnouncements }) {
  const { t } = useTranslation();
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Catalyst Explorer" }),
    /* @__PURE__ */ jsxs("div", { className: "relative flex w-full flex-col justify-center gap-8", children: [
      /* @__PURE__ */ jsx(CatalystIntro, {}),
      /* @__PURE__ */ jsx("section", { className: "annnouncements-wrapper py-16", children: /* @__PURE__ */ jsxs("div", { className: "container", children: [
        /* @__PURE__ */ jsx("div", { className: " overflow-auto py-8", children: /* @__PURE__ */ jsx("h2", { className: "title-2", children: "Announcements Data" }) }),
        /* @__PURE__ */ jsx(WhenVisible, { fallback: /* @__PURE__ */ jsx("div", { children: "Loading..." }), data: "announcements", children: JSON.stringify(announcements) })
      ] }) }),
      /* @__PURE__ */ jsx("section", { className: "numbers-wrapper py-16", children: /* @__PURE__ */ jsxs("div", { className: "container", children: [
        /* @__PURE__ */ jsx("div", { className: " overflow-auto py-8", children: /* @__PURE__ */ jsx("h2", { className: "title-2", children: "Metrics Data" }) }),
        /* @__PURE__ */ jsx(WhenVisible, { fallback: /* @__PURE__ */ jsx("div", { children: "Loading..." }), data: "metrics", children: JSON.stringify(metrics) })
      ] }) }),
      /* @__PURE__ */ jsx(
        WhenVisible,
        {
          fallback: /* @__PURE__ */ jsx(ProposalCardLoading, {}),
          data: "proposals",
          children: /* @__PURE__ */ jsx(ProposalList, { proposals })
        }
      ),
      /* @__PURE__ */ jsx("section", { className: "special-announcements-wrapper", children: /* @__PURE__ */ jsxs("div", { className: "container", children: [
        /* @__PURE__ */ jsx("div", { className: " overflow-auto py-8", children: /* @__PURE__ */ jsx("h2", { className: "title-2", children: "Special Announcements Data" }) }),
        /* @__PURE__ */ jsx(WhenVisible, { fallback: /* @__PURE__ */ jsx("div", { children: "Loading..." }), data: "specialAnnouncements", children: JSON.stringify(specialAnnouncements) })
      ] }) }),
      /* @__PURE__ */ jsxs("section", { className: "posts-wrapper container flex flex-col gap-8", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h2", { className: "title-2", children: t("posts.title") }),
          /* @__PURE__ */ jsx("p", { children: t("posts.subtitle") })
        ] }),
        /* @__PURE__ */ jsx(WhenVisible, { fallback: /* @__PURE__ */ jsx(PostListLoader, {}), data: "posts", children: /* @__PURE__ */ jsx("ul", { className: "content-gap scrollable snaps-scrollable", children: posts && posts.map((post) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(PostCard, { post }) }, post == null ? void 0 : post.id)) }) })
      ] })
    ] })
  ] });
}
export {
  Index as default
};
