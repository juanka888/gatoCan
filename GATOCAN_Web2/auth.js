(function () {
    const USERS_KEY = "gatocanUsers";
    const SESSION_KEY = "gatocanSession";

    function getUsers() {
        try {
            return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
        } catch {
            return [];
        }
    }

    function saveUsers(users) {
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }

    function showMessage(element, text, type) {
        if (!element) return;
        element.textContent = text;
        element.classList.remove("success", "error");
        element.classList.add(type);
    }

    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", function (event) {
            event.preventDefault();
            const message = document.getElementById("loginMessage");
            const username = document.getElementById("loginUser").value.trim();
            const password = document.getElementById("loginPass").value;

            const users = getUsers();
            const foundUser = users.find((user) => user.username === username && user.password === password);
            const demoAccess = username === "admin" && password === "gatocan123";

            if (foundUser || demoAccess) {
                localStorage.setItem(SESSION_KEY, JSON.stringify({ user: username, loggedAt: new Date().toISOString() }));
                showMessage(message, "Acceso correcto. Redirigiendo al inicio...", "success");
                setTimeout(function () {
                    window.location.href = "./index.html#inicio";
                }, 1000);
                return;
            }

            showMessage(message, "Usuario o contraseña incorrectos.", "error");
        });
    }

    const registerForm = document.getElementById("registerForm");
    if (registerForm) {
        registerForm.addEventListener("submit", function (event) {
            event.preventDefault();
            const message = document.getElementById("registerMessage");

            const fullName = document.getElementById("fullName").value.trim();
            const email = document.getElementById("email").value.trim().toLowerCase();
            const username = document.getElementById("regUser").value.trim();
            const password = document.getElementById("regPass").value;
            const confirmPassword = document.getElementById("confirmPass").value;

            if (!fullName || !email || !username || !password) {
                showMessage(message, "Todos los campos son obligatorios.", "error");
                return;
            }

            if (password.length < 6) {
                showMessage(message, "La contraseña debe tener al menos 6 caracteres.", "error");
                return;
            }

            if (password !== confirmPassword) {
                showMessage(message, "Las contraseñas no coinciden.", "error");
                return;
            }

            const users = getUsers();
            const exists = users.some((user) => user.username === username || user.email === email);
            if (exists) {
                showMessage(message, "El usuario o el correo ya está registrado.", "error");
                return;
            }

            users.push({ fullName, email, username, password, provider: "local" });
            saveUsers(users);
            showMessage(message, "Registro completado. Ahora puedes iniciar sesión.", "success");
            registerForm.reset();
        });
    }

    const googleButton = document.getElementById("googleRegister");
    if (googleButton) {
        googleButton.addEventListener("click", function () {
            window.open("https://accounts.google.com/signup", "_blank", "noopener,noreferrer");
            const message = document.getElementById("registerMessage");
            showMessage(message, "Se abrió Google para crear tu cuenta. Luego vuelve e inicia sesión o completa el registro local.", "success");
        });
    }
})();
