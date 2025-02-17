const DB = {
  getUsers: () => JSON.parse(localStorage.getItem("users") || "[]"),
  saveUsers: (users) => localStorage.setItem("users", JSON.stringify(users)),

  getFlats: () => JSON.parse(localStorage.getItem("flats") || "[]"),
  saveFlats: (flats) => localStorage.setItem("flats", JSON.stringify(flats)),

  getCurrentUser: () => JSON.parse(sessionStorage.getItem("currentUser")),
  saveCurrentUser: (user) => {
    user.sessionStartTime = Date.now();
    sessionStorage.setItem("currentUser", JSON.stringify(user));
  },

  clearSession: () => sessionStorage.clear(),
};

const showError = (message) => showInteractionWindow(message);

function checkSessionTimeout() {
  const currentUser = DB.getCurrentUser();
  if (!currentUser) return;

  const loginTime = currentUser.sessionStartTime;
  const currentTime = Date.now();
  const timeElapsed = (currentTime - loginTime) / 1000;

  if (timeElapsed >= 3600) {
    showError("❗⚠️ Session expired. You have been logged out. ❗⚠️");
    logout();
  }
}

function logout() {
  DB.clearSession();
  window.location.href = "index.html";
}

window.addEventListener("load", checkSessionTimeout);

function checkAuth() {
  const currentUser = DB.getCurrentUser();
  if (!currentUser && !window.location.pathname.endsWith("index.html")) {
    window.location.href = "index.html";
  }
}

function initHeader() {
  if (document.querySelector(".header")) return;

  const currentUser = DB.getCurrentUser();
  if (!currentUser) return;

  const fontAwesomeLink = document.createElement("link");
  fontAwesomeLink.rel = "stylesheet";
  fontAwesomeLink.href =
    "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css";
  document.head.appendChild(fontAwesomeLink);

  const header = document.createElement("header");
  header.className = "header";
  header.innerHTML = `
    <a href="home.html"><h1>RentEase 🏠</h1></a>
     
    <nav class="nav-menu">
        <a href="home.html">My Flats🏡</a>
        <a href="favorite.html">My Favorite Flats❤️</a>
        <a href="all-flats.html">All Flats🏘️</a>
        <a href="new-flat.html">Add Flat📌</a>
        <a href="profile.html">Profile👨🏻‍💼</a>

        <!-- Dark mode toggle using sun and moon icons -->
        <button title="bla" id="darkModeButton" class="dark-mode-toggle">
        
            <i class="fas fa-sun" id="sunIcon"></i> <!-- Sun icon -->
            <i class="fas fa-moon" id="moonIcon" style="display: none;"></i> <!-- Moon icon (hidden initially) -->
        </button>
       
    </nav>
    <div>
        <span>✌️ Hello, ${currentUser.firstName} ${currentUser.lastName}</span>
        
        <button onclick="logout()">Logout</button>
        
    </div>
`;

  document.body.prepend(header);

  const darkModeButton = document.getElementById("darkModeButton");
  const sunIcon = document.getElementById("sunIcon");
  const moonIcon = document.getElementById("moonIcon");
  darkModeButton.addEventListener("click", toggleDarkMode);

  const userThemeKey = `theme_${currentUser.id}`;

  if (localStorage.getItem(userThemeKey) === "dark") {
    document.body.classList.add("dark-mode");
    sunIcon.style.display = "none";
    moonIcon.style.display = "inline";
  } else {
    document.body.classList.remove("dark-mode");
    sunIcon.style.display = "inline";
    moonIcon.style.display = "none";
  }

  function toggleDarkMode() {
    if (document.body.classList.contains("dark-mode")) {
      document.body.classList.remove("dark-mode");
      sunIcon.style.display = "inline";
      moonIcon.style.display = "none";

      localStorage.setItem(userThemeKey, "light");
    } else {
      document.body.classList.add("dark-mode");
      sunIcon.style.display = "none";
      moonIcon.style.display = "inline";

      localStorage.setItem(userThemeKey, "dark");
    }
  }
}

function toggleDarkMode() {
  const body = document.body;
  const darkModeButton = document.getElementById("darkModeButton");

  if (body.classList.contains("dark-mode")) {
    body.classList.remove("dark-mode");
    darkModeButton.textContent = "Dark Mode";
    localStorage.setItem("theme", "light");
  } else {
    body.classList.add("dark-mode");
    darkModeButton.textContent = "Light Mode";
    localStorage.setItem("theme", "dark");
  }
}

async function generateKey() {
  const keyMaterial = await crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );

  const exportedKey = await crypto.subtle.exportKey("raw", keyMaterial);
  const keyBase64 = btoa(String.fromCharCode(...new Uint8Array(exportedKey)));

  localStorage.setItem("encryptionKey", keyBase64);
}

async function getStoredKey() {
  const keyBase64 = localStorage.getItem("encryptionKey");
  if (!keyBase64) return null;

  const keyBytes = Uint8Array.from(atob(keyBase64), (c) => c.charCodeAt(0));
  return crypto.subtle.importKey("raw", keyBytes, { name: "AES-GCM" }, false, [
    "encrypt",
    "decrypt",
  ]);
}

async function encryptPassword(password) {
  const key = await getStoredKey();
  if (!key) {
    showError("❗⚠️ Encryption key missing. Please generate a key. ❗⚠️");
    return null;
  }

  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoder = new TextEncoder();
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoder.encode(password)
  );

  return {
    encryptedPassword: btoa(String.fromCharCode(...new Uint8Array(encrypted))),
    iv: btoa(String.fromCharCode(...iv)),
  };
}

async function decryptPassword(encryptedPassword, iv) {
  const key = await getStoredKey();
  if (!key) {
    showError("❗⚠️ Encryption key missing. ❗⚠️");
    return null;
  }

  try {
    const ivData = Uint8Array.from(atob(iv), (c) => c.charCodeAt(0));
    const encryptedData = Uint8Array.from(atob(encryptedPassword), (c) =>
      c.charCodeAt(0)
    );

    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: ivData },
      key,
      encryptedData
    );

    return new TextDecoder().decode(decrypted);
  } catch (error) {
    return null;
  }
}

if (!localStorage.getItem("encryptionKey")) {
  generateKey();
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
  maxLength: (input, max = 40) => input.length <= max,
};
