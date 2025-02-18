document.addEventListener("DOMContentLoaded", () => {
  checkAuth();
  initHeader();
  renderAllFlats();

  document
    .getElementById("applyFilters")
    .addEventListener("click", filterFlats);
});

let editingFlatId = null;
let currentPage = 1;
const flatsPerPage = 3;

let filterValues = {
  city: "",
  minPrice: 0,
  maxPrice: Infinity,
  minArea: 0,
  maxArea: Infinity,
  yearBuilt: 0,
  hasAC: false,
};

let sortColumn = null;
let sortDirection = "asc";

function renderAllFlats(filteredFlats = null) {
  const user = DB.getCurrentUser();
  const flats = DB.getFlats();

  let flatsToProcess = filteredFlats || flats;

  let filteredWithValues = flatsToProcess.filter((flat) => {
    return (
      flat.ownerId === user.id &&
      flat.city.toLowerCase().includes(filterValues.city) &&
      flat.rentPrice >= filterValues.minPrice &&
      flat.rentPrice <= filterValues.maxPrice &&
      flat.areaSize >= filterValues.minArea &&
      flat.areaSize <= filterValues.maxArea &&
      flat.yearBuilt >= filterValues.yearBuilt &&
      (!filterValues.hasAC || flat.hasAC)
    );
  });

  if (sortColumn) {
    filteredWithValues.sort((a, b) => {
      let valueA = a[sortColumn];
      let valueB = b[sortColumn];

      if (typeof valueA === "string") valueA = valueA.toLowerCase();
      if (typeof valueB === "string") valueB = valueB.toLowerCase();

      if (valueA < valueB) return sortDirection === "asc" ? -1 : 1;
      if (valueA > valueB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }

  const totalPages = Math.ceil(filteredWithValues.length / flatsPerPage);
  const startIndex = (currentPage - 1) * flatsPerPage;
  const endIndex = startIndex + flatsPerPage;
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
      <td>
        <button class="edit" onclick="editFlat('${flat.id}')">Edit</button>
        <button class="danger" onclick="removeFlat('${flat.id}')">Remove</button>
      </td>
    `;
    tbody.appendChild(row);
  });

  renderPaginationControls(totalPages);
}

function removeFlat(flatId) {
  const user = DB.getCurrentUser();
  let flats = DB.getFlats();
  const flat = flats.find((flat) => flat.id === flatId);

  if (flat && flat.ownerId === user.id) {
    flats = flats.filter((flat) => flat.id !== flatId);
    DB.saveFlats(flats);
    renderAllFlats();
  } else {
    alert("You are not authorized to remove this flat.");
  }
}

function editFlat(flatId) {
  const user = DB.getCurrentUser();
  const flats = DB.getFlats();
  const flat = flats.find((f) => f.id === flatId);

  if (!flat) return;

  if (flat.ownerId !== user.id) {
    alert("You are not authorized to edit this flat.");
    return;
  }

  editingFlatId = flatId;

  document.getElementById("editCity").value = flat.city;
  document.getElementById("editStreetName").value = flat.streetName;
  document.getElementById("editStreetNumber").value = flat.streetNumber;
  document.getElementById("editAreaSize").value = flat.areaSize;
  document.getElementById("editRentPrice").value = flat.rentPrice;
  document.getElementById("editYearBuilt").value = flat.yearBuilt;
  document.getElementById("editHasAC").checked = flat.hasAC;

  document.getElementById("editModal").style.display = "block";
}

document.getElementById("saveEdit").addEventListener("click", () => {
  if (!editingFlatId) return;

  let flats = DB.getFlats();
  const flatIndex = flats.findIndex((f) => f.id === editingFlatId);
  if (flatIndex === -1) return;

  flats[flatIndex] = {
    ...flats[flatIndex],
    city: document.getElementById("editCity").value,
    streetName: document.getElementById("editStreetName").value,
    streetNumber: document.getElementById("editStreetNumber").value,
    areaSize: parseFloat(document.getElementById("editAreaSize").value),
    rentPrice: parseFloat(document.getElementById("editRentPrice").value),
    yearBuilt: parseInt(document.getElementById("editYearBuilt").value),
    hasAC: document.getElementById("editHasAC").checked,
  };

  DB.saveFlats(flats);
  document.getElementById("editModal").style.display = "none";
  renderAllFlats();
});

document.getElementById("cancelEdit").addEventListener("click", () => {
  document.getElementById("editModal").style.display = "none";
});

function filterFlats() {
  filterValues.city = document.getElementById("cityFilter").value.toLowerCase();
  filterValues.minPrice =
    parseFloat(document.getElementById("minPrice").value) || 0;
  filterValues.maxPrice =
    parseFloat(document.getElementById("maxPrice").value) || Infinity;
  filterValues.minArea =
    parseFloat(document.getElementById("minArea").value) || 0;
  filterValues.maxArea =
    parseFloat(document.getElementById("maxArea").value) || Infinity;
  filterValues.yearBuilt =
    parseInt(document.getElementById("yearBuiltFilter").value) || 0;
  filterValues.hasAC = document.getElementById("hasACFilter").checked;

  currentPage = 1;
  renderAllFlats();
}

function renderPaginationControls(totalPages) {
  const pagination = document.getElementById("pagination");
  pagination.innerHTML = "";

  const prevButton = document.createElement("button");
  prevButton.textContent = "←";
  prevButton.classList.add("prev");
  prevButton.disabled = currentPage === 1;
  prevButton.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      renderAllFlats();
    }
  });

  const nextButton = document.createElement("button");
  nextButton.textContent = "→";
  nextButton.classList.add("next");
  nextButton.disabled = currentPage === totalPages;
  nextButton.addEventListener("click", () => {
    if (currentPage < totalPages) {
      currentPage++;
      renderAllFlats();
    }
  });

  pagination.appendChild(prevButton);

  const pageButtons = [];
  if (totalPages <= 5) {
    for (let i = 1; i <= totalPages; i++) {
      pageButtons.push(i);
    }
  } else {
    if (currentPage <= 3) {
      pageButtons.push(1, 2, 3, "...", totalPages);
    } else if (currentPage >= totalPages - 2) {
      pageButtons.push(1, "...", totalPages - 2, totalPages - 1, totalPages);
    } else {
      pageButtons.push(
        1,
        "...",
        currentPage - 1,
        currentPage,
        currentPage + 1,
        "...",
        totalPages
      );
    }
  }

  pageButtons.forEach((page) => {
    const pageButton = document.createElement("button");
    pageButton.textContent = page;
    pageButton.classList.add("page-button");
    if (page === currentPage) pageButton.classList.add("active");
    pageButton.addEventListener("click", () => {
      if (page === "...") return;
      currentPage = page;
      renderAllFlats();
    });
    pagination.appendChild(pageButton);
  });

  pagination.appendChild(nextButton);
}

function sortFlats(column) {
  if (sortColumn === column) {
    sortDirection = sortDirection === "asc" ? "desc" : "asc";
  } else {
    sortColumn = column;
    sortDirection = "asc";
  }

  document.querySelectorAll("th").forEach((th) => {
    th.innerHTML = th.innerHTML.replace(/( 🔼| 🔽)/g, "");
  });

  const header = document.querySelector(`th[onclick="sortFlats('${column}')"]`);
  if (header) {
    header.innerHTML += sortDirection === "asc" ? " 🔼" : " 🔽";
  }

  currentPage = 1;
  renderAllFlats();
}
