document
  .getElementById("loginForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const users = DB.getUsers();
    const user = users.find((u) => u.email === email);

    const showError = (message) => showInteractionWindow(message);

    if (!user) {
      showError("❗⚠️ User not found ❗⚠️");
      return;
    }

    const decryptedPassword = await decryptPassword(user.password, user.iv);

    if (decryptedPassword !== password) {
      showError("❗⚠️ Invalid email or password ❗⚠️");
      return;
    }

    DB.saveCurrentUser(user);
    window.location.href = "home.html";
  });

document
  .getElementById("registerButton")
  .addEventListener("click", function () {
    window.location.href = "register.html";
  });
