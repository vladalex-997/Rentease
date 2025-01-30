document
  .getElementById("registerForm")
  .addEventListener("submit", function (e) {
    e.preventDefault();

    const user = {
      firstName: document.getElementById("firstName").value,
      lastName: document.getElementById("lastName").value,
      email: document.getElementById("email").value,
      birthDate: document.getElementById("birthDate").value,
      password: document.getElementById("password").value,
      favorites: [],
    };

    const showError = (message) => {
      alert(message);
    };

    if (!Validator.email(user.email)) {
      showError("Invalid email format");
      return;
    }

    if (!Validator.age(user.birthDate)) {
      showError("You must be between 18-120 years old");
      return;
    }

    if (!Validator.password(user.password)) {
      showError(
        "Password must contain at least 6 characters with letters, numbers, and special characters"
      );
      return;
    }

    if (user.password !== document.getElementById("confirmPassword").value) {
      showError("Passwords do not match");
      return;
    }

    const users = DB.getUsers();
    if (users.some((u) => u.email === user.email)) {
      showError("Email already registered");
      return;
    }

    users.push(user);
    DB.saveUsers(users);
    DB.saveCurrentUser(user);

    setTimeout(() => {
      window.location.href = "home.html";
    }, 1000);
  });
