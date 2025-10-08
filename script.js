const startBtn = document.getElementById("start-btn");
const permissionScreen = document.getElementById("permission-screen");
const arContainer = document.getElementById("ar-container");
const geoBox = document.getElementById("geoBox");

// Coordenadas del punto objetivo
const objetivo = { lat: -29.477051, lon: -66.889616 };
const radio = 5;

// Fórmula de distancia (Haversine)
function distanciaMetros(lat1, lon1, lat2, lon2) {
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

startBtn.addEventListener("click", () => {
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      alert(
        "Ubicación detectada ✅\nLat: " +
          pos.coords.latitude +
          "\nLon: " +
          pos.coords.longitude
      );

      // Ocultar pantalla inicial y mostrar AR
      permissionScreen.style.display = "none";
      arContainer.style.display = "block";

      iniciarAR();
    },
    (err) => {
      alert("Error de ubicación: " + err.message);
    },
    { enableHighAccuracy: true, timeout: 15000 }
  );
});

function iniciarAR() {
  navigator.geolocation.watchPosition(
    (pos) => {
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;
      const dist = distanciaMetros(lat, lon, objetivo.lat, objetivo.lon);
      console.log("Distancia:", dist.toFixed(2), "m");

      if (dist <= radio) {
        geoBox.setAttribute("visible", "true");
      } else {
        geoBox.setAttribute("visible", "false");
      }
    },
    (err) => {
      console.error("Error GPS:", err);
    },
    { enableHighAccuracy: true, maximumAge: 0, timeout: 20000 }
  );
}


