document.addEventListener("DOMContentLoaded", () => {
  checkAuth();
  initHeader();
  renderFavorites();

  document
    .getElementById("applyFilters")
    .addEventListener("click", filterFavorites);
});

function renderFavorites(filteredFlats = null) {
  const user = DB.getCurrentUser();
  const flats = DB.getFlats();
  const favorites = flats.filter((flat) => user.favorites.includes(flat.id));
  const filtered = filteredFlats || favorites;

  const tbody = document.querySelector("#favoritesTable tbody");
  tbody.innerHTML = "";

  filtered.forEach((flat) => {
    const acIcon = flat.hasAC
      ? `<span style="color: green;">✔</span>`
      : `<span style="color: red;">✘</span>`;

    const row = document.createElement("tr");
    row.innerHTML = `
            <td>${flat.city}</td>
            <td>${flat.streetName} ${flat.streetNumber}</td>
            <td>${flat.areaSize} sqm</td>
            <td>$${flat.rentPrice}</td>
            <td>${acIcon}</td>
            <td>${flat.yearBuilt}</td>
            <td><button class="danger" onclick="removeFavorite('${flat.id}')">Remove</button></td>
        `;
    tbody.appendChild(row);
  });
}

function removeFavorite(flatId) {
  const user = DB.getCurrentUser();
  user.favorites = user.favorites.filter((id) => id !== flatId);
  const users = DB.getUsers();
  const index = users.findIndex((u) => u.email === user.email);
  users[index] = user;
  DB.saveUsers(users);
  DB.saveCurrentUser(user);
  renderFavorites();
}

function filterFavorites() {
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

  const user = DB.getCurrentUser();
  const flats = DB.getFlats();
  const favorites = flats.filter((flat) => user.favorites.includes(flat.id));

  const filtered = favorites.filter((flat) => {
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

  renderFavorites(filtered);
}
