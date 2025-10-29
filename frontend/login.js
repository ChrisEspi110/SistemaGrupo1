const form = document.getElementById('loginForm');
const mensajeError = document.getElementById('mensajeError');

form.addEventListener('submit', async e => {
    e.preventDefault();

    const usuario = document.getElementById('usuario').value;
    const clave = document.getElementById('clave').value;

    try {
        const res = await fetch('https://backend-ng4h.onrender.com/login', { // <-- URL completa del backend
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({usuario, clave})
        });

        const data = await res.json();

        if(data.success){
            window.location.href = 'estudiantes.html';
        } else {
            mensajeError.textContent = 'Usuario o contraseña incorrectos';
            mensajeError.style.display = 'block';
        }
    } catch (err) {
        mensajeError.textContent = 'Error de conexión. Intenta nuevamente.';
        mensajeError.style.display = 'block';
        console.error(err);
    }
});
