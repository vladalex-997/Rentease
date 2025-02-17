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

let currentPageFlats = 1;
const flatsPerPage = 5;
let filterValuesFlats = {
  city: "",
  minPrice: 0,
  maxPrice: Infinity,
  minArea: 0,
  maxArea: Infinity,
  yearBuilt: 0,
  hasAC: false,
};

function renderFlats(filteredFlats = null) {
  const flats = filteredFlats || DB.getFlats();

  const filteredWithValues = flats.filter((flat) => {
    return (
      flat.city.toLowerCase().includes(filterValuesFlats.city) &&
      flat.rentPrice >= filterValuesFlats.minPrice &&
      flat.rentPrice <= filterValuesFlats.maxPrice &&
      flat.areaSize >= filterValuesFlats.minArea &&
      flat.areaSize <= filterValuesFlats.maxArea &&
      flat.yearBuilt >= filterValuesFlats.yearBuilt &&
      (!filterValuesFlats.hasAC || flat.hasAC)
    );
  });

  const totalPages = Math.ceil(filteredWithValues.length / flatsPerPage);

  const startIndex = (currentPageFlats - 1) * flatsPerPage;
  const endIndex = startIndex + flatsPerPage;
  const flatsToDisplay = filteredWithValues.slice(startIndex, endIndex);

  const user = DB.getCurrentUser();
  const tbody = document.querySelector("#flatsTable tbody");
  tbody.innerHTML = "";

  flatsToDisplay.forEach((flat) => {
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

  renderPaginationControls(totalPages);
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
  filterValuesFlats.city = document
    .getElementById("cityFilter")
    .value.toLowerCase();
  filterValuesFlats.minPrice =
    parseFloat(document.getElementById("minPrice").value) || 0;
  filterValuesFlats.maxPrice =
    parseFloat(document.getElementById("maxPrice").value) || Infinity;
  filterValuesFlats.minArea =
    parseFloat(document.getElementById("minArea").value) || 0;
  filterValuesFlats.maxArea =
    parseFloat(document.getElementById("maxArea").value) || Infinity;
  filterValuesFlats.yearBuilt =
    parseInt(document.getElementById("yearBuiltFilter").value) || 0;
  filterValuesFlats.hasAC = document.getElementById("hasACFilter").checked;

  currentPageFlats = 1;

  renderFlats();
}

function sortFlats(key) {
  const flats = DB.getFlats();
  flats.sort((a, b) => (a[key] > b[key] ? 1 : -1));
  renderFlats(flats);
}

function renderPaginationControls(totalPages) {
  const pagination = document.getElementById("pagination");
  pagination.innerHTML = "";

  const prevButton = document.createElement("button");
  prevButton.textContent = "←";
  prevButton.classList.add("prev");
  prevButton.disabled = currentPageFlats === 1;
  prevButton.addEventListener("click", () => {
    if (currentPageFlats > 1) {
      currentPageFlats--;
      renderFlats();
    }
  });

  const nextButton = document.createElement("button");
  nextButton.textContent = "→";
  nextButton.classList.add("next");
  nextButton.disabled = currentPageFlats === totalPages;
  nextButton.addEventListener("click", () => {
    if (currentPageFlats < totalPages) {
      currentPageFlats++;
      renderFlats();
    }
  });

  pagination.appendChild(prevButton);

  const pageButtons = [];
  if (totalPages <= 5) {
    for (let i = 1; i <= totalPages; i++) {
      pageButtons.push(i);
    }
  } else {
    if (currentPageFlats <= 3) {
      pageButtons.push(1, 2, 3, "...", totalPages);
    } else if (currentPageFlats >= totalPages - 2) {
      pageButtons.push(1, "...", totalPages - 2, totalPages - 1, totalPages);
    } else {
      pageButtons.push(
        1,
        "...",
        currentPageFlats - 1,
        currentPageFlats,
        currentPageFlats + 1,
        "...",
        totalPages
      );
    }
  }

  pageButtons.forEach((page) => {
    const pageButton = document.createElement("button");
    pageButton.textContent = page;
    pageButton.classList.add("page-button");
    if (page === currentPageFlats) pageButton.classList.add("active");
    pageButton.addEventListener("click", () => {
      if (page === "...") return;
      currentPageFlats = page;
      renderFlats();
    });
    pagination.appendChild(pageButton);
  });

  pagination.appendChild(nextButton);
}
