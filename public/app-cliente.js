//--------------------------------------------------------------
// DATOS DEL CLIENTE
//--------------------------------------------------------------
const nombre = localStorage.getItem("nombre");
const torre = localStorage.getItem("torre");
const apartamento = localStorage.getItem("apartamento");
// lo agrego para mandados 
const seccionMandado = document.getElementById("seccionMandado");
const btnVolverMenuMandado = document.getElementById("btnVolverMenuMandado");
const menuPrincipal = document.getElementById("menuPrincipal");
const seccionBasura = document.getElementById("seccionBasura");
const btnMandado = document.getElementById("btnMandado");
const btnVolverMenu = document.getElementById("btnVolverMenu");

if (btnMandado && seccionMandado && menuPrincipal) {
    btnMandado.addEventListener("click", () => {
        menuPrincipal.style.display = "none";
        seccionBasura.style.display = "none";
        seccionMandado.style.display = "block";

        // Reset campos
        document.getElementById("mensajeEstadoMandado").innerText = "";

        document.getElementById("descripcionMandado").style.display = "block";
        document.getElementById("precioMandado").style.display = "block";
        document.getElementById("btnCrearMandado").style.display = "inline-block";
        document.getElementById("btnNuevoMandado").style.display = "none";




        cargarMisMandados();

    });
}

if (btnVolverMenuMandado) {
    btnVolverMenuMandado.addEventListener("click", () => {
        seccionMandado.style.display = "none";
        menuPrincipal.style.display = "block";
    });
}

async function crearMandado() {
    const descripcion = document.getElementById("descripcionMandado").value.trim();
    const precioInput = document.getElementById("precioMandado");
    const precio = Number(precioInput.value);

    if (!descripcion) return miniToast("Describe el mandado");
    if (!precio) return miniToast("Ingresa un precio");
    if (precio < 600) return miniToast("El precio mínimo es $600");
    if (precio % 100 !== 0) return miniToast("Debe ser múltiplo de $100");

    const clienteID = `${torre}-${apartamento}`;

    try {
        const resp = await fetch("/api/pedidos", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                cliente: clienteID,
                descripcion,
                precio
            })
        });

        if (!resp.ok) return miniToast("Error del servidor");

        const data = await resp.json();
        if (data.ok) {
            miniToast("Mandado solicitado correctamente");

            // 🟢 Mensaje verde
            const msg = document.getElementById("mensajeEstadoMandado");
            msg.innerText = "Mandado creado correctamente";
            msg.style.color = "#28a745";

            // ⛔ ocultar formulario
            document.getElementById("descripcionMandado").style.display = "none";
            document.getElementById("precioMandado").style.display = "none";
            document.getElementById("btnCrearMandado").style.display = "none";
            document.getElementById("infoMandado").style.display = "none";


            // ✅ mostrar botón nuevo mandado
            document.getElementById("btnNuevoMandado").style.display = "inline-block";

            // limpiar valores
            document.getElementById("descripcionMandado").value = "";
            document.getElementById("precioMandado").value = "";

            // recargar historial
            cargarMisMandados();
        }



    } catch (e) {
        console.error(e);
        miniToast("No se pudo conectar");
    }
}
document
    .getElementById("btnCrearMandado")
    .addEventListener("click", crearMandado);

// lo agregue para mandados
// btn volver menu
if (btnVolverMenu) {
    btnVolverMenu.addEventListener("click", () => {
        // Mostrar menú principal
        menuPrincipal.style.display = "block";

        // Ocultar secciones (solo las que ya existen)
        seccionBasura.style.display = "none";
    });
}

document.getElementById("btnNuevoMandado").addEventListener("click", () => {

    // mostrar formulario
    document.getElementById("descripcionMandado").style.display = "block";
    document.getElementById("precioMandado").style.display = "block";
    document.getElementById("btnCrearMandado").style.display = "inline-block";

    // ocultar botón nuevo
    document.getElementById("btnNuevoMandado").style.display = "none";
    document.getElementById("infoMandado").style.display = "block";

    // limpiar mensaje
    document.getElementById("mensajeEstadoMandado").innerText = "";

    miniToast("Listo para crear un nuevo mandado");
});


function mostrarPrimerServicioBasura() {
    // Limpiar estado visual
    document.getElementById("estadoActual").innerHTML = "";
    document.getElementById("misPedidos").style.display = "none";

    // Mostrar formulario inicial
    const precioInput = document.getElementById("precio");
    precioInput.style.display = "inline-block";
    precioInput.value = "";

    document.getElementById("btnCrear").style.display = "inline-block";
    document.getElementById("btnNuevo").style.display = "none";
    document.getElementById("propinaInfo").style.display = "block";

    // Texto de bienvenida normal
    const bienvenida = document.getElementById("bienvenidaUsuario");
    bienvenida.innerText = `¡Bienvenido ${nombre}!`;
    bienvenida.style.color = "";
}

function formatoCOP(valor) {
    return `$${Number(valor).toLocaleString("es-CO")}`;
}


document.getElementById("btnBasura").addEventListener("click", () => {
    menuPrincipal.style.display = "none";
    seccionBasura.style.display = "block";

    mostrarPrimerServicioBasura();
});



const precioInput = document.getElementById("precio");
precioInput.style.display = "inline-block";
precioInput.value = "";

document.getElementById("btnCrear").style.display = "inline-block";
document.getElementById("btnNuevo").style.display = "none";
document.getElementById("propinaInfo").style.display = "block";

const bienvenida = document.getElementById("bienvenidaUsuario");
bienvenida.innerText = `¡Bienvenido ${nombre}!`;
bienvenida.style.color = "";



//--------------------------------------------------------------
// MINI TOAST
//--------------------------------------------------------------
function miniToast(texto) {
    const div = document.createElement("div");
    div.className = "toast";
    div.innerText = texto;
    document.body.appendChild(div);

    setTimeout(() => div.classList.add("show"), 10);
    setTimeout(() => {
        div.classList.remove("show");
        setTimeout(() => div.remove(), 300);
    }, 2000);
}

//--------------------------------------------------------------
// CREAR PEDIDO
//--------------------------------------------------------------
//--------------------------------------------------------------
// CREAR PEDIDO
//--------------------------------------------------------------
async function crearPedido() {
    const precioInput = document.getElementById("precio");
    let precio = Number(precioInput.value.trim());

    if (!precio) return miniToast("Debes ingresar un precio");
    if (precio < 600) return miniToast("El precio mínimo es $600");
    if (precio % 100 !== 0) return miniToast("El precio debe ser múltiplo de $100");

    const clienteID = `${torre}-${apartamento}`;

    try {
        const resp = await fetch("/api/pedidos", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                cliente: clienteID,
                descripcion: "Servicio solicitado",
                precio
            })
        });

        if (!resp.ok) return miniToast("Error en el servidor");
        const data = await resp.json();
        if (data.ok) {
            miniToast("Servicio solicitado correctamente");

            // 🔄 Cambiar bienvenida
            const mensaje = document.getElementById("mensajeEstadoServicio");
            mensaje.innerText = "Servicio creado correctamente";


            // ⛔ OCULTAR TEXTO DE PROPINA
            document.getElementById("propinaInfo").style.display = "none";

            // Limpiar y ocultar input
            precioInput.value = "";
            precioInput.style.display = "none";

            // Ocultar botón crear
            document.getElementById("btnCrear").style.display = "none";

            // Mostrar botón nuevo servicio
            document.getElementById("btnNuevo").style.display = "inline-block";

            cargarMisServicios();
        }



    } catch (err) {
        console.error("ERROR DE RED:", err);
        miniToast("No se pudo conectar con el servidor");
    }
}

document.getElementById("btnCrear").addEventListener("click", crearPedido);

document.getElementById("btnNuevo").addEventListener("click", () => {
    const precioInput = document.getElementById("precio");
    precioInput.style.display = "inline-block";
    document.getElementById("btnCrear").style.display = "inline-block";
    document.getElementById("btnNuevo").style.display = "none";
    document.getElementById("mensajeEstadoServicio").innerText = "";

    precioInput.value = "";

    // ⛔ MOSTRAR TEXTO DE PROPINA OTRA VEZ
    document.getElementById("propinaInfo").style.display = "block";

    const bienvenida = document.getElementById("bienvenidaUsuario");
    bienvenida.innerText = `¡Bienvenido ${nombre}!`;
    bienvenida.style.color = "";


    miniToast("Listo para crear un nuevo servicio");
});


document.getElementById("btnCrear").addEventListener("click", crearPedido);

document.getElementById("btnNuevo").addEventListener("click", () => {
    const precioInput = document.getElementById("precio");
    precioInput.style.display = "inline-block";
    document.getElementById("btnCrear").style.display = "inline-block";
    document.getElementById("btnNuevo").style.display = "none";
    precioInput.value = "";
    miniToast("Listo para crear un nuevo servicio");
});

//--------------------------------------------------------------
// CARGAR SERVICIOS
//--------------------------------------------------------------
async function cargarMisServicios() {

    const res = await fetch(`/api/misPedidos?torre=${torre}&apartamento=${apartamento}`);
    const pedidos = await res.json();

    const divEstado = document.getElementById("estadoActual");
    const divHistorial = document.getElementById("misPedidos");
    divEstado.innerHTML = "";
    divHistorial.innerHTML = "";

    if (pedidos.length === 0) {
        divEstado.innerHTML = "<p>No tienes servicios activos</p>";
        document.getElementById("precio").style.display = "inline-block";
        document.getElementById("btnCrear").style.display = "inline-block";
        document.getElementById("btnNuevo").style.display = "none";
        return;
    }

    // Mostrar pedido activo
    const actual = pedidos[0];
    const fechaActual = new Date(actual.fecha);

    divEstado.innerHTML = `
        <div class="card">
            <p><strong>Servicio creado el:</strong> ${fechaActual.toLocaleDateString()} a las ${fechaActual.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
            <p><strong>Estado:</strong> ${actual.estado}</p>
            <p><strong>Precio:</strong> ${formatoCOP(actual.precio)}</p>

        </div>
    `;

    // Historial (tabla)
    if (pedidos.length > 1) {
        let tabla = `<table class="historialTabla">
            <thead>
                <tr>
                    <th>Fecha</th>
                    <th>Hora</th>
                    <th>Precio</th>
                    <th>Estado</th>
                </tr>
            </thead>
            <tbody>`;

        pedidos.slice(1).forEach(s => {
            const fecha = new Date(s.fecha);
            tabla += `
                <tr>
                    <td>${fecha.toLocaleDateString()}</td>
                    <td>${fecha.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                    <td>${formatoCOP(s.precio)}</td>

                    <td>${s.estado}</td>
                </tr>
            `;
        });

        tabla += `</tbody></table>`;
        divHistorial.innerHTML = tabla;
    }

    document.getElementById("precio").style.display = "none";
    document.getElementById("btnCrear").style.display = "none";
    document.getElementById("btnNuevo").style.display = "inline-block";
}


//--------------------------------------------------------------
// SOCKET.IO
//--------------------------------------------------------------
const socket = io();
socket.on("pedidos_actualizados", () => cargarMisServicios());

//--------------------------------------------------------------
// HISTORIAL DESPLEGABLE
//--------------------------------------------------------------
const historialToggle = document.getElementById("historialToggle");
const divHistorial = document.getElementById("misPedidos");

historialToggle.addEventListener("click", () => {
    if (divHistorial.style.display === "none" || divHistorial.style.display === "") {
        divHistorial.style.display = "block";

        // Contar las filas de la tabla si existe
        let numPedidos = 0;
        const tabla = divHistorial.querySelector("table.historialTabla tbody");
        if (tabla) {
            numPedidos = tabla.querySelectorAll("tr").length;
        }

        historialToggle.innerText = `Ocultar historial (${numPedidos} pedido${numPedidos !== 1 ? 's' : ''})`;
    } else {
        divHistorial.style.display = "none";
        historialToggle.innerText = "Ver historial de Servicios";
    }
});

//--------------------------------------------------------------
// MENSAJE DE BIENVENIDA
//--------------------------------------------------------------
window.addEventListener("DOMContentLoaded", () => {
    const divBienvenida = document.getElementById("bienvenidaUsuario");

    if (divBienvenida && nombre) {
        divBienvenida.innerText = `¡Bienvenido ${nombre}!`;
    }
});





//--------------------------------------------------------------
// CARGA INICIAL
//--------------------------------------------------------------
async function cargarMisMandados() {
    const contenedor = document.getElementById("historialMandados");
    contenedor.innerHTML = "Cargando mandados...";

    const res = await fetch(`/api/misPedidos?torre=${torre}&apartamento=${apartamento}`);
    const pedidos = await res.json();

    const mandados = pedidos.filter(p =>
        p.descripcion && p.descripcion !== "Servicio solicitado"
    );

    if (mandados.length === 0) {
        contenedor.innerHTML = "<p>No tienes mandados aún</p>";
        return;
    }

    let html = "";

    mandados.forEach(m => {
        const fecha = new Date(m.fecha);
        html += `
            <div class="card">
                <p><strong>${m.descripcion}</strong></p>
                <p>Precio: ${formatoCOP(m.precio)}</p>
                <p>Estado: ${m.estado}</p>
                <p style="font-size:12px;color:#666">
                    ${fecha.toLocaleDateString()} ${fecha.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
            </div>
        `;
    });

    contenedor.innerHTML = html;
}

cargarMisServicios();
console.log("Cliente cargado:", torre, apartamento);

const toggleMandados = document.getElementById("toggleMandados");
const historialMandados = document.getElementById("historialMandados");

if (toggleMandados) {
    toggleMandados.addEventListener("click", () => {
        if (
            historialMandados.style.display === "none" ||
            historialMandados.style.display === ""
        ) {
            historialMandados.style.display = "block";
            toggleMandados.innerText = "Ocultar historial de mandados";
        } else {
            historialMandados.style.display = "none";
            toggleMandados.innerText = "Ver historial de mandados";
        }
    });
}
