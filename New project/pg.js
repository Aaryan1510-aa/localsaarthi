const PG_STORAGE_KEY = "local-saarthi-selected-pg";

const detailNode = document.getElementById("pg-detail");
const params = new URLSearchParams(window.location.search);
const selectedId = params.get("id");

function loadSelectedPG() {
  try {
    const raw = localStorage.getItem(PG_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function escapeHTML(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function toINR(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(Number(value || 0));
}

function parseListParam(value) {
  return String(value || "")
    .split("||")
    .map((item) => item.trim())
    .filter(Boolean);
}

function loadSelectedPGFromParams() {
  const name = params.get("name");
  if (!name) return null;

  return {
    pgId: selectedId || "",
    name,
    location: params.get("location") || "",
    price: Number(params.get("price") || 0),
    rating: Number(params.get("rating") || 0),
    campusName: params.get("college") || "Campus Nearby",
    badge: params.get("badge") || "Verified PG",
    reviews: Number(params.get("reviews") || 0),
    ownerPhone: params.get("phone") || "+91 98765 43210",
    description: params.get("desc") || "",
    image: params.get("image") || "",
    gallery: parseListParam(params.get("gallery")),
    highlights: parseListParam(params.get("highlights")),
    girlsOnly: params.get("girlsOnly") === "1",
    scoreSet: {
      foodQuality: Number(params.get("foodQuality") || 82),
      safety: Number(params.get("safety") || 84),
      comfort: Number(params.get("comfort") || 86),
      valueForMoney: Number(params.get("valueForMoney") || 80)
    }
  };
}

function renderNotFound() {
  detailNode.innerHTML = `
    <section class="detail-card page-empty">
      <p class="eyebrow">PG Details</p>
      <h1>PG details unavailable</h1>
      <p class="subcopy">Go back to the PG finder and open a listing again.</p>
      <div class="action-row">
        <a href="index.html#demo" class="btn btn-primary">Back to PG Finder</a>
      </div>
    </section>
  `;
}

function renderPG(pg) {
  const gallery = Array.isArray(pg.gallery) ? pg.gallery.filter(Boolean).slice(0, 3) : [];
  const tags = Array.isArray(pg.highlights) ? pg.highlights : [];
  const scoreSet = pg.scoreSet || {};
  const metrics = [
    ["Food Quality", Number(scoreSet.foodQuality || 82)],
    ["Safety", Number(scoreSet.safety || 84)],
    ["Comfort", Number(scoreSet.comfort || 86)],
    ["Value for Money", Number(scoreSet.valueForMoney || 80)]
  ];

  detailNode.innerHTML = `
    <section class="detail-card detail-hero">
      <div class="media-panel">
        <img src="${escapeHTML(gallery[0] || pg.image || "")}" alt="${escapeHTML(pg.name)}" class="hero-image" />
        <div class="thumb-grid">
          ${gallery
            .slice(1)
            .map((image) => `<img src="${escapeHTML(image)}" alt="${escapeHTML(pg.name)} gallery image" />`)
            .join("")}
        </div>
      </div>

      <div class="hero-copy">
        <span class="eyebrow">${escapeHTML(pg.badge || "Verified PG")}</span>
        <h1>${escapeHTML(pg.name)}</h1>
        <p class="subcopy">${escapeHTML(pg.description || "")}</p>

        <div class="top-meta">
          <span class="meta-pill">★ ${escapeHTML(pg.rating)} rating</span>
          <span class="meta-pill">${escapeHTML(pg.reviews)} student reviews</span>
          <span class="meta-pill">${escapeHTML(pg.campusName || "Campus Nearby")}</span>
        </div>

        <div class="info-grid">
          <article class="info-card">
            <div class="info-label">Location</div>
            <div class="info-value">${escapeHTML(pg.location)}</div>
          </article>
          <article class="info-card">
            <div class="info-label">Monthly Rent</div>
            <div class="info-value">${toINR(pg.price)}/mo</div>
          </article>
          <article class="info-card">
            <div class="info-label">Category</div>
            <div class="info-value">${pg.girlsOnly ? "Girls Only PG" : "Student PG"}</div>
          </article>
          <article class="info-card">
            <div class="info-label">Owner Contact</div>
            <div class="info-value">${escapeHTML(pg.ownerPhone || "+91 98765 43210")}</div>
          </article>
        </div>

        <div class="action-row">
          <a href="tel:${escapeHTML(String(pg.ownerPhone || "").replace(/\s+/g, ""))}" class="btn btn-primary">Call PG Owner</a>
          <a href="index.html#reviews" class="btn btn-secondary">View Student Reviews</a>
        </div>
      </div>
    </section>

    <section class="section-grid">
      <article class="detail-card section-box">
        <h2>PG Info</h2>
        <p class="location-copy">
          ${escapeHTML(pg.name)} is located in ${escapeHTML(pg.location)} and is suited for students looking for reliable accommodation near ${escapeHTML(pg.campusName || "campus")}. This listing focuses on practical student needs including access, comfort, and day-to-day convenience.
        </p>
      </article>

      <article class="detail-card section-box">
        <h2>Facilities</h2>
        <div class="facility-tags">
          ${tags.map((tag) => `<span>${escapeHTML(tag)}</span>`).join("")}
          ${pg.girlsOnly ? "<span>Girls Only</span>" : ""}
        </div>
      </article>
    </section>

    <section class="detail-card section-box">
      <h2>Review Breakdown</h2>
      <div class="meter-list">
        ${metrics
          .map(
            ([label, value]) => `
              <div class="meter-row">
                <div class="meter-top">
                  <span>${escapeHTML(label)}</span>
                  <strong>${value}%</strong>
                </div>
                <div class="meter-track">
                  <div class="meter-fill" style="width:${value}%"></div>
                </div>
              </div>
            `
          )
          .join("")}
      </div>
      <p class="review-summary">
        Ratings are shown as percentage meters to make it easier for freshers to compare food quality, safety, comfort, and value for money at a glance.
      </p>
    </section>
  `;
}

const selectedPG = loadSelectedPGFromParams() || loadSelectedPG();

if (!selectedPG || (selectedId && selectedPG.pgId !== selectedId)) {
  renderNotFound();
} else {
  renderPG(selectedPG);
}
