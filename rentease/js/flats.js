function addFavorite(flatId) {
  const user = DB.getCurrentUser();
  if (!user.favorites.includes(flatId)) {
    user.favorites.push(flatId);
    const users = DB.getUsers();
    const index = users.findIndex((u) => u.email === user.email);
    users[index] = user;
    DB.saveUsers(users);
    DB.saveCurrentUser(user);
  }
}

function removeFavorite(flatId) {
  const user = DB.getCurrentUser();
  user.favorites = user.favorites.filter((id) => id !== flatId);
  const users = DB.getUsers();
  const index = users.findIndex((u) => u.email === user.email);
  users[index] = user;
  DB.saveUsers(users);
  DB.saveCurrentUser(user);
}
