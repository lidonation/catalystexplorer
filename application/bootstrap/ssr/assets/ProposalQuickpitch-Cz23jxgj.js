import { jsxs, jsx } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import Plyr from "plyr-react";
import { useTranslation } from "react-i18next";
function ProposalQuickpitch({ quickpitch }) {
  const { t } = useTranslation();
  const [videoData, setVideoData] = useState({
    id: null,
    provider: "html5",
    error: null
  });
  const processVideoUrl = (url) => {
    if (!url) {
      return {
        id: null,
        provider: "html5",
        error: t("proposals.errors.noUrl")
      };
    }
    try {
      new URL(url);
      if (url.includes("youtube.com") || url.includes("youtu.be")) {
        const youtubeMatch = url.match(/(?:v=|youtu\.be\/)([\w-]+)/);
        if (!youtubeMatch) {
          return {
            id: null,
            provider: "youtube",
            error: t("proposals.errors.invalidYoutubeFormat")
          };
        }
        return { id: youtubeMatch[1], provider: "youtube", error: null };
      }
      if (url.includes("vimeo.com")) {
        const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
        if (!vimeoMatch) {
          return {
            id: null,
            provider: "vimeo",
            error: t("proposals.errors.invalidVimeoFormat")
          };
        }
        return { id: vimeoMatch[1], provider: "vimeo", error: null };
      }
      return {
        id: null,
        provider: "html5",
        error: t("proposals.errors.invalidUrlFormat")
      };
    } catch (e) {
      return {
        id: null,
        provider: "html5",
        error: t("proposals.errors.invalidUrl")
      };
    }
  };
  useEffect(() => {
    const result = processVideoUrl(quickpitch);
    setVideoData(result);
  }, [quickpitch, t]);
  return /* @__PURE__ */ jsxs("section", { "aria-labelledby": "video-heading", className: "h-full", children: [
    /* @__PURE__ */ jsx("h2", { id: "video-heading", className: "sr-only", children: t("proposals.projectVideo") }),
    /* @__PURE__ */ jsx("div", { className: "relative h-full w-full overflow-hidden rounded-2xl", children: videoData.error ? /* @__PURE__ */ jsx("div", { className: "flex h-full items-center justify-center p-4", children: /* @__PURE__ */ jsxs("div", { className: "text-center max-w-lg", children: [
      /* @__PURE__ */ jsx("p", { className: "mb-2", children: videoData.error }),
      quickpitch && /* @__PURE__ */ jsxs("p", { className: "text-sm break-all", children: [
        t("proposals.providedUrl"),
        ": ",
        quickpitch
      ] })
    ] }) }) : videoData.id && /* @__PURE__ */ jsx(
      Plyr,
      {
        source: {
          type: "video",
          sources: [
            {
              src: videoData.id,
              provider: videoData.provider
            }
          ]
        },
        options: {
          controls: ["play-large", "play", "progress", "current-time", "mute", "volume", "fullscreen"],
          ratio: "16:9",
          hideControls: false,
          autoplay: false,
          invertTime: false,
          tooltips: { controls: true, seek: true }
        }
      },
      videoData.id
    ) })
  ] });
}
export {
  ProposalQuickpitch as default
};
