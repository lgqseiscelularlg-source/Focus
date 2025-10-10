// === Componente de gestos (rotar con 1 dedo, zoom con 2) ===
AFRAME.registerComponent("gesture-handler", {
  schema: { enabled: { default: true }, min: { default: 20 }, max: { default: 1000 } },
  init: function () {
    const el = this.el;
    const sceneEl = el.sceneEl;

    // Estados
    this._rotStartDeg = THREE.MathUtils.radToDeg(el.object3D.rotation.y) || 0;
    this._scaleStart = el.object3D.scale.x || 1;
    this._touchStartX = 0;
    this._pinchStartDist = 0;

    // Adjuntar listeners cuando el canvas exista
    const attach = () => {
      const target = sceneEl.canvas || sceneEl.renderer?.domElement || document.body;

      // Aseguramos passive:false para poder e.preventDefault()
      const opts = { passive: false };

      target.addEventListener("touchstart", this._onStart.bind(this), opts);
      target.addEventListener("touchmove",  this._onMove.bind(this),  opts);
      target.addEventListener("touchend",   this._onEnd.bind(this),   opts);
      target.addEventListener("touchcancel",this._onEnd.bind(this),   opts);
    };

    if (sceneEl.canvas) attach();
    else sceneEl.addEventListener("render-target-loaded", attach, { once: true });
  },

  _onStart: function (e) {
    if (!this.data.enabled) return;
    e.preventDefault();

    const el = this.el;

    if (e.touches.length === 1) {
      this._touchStartX = e.touches[0].pageX;
      // Tomar rotación actual como base
      this._rotStartDeg = THREE.MathUtils.radToDeg(el.object3D.rotation.y);
    } else if (e.touches.length === 2) {
      this._pinchStartDist = this._dist(e.touches[0], e.touches[1]);
      // Tomar escala actual como base (no asumir 1)
      this._scaleStart = el.object3D.scale.x;
    }
  },

  _onMove: function (e) {
    if (!this.data.enabled) return;
    e.preventDefault();

    const el = this.el;

    if (e.touches.length === 1) {
      // ROTACIÓN (eje Y)
      const deltaX = e.touches[0].pageX - this._touchStartX;
      const rotDeg = this._rotStartDeg + deltaX * 0.4; // sensibilidad
      el.object3D.rotation.y = THREE.MathUtils.degToRad(rotDeg);
    } else if (e.touches.length === 2) {
      // ZOOM (escala uniforme)
      const newDist = this._dist(e.touches[0], e.touches[1]);
      const factor = newDist / this._pinchStartDist;
      let newScale = this._scaleStart * factor;

      // Limitar escala a un rango razonable (depende de tu modelo)
      newScale = Math.max(this.data.min, Math.min(this.data.max, newScale));

      el.object3D.scale.set(newScale, newScale, newScale);
    }
  },

  _onEnd: function (e) {
    // No necesitamos lógica especial aquí, pero se deja por claridad
  },

  _dist: function (a, b) {
    const dx = a.pageX - b.pageX;
    const dy = a.pageY - b.pageY;
    return Math.sqrt(dx * dx + dy * dy);
  }
});
// === Fin componente de gestos ===

//-------------------------------------------------------------------------------------------

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

      // 🔹 Muestra el modelo 3D GLB
      setTimeout(() => {
      objeto3d.setAttribute("visible", "true");
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






