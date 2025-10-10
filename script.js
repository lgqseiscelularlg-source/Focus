// === GESTURE HANDLER (rotar y hacer zoom) ===
AFRAME.registerComponent("gesture-handler", {
  schema: { enabled: { default: true }, min: { default: 50 }, max: { default: 1000 } },
  init: function () {
    const el = this.el;
    const sceneEl = el.sceneEl;
    this.scaleStart = el.object3D.scale.x;
    this.rotStart = el.object3D.rotation.y;
    this.touchStartX = 0;
    this.pinchStartDist = 0;

    // Esperar a que el canvas exista
    const attach = () => {
      const canvas = sceneEl.canvas;
      canvas.addEventListener("touchstart", this._start.bind(this), { passive: false });
      canvas.addEventListener("touchmove", this._move.bind(this), { passive: false });
    };
    if (sceneEl.canvas) attach();
    else sceneEl.addEventListener("render-target-loaded", attach);
  },
  _start: function (e) {
    if (e.touches.length === 1) {
      this.touchStartX = e.touches[0].pageX;
      this.rotStart = this.el.object3D.rotation.y;
    } else if (e.touches.length === 2) {
      this.pinchStartDist = this._dist(e.touches);
      this.scaleStart = this.el.object3D.scale.x;
    }
  },
  _move: function (e) {
    if (e.touches.length === 1) {
      const dx = e.touches[0].pageX - this.touchStartX;
      this.el.object3D.rotation.y = this.rotStart - dx * 0.005; // sensibilidad
    } else if (e.touches.length === 2) {
      const d = this._dist(e.touches);
      let s = (d / this.pinchStartDist) * this.scaleStart;
      s = Math.min(this.data.max, Math.max(this.data.min, s));
      this.el.object3D.scale.set(s, s, s);
    }
  },
  _dist: (t) => Math.hypot(t[0].pageX - t[1].pageX, t[0].pageY - t[1].pageY)
});
// === FIN GESTURE HANDLER ===


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






