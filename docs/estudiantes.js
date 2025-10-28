// ===== SELECTORES PRINCIPALES =====
const tablaBody = document.querySelector('#estudiantesTable tbody'); // Cuerpo de la tabla
const mensaje = document.getElementById('mensaje'); // Contenedor de mensajes

let editandoId = null; // ID del estudiante en edición

// ===== FUNCIONES GENERALES =====

// Mostrar mensaje dinámico (éxito o error)
function mostrarMensaje(texto, tipo = 'success') {
    mensaje.textContent = texto;
    mensaje.className = tipo === 'success' ? 'success' : 'error';
    mensaje.style.display = 'block';
    setTimeout(() => mensaje.style.display = 'none', 3000);
}

// ===== SESIÓN =====
// Cerrar sesión y redirigir a login
document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('usuario');
    window.location.href = 'index.html';
});

// ===== CARGAR ESTUDIANTES =====
async function cargarEstudiantes() {
    try {
        const res = await fetch('/estudiantes');
        const estudiantes = await res.json();
        tablaBody.innerHTML = '';

        estudiantes.forEach(est => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${est.codigo_estudiante}</td>
                <td class="nombre">${est.nombre}</td>
                <td class="apellido">${est.apellido}</td>
                <td class="edad">${est.edad}</td>
                <td class="curso">${est.curso}</td>
                <td>
                    <button class="editar">Editar</button>
                    <button class="eliminar">Eliminar</button>
                </td>
            `;
            tablaBody.appendChild(tr);

            // ===== BOTÓN EDITAR =====
            const btnEditar = tr.querySelector('.editar');
            btnEditar.addEventListener('click', () => {
                if (btnEditar.textContent === 'Editar') {
                    // Guardar valores actuales
                    const nombre = tr.querySelector('.nombre').textContent;
                    const apellido = tr.querySelector('.apellido').textContent;
                    const edad = tr.querySelector('.edad').textContent;
                    const curso = tr.querySelector('.curso').textContent;

                    // Reemplazar celdas por inputs para edición
                    tr.querySelector('.nombre').innerHTML = `<input type="text" value="${nombre}">`;
                    tr.querySelector('.apellido').innerHTML = `<input type="text" value="${apellido}">`;
                    tr.querySelector('.edad').innerHTML = `<input type="number" value="${edad}">`;
                    tr.querySelector('.curso').innerHTML = `<input type="text" value="${curso}">`;

                    btnEditar.textContent = 'Guardar';

                    // Botón cancelar inline
                    const btnCancelar = document.createElement('button');
                    btnCancelar.textContent = 'Cancelar';
                    btnCancelar.classList.add('cancelar');
                    btnCancelar.style.marginLeft = '5px';
                    btnEditar.insertAdjacentElement('afterend', btnCancelar);

                    btnCancelar.addEventListener('click', () => {
                        tr.querySelector('.nombre').textContent = nombre;
                        tr.querySelector('.apellido').textContent = apellido;
                        tr.querySelector('.edad').textContent = edad;
                        tr.querySelector('.curso').textContent = curso;
                        btnEditar.textContent = 'Editar';
                        btnCancelar.remove();
                    });

                } else {
                    // Guardar cambios en el servidor
                    const nombre = tr.querySelector('.nombre input').value.trim();
                    const apellido = tr.querySelector('.apellido input').value.trim();
                    const edad = parseInt(tr.querySelector('.edad input').value);
                    const curso = tr.querySelector('.curso input').value.trim();

                    if (!nombre || !apellido || !edad || !curso) {
                        mostrarMensaje('Todos los campos son obligatorios', 'error');
                        return;
                    }

                    fetch(`/estudiantes/${est.id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ nombre, apellido, edad, curso })
                    })
                        .then(res => res.json())
                        .then(data => {
                            if (data.success) {
                                mostrarMensaje('Estudiante actualizado', 'success');
                                cargarEstudiantes();
                            } else {
                                mostrarMensaje('Error al actualizar', 'error');
                            }
                        })
                        .catch(err => {
                            mostrarMensaje('Error de conexión', 'error');
                            console.error(err);
                        });
                }
            });

            // ===== BOTÓN ELIMINAR =====
            const btnEliminar = tr.querySelector('.eliminar');
            btnEliminar.addEventListener('click', async () => {
                if (!confirm('¿Seguro que quieres eliminar este estudiante?')) return;
                try {
                    const res = await fetch(`/estudiantes/${est.id}`, { method: 'DELETE' });
                    const data = await res.json();
                    mostrarMensaje(data.success ? 'Estudiante eliminado' : 'Error eliminando', data.success ? 'success' : 'error');
                    cargarEstudiantes();
                } catch (err) {
                    mostrarMensaje('Error de conexión', 'error');
                    console.error(err);
                }
            });
        });
    } catch (err) {
        mostrarMensaje('Error cargando estudiantes', 'error');
        console.error(err);
    }
}

// ===== AGREGAR / ACTUALIZAR ESTUDIANTE =====
document.getElementById('agregarBtn').addEventListener('click', async () => {
    const nombre = document.getElementById('nombre').value.trim();
    const apellido = document.getElementById('apellido').value.trim();
    const edad = parseInt(document.getElementById('edad').value);
    const curso = document.getElementById('curso').value.trim();

    if (!nombre || !apellido || !edad || !curso) {
        mostrarMensaje('Todos los campos son obligatorios', 'error');
        return;
    }

    try {
        const url = editandoId ? `/estudiantes/${editandoId}` : '/estudiantes';
        const method = editandoId ? 'PUT' : 'POST';
        const body = JSON.stringify({ nombre, apellido, edad, curso });

        const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body });
        const data = await res.json();

        if (data.success) {
            mostrarMensaje(editandoId ? 'Estudiante actualizado' : 'Estudiante agregado', 'success');
            cargarEstudiantes();
            // Limpiar formulario
            document.getElementById('nombre').value = '';
            document.getElementById('apellido').value = '';
            document.getElementById('edad').value = '';
            document.getElementById('curso').value = '';
            editandoId = null;
            document.getElementById('cancelarEdicion').style.display = 'none';
            document.getElementById('agregarBtn').textContent = 'Agregar Estudiante';
        } else {
            mostrarMensaje('Error en la operación', 'error');
        }
    } catch (err) {
        mostrarMensaje('Error de conexión', 'error');
        console.error(err);
    }
});

// ===== CANCELAR EDICIÓN =====
document.getElementById('cancelarEdicion').addEventListener('click', () => {
    editandoId = null;
    document.getElementById('nombre').value = '';
    document.getElementById('apellido').value = '';
    document.getElementById('edad').value = '';
    document.getElementById('curso').value = '';
    document.getElementById('agregarBtn').textContent = 'Agregar Estudiante';
    document.getElementById('cancelarEdicion').style.display = 'none';
});

// ===== INICIALIZACIÓN =====
cargarEstudiantes(); // Carga inicial de estudiantes

// ===== REPORTES =====
let chartCursos = null, chartEdades = null, chartPromedio = null;

// Mostrar sección de reportes
document.getElementById('reportesBtn').addEventListener('click', async () => {
    document.getElementById('crudSection').style.display = 'none';
    document.querySelector('.form-container').style.display = 'none';
    document.getElementById('reportesSection').style.display = 'block';
    document.getElementById('reportesBtn').style.display = 'none';
    await generarReportes(); // Genera gráficos
});

// Cerrar reportes y volver al CRUD
document.getElementById('cerrarReportesBtn').addEventListener('click', () => {
    document.getElementById('reportesSection').style.display = 'none';
    document.getElementById('crudSection').style.display = 'block';
    document.querySelector('.form-container').style.display = 'flex';
    document.getElementById('reportesBtn').style.display = 'inline-block';
});

// Generar reportes dinámicos
async function generarReportes() {
    try {
        const res = await fetch('/estudiantes');
        const estudiantes = await res.json();

        // ===== ESTUDIANTES POR CURSO =====
        const cursos = {};
        estudiantes.forEach(e => cursos[e.curso] = (cursos[e.curso] || 0) + 1);

        if (chartCursos) chartCursos.destroy();
        chartCursos = new Chart(document.getElementById('graficoCursos'), {
            type: 'bar',
            data: { labels: Object.keys(cursos), datasets: [{ label: 'Cantidad de Estudiantes', data: Object.values(cursos), backgroundColor: '#2575fc', borderColor: '#1b4fd1', borderWidth: 2 }] },
            options: { responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
        });

        // ===== DISTRIBUCIÓN DE EDADES =====
        const edades = {};
        estudiantes.forEach(e => edades[e.edad] = (edades[e.edad] || 0) + 1);

        if (chartEdades) chartEdades.destroy();
        chartEdades = new Chart(document.getElementById('graficoEdades'), {
            type: 'pie',
            data: { labels: Object.keys(edades), datasets: [{ data: Object.values(edades), backgroundColor: ['#6a11cb', '#2575fc', '#27ae60', '#f39c12', '#e74c3c'] }] },
            options: { responsive: true }
        });

        // ===== PROMEDIO DE EDAD POR CURSO =====
        const promedio = {};
        estudiantes.forEach(e => {
            if (!promedio[e.curso]) promedio[e.curso] = { total: 0, count: 0 };
            promedio[e.curso].total += e.edad;
            promedio[e.curso].count++;
        });
        const cursosProm = Object.keys(promedio);
        const promedios = cursosProm.map(c => (promedio[c].total / promedio[c].count).toFixed(1));

        if (chartPromedio) chartPromedio.destroy();
        chartPromedio = new Chart(document.getElementById('graficoPromedio'), {
            type: 'line',
            data: { labels: cursosProm, datasets: [{ label: 'Promedio de Edad', data: promedios, fill: false, borderColor: '#6a11cb', borderWidth: 2, tension: 0.3 }] },
            options: { responsive: true }
        });

    } catch (err) {
        console.error('Error al generar reportes:', err);
        mostrarMensaje('Error generando reportes', 'error');
    }
}
