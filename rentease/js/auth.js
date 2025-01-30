document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    const users = DB.getUsers();
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        DB.saveCurrentUser(user);
        window.location.href = 'home.html';
    } else {
        alert('Invalid email or password');
    }
});

document.getElementById('registerButton').addEventListener('click', function() {
    window.location.href = 'register.html';
});