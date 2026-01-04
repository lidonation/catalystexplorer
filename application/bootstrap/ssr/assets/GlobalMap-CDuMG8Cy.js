import { r as reactExports, j as jsxRuntimeExports } from '../ssr.js';
import ReactMapGL, { Marker, Popup } from 'react-map-gl';
import '@inertiajs/react';
import 'ziggy-js';
import 'laravel-react-i18n';
import 'marked-react';
import 'clsx';
import 'tailwind-merge';
import 'lucide-react';
import '@radix-ui/react-popover';
import 'axios';
import '@multiavatar/multiavatar/esm';
import 'react-toastify';
import '@radix-ui/react-switch';
import 'zod';
import '@radix-ui/react-dropdown-menu';
import 'dexie';
import 'dexie-react-hooks';
import 'framer-motion';
import '@radix-ui/react-slider';
import 'cmdk';
import '@radix-ui/react-dialog';
import '@radix-ui/react-scroll-area';
import 'date-fns';
import 'hast-util-sanitize';
import 'react-markdown';
import 'remark-gfm';
import '@headlessui/react';
import 'react-masonry-css';
import '@laravel/stream-react';
import '@radix-ui/react-tooltip';
import '@inertiaui/modal-react';
import '@radix-ui/react-tabs';
import 'lodash';
import '@nivo/pie';
import '@nivo/bar';
import '@nivo/funnel';
import '@nivo/line';
import '@nivo/treemap';
import '@nivo/heatmap';
import '@nivo/scatterplot';
import 'embla-carousel-react';
import '@dnd-kit/sortable';
import '@dnd-kit/core';
import '@dnd-kit/utilities';
import 'rehype-raw';
import 'franc';
import '@inertiajs/react/server';
import 'util';
import 'crypto';
import 'async_hooks';
import 'stream';

const GlobalMap = ({
  points,
  initialZoom = 2,
  height = "500px",
  width = "100%",
  mapStyle = "mapbox://styles/mapbox/streets-v11"
}) => {
  const [selectedPoint, setSelectedPoint] = reactExports.useState(null);
  const initialViewport = {
    latitude: points[0]?.latitude || 0,
    longitude: points[0]?.longitude || 0,
    zoom: initialZoom
  };
  if (!points || points.length === 0) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        style: { width, height },
        className: "flex items-center justify-center bg-gray-100 text-gray-500",
        children: "No locations to display"
      }
    );
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { width, height }, className: "relative", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
    ReactMapGL,
    {
      initialViewState: initialViewport,
      mapStyle,
      mapboxAccessToken: "",
      onClick: () => setSelectedPoint(null),
      onError: (err) => console.error("Map error:", err),
      style: { width: "100%", height: "100%" },
      children: [
        points.map((point) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          Marker,
          {
            latitude: point.latitude,
            longitude: point.longitude,
            color: "red",
            onClick: (e) => {
              e.originalEvent.stopPropagation();
              setSelectedPoint(point);
            }
          },
          point.id
        )),
        selectedPoint && /* @__PURE__ */ jsxRuntimeExports.jsx(
          Popup,
          {
            latitude: selectedPoint.latitude,
            longitude: selectedPoint.longitude,
            onClose: () => setSelectedPoint(null),
            closeOnClick: false,
            anchor: "top",
            children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mb-1 text-lg font-semibold", children: selectedPoint.title }),
              selectedPoint.description && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600", children: selectedPoint.description }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 text-xs text-gray-400", children: [
                selectedPoint.latitude.toFixed(4),
                ",",
                " ",
                selectedPoint.longitude.toFixed(4)
              ] })
            ] })
          }
        )
      ]
    }
  ) });
};

export { GlobalMap as default };
