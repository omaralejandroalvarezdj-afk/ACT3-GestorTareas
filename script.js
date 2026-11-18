// Recuperar las tareas guardadas en el navegador.
const datosGuardados = localStorage.getItem("misTareas");
let tareas = [];

try {
    const datos = datosGuardados ? JSON.parse(datosGuardados) : [];
    if (Array.isArray(datos)) {
        tareas = datos.filter(t => t && typeof t.id === "number" &&
            typeof t.nombre === "string" && typeof t.completada === "boolean");
    }
} catch (error) {
    tareas = [];
}

let idEditando = null;

const formulario = document.getElementById("formulario");
const campoTarea = document.getElementById("tarea");
const campoBuscar = document.getElementById("buscar");
const lista = document.getElementById("lista");
const mensaje = document.getElementById("mensaje");
const botonGuardar = document.getElementById("botonGuardar");
const botonCancelar = document.getElementById("botonCancelar");

// Guardar información para que continúe al cerrar o recargar la página.
const guardarTareas = () => {
    localStorage.setItem("misTareas", JSON.stringify(tareas));
};

const mostrarMensaje = (texto) => {
    mensaje.textContent = texto;
};

const cancelarEdicion = () => {
    idEditando = null;
    campoTarea.value = "";
    botonGuardar.textContent = "Agregar tarea";
    botonCancelar.hidden = true;
};

// Crear la lista de tareas usando el DOM.
const mostrarTareas = () => {
    lista.innerHTML = "";
    const busqueda = campoBuscar.value.trim().toLowerCase();
    const filtradas = tareas.filter(t => t.nombre.toLowerCase().includes(busqueda));

    filtradas.forEach(tarea => {
        const elemento = document.createElement("li");
        const casilla = document.createElement("input");
        casilla.type = "checkbox";
        casilla.checked = tarea.completada;
        casilla.setAttribute("aria-label", `Completar ${tarea.nombre}`);
        casilla.addEventListener("change", () => {
            tarea.completada = casilla.checked;
            guardarTareas();
            mostrarTareas();
        });

        const nombre = document.createElement("span");
        nombre.textContent = tarea.nombre;
        if (tarea.completada) nombre.classList.add("completada");

        const editar = document.createElement("button");
        editar.textContent = "Editar";
        editar.type = "button";
        editar.addEventListener("click", () => {
            idEditando = tarea.id;
            campoTarea.value = tarea.nombre;
            botonGuardar.textContent = "Guardar cambios";
            botonCancelar.hidden = false;
            mostrarMensaje("Estás editando una tarea.");
            campoTarea.focus();
        });

        const eliminar = document.createElement("button");
        eliminar.textContent = "Eliminar";
        eliminar.type = "button";
        eliminar.addEventListener("click", () => {
            if (!confirm("¿Quieres eliminar esta tarea?")) return;
            tareas = tareas.filter(t => t.id !== tarea.id);
            if (idEditando === tarea.id) cancelarEdicion();
            guardarTareas();
            mostrarTareas();
            mostrarMensaje("Tarea eliminada.");
        });

        elemento.append(casilla, nombre, editar, eliminar);
        lista.appendChild(elemento);
    });

    const completadas = tareas.filter(t => t.completada).length;
    document.getElementById("contador").textContent =
        `Total: ${tareas.length} | Pendientes: ${tareas.length - completadas} | Completadas: ${completadas}`;
    document.getElementById("vacio").textContent =
        tareas.length === 0 ? "Todavía no hay tareas." : "No hay tareas con esa búsqueda.";
    document.getElementById("vacio").hidden = filtradas.length > 0;
};

formulario.addEventListener("submit", (evento) => {
    evento.preventDefault();
    const nombre = campoTarea.value.trim();

    if (nombre === "") {
        mostrarMensaje("Escribe el nombre de una tarea.");
        return;
    }

    if (idEditando !== null) {
        const tarea = tareas.find(t => t.id === idEditando);
        if (tarea) tarea.nombre = nombre;
        mostrarMensaje("Tarea modificada.");
    } else {
        const nuevaTarea = {
            id: Date.now() + Math.random(),
            nombre: nombre,
            completada: false
        };
        tareas.push(nuevaTarea);
        mostrarMensaje("Tarea agregada.");
    }

    guardarTareas();
    cancelarEdicion();
    mostrarTareas();
});

botonCancelar.addEventListener("click", () => {
    cancelarEdicion();
    mostrarMensaje("Edición cancelada.");
});

campoBuscar.addEventListener("input", mostrarTareas);

mostrarTareas();
