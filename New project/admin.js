const OWNER_LISTINGS_KEY = "local-saarthi-owner-listings";
const ADMIN_LOGIN_ID = "localsaarthiadmin";
const ADMIN_LOGIN_PASSWORD = "admin@123";

const totalCountNode = document.getElementById("total-count");
const pendingCountNode = document.getElementById("pending-count");
const approvedCountNode = document.getElementById("approved-count");
const rejectedCountNode = document.getElementById("rejected-count");
const pendingListNode = document.getElementById("pending-list");
const approvedListNode = document.getElementById("approved-list");
const rejectedListNode = document.getElementById("rejected-list");
const loginView = document.getElementById("login-view");
const dashboardView = document.getElementById("dashboard-view");
const loginForm = document.getElementById("login-form");
const loginMessage = document.getElementById("login-message");
const adminIdInput = document.getElementById("admin-id");
const adminPasswordInput = document.getElementById("admin-password");
const logoutBtn = document.getElementById("logout-btn");
const adminNavActions = document.getElementById("admin-nav-actions");
let isAuthenticated = false;

const listings = loadListings();
saveListings();
initAuth();

function initAuth() {
  if (!loginView || !dashboardView || !loginForm) return;
  showLogin();
}

function showLogin() {
  isAuthenticated = false;
  loginView.hidden = false;
  dashboardView.hidden = true;
  loginView.classList.remove("hidden");
  dashboardView.classList.add("hidden");
  loginView.style.display = "";
  dashboardView.style.display = "none";
  if (logoutBtn) logoutBtn.classList.add("hidden");
  if (adminNavActions) {
    adminNavActions.hidden = true;
    adminNavActions.classList.add("hidden");
    adminNavActions.style.display = "none";
  }
}

function showDashboard() {
  isAuthenticated = true;
  loginView.hidden = true;
  dashboardView.hidden = false;
  loginView.classList.add("hidden");
  dashboardView.classList.remove("hidden");
  loginView.style.display = "none";
  dashboardView.style.display = "";
  if (logoutBtn) logoutBtn.classList.remove("hidden");
  if (adminNavActions) {
    adminNavActions.hidden = false;
    adminNavActions.classList.remove("hidden");
    adminNavActions.style.display = "flex";
  }
  renderDashboard();
}

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
    facilities: Array.isArray(item.facilities) ? item.facilities : [],
    coverPhoto,
    photos: undefined
  };
}

function saveListings() {
  localStorage.setItem(OWNER_LISTINGS_KEY, JSON.stringify(listings));
}

function escapeHTML(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function renderEmpty(node, message) {
  node.innerHTML = `<div class="empty">${message}</div>`;
}

function renderDashboard() {
  const pending = listings.filter((item) => item.status === "pending");
  const approved = listings.filter((item) => item.status === "approved");
  const rejected = listings.filter((item) => item.status === "rejected");

  totalCountNode.textContent = String(listings.length);
  pendingCountNode.textContent = String(pending.length);
  approvedCountNode.textContent = String(approved.length);
  rejectedCountNode.textContent = String(rejected.length);

  renderPending(pending);
  renderApproved(approved);
  renderRejected(rejected);
}

function renderPending(pending) {
  if (pending.length === 0) {
    renderEmpty(pendingListNode, "No pending listings.");
    return;
  }

  pendingListNode.innerHTML = pending
    .slice()
    .reverse()
    .map(
      (item) => `
      <article class="listing-item">
        <h3>${escapeHTML(item.pgName || "Unnamed PG")}</h3>
        <p>${escapeHTML(item.location || "Unknown location")} | ${escapeHTML(item.address || "No address")}</p>
        <p>${escapeHTML(item.description || "No description")}</p>
        <div class="listing-meta">
          <span>Rent: INR ${Number(item.rent || 0).toLocaleString("en-IN")}/mo</span>
          <span>${escapeHTML(item.roomType || "Room type N/A")}</span>
          <span>Owner: ${escapeHTML(item.ownerName || "N/A")}</span>
          <span>Submitted: ${formatDate(item.createdAt)}</span>
        </div>
        <div class="actions">
          <button class="btn" data-action="approve" data-id="${item.id}">Approve</button>
          <button class="btn btn-reject" data-action="reject" data-id="${item.id}">Reject</button>
        </div>
      </article>
    `
    )
    .join("");
}

function renderApproved(approved) {
  if (approved.length === 0) {
    renderEmpty(approvedListNode, "No approved listings yet.");
    return;
  }

  approvedListNode.innerHTML = approved
    .slice()
    .reverse()
    .slice(0, 10)
    .map(
      (item) => `
      <article class="listing-item">
        <h3>${escapeHTML(item.pgName || "Unnamed PG")}</h3>
        <p>${escapeHTML(item.location || "Unknown location")}</p>
        <div class="listing-meta">
          <span class="status status-approved">Approved</span>
          <span>On: ${formatDate(item.approvedAt)}</span>
        </div>
      </article>
    `
    )
    .join("");
}

function renderRejected(rejected) {
  if (rejected.length === 0) {
    renderEmpty(rejectedListNode, "No rejected listings yet.");
    return;
  }

  rejectedListNode.innerHTML = rejected
    .slice()
    .reverse()
    .slice(0, 10)
    .map(
      (item) => `
      <article class="listing-item">
        <h3>${escapeHTML(item.pgName || "Unnamed PG")}</h3>
        <p>${escapeHTML(item.location || "Unknown location")}</p>
        <div class="listing-meta">
          <span class="status status-rejected">Rejected</span>
          <span>On: ${formatDate(item.rejectedAt)}</span>
        </div>
      </article>
    `
    )
    .join("");
}

function updateStatus(id, nextStatus) {
  const index = listings.findIndex((item) => item.id === id);
  if (index < 0) return;

  listings[index].status = nextStatus;
  if (nextStatus === "approved") {
    listings[index].approvedAt = new Date().toISOString();
    listings[index].rejectedAt = null;
  } else {
    listings[index].rejectedAt = new Date().toISOString();
    listings[index].approvedAt = null;
  }

  saveListings();
  renderDashboard();
}

pendingListNode.addEventListener("click", (event) => {
  if (!isAuthenticated) return;
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;

  const action = target.dataset.action;
  const id = target.dataset.id;
  if (!action || !id) return;

  if (action === "approve") updateStatus(id, "approved");
  if (action === "reject") updateStatus(id, "rejected");
});

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const id = (adminIdInput?.value || "").trim();
  const password = adminPasswordInput?.value || "";

  if (id === ADMIN_LOGIN_ID && password === ADMIN_LOGIN_PASSWORD) {
    loginMessage.textContent = "";
    showDashboard();
    loginForm.reset();
    return;
  }

  loginMessage.textContent = "Invalid credentials. Please try again.";
});

logoutBtn?.addEventListener("click", () => {
  showLogin();
});
