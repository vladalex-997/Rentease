document.addEventListener("DOMContentLoaded", () => {
  checkAuth();
  initHeader();
});

document.getElementById("flatForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const showError = (message) => showInteractionWindow(message);

  const currentYear = new Date().getFullYear();

  const yearBuilt = parseInt(document.getElementById("yearBuilt").value);

  if (isNaN(yearBuilt) || yearBuilt < 1800 || yearBuilt > currentYear) {
    showError(
      "❌ Please enter a valid year between 1800 and the current year. ❌"
    );
    return;
  }

  const user = DB.getCurrentUser();

  const flat = {
    id: Date.now().toString(),
    city: document.getElementById("city").value,
    streetName: document.getElementById("streetName").value,
    streetNumber: document.getElementById("streetNumber").value,
    areaSize: document.getElementById("areaSize").value,
    rentPrice: document.getElementById("rentPrice").value,
    hasAC: document.getElementById("hasAC").checked,
    yearBuilt: yearBuilt,
    dateAvailable: new Date().toISOString(),
    ownerId: user.id,
  };

  const flats = DB.getFlats();
  flats.push(flat);
  DB.saveFlats(flats);

  user.favorites.push(flat.id);
  const users = DB.getUsers();
  const index = users.findIndex((u) => u.email === user.email);
  users[index] = user;
  DB.saveUsers(users);
  DB.saveCurrentUser(user);

  showError("✅ Flat added successfully! ✅");
});
