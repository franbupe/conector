const apiKey = '41c0fff04435e0638a6406d64376d702';// Coloca aquí tu API Key de Holded
const proyectoIdDeseado = '6673294de56217109c01baeb';// ID de proyecto específico de Holded
// Llama a cargarProyecto directamente para que cargue al inicio
cargarProyecto();
function cargarProyecto() {
    const options = {
        method: 'GET',
        headers: { accept: 'application/json', key: apiKey }
    };
    fetch(`https://api.holded.com/api/projects/v1/projects`, options)
        .then(response => response.json())
        .then(proyectos => {
            const proyecto = proyectos.find(p => p.id === proyectoIdDeseado);
            if (proyecto) {
                mostrarProyecto(proyecto);
                cargarTareasPorProyecto(proyecto);
            } else {
                document.getElementById('proyectoContainer').innerHTML = '<p>No se encontró el proyecto especificado.</p>';
            }
        })
        .catch(error => {
            console.error('Error al obtener el proyecto:', error);
            document.getElementById('proyectoContainer').innerHTML = '<p>No se pudo obtener el proyecto.</p>';
        });
}
function mostrarProyecto(proyecto) {
    const proyectoContainer = document.getElementById('proyectoContainer');
    proyectoContainer.innerHTML = `
        <div class="col-12 mb-4">
            <div class="card">
                <div class="card-body">
                   
                    <div id="tareas-${proyecto.id}" class="tareas-container">
                        <p>Cargando tareas...</p>
                    </div>
                </div>
            </div>
        </div>
    `;
}
function cargarTareasPorProyecto(proyecto) {
    const options = {
        method: 'GET',
        headers: { accept: 'application/json', key: apiKey }
    };
    fetch('https://api.holded.com/api/projects/v1/tasks', options)
        .then(response => response.json())
        .then(tareas => {
            const tareasFiltradas = tareas.filter(tarea => tarea.projectId === proyectoIdDeseado);
            mostrarTareasPorCategoria(tareasFiltradas, proyecto);
            // Código adicional para mostrar todos los estados en consola
            const estadosUnicos = [...new Set(tareasFiltradas.map(tarea => tarea.status))];
            console.log("Estados únicos devueltos por la API de Holded:", estadosUnicos);
        })
        .catch(error => {
            console.error('Error al obtener tareas:', error);
            document.getElementById(`tareas-${proyectoIdDeseado}`).innerHTML = '<p>No se pudieron obtener las tareas.</p>';
        });
}
function mostrarTareasPorCategoria(tareas, proyecto) {
    const tareasContainer = document.getElementById(`tareas-${proyectoIdDeseado}`);
    tareasContainer.innerHTML = '';
    const estadoClases = {
        new: 'estado-nuevo',
        rejected: 'estado-rechazado',
        confirmadoparaimpresin: 'estado-confirmado',
        endiseo: 'estado-diseño',
        pedidoincompleto: 'estado-incompleto',
        in_progress: 'estado-en-proceso', // Cambiado a "en proceso"
		facturaryenviar: 'facturar-y-enviar'
		
    };
    proyecto.lists.forEach(list => {
        const categoriaContainer = document.createElement('div');
        categoriaContainer.classList.add('columna-tareas');
        
        categoriaContainer.innerHTML = `
            <h6 class="categoria-titulo">${list.name}</h6>
            <div class="tareas-lista" id="tareas-lista-${list.id}"></div>
        `;
        tareasContainer.appendChild(categoriaContainer);
        const tareasEnCategoria = tareas.filter(tarea => tarea.listId === list.id);
        const tareasLista = document.getElementById(`tareas-lista-${list.id}`);
        
        tareasEnCategoria.forEach(tarea => {
            // Obtener el conteo actual de productos desde localStorage
            let productosRealizados = parseInt(localStorage.getItem(`conteo_${tarea.id}`)) || 0;
            
            // Cambiar el estado a "en proceso" si hay productos realizados
            let claseEstado = estadoClases[tarea.status] || '';
            if (productosRealizados > 0) {
                claseEstado = estadoClases.in_progress;
                tarea.status = 'in_progress'; // Cambia el estado de la tarea a "en proceso"
            }
            const tareaHTML = `
                <div class="tarea-item ${claseEstado}" data-tarea-id="${tarea.id}" onclick="iniciarConteo('${tarea.id}', '${tarea.name}')">
                    <p><strong>${tarea.name}</strong></p>
                    <p class="productos-realizados">Productos realizados: <strong>${productosRealizados}</strong></p>
                    
                </div>
            `;
            tareasLista.innerHTML += tareaHTML;
        });
        if (tareasEnCategoria.length === 0) {
            tareasLista.innerHTML = '<p>No hay tareas en esta categoría.</p>';
        }
    });
}
function iniciarConteo(tareaId, tareaName) {
    document.getElementById('nombreTareaPopup').textContent = tareaName;
    document.getElementById('popupTitulo').textContent = `Conteo para la tarea: ${tareaName}`;
    
    const popup = document.getElementById('popupContador');
    const overlay = document.getElementById('overlay');
    popup.style.display = 'block';
    overlay.style.display = 'block';
    popup.classList.add('mostrar');
    // Extraer el número de productos del título de la tarea usando una expresión regular
    const match = tareaName.match(/\d+/);
    const objetivoProductos = match ? parseInt(match[0]) : 0; // Si no hay número, el objetivo será 0
    document.getElementById('objetivoProductosPopup').textContent = objetivoProductos;
    // Cargar el conteo actual de productos desde localStorage
    let contador = parseInt(localStorage.getItem(`conteo_${tareaId}`)) || 0;
    const contadorValor = document.getElementById('contadorValorPopup');
    contadorValor.textContent = contador;
    // Función para verificar si se ha alcanzado el objetivo
    function verificarObjetivo() {
        if (contador >= objetivoProductos && objetivoProductos > 0) {
            // Añadir la clase para mantener el fondo verde claro
            popup.classList.add('objetivo-alcanzado');
        }
    }
    document.getElementById('incrementarPopup').addEventListener('click', () => {
        const productosPorPlancha = parseInt(document.getElementById('productosPorPlanchaPopup').value) || 1;
        contador += productosPorPlancha;
        contadorValor.textContent = contador;
        verificarObjetivo(); // Verifica si se ha alcanzado el objetivo después de cada incremento
    });
    document.getElementById('decrementarPopup').addEventListener('click', () => {
        if (contador > 0) {
            contador -= 1;
            contadorValor.textContent = contador;
        }
    });
    document.getElementById('finalizarConteoPopup').addEventListener('click', () => {
        localStorage.setItem(`conteo_${tareaId}`, contador);
        alert(`Conteo finalizado. Total productos: ${contador}`);
        popup.classList.remove('objetivo-alcanzado'); // Quitar la animación al finalizar
        cargarProyecto(); 
        cerrarPopup();
    });
    document.getElementById('cerrarPopup').addEventListener('click', cerrarPopup);
}
function cerrarPopup() {
    const popup = document.getElementById('popupContador');
    const overlay = document.getElementById('overlay');
    popup.style.display = 'none';
    overlay.style.display = 'none';
    popup.classList.remove('mostrar');
}
function cerrarPopup() {
    const popup = document.getElementById('popupContador');
    const overlay = document.getElementById('overlay');
    popup.style.display = 'none';
    overlay.style.display = 'none';
    popup.classList.remove('mostrar');
}
function cerrarPopup() {
    const popup = document.getElementById('popupContador');
    const overlay = document.getElementById('overlay');
    popup.style.display = 'none';
    overlay.style.display = 'none';
    popup.classList.remove('mostrar');
}
function cerrarPopup() {
    const popup = document.getElementById('popupContador');
    const overlay = document.getElementById('overlay');
    popup.style.display = 'none';
    overlay.style.display = 'none';
    popup.classList.remove('mostrar');
}
function actualizarConteoTarea(tareaId, nuevoConteo) {
    // Seleccionar el elemento que muestra el conteo de productos en la tarea específica
    const tareaElemento = document.querySelector(`[data-tarea-id="${tareaId}"] .productos-realizados`);
    if (tareaElemento) {
        tareaElemento.textContent = `Productos realizados: ${nuevoConteo}`;
    }
}
function cerrarPopup() {
    const popup = document.getElementById('popupContador');
    const overlay = document.getElementById('overlay');
    popup.style.display = 'none';
    overlay.style.display = 'none';
    popup.classList.remove('mostrar');
}
function cerrarPopup() {
    const popup = document.getElementById('popupContador');
    const overlay = document.getElementById('overlay');
    popup.style.display = 'none';
    overlay.style.display = 'none';
    popup.classList.remove('mostrar');
}
// Cargar las tareas inmediatamente al iniciar
cargarProyecto();
// Configuración del intervalo de actualización (5 minutos en este caso)
const INTERVALO_ACTUALIZACION = 60000; // 60000 ms = 1 minuto
// Función para actualizar las tareas automáticamente
setInterval(() => {
    console.log("Actualizando las tareas...");
    cargarProyecto(); // Vuelve a cargar el proyecto y las tareas
}, INTERVALO_ACTUALIZACION);
/*function reiniciarContadores() {
    Object.keys(localStorage).forEach(key => {
        if (key.startsWith("conteo_")) {
            localStorage.removeItem(key);
        }
    });
    console.log("Todos los contadores han sido reiniciados.");
}
// Llamar a la función para reiniciar los contadores
reiniciarContadores();*/
