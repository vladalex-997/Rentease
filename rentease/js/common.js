const DB = {
  getUsers: () => JSON.parse(localStorage.getItem("users") || "[]"),
  saveUsers: (users) => localStorage.setItem("users", JSON.stringify(users)),

  getFlats: () => JSON.parse(localStorage.getItem("flats") || "[]"),
  saveFlats: (flats) => localStorage.setItem("flats", JSON.stringify(flats)),

  getCurrentUser: () => JSON.parse(sessionStorage.getItem("currentUser")),
  saveCurrentUser: (user) =>
    sessionStorage.setItem("currentUser", JSON.stringify(user)),

  clearSession: () => sessionStorage.clear(),
};

function checkAuth() {
  const currentUser = DB.getCurrentUser();
  if (!currentUser && !window.location.pathname.endsWith("index.html")) {
    window.location.href = "index.html";
  }
}

function logout() {
  DB.clearSession();
  window.location.href = "index.html";
}

function initHeader() {
  if (document.querySelector(".header")) return;

  const currentUser = DB.getCurrentUser();
  const header = document.createElement("header");
  header.className = "header";
  header.innerHTML = `
        <h1>RentEase</h1>
        <nav class="nav-menu">
            <a href="home.html">Home</a>
            <a href="all-flats.html">All Flats</a>
            <a href="new-flat.html">Add Flat</a>
            <a href="profile.html">Profile</a>
        </nav>
        <div>
            <span>Hello, ${currentUser.firstName} ${currentUser.lastName}</span>
            <button onclick="logout()">Logout</button>
        </div>
    `;
  document.body.prepend(header);
}

const Validator = {
  email: (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
  password: (password) =>
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{6,}$/.test(password),
  age: (birthDate) => {
    const ageDifMs = Date.now() - new Date(birthDate).getTime();
    const ageDate = new Date(ageDifMs);
    const age = Math.abs(ageDate.getUTCFullYear() - 1970);
    return age >= 18 && age <= 120;
  },
};
