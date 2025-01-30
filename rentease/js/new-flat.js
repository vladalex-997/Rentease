document.addEventListener("DOMContentLoaded", () => {
  checkAuth();
  initHeader();
});

document.getElementById("flatForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const flat = {
    id: Date.now().toString(),
    city: document.getElementById("city").value,
    streetName: document.getElementById("streetName").value,
    streetNumber: document.getElementById("streetNumber").value,
    areaSize: document.getElementById("areaSize").value,
    rentPrice: document.getElementById("rentPrice").value,
    hasAC: document.getElementById("hasAC").checked,
    yearBuilt: document.getElementById("yearBuilt").value || 2000,
    dateAvailable: new Date().toISOString(),
  };

  const flats = DB.getFlats();
  flats.push(flat);
  DB.saveFlats(flats);

  const user = DB.getCurrentUser();
  user.favorites.push(flat.id);
  const users = DB.getUsers();
  const index = users.findIndex((u) => u.email === user.email);
  users[index] = user;
  DB.saveUsers(users);
  DB.saveCurrentUser(user);

  alert("Flat added successfully!");
  window.location.href = "home.html";
});
