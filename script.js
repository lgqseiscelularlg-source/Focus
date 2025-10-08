// --- Configuración --- //
const objetivo = { lat: -29.477051, lon: -66.889616 };
const radio = 10; // metros (para tus pruebas)
const geoBox = document.getElementById("geoBox");
const fixedBox = document.getElementById("fixedBox");

let fijado = false;

// Mostrar aviso en desktop si querés (opcional)
// if (!/Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
//   const w = document.getElementById("desktop-warning");
//   if (w) w.classList.remove("hidden");
// }

// Haversine
function distMetros(lat1, lon1, lat2, lon2) {
  const R = 6371e3, toRad = d => d * Math.PI / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLon/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

// Copia posición mundial de geoBox hacia fixedBox
function congelarEnPosicionActual() {
  // Asegurarnos de que el object3D existe
  if (!geoBox.object3D || !fixedBox.object3D) return false;

  // Tomar posición mundial del geoBox
  const worldPos = new THREE.Vector3();
  geoBox.object3D.getWorldPosition(worldPos);

  // Copiarla al cubo fijo
  fixedBox.object3D.position.copy(worldPos);

  // Mostrar fijo y ocultar geolocalizado
  fixedBox.setAttribute("visible", "true");
  geoBox.setAttribute("visible", "false");

  fijado = true;
  console.log("Cubo fijado en:", worldPos);
  return true;
}

// Reactivar modo geolocalizado (cuando salís del radio)
function resetFijado() {
  fijado = false;
  fixedBox.setAttribute("visible", "false");
  // Volvemos a mostrar el geoBox para que AR.js lo reposicione según el GPS
  geoBox.setAttribute("visible", "true");
}

// Observa la posición del usuario
navigator.geolocation.watchPosition(
  (pos) => {
    const lat = pos.coords.latitude;
    const lon = pos.coords.longitude;
    const d = distMetros(lat, lon, objetivo.lat, objetivo.lon);
    // console.log("Distancia:", d.toFixed(2), "m");

    if (d <= radio) {
      // Asegurarse de que geoBox esté visible para que AR.js lo coloque
      geoBox.setAttribute("visible", "true");

      // Esperar un pequeño tiempo para que AR.js actualice la posición
      if (!fijado) {
        // Micro-retry para tomar posición estable
        let intentos = 0;
        const maxIntentos = 10;
        const id = setInterval(() => {
          intentos++;
          // Si geoBox ya tiene object3D y no está en 0,0,0 (o aunque lo esté, copiamos)
          if (geoBox.object3D) {
            const ok = congelarEnPosicionActual();
            if (ok || intentos >= maxIntentos) clearInterval(id);
          } else if (intentos >= maxIntentos) {
            clearInterval(id);
          }
        }, 150);
      }
    } else {
      // Fuera del radio → ocultar fijo y reactivar geolocalizado
      if (fijado) {
        resetFijado();
      } else {
        // Asegurarse de que no quede nada a la vista
        geoBox.setAttribute("visible", "false");
        fixedBox.setAttribute("visible", "false");
      }
    }
  },
  (err) => console.error("Geo error:", err),
  { enableHighAccuracy: true, maximumAge: 0, timeout: 20000 }
);

