const OWNER_LISTINGS_KEY = "local-saarthi-owner-listings";
const STATUS_LABELS = {
  pending: "Pending Approval",
  approved: "Approved",
  rejected: "Rejected"
};

const ownerForm = document.getElementById("owner-form");
const listingsNode = document.getElementById("owner-listings");
const messageNode = document.getElementById("owner-message");
const photoInput = document.getElementById("pg-photos");
const previewNode = document.getElementById("photo-preview");

const listings = loadListings();
saveListings();

function loadListings() {
  try {
    const parsed = JSON.parse(localStorage.getItem(OWNER_LISTINGS_KEY) || "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalizeListing);
  } catch {
    return [];
  }
}

function makeListingId() {
  return `listing-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeListing(raw) {
  const item = raw && typeof raw === "object" ? raw : {};
  const legacyPhotos = Array.isArray(item.photos) ? item.photos : [];
  const coverPhoto = typeof item.coverPhoto === "string" ? item.coverPhoto : legacyPhotos[0] || "";
  return {
    ...item,
    id: item.id || makeListingId(),
    status: item.status === "approved" || item.status === "rejected" ? item.status : "pending",
    createdAt: item.createdAt || new Date().toISOString(),
    approvedAt: item.approvedAt || null,
    rejectedAt: item.rejectedAt || null,
    photoCount: Number(item.photoCount || 0),
    coverPhoto,
    photos: undefined
  };
}

function saveListings() {
  localStorage.setItem(OWNER_LISTINGS_KEY, JSON.stringify(listings));
}

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Unable to read image file"));
    reader.readAsDataURL(file);
  });
}

function compressDataURL(dataUrl, maxEdge = 960, quality = 0.72) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const maxDim = Math.max(image.width, image.height) || 1;
      const scale = maxDim > maxEdge ? maxEdge / maxDim : 1;
      const width = Math.max(1, Math.round(image.width * scale));
      const height = Math.max(1, Math.round(image.height * scale));

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas unavailable"));
        return;
      }

      ctx.drawImage(image, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    image.onerror = () => reject(new Error("Unable to process image"));
    image.src = dataUrl;
  });
}

async function readListingCoverPhoto(files) {
  const first = [...files][0];
  if (!first) return "";
  const rawDataURL = await readFileAsDataURL(first);
  if (!rawDataURL.startsWith("data:image/")) return "";
  return compressDataURL(rawDataURL);
}

function escapeHTML(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderListings() {
  if (listings.length === 0) {
    listingsNode.innerHTML = '<div class="owner-item"><p>No listings submitted yet.</p></div>';
    return;
  }

  listingsNode.innerHTML = [...listings]
    .reverse()
    .slice(0, 8)
    .map((item) => {
      const rent = Number(item.rent || 0);
      const submittedOn = new Date(item.createdAt).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      });
      return `
      <article class="owner-item">
        <h3>${escapeHTML(item.pgName)}</h3>
        <p>${escapeHTML(item.location)} | ${escapeHTML(item.address)}</p>
        <p>${escapeHTML(item.description)}</p>
        <p class="owner-status owner-status-${item.status}">
          ${STATUS_LABELS[item.status] || STATUS_LABELS.pending}
        </p>
        <div class="owner-meta">
          <span>INR ${rent.toLocaleString("en-IN")}/mo</span>
          <span>${escapeHTML(item.roomType)}</span>
          <span>${item.photoCount} photos</span>
          <span>Submitted ${submittedOn}</span>
        </div>
      </article>
    `;
    })
    .join("");
}

function getSelectedFacilities() {
  return [...document.querySelectorAll(".facilities input:checked")].map((cb) => cb.value);
}

function previewImages(files) {
  previewNode.innerHTML = "";
  [...files].slice(0, 6).forEach((file) => {
    const img = document.createElement("img");
    img.src = URL.createObjectURL(file);
    img.alt = file.name;
    previewNode.appendChild(img);
  });
}

photoInput.addEventListener("change", () => {
  previewImages(photoInput.files || []);
});

ownerForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  messageNode.textContent = "";

  const selectedPhotoCount = Math.min((photoInput.files || []).length, 6);
  let coverPhoto = "";
  try {
    coverPhoto = await readListingCoverPhoto(photoInput.files || []);
  } catch {
    messageNode.textContent = "Photo process nahi ho payi. Please try again.";
    return;
  }

  const listing = {
    id: makeListingId(),
    ownerName: document.getElementById("owner-name").value.trim(),
    phone: document.getElementById("owner-phone").value.trim(),
    email: document.getElementById("owner-email").value.trim(),
    pgName: document.getElementById("pg-name").value.trim(),
    location: document.getElementById("pg-location").value.trim(),
    address: document.getElementById("pg-address").value.trim(),
    rent: document.getElementById("pg-rent").value.trim(),
    deposit: document.getElementById("pg-deposit").value.trim(),
    roomType: document.getElementById("pg-room-type").value,
    facilities: getSelectedFacilities(),
    description: document.getElementById("pg-description").value.trim(),
    photoCount: selectedPhotoCount,
    coverPhoto,
    createdAt: new Date().toISOString(),
    approvedAt: null,
    rejectedAt: null,
    status: "pending"
  };

  try {
    listings.push(listing);
    saveListings();
    renderListings();
  } catch {
    listings.pop();
    messageNode.textContent = "Image size zyada hai. Kam ya chhoti photos upload karein.";
    return;
  }

  ownerForm.reset();
  previewNode.innerHTML = "";
  messageNode.textContent = "Listing submitted. Status: Pending Approval. Admin approval ke baad Finder me visible hogi.";
});

renderListings();
