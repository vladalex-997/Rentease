document.addEventListener("DOMContentLoaded", () => {
  checkAuth();
  initHeader();

  const user = DB.getCurrentUser();
  document.getElementById("firstName").value = user.firstName;
  document.getElementById("lastName").value = user.lastName;
  document.getElementById("email").value = user.email;
  document.getElementById("birthDate").value = user.birthDate;
});

document.getElementById("profileForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const updatedUser = {
    ...DB.getCurrentUser(),
    firstName: document.getElementById("firstName").value,
    lastName: document.getElementById("lastName").value,
    email: document.getElementById("email").value,
    birthDate: document.getElementById("birthDate").value,
    password:
      document.getElementById("password").value || DB.getCurrentUser().password,
  };

  const showError = (message) => {
    alert(message);
  };

  if (!Validator.email(updatedUser.email)) {
    showError("Invalid email format");
    return;
  }

  if (!Validator.age(updatedUser.birthDate)) {
    showError("You must be between 18-120 years old");
    return;
  }

  if (!Validator.password(updatedUser.password)) {
    showError(
      "Password must contain at least 6 characters with letters, numbers, and special characters"
    );
    return;
  }

  const users = DB.getUsers();
  const index = users.findIndex((u) => u.email === updatedUser.email);
  if (index !== -1 && users[index].email !== DB.getCurrentUser().email) {
    showError("Email already registered");
    return;
  }

  users[users.findIndex((u) => u.email === DB.getCurrentUser().email)] =
    updatedUser;
  DB.saveUsers(users);
  DB.saveCurrentUser(updatedUser);

  window.location.href = "home.html";
});
