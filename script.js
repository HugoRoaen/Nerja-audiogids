const walkTitles = [
  "Nerja algemeen", "Playa Burriana", "Iglesia de San Miguel",
  "Ermita Nuestra Señora de las Angustias", "Barco de Chanquete",
  "La Torrecilla", "Fuente de Europa", "Standbeeld van Don Quijote",
  "Iglesia de El Salvador", "Balcón de Europa",
  "Eerbetoon aan de ontdekkers van de grot van Nerja",
  "Standbeeld van koning Alfonso XII", "Standbeeld van Chanquete",
  "Playa de Calahonda"
];

const museumTitles = [
  "Bienvenido", "Los Fenicios", "Las Calzadas Romanas", "El Garum",
  "Al-Andalus", "Narya", "La seda", "La muerte de Al-Andalus",
  "La Conquista Cristiana", "Las Torres Costeras", "Los Libros de Privilegios",
  "El escudo de Nerja", "La caña de azúcar", "Maro en el siglo XVIII",
  "Verano Azul", "El descubrimiento de la cueva", "La Cueva de Nerja",
  "Los espeleotemas", "El arte rupestre", "Los habitantes de la cueva",
  "Manolo, pintor de la cueva", "Los utensilios para pintar",
  "Los materiales más antiguos", "La plaqueta del ánade", "El Magdaleniense",
  "El Neolítico", "El Calcolítico", "Los adornos corporales", "Pepita",
  "El telar", "El soliforme", "Queso y los ídolos", "Los niños rojos",
  "Tragalamocha", "El ajuar funerario", "El túmulo funerario"
];

function createCards(targetId, titles, type) {
  const target = document.getElementById(targetId);
  const label = type === "museum" ? "Museumfragment" : "Halte";
  target.innerHTML = titles.map((title, index) => {
    const number = index + 1;
    return `<article class="audio-card">
      <img src="assets/images/${type}/foto-${number}.jpg" alt="Foto bij ${label.toLowerCase()} ${number}: ${title}" loading="lazy">
      <div class="audio-content">
        <h3>${number}. ${title}</h3>
        <audio controls preload="none" aria-label="${label} ${number}: ${title}">
          <source src="assets/audio/${type}/audio-${number}.mp3" type="audio/mpeg">
          Je browser kan dit audiofragment niet afspelen.
        </audio>
      </div>
    </article>`;
  }).join("");
}

createCards("walk-list", walkTitles, "rondleiding");
createCards("museum-list", museumTitles, "museum");

document.querySelectorAll(".choice").forEach(button => {
  button.addEventListener("click", () => {
    const targetId = button.dataset.target;
    document.querySelectorAll(".choice").forEach(item => {
      const selected = item === button;
      item.classList.toggle("active", selected);
      item.setAttribute("aria-pressed", selected);
    });
    document.querySelectorAll(".guide").forEach(section => {
      const selected = section.id === targetId;
      section.classList.toggle("active", selected);
      section.hidden = !selected;
    });
    document.querySelectorAll("audio").forEach(player => player.pause());
    document.getElementById(targetId).scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

async function loadRoute() {
  if (!window.L) return;
  const map = L.map("map", { scrollWheelZoom: false });
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap"
  }).addTo(map);

  try {
    const response = await fetch("assets/route/rondleiding-nerja.gpx");
    const text = await response.text();
    const xml = new DOMParser().parseFromString(text, "application/xml");
    const points = [...xml.querySelectorAll("trkpt, rtept")].map(point => [
      Number(point.getAttribute("lat")), Number(point.getAttribute("lon"))
    ]).filter(([lat, lon]) => Number.isFinite(lat) && Number.isFinite(lon));

    if (!points.length) throw new Error("Geen routepunten gevonden");
    const route = L.polyline(points, { color: "#e15a36", weight: 5, opacity: .9 }).addTo(map);
    L.circleMarker(points[0], { radius: 7, color: "#075985", fillOpacity: 1 }).addTo(map).bindTooltip("Start");
    L.circleMarker(points[points.length - 1], { radius: 7, color: "#075985", fillOpacity: 1 }).addTo(map).bindTooltip("Einde");
    map.fitBounds(route.getBounds(), { padding: [24, 24] });
  } catch (error) {
    map.setView([36.746, -3.879], 14);
  }
}

loadRoute();
