// Mostrar advertencia si se abre desde escritorio
if (!/Mobi|Android/i.test(navigator.userAgent)) {
  document.getElementById("desktop-warning").classList.remove("hidden");
}

// Variables de control
const radio = 6; // metros
const target = { lat: -29.477051, lon: -66.889616 };
const objeto = document.getElementById("geoBox");     // Cubo geolocalizado
const objeto3d = document.getElementById("objeto3d"); // Modelo GLB

// Observa la ubicación del usuario
navigator.geolocation.watchPosition(
  (pos) => {
    const lat = pos.coords.latitude;
    const lon = pos.coords.longitude;

    // Calcula la distancia al punto objetivo
    const distancia = calcularDistancia(lat, lon, target.lat, target.lon);
    console.log("Distancia actual: " + distancia.toFixed(2) + " m");

    // Muestra la distancia en pantalla (si existe el elemento)
    const display = document.getElementById("distancia-display");
    if (display) {
      display.innerText = "Distancia: " + distancia.toFixed(1) + " m";
    }

    // Control de aparición del objeto según la distancia
    if (distancia <= radio) {
      // 🔹 Oculta el cubo geolocalizado
      objeto.setAttribute("visible", "false");

      // 🔹 Muestra el modelo 3D GLB frente al usuario
      setTimeout(() => {
        objeto3d.setAttribute("visible", "true");
        objeto3d.setAttribute("position", "0 2 -3"); // 2 m de altura, 3 m delante
      }, 500);
    } else {
      // 🔹 Vuelve a mostrar el cubo geolocalizado
      objeto3d.setAttribute("visible", "false");
      objeto.setAttribute("visible", "false");
      objeto.setAttribute(
        "gps-entity-place",
        `latitude: ${target.lat}; longitude: ${target.lon}`
      );
    }
  },
  (err) => {
    console.error("Error de geolocalización:", err);
    const display = document.getElementById("distancia-display");
    if (display) {
      display.innerText = "Error GPS";
    }
  },
  { enableHighAccuracy: true }
);

// Fórmula de Haversine
function calcularDistancia(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // metros
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) ** 2 +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}






