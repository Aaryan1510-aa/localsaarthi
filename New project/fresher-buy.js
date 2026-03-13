const params = new URLSearchParams(window.location.search);
const pgName = params.get("pg") || "-";
const pgLocation = params.get("location") || "-";
const pgPrice = Number(params.get("price") || 0);
const pgRating = params.get("rating") || "-";
const pgCollege = params.get("college") || "";

const nameNode = document.getElementById("pg-name");
const locationNode = document.getElementById("pg-location");
const priceNode = document.getElementById("pg-price");
const ratingNode = document.getElementById("pg-rating");
const collegeInput = document.getElementById("student-college");
const form = document.getElementById("buy-form");
const messageNode = document.getElementById("buy-message");

nameNode.textContent = pgName;
locationNode.textContent = pgLocation;
priceNode.textContent =
  pgPrice > 0
    ? `${new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(pgPrice)}/mo`
    : "-";
ratingNode.textContent = pgRating !== "-" ? `★ ${pgRating}` : "-";

if (pgCollege) {
  collegeInput.value = pgCollege.replace(/^owner::/i, "").replaceAll("::", " ");
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  messageNode.textContent = "Request submitted successfully. Team will contact you shortly.";
  form.reset();
  if (pgCollege) {
    collegeInput.value = pgCollege.replace(/^owner::/i, "").replaceAll("::", " ");
  }
});
