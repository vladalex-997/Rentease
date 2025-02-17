document
  .getElementById("registerForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    function generateUserId() {
      return Math.random().toString(36).substr(2, 16);
    }

    const user = {
      id: generateUserId(),
      firstName: document.getElementById("firstName").value,
      lastName: document.getElementById("lastName").value,
      email: document.getElementById("email").value,
      birthDate: document.getElementById("birthDate").value,
      favorites: [],
    };

    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    const showError = (message) => showInteractionWindow(message);

    if (
      !Validator.maxLength(user.firstName) ||
      !Validator.maxLength(user.lastName) ||
      !Validator.maxLength(user.email) ||
      !Validator.maxLength(password) ||
      !Validator.maxLength(confirmPassword)
    ) {
      showError("❗⚠️ Each field must not exceed 40 characters ❗⚠️");
      return;
    }

    if (!Validator.email(user.email)) {
      showError("❗⚠️ Invalid email format ❗⚠️");
      return;
    }

    if (!Validator.age(user.birthDate)) {
      showError("❗⚠️ You must be between 18-120 years old ❗⚠️");
      return;
    }

    if (!Validator.password(password)) {
      showError(
        "❗⚠️ Password must contain at least 6 characters with letters, numbers, and special characters ❗⚠️"
      );
      return;
    }

    if (password !== confirmPassword) {
      showError("❗⚠️ Passwords do not match ❗⚠️");
      return;
    }

    const users = DB.getUsers();
    if (users.some((u) => u.email === user.email)) {
      showError("❗⚠️Email already registered ❗⚠️");
      return;
    }

    const encrypted = await encryptPassword(password);
    if (!encrypted) return;

    user.password = encrypted.encryptedPassword;
    user.iv = encrypted.iv;

    users.push(user);
    DB.saveUsers(users);
    DB.saveCurrentUser(user);

    setTimeout(() => {
      window.location.href = "home.html";
    }, 1000);
  });
