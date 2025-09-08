import { jsx, jsxs } from 'react/jsx-runtime';
import { useState } from 'react';
import ReactMapGL, { Marker, Popup } from 'react-map-gl';

const GlobalMap = ({
  points,
  initialZoom = 2,
  height = "500px",
  width = "100%",
  mapStyle = "mapbox://styles/mapbox/streets-v11"
}) => {
  const [selectedPoint, setSelectedPoint] = useState(null);
  const initialViewport = {
    latitude: points[0]?.latitude || 0,
    longitude: points[0]?.longitude || 0,
    zoom: initialZoom
  };
  if (!points || points.length === 0) {
    return /* @__PURE__ */ jsx(
      "div",
      {
        style: { width, height },
        className: "flex items-center justify-center bg-gray-100 text-gray-500",
        children: "No locations to display"
      }
    );
  }
  return /* @__PURE__ */ jsx("div", { style: { width, height }, className: "relative", children: /* @__PURE__ */ jsxs(
    ReactMapGL,
    {
      initialViewState: initialViewport,
      mapStyle,
      mapboxAccessToken: "",
      onClick: () => setSelectedPoint(null),
      onError: (err) => console.error("Map error:", err),
      style: { width: "100%", height: "100%" },
      children: [
        points.map((point) => /* @__PURE__ */ jsx(
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
        selectedPoint && /* @__PURE__ */ jsx(
          Popup,
          {
            latitude: selectedPoint.latitude,
            longitude: selectedPoint.longitude,
            onClose: () => setSelectedPoint(null),
            closeOnClick: false,
            anchor: "top",
            children: /* @__PURE__ */ jsxs("div", { className: "p-3", children: [
              /* @__PURE__ */ jsx("h3", { className: "mb-1 text-lg font-semibold", children: selectedPoint.title }),
              selectedPoint.description && /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-600", children: selectedPoint.description }),
              /* @__PURE__ */ jsxs("div", { className: "mt-2 text-xs text-gray-400", children: [
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
