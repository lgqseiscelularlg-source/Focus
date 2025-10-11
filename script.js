// === CONTROL DE GESTOS SOBRE MODELO GPS (estable) ===
AFRAME.registerComponent("gps-gesture", {
  schema: { rotFactor: { default: 0.35 }, minScale: { default: 50 }, maxScale: { default: 1500 } },
  init: function () {
    this.wrapper = this.el;                       // <a-entity id="wrapper3d">
    this.pivot   = document.getElementById("pivot3d"); // el hijo libre
    this.active  = false;

    // Estado de gesto
    this._touch1X = 0;
    this._rotBase = 0;     // grados (no rad) para trabajar fácil con setAttribute
    this._pinch0  = 0;
    this._scale0  = 1;

    // Cache de valores actuales (para RAF)
    this._rotY    = 0;     // grados
    this._scale   = 300;   // tu escala inicial

    // Inicializar desde atributos actuales del pivot
    const rotAttr   = this.pivot.getAttribute("rotation") || {x:0,y:0,z:0};
    const scaleAttr = this.pivot.getAttribute("scale")    || {x:300,y:300,z:300};
    this._rotY  = rotAttr.y;
    this._scale = scaleAttr.x;

    // Listeners globales garantizados
    window.addEventListener("touchstart", this._onStart, {passive:false});
    window.addEventListener("touchmove",  this._onMove,  {passive:false});
    window.addEventListener("touchend",   this._onEnd,   {passive:false});
    window.addEventListener("touchcancel",this._onEnd,   {passive:false});

    // bind this
    this._tickApply = this._tickApply.bind(this);
    this._onStart   = this._onStart.bind(this);
    this._onMove    = this._onMove.bind(this);
    this._onEnd     = this._onEnd.bind(this);

    // Arranca el loop de aplicación (suave, sin pelearse con AR.js)
    requestAnimationFrame(this._tickApply);
  },

  // Aplicamos rotation/scale por atributos (A-Frame), en RAF para no ser pisados
  _tickApply: function () {
    if (this.pivot) {
      this.pivot.setAttribute("rotation", `0 ${this._rotY} 0`);
      const s = Math.min(this.data.maxScale, Math.max(this.data.minScale, this._scale));
      this.pivot.setAttribute("scale", `${s} ${s} ${s}`);
    }
    requestAnimationFrame(this._tickApply);
  },

  _onStart: function (e) {
    if (!this.wrapper.getAttribute("visible")) return; // solo cuando está visible
    if (e.touches.length === 1) {
      this._touch1X = e.touches[0].pageX;
      const r = this.pivot.getAttribute("rotation") || {y:0};
      this._rotBase = r.y;
      this.active = true;
    } else if (e.touches.length === 2) {
      this._pinch0 = this._dist(e.touches[0], e.touches[1]);
      const sc = this.pivot.getAttribute("scale") || {x:300};
      this._scale0 = sc.x;
      this.active = true;
    }
    e.preventDefault();
  },

  _onMove: function (e) {
    if (!this.active) return;
    if (!this.wrapper.getAttribute("visible")) return;

    if (e.touches.length === 1) {
      const dx = e.touches[0].pageX - this._touch1X;
      this._rotY = this._rotBase - dx * this.data.rotFactor; // grados
    } else if (e.touches.length === 2) {
      const d1 = this._dist(e.touches[0], e.touches[1]);
      const factor = d1 / this._pinch0;
      this._scale = this._scale0 * factor;
    }
    e.preventDefault();
  },

  _onEnd: function (e) {
    this.active = false;
    e.preventDefault();
  },

  _dist: function (a, b) {
    const dx = a.pageX - b.pageX, dy = a.pageY - b.pageY;
    return Math.hypot(dx, dy);
  }
});
// === FIN CONTROL DE GESTOS ===




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






