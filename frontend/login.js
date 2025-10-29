document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const usuario = document.getElementById('usuario').value;
    const clave = document.getElementById('clave').value;
    const mensajeError = document.getElementById('mensajeError');

    try {
        const response = await fetch('https://backend-ng4h.onrender.com/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usuario, clave })
        });

        const data = await response.json();

        if (data.success) {
            // Guardamos sesión local
            localStorage.setItem('usuario', usuario);
            window.location.href = 'dashboard.html';
        } else {
            mensajeError.textContent = 'Usuario o contraseña incorrectos.';
            mensajeError.style.display = 'block';
        }
    } catch (err) {
        mensajeError.textContent = 'Error de conexión. Intenta nuevamente.';
        mensajeError.style.display = 'block';
        console.error(err);
    }
});
