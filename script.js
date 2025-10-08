// Mostrar advertencia si se abre desde escritorio
if (!/Mobi|Android/i.test(navigator.userAgent)) {
  document.getElementById("desktop-warning").classList.remove("hidden");
}

// Coordenadas del punto objetivo (tu ubicación de prueba)
const objetivo = { lat: -29.477051, lon: -66.889616 };
const radio = 10; // metros

// Estado para saber si el cubo ya fue fijado
let cuboFijado = false;

navigator.geolocation.watchPosition(
  function (position) {
    const userLat = position.coords.latitude;
    const userLon = position.coords.longitude;
    const geoBox = document.getElementById("geoBox");

    const distancia = calcularDistancia(userLat, userLon, objetivo.lat, objetivo.lon);

    // Si está dentro del radio
    if (distancia <= radio) {
      geoBox.setAttribute("visible", "true");

      // Si aún no fue fijado, lo fijamos en su posición actual
      if (!cuboFijado) {
        const posicionActual = geoBox.getAttribute("position");
        geoBox.removeAttribute("gps-entity-place"); // Desvincula el GPS
        geoBox.setAttribute("position", posicionActual); // Mantiene su posición actual
        cuboFijado = true;
        console.log("Cubo fijado en posición:", posicionActual);
      }
    } else {
      geoBox.setAttribute("visible", "false");
      cuboFijado = false;
      // Volvemos a vincular el GPS si vuelve a entrar en el radio
      geoBox.setAttribute(
        "gps-entity-place",
        `latitude: ${objetivo.lat}; longitude: ${objetivo.lon}`
      );
    }
  },
  function (error) {
    console.error("Error de geolocalización:", error);
  },
  {
    enableHighAccuracy: true,
    maximumAge: 0,
    timeout: 27000,
  }
);

// Función para calcular distancia (Haversine)
function calcularDistancia(lat1, lon1, lat2, lon2) {
  const R = 6371e3;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

