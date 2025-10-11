// === CONTROL DE GESTOS (rotación + zoom) ===
AFRAME.registerComponent("gesture-controls", {
  schema: { rotFactor: { default: 0.35 }, minScale: { default: 50 }, maxScale: { default: 1500 } },
  init: function () {
    this.model = this.el;
    this.startX = 0;
    this.startScale = this.model.object3D.scale.x;
    this.baseRot = this.model.object3D.rotation.y;
    this.pinchStart = 0;

    const dist = (a, b) => Math.hypot(a.pageX - b.pageX, a.pageY - b.pageY);

    window.addEventListener("touchstart", (e) => {
      if (e.touches.length === 1) {
        this.startX = e.touches[0].pageX;
        this.baseRot = this.model.object3D.rotation.y;
      } else if (e.touches.length === 2) {
        this.pinchStart = dist(e.touches[0], e.touches[1]);
        this.startScale = this.model.object3D.scale.x;
      }
    });

    window.addEventListener("touchmove", (e) => {
      if (e.touches.length === 1) {
        const dx = e.touches[0].pageX - this.startX;
        this.model.object3D.rotation.y = this.baseRot - dx * this.data.rotFactor * 0.01745; // grados→rad
      } else if (e.touches.length === 2) {
        const pinchNow = dist(e.touches[0], e.touches[1]);
        const factor = pinchNow / this.pinchStart;
        let newScale = this.startScale * factor;
        newScale = Math.min(this.data.maxScale, Math.max(this.data.minScale, newScale));
        this.model.object3D.scale.set(newScale, newScale, newScale);
      }
      e.preventDefault();
    }, { passive: false });
  }
});

// -----------------------------------------------------------------------------
// 📍 GEOPOSICIÓN + CLON DEL MODELO INTERACTIVO
// -----------------------------------------------------------------------------
if (!/Mobi|Android/i.test(navigator.userAgent)) {
  document.getElementById("desktop-warning").classList.remove("hidden");
}

const radio = 15; // metros
const target = { lat: -29.477051, lon: -66.889616 };
const anchor = document.getElementById("anchor");

let modelClone = null; // el modelo 3D interactivo

// Observa la ubicación
navigator.geolocation.watchPosition(
  (pos) => {
    const lat = pos.coords.latitude;
    const lon = pos.coords.longitude;

    const distancia = calcularDistancia(lat, lon, target.lat, target.lon);
    console.log("Distancia actual: " + distancia.toFixed(2) + " m");

    const display = document.getElementById("distancia-display");
    if (display) display.innerText = "Distancia: " + distancia.toFixed(1) + " m";

    // Entró en el radio → clonar modelo
    if (distancia <= radio && !modelClone) {
      crearModeloInteractivo(anchor);
    }

    // Salió del radio → eliminar modelo
    if (distancia > radio && modelClone) {
      modelClone.parentNode.removeChild(modelClone);
      modelClone = null;
    }
  },
  (err) => console.error("Error de geolocalización:", err),
  { enableHighAccuracy: true }
);

// -----------------------------------------------------------------------------
// 🔹 FUNCIONES AUXILIARES
// -----------------------------------------------------------------------------
function crearModeloInteractivo(anchor) {
  const scene = document.querySelector("a-scene");

  // Creamos el modelo libre (clon)
  const model = document.createElement("a-entity");
  model.setAttribute("gltf-model", "./models/goku.glb");
  model.setAttribute("scale", "300 300 300");
  model.setAttribute("rotation", "0 0 0");
  model.setAttribute("gesture-controls", "rotFactor:0.35");
  scene.appendChild(model);

  // Posicionarlo donde está el anchor actualmente
  const anchorWorldPos = new THREE.Vector3();
  anchor.object3D.getWorldPosition(anchorWorldPos);

  model.object3D.position.copy(anchorWorldPos);
  model.object3D.position.y += 2; // 2 metros sobre el suelo

  modelClone = model;
  console.log("✅ Modelo 3D interactivo creado");
}

// Distancia Haversine
function calcularDistancia(lat1, lon1, lat2, lon2) {
  const R = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(Δφ / 2) ** 2 +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}







