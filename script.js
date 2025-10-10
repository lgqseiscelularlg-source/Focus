// === GESTURE CONTROLS (funciona con AR.js geolocalizado) ===
AFRAME.registerComponent("gesture-controls", {
  schema: {
    rotSensitivity: { default: 0.005 },
    minScale: { default: 50 },
    maxScale: { default: 1500 }
  },
  init: function () {
    const el = this.el;
    const scene = el.sceneEl;

    let startX = 0;
    let startScale = el.object3D.scale.x || 1;
    let baseRotY = el.object3D.rotation.y || 0;
    let pinchStartDist = 0;

    const dist = (t0, t1) => {
      const dx = t0.pageX - t1.pageX, dy = t0.pageY - t1.pageY;
      return Math.hypot(dx, dy);
    };

    const attach = () => {
      const canvas = scene.renderer && scene.renderer.domElement;
      if (!canvas) return;

      // Asegura que los gestos no vayan a la cámara ni al navegador
      canvas.style.touchAction = "none";

      canvas.addEventListener("touchstart", (e) => {
        // Evitar que look-controls procese el drag
        e.preventDefault(); e.stopPropagation();

        if (e.touches.length === 1) {
          startX = e.touches[0].pageX;
          baseRotY = el.object3D.rotation.y;
        } else if (e.touches.length === 2) {
          pinchStartDist = dist(e.touches[0], e.touches[1]);
          startScale = el.object3D.scale.x;
        }
      }, { passive: false });

      canvas.addEventListener("touchmove", (e) => {
        e.preventDefault(); e.stopPropagation();

        if (e.touches.length === 1) {
          const dx = e.touches[0].pageX - startX;
          el.object3D.rotation.y = baseRotY - dx * this.data.rotSensitivity;
        } else if (e.touches.length === 2) {
          const factor = dist(e.touches[0], e.touches[1]) / pinchStartDist;
          let s = startScale * factor;
          s = Math.min(this.data.maxScale, Math.max(this.data.minScale, s));
          el.object3D.scale.set(s, s, s);
        }
      }, { passive: false });
    };

    if (scene.renderer) attach();
    else scene.addEventListener("render-target-loaded", attach, { once: true });
  }
});
// === FIN GESTURE CONTROLS ===


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
const wrapper3d = document.getElementById("wrapper3d");// geolocalizado



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
//------------------------ bloque if else
    
    // Control de aparición según distancia (wrapper geolocalizado + hijo interactivo)
    if (distancia <= radio) {
      if (objeto) objeto.setAttribute("visible", "false"); // opcional: ocultar cubo
      wrapper3d.setAttribute("visible", "true");
      objeto3d.setAttribute("visible", "true"); // por si quedó oculto de antes
    } else {
      wrapper3d.setAttribute("visible", "false");
      if (objeto) {
        objeto.setAttribute("visible", "false");
        objeto.setAttribute("gps-entity-place", `latitude: ${target.lat}; longitude: ${target.lon}`);
      }
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






