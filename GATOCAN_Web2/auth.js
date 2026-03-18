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

    async function upsertUserProfile(supabase, user, extraData) {
        const payload = {
            id: user.id,
            email: user.email,
            full_name: extraData.fullName || null,
            username: extraData.username || null,
            updated_at: new Date().toISOString(),
        };

        const { error } = await supabase.from("profiles").upsert(payload, {
            onConflict: "id",
        });

        if (error) throw error;
    }

    async function saveUserData(supabase, userId, dataType, payload) {
        const { error } = await supabase.from("user_data").insert({
            user_id: userId,
            data_type: dataType,
            payload,
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

            let email = emailOrUser;
            if (!emailOrUser.includes("@")) {
                const { data: profile, error: profileError } = await supabase
                    .from("profiles")
                    .select("email")
                    .eq("username", emailOrUser)
                    .maybeSingle();

                if (profileError || !profile?.email) {
                    showMessage(message, "No existe un usuario con ese nombre.", "error");
                    return;
                }
                email = profile.email;
            }

            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error || !data.user) {
                showMessage(message, "Usuario o contraseña incorrectos.", "error");
                return;
            }

            localStorage.setItem(
                SESSION_KEY,
                JSON.stringify({ user: data.user.email, loggedAt: new Date().toISOString() })
            );
            showMessage(message, "Acceso correcto. Redirigiendo al inicio...", "success");
            setTimeout(function () {
                window.location.href = "./index.html#inicio";
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
                        username,
                    },
                },
            });

            if (error || !data.user) {
                showMessage(message, error?.message || "No se pudo completar el registro.", "error");
                return;
            }

            try {
                await upsertUserProfile(supabase, data.user, { fullName, username });
                await saveUserData(supabase, data.user.id, "registro", {
                    source: "web",
                    created_at: new Date().toISOString(),
                });
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
                    redirectTo: window.location.origin + window.location.pathname,
                },
            });

            if (error) {
                showMessage(message, "No se pudo iniciar con Google.", "error");
                return;
            }

            showMessage(message, "Redirigiendo a Google...", "success");
        });
    }

    initLogin();
    initRegister();
    initGoogleAuth();
})();
