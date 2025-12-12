export const mapStyles = [
  {
    elementType: "labels.text.fill",
    stylers: [{ color: "#6b7472" }],
  },
  {
    elementType: "labels.text.stroke",
    stylers: [{ color: "#f4f5f5" }],
  },

  {
    featureType: "administrative",
    elementType: "geometry",
    stylers: [{ color: "#3f5b58" }],
  },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#3f5b58" }],
  },

  {
    featureType: "landscape",
    elementType: "geometry",
    stylers: [{ color: "#f4f5f5" }],
  },

  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#d3d7d6" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#c0c4c3" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#c0c4c3" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: "#9fa7a5" }],
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#6b7472" }],
  },

  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#a7b9c6" }],
  },
  {
    featureType: "water",
    elementType: "geometry.stroke",
    stylers: [{ color: "#9fa7a5" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#6b7472" }],
  },

  {
    featureType: "poi",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "transit",
    stylers: [{ visibility: "off" }],
  },

  //hiding unnecessary elements
  {
    featureType: "poi.business",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "poi.medical",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "poi.school",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "poi.sports_complex",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "poi.place_of_worship",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "poi.attraction",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "poi",
    elementType: "labels",
    stylers: [{ visibility: "off" }],
  },
];

export default mapStyles;
