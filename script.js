// === CONTROL MANUAL DE GESTOS SOBRE MODELO GLB (FUNCIONAL EN AR.JS) ===
AFRAME.registerComponent("gesture-fix", {
  init: function () {
    const el = this.el; // el modelo
    const scene = el.sceneEl;

    let startX = 0;
    let startScale = 1;
    let currentRotation = 0;
    let currentScale = 1;
    let pinchStartDist = 0;

    const getDistance = (touches) => {
      const dx = touches[0].pageX - touches[1].pageX;
      const dy = touches[0].pageY - touches[1].pageY;
      return Math.sqrt(dx * dx + dy * dy);
    };

    const attachListeners = () => {
      const canvas = scene.renderer?.domElement;
      if (!canvas) return;

      canvas.style.touchAction = "none"; // evita que el navegador robe gestos

      canvas.addEventListener(
        "touchstart",
        (e) => {
          if (e.touches.length === 1) {
            startX = e.touches[0].pageX;
            currentRotation = el.object3D.rotation.y;
          } else if (e.touches.length === 2) {
            pinchStartDist = getDistance(e.touches);
            startScale = el.object3D.scale.x;
          }
        },
        { passive: false }
      );

      canvas.addEventListener(
        "touchmove",
        (e) => {
          if (e.touches.length === 1) {
            const deltaX = e.touches[0].pageX - startX;
            el.object3D.rotation.y = currentRotation - deltaX * 0.005; // sensibilidad
          } else if (e.touches.length === 2) {
            const newDist = getDistance(e.touches);
            const scaleFactor = newDist / pinchStartDist;
            currentScale = Math.min(Math.max(startScale * scaleFactor, 50), 1500); // límites razonables
            el.object3D.scale.set(currentScale, currentScale, currentScale);
          }
          e.preventDefault();
        },
        { passive: false }
      );
    };

    if (scene.renderer) attachListeners();
    else scene.addEventListener("render-target-loaded", attachListeners);
  },
});
// === FIN CONTROL MANUAL DE GESTOS ===



//------------------------------------------------------------------------------------------

// Mostrar advertencia si se abre desde escritorio
if (!/Mobi|Android/i.test(navigator.userAgent)) {
  document.getElementById("desktop-warning").classList.remove("hidden");
}

// Variables de control
const radio = 15; // metros
const target = { lat: -29.477051, lon: -66.889616 };
const objeto = document.getElementById("geoBox");     // Cubo geolocalizado
const objeto3d = document.getElementById("objeto3d"); // Modelo GLB
objeto3d.setAttribute("visible", "true");
const wrapper3d = document.getElementById("wrapper3d");



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
//------------------------
    // Control de aparición del objeto según la distancia (versión con wrapper geolocalizado)
    if (distancia <= radio) {
      // 🔹 Oculta el cubo geolocalizado (lo dejamos como fallback apagado)
      objeto.setAttribute("visible", "false");
    
      // 🔹 Muestra el contenedor geolocalizado que ANCLA el modelo en el mundo
      // (El modelo 'objeto3d' está dentro y recibe los gestos)
      wrapper3d.setAttribute("visible", "true");
    
      // 🔹 Asegura que el modelo esté visible por si en versiones previas quedó oculto
      objeto3d.setAttribute("visible", "true");
    } else {
      // 🔹 Oculta el contenedor (y por ende el modelo)
      wrapper3d.setAttribute("visible", "false");
    
      // 🔹 Mantenemos el cubo oculto (si quisieras mostrarlo fuera del radio, ponelo en true)
      objeto.setAttribute("visible", "false");
    
      // 🔹 Reinyecta el gps-entity-place del cubo por compatibilidad (no es estrictamente necesario,
      //     pero lo conservo porque ya lo tenías y no interfiere con el wrapper)
      objeto.setAttribute(
        "gps-entity-place",
        `latitude: ${target.lat}; longitude: ${target.lon}`
      );
    
      // 🔹 Por si en alguna prueba dejaste el modelo visible manualmente
      objeto3d.setAttribute("visible", "false");
    }

  //-----------------
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






