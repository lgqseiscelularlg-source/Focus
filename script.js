// Coordenadas del punto objetivo
const objetivo = { lat: -29.477051, lon: -66.889616 };
const radio = 5; // metros
const geoBox = document.getElementById("geoBox");
const distLabel = document.getElementById("distance-label");

// Estilo discreto para la etiqueta de distancia
distLabel.style.position = "fixed";
distLabel.style.bottom = "12px";
distLabel.style.left = "50%";
distLabel.style.transform = "translateX(-50%)";
distLabel.style.background = "rgba(0, 0, 0, 0.5)";
distLabel.style.padding = "4px 10px";
distLabel.style.borderRadius = "6px";
distLabel.style.fontSize = "13px";
distLabel.style.color = "#fff";
distLabel.style.zIndex = "1000";
distLabel.style.fontFamily = "Arial, sans-serif";

// Utilidad: convierte grados a radianes
const toRad = (deg) => (deg * Math.PI) / 180;

// Cálculo de distancia con Haversine
function distanciaMetros(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // radio de la Tierra en metros
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Una vez que AR.js carga la cámara, comenzamos el seguimiento GPS
window.addEventListener("arjs-video-loaded", () => {
  console.log("✅ Cámara lista. Iniciando seguimiento GPS...");

  navigator.geolocation.watchPosition(
    (pos) => {
      const { latitude, longitude } = pos.coords;
      const distancia = distanciaMetros(
        latitude,
        longitude,
        objetivo.lat,
        objetivo.lon
      );

      distLabel.textContent = `Distancia: ${distancia.toFixed(2)} m`;

      // Mostrar el cubo solo si está dentro del radio
      if (distancia <= radio) {
        if (geoBox.getAttribute("visible") === "false") {
          console.log("🧱 Dentro del radio — mostrando cubo");
          geoBox.setAttribute("visible", "true");
          geoBox.setAttribute("position", "0 2 -5"); // aparece al frente
          geoBox.setAttribute("scale", "3 3 3");
        }
      } else {
        geoBox.setAttribute("visible", "false");
      }
    },
    (err) => {
      console.error("Error de geolocalización:", err);
      alert("No se pudo obtener la ubicación. Verifica los permisos de GPS.");
    },
    { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 }
  );
});



