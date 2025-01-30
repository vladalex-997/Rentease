document.addEventListener("DOMContentLoaded", () => {
  checkAuth();
  initHeader();
  renderFlats();

  document
    .getElementById("applyFilters")
    .addEventListener("click", filterFlats);
  document.querySelectorAll("#flatsTable th[data-sort]").forEach((th) => {
    th.addEventListener("click", () => sortFlats(th.getAttribute("data-sort")));
  });
});

function renderFlats(filteredFlats = null) {
  const flats = filteredFlats || DB.getFlats();
  const user = DB.getCurrentUser();
  const tbody = document.querySelector("#flatsTable tbody");
  tbody.innerHTML = "";

  flats.forEach((flat) => {
    const isFavorite = user.favorites.includes(flat.id);
    const acIcon = flat.hasAC
      ? `<span style="color: green;">✔</span>`
      : `<span style="color: red;">✘</span>`;

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${flat.city}</td>
      <td>${flat.streetName} ${flat.streetNumber}</td>
      <td>${flat.areaSize} sqm</td>
      <td>$${flat.rentPrice}</td>
      <td>${flat.yearBuilt}</td>
      <td>${acIcon}</td>
      <td>
        <button onclick="toggleFavorite('${flat.id}')">
          ${isFavorite ? "Unfavorite" : "Favorite"}
        </button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

function toggleFavorite(flatId) {
  const user = DB.getCurrentUser();
  if (user.favorites.includes(flatId)) {
    user.favorites = user.favorites.filter((id) => id !== flatId);
  } else {
    user.favorites.push(flatId);
  }
  const users = DB.getUsers();
  const index = users.findIndex((u) => u.email === user.email);
  users[index] = user;
  DB.saveUsers(users);
  DB.saveCurrentUser(user);
  renderFlats();
}

function filterFlats() {
  const city = document.getElementById("cityFilter").value.toLowerCase();
  const minPrice = parseFloat(document.getElementById("minPrice").value) || 0;
  const maxPrice =
    parseFloat(document.getElementById("maxPrice").value) || Infinity;
  const minArea = parseFloat(document.getElementById("minArea").value) || 0;
  const maxArea =
    parseFloat(document.getElementById("maxArea").value) || Infinity;
  const yearBuilt =
    parseInt(document.getElementById("yearBuiltFilter").value) || 0;
  const hasAC = document.getElementById("hasACFilter").checked;

  const flats = DB.getFlats().filter((flat) => {
    return (
      flat.city.toLowerCase().includes(city) &&
      flat.rentPrice >= minPrice &&
      flat.rentPrice <= maxPrice &&
      flat.areaSize >= minArea &&
      flat.areaSize <= maxArea &&
      flat.yearBuilt >= yearBuilt &&
      (!hasAC || flat.hasAC)
    );
  });

  renderFlats(flats);
}

function sortFlats(key) {
  const flats = DB.getFlats();
  flats.sort((a, b) => (a[key] > b[key] ? 1 : -1));
  renderFlats(flats);
}
