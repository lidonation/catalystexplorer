import { jsxs, jsx } from "react/jsx-runtime";
import { useTranslation } from "react-i18next";
import { useState } from "react";
function ArrowTopRightIcon({
  className,
  width = 24,
  height = 24
}) {
  const { t } = useTranslation();
  return /* @__PURE__ */ jsxs(
    "svg",
    {
      width,
      height,
      viewBox: "0 0 24 24",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      className,
      children: [
        /* @__PURE__ */ jsx("title", { children: t("icons.title.arrowTopRight") }),
        /* @__PURE__ */ jsx(
          "path",
          {
            d: "M7 17L17 7M7 7H17V17",
            stroke: "currentColor",
            strokeWidth: "2",
            strokeLinecap: "round",
            strokeLinejoin: "round"
          }
        )
      ]
    }
  );
}
function PostCard({ post }) {
  var _a;
  const heroData = JSON.parse(post == null ? void 0 : post.hero);
  const thumbnail = (_a = heroData.responsive_images.thumbnail) == null ? void 0 : _a.base64svg;
  const originalUrl = heroData == null ? void 0 : heroData.original_url;
  const [imgSrc, setImgSrc] = useState(thumbnail);
  const handleImageLoad = () => {
    setImgSrc(originalUrl);
  };
  return /* @__PURE__ */ jsxs(
    "article",
    {
      className: "flex w-full flex-col",
      role: "region",
      "aria-labelledby": `post-title-${post == null ? void 0 : post.id}`,
      children: [
        /* @__PURE__ */ jsx("div", { className: "h-auto w-full", children: /* @__PURE__ */ jsx(
          "img",
          {
            className: "aspect-video h-full w-full rounded-lg object-cover",
            src: imgSrc,
            loading: "lazy",
            alt: heroData == null ? void 0 : heroData.name,
            onLoad: imgSrc === thumbnail ? handleImageLoad : void 0
          }
        ) }),
        /* @__PURE__ */ jsxs("div", { className: "mt-4 flex items-center", children: [
          /* @__PURE__ */ jsx(
            "p",
            {
              className: "text-4 font-bold text-accent",
              "aria-label": `Author: ${post == null ? void 0 : post.author_name}`,
              children: post == null ? void 0 : post.author_name
            }
          ),
          /* @__PURE__ */ jsx(
            "div",
            {
              className: "ml-2 mr-2 h-1 w-1 rounded-full bg-accent",
              "aria-hidden": "true"
            }
          ),
          /* @__PURE__ */ jsx(
            "p",
            {
              className: "text-4 font-bold text-accent",
              "aria-label": `Published on: ${post == null ? void 0 : post.published_at}`,
              children: post == null ? void 0 : post.published_at
            }
          )
        ] }),
        /* @__PURE__ */ jsxs(
          "a",
          {
            href: post == null ? void 0 : post.link,
            target: "_blank",
            rel: "noopener noreferrer",
            className: "group mt-2 flex w-full items-start justify-between",
            "aria-label": `Read the full post titled "${post == null ? void 0 : post.title}"`,
            children: [
              /* @__PURE__ */ jsx(
                "h2",
                {
                  id: `post-title-${post == null ? void 0 : post.id}`,
                  className: "w-full text-2xl font-extrabold text-content group-hover:text-primary",
                  children: post == null ? void 0 : post.title
                }
              ),
              /* @__PURE__ */ jsx(
                ArrowTopRightIcon,
                {
                  className: "ml-4 cursor-pointer text-content group-hover:text-primary",
                  "aria-hidden": "true"
                }
              )
            ]
          }
        ),
        /* @__PURE__ */ jsx("div", { className: "mb-4 mt-2 w-full text-content opacity-70", children: /* @__PURE__ */ jsx("p", { "aria-label": `Subtitle: ${post == null ? void 0 : post.subtitle}`, children: post == null ? void 0 : post.subtitle }) })
      ]
    }
  );
}
export {
  PostCard as default
};
