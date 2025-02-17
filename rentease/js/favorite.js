document.addEventListener("DOMContentLoaded", () => {
  checkAuth();
  initHeader();
  renderFavorites();

  document
    .getElementById("applyFilters")
    .addEventListener("click", filterFavorites);
});

let currentPageFavorites = 1;
const favoritesPerPage = 1;
let filterValuesFavorites = {
  city: "",
  minPrice: 0,
  maxPrice: Infinity,
  minArea: 0,
  maxArea: Infinity,
  yearBuilt: 0,
  hasAC: false,
};

function renderFavorites(filteredFlats = null) {
  const user = DB.getCurrentUser();
  const flats = DB.getFlats();
  const favorites = flats.filter((flat) => user.favorites.includes(flat.id));
  const filtered = filteredFlats || favorites;

  const filteredWithValues = filtered.filter((flat) => {
    return (
      flat.city.toLowerCase().includes(filterValuesFavorites.city) &&
      flat.rentPrice >= filterValuesFavorites.minPrice &&
      flat.rentPrice <= filterValuesFavorites.maxPrice &&
      flat.areaSize >= filterValuesFavorites.minArea &&
      flat.areaSize <= filterValuesFavorites.maxArea &&
      flat.yearBuilt >= filterValuesFavorites.yearBuilt &&
      (!filterValuesFavorites.hasAC || flat.hasAC)
    );
  });

  const totalPages = Math.ceil(filteredWithValues.length / favoritesPerPage);

  const startIndex = (currentPageFavorites - 1) * favoritesPerPage;
  const endIndex = startIndex + favoritesPerPage;
  const flatsToDisplay = filteredWithValues.slice(startIndex, endIndex);

  const tbody = document.querySelector("#favoritesTable tbody");
  tbody.innerHTML = "";

  flatsToDisplay.forEach((flat) => {
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
            <td><button class="danger" onclick="removeFavorite('${flat.id}')">Remove from Favorites</button></td>
        `;
    tbody.appendChild(row);
  });

  renderPaginationControls(totalPages);
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
  filterValuesFavorites.city = document
    .getElementById("cityFilter")
    .value.toLowerCase();
  filterValuesFavorites.minPrice =
    parseFloat(document.getElementById("minPrice").value) || 0;
  filterValuesFavorites.maxPrice =
    parseFloat(document.getElementById("maxPrice").value) || Infinity;
  filterValuesFavorites.minArea =
    parseFloat(document.getElementById("minArea").value) || 0;
  filterValuesFavorites.maxArea =
    parseFloat(document.getElementById("maxArea").value) || Infinity;
  filterValuesFavorites.yearBuilt =
    parseInt(document.getElementById("yearBuiltFilter").value) || 0;
  filterValuesFavorites.hasAC = document.getElementById("hasACFilter").checked;

  currentPageFavorites = 1;

  renderFavorites();
}

function renderPaginationControls(totalPages) {
  const pagination = document.getElementById("pagination");
  pagination.innerHTML = "";

  const prevButton = document.createElement("button");
  prevButton.textContent = "←";
  prevButton.classList.add("prev");
  prevButton.disabled = currentPageFavorites === 1;
  prevButton.addEventListener("click", () => {
    if (currentPageFavorites > 1) {
      currentPageFavorites--;
      renderFavorites();
    }
  });

  const nextButton = document.createElement("button");
  nextButton.textContent = "→";
  nextButton.classList.add("next");
  nextButton.disabled = currentPageFavorites === totalPages;
  nextButton.addEventListener("click", () => {
    if (currentPageFavorites < totalPages) {
      currentPageFavorites++;
      renderFavorites();
    }
  });

  pagination.appendChild(prevButton);

  const pageButtons = [];
  if (totalPages <= 5) {
    for (let i = 1; i <= totalPages; i++) {
      pageButtons.push(i);
    }
  } else {
    if (currentPageFavorites <= 3) {
      pageButtons.push(1, 2, 3, "...", totalPages);
    } else if (currentPageFavorites >= totalPages - 2) {
      pageButtons.push(1, "...", totalPages - 2, totalPages - 1, totalPages);
    } else {
      pageButtons.push(
        1,
        "...",
        currentPageFavorites - 1,
        currentPageFavorites,
        currentPageFavorites + 1,
        "...",
        totalPages
      );
    }
  }

  pageButtons.forEach((page) => {
    const pageButton = document.createElement("button");
    pageButton.textContent = page;
    pageButton.classList.add("page-button");
    if (page === currentPageFavorites) pageButton.classList.add("active");
    pageButton.addEventListener("click", () => {
      if (page === "...") return;
      currentPageFavorites = page;
      renderFavorites();
    });
    pagination.appendChild(pageButton);
  });

  pagination.appendChild(nextButton);
}
