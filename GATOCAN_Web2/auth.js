(function () {
    const SESSION_KEY = "gatocanSession";
    const DEFAULT_SUPABASE_URL = "https://jjeciqwzepkmeeticihg.supabase.co";
    const DEFAULT_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpqZWNpcXd6ZXBrbWVldGljaWhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM4NDUwODksImV4cCI6MjA4OTQyMTA4OX0.GvaF1Q1-V1z4ND3saKn9ruMPqnfzlXWQT6GXOanxG_s";

    function showMessage(element, text, type) {
        if (!element) return;
        element.textContent = text;
        element.classList.remove("success", "error");
        element.classList.add(type);
    }

    function getSupabaseUrl() {
        return window.SUPABASE_URL || DEFAULT_SUPABASE_URL;
    }

    function getSupabaseAnonKey() {
        return window.SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;
    }

    function getSupabaseClient() {
        if (!window.supabase) {
            return null;
        }

        const key = getSupabaseAnonKey();
        if (!key) {
            return null;
        }

        return window.supabase.createClient(getSupabaseUrl(), key, {
            auth: {
                persistSession: true,
                autoRefreshToken: true,
                detectSessionInUrl: true,
            },
        });
    }

    function cacheSessionUser(user) {
        if (!user?.email) return;
        localStorage.setItem(
            SESSION_KEY,
            JSON.stringify({ user: user.email, loggedAt: new Date().toISOString() })
        );
    }

    async function upsertUserProfile(supabase, user, extraData) {
        const payload = {
            id: user.id,
            email: user.email,
            nombre_completo: extraData.fullName || user.user_metadata?.full_name || null,
            avatar_url: user.user_metadata?.avatar_url || null,
        };

        const { error } = await supabase.from("perfiles").upsert(payload, {
            onConflict: "id",
        });

        if (error) throw error;
    }

    async function initLogin() {
        const loginForm = document.getElementById("loginForm");
        if (!loginForm) return;

        loginForm.addEventListener("submit", async function (event) {
            event.preventDefault();
            const message = document.getElementById("loginMessage");
            const emailOrUser = document.getElementById("loginUser").value.trim();
            const password = document.getElementById("loginPass").value;
            const supabase = getSupabaseClient();

            if (!supabase) {
                showMessage(message, "No se pudo inicializar Supabase.", "error");
                return;
            }

            if (!emailOrUser.includes("@")) {
                showMessage(
                    message,
                    "Introduce tu correo electrónico para iniciar sesión.",
                    "error"
                );
                return;
            }

            const { data, error } = await supabase.auth.signInWithPassword({
                email: emailOrUser,
                password,
            });

            if (error || !data.user) {
                showMessage(message, "Usuario o contraseña incorrectos.", "error");
                return;
            }

            cacheSessionUser(data.user);
            showMessage(message, "Acceso correcto. Redirigiendo a tu perfil...", "success");
            setTimeout(function () {
                window.location.href = "./perfil.html";
            }, 900);
        });
    }

    async function initRegister() {
        const registerForm = document.getElementById("registerForm");
        if (!registerForm) return;

        registerForm.addEventListener("submit", async function (event) {
            event.preventDefault();
            const message = document.getElementById("registerMessage");

            const fullName = document.getElementById("fullName").value.trim();
            const email = document.getElementById("email").value.trim().toLowerCase();
            const password = document.getElementById("regPass").value;
            const confirmPassword = document.getElementById("confirmPass").value;
            const acceptTerms = document.getElementById("acceptTerms").checked;

            if (!fullName || !email || !password) {
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

            if (!acceptTerms) {
                showMessage(
                    message,
                    "Debes aceptar la política de privacidad para poder registrarte.",
                    "error"
                );
                return;
            }

            const supabase = getSupabaseClient();
            if (!supabase) {
                showMessage(message, "No se pudo inicializar Supabase.", "error");
                return;
            }

            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                    },
                },
            });

            if (error || !data.user) {
                showMessage(message, error?.message || "No se pudo completar el registro.", "error");
                return;
            }

            try {
                await upsertUserProfile(supabase, data.user, { fullName });
            } catch (dbError) {
                console.error(dbError);
                showMessage(
                    message,
                    "Cuenta creada, pero hubo un problema guardando datos extra en la base de datos.",
                    "error"
                );
                return;
            }

            showMessage(
                message,
                "Registro completado. Revisa tu correo para confirmar la cuenta si Supabase lo requiere.",
                "success"
            );
            registerForm.reset();
        });
    }

    function initGoogleAuth() {
        const googleButton = document.getElementById("googleRegister");
        if (!googleButton) return;

        googleButton.addEventListener("click", async function () {
            const message = document.getElementById("registerMessage");
            const supabase = getSupabaseClient();

            if (!supabase) {
                showMessage(message, "No se pudo inicializar Supabase.", "error");
                return;
            }

            const { error } = await supabase.auth.signInWithOAuth({
                provider: "google",
                options: {
                    queryParams: {
                        access_type: "offline",
                        prompt: "select_account",
                    },
                    redirectTo: new URL("./perfil.html", window.location.href).href,
                },
            });

            if (error) {
                if (error.message?.includes("Unsupported provider")) {
                    showMessage(
                        message,
                        "Google no está habilitado en Supabase. Actívalo en Authentication > Providers > Google.",
                        "error"
                    );
                    return;
                }
                showMessage(message, error.message || "No se pudo iniciar con Google.", "error");
                return;
            }

            showMessage(message, "Redirigiendo a Google...", "success");
        });
    }

    async function initProfile() {
        const profileForm = document.getElementById("profileForm");
        if (!profileForm) return;

        const message = document.getElementById("profileMessage");
        const editBtn = document.getElementById("editProfileBtn");
        const saveBtn = document.getElementById("saveProfileBtn");
        const logoutBtn = document.getElementById("logoutBtn");
        const supabase = getSupabaseClient();

        if (!supabase) {
            showMessage(message, "No se pudo inicializar Supabase.", "error");
            return;
        }

        const { data: authData, error: authError } = await supabase.auth.getUser();
        if (authError || !authData?.user) {
            window.location.href = "./login.html";
            return;
        }

        const user = authData.user;
        cacheSessionUser(user);

        const fullNameInput = document.getElementById("profileFullName");
        const phoneInput = document.getElementById("profilePhone");
        const dniInput = document.getElementById("profileDniNie");
        const addressInput = document.getElementById("profileAddress");
        const postalInput = document.getElementById("profilePostal");
        const townInput = document.getElementById("profileTown");
        const emailInput = document.getElementById("profileEmail");

        emailInput.value = user.email || "";

        const { data: profileData } = await supabase
            .from("perfiles")
            .select("nombre_completo, telefono, dni_nie, direccion, codigo_postal, poblacion")
            .eq("id", user.id)
            .maybeSingle();

        fullNameInput.value = profileData?.nombre_completo || user.user_metadata?.full_name || "";
        phoneInput.value = profileData?.telefono || "";
        dniInput.value = profileData?.dni_nie || "";
        addressInput.value = profileData?.direccion || "";
        postalInput.value = profileData?.codigo_postal || "";
        townInput.value = profileData?.poblacion || "";

        editBtn.addEventListener("click", function () {
            profileForm.querySelectorAll("input[data-editable='true']").forEach(function (input) {
                input.disabled = false;
            });
            saveBtn.disabled = false;
            showMessage(message, "Puedes editar tus datos y guardarlos.", "success");
        });

        saveBtn.addEventListener("click", async function () {
            const payload = {
                id: user.id,
                email: user.email,
                nombre_completo: fullNameInput.value.trim() || null,
                telefono: phoneInput.value.trim() || null,
                dni_nie: dniInput.value.trim() || null,
                direccion: addressInput.value.trim() || null,
                codigo_postal: postalInput.value.trim() || null,
                poblacion: townInput.value.trim() || null,
            };

            const { error } = await supabase.from("perfiles").upsert(payload, { onConflict: "id" });
            if (error) {
                showMessage(message, error.message || "No se pudieron guardar los cambios.", "error");
                return;
            }

            profileForm.querySelectorAll("input[data-editable='true']").forEach(function (input) {
                input.disabled = true;
            });
            saveBtn.disabled = true;
            showMessage(message, "Perfil actualizado correctamente.", "success");
        });

        logoutBtn.addEventListener("click", async function () {
            await supabase.auth.signOut();
            localStorage.removeItem(SESSION_KEY);
            window.location.href = "./login.html";
        });
    }

    initLogin();
    initRegister();
    initGoogleAuth();
    initProfile();
})();
