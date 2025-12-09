//--------------------------------------------------------------
// DATOS DEL CLIENTE
//--------------------------------------------------------------
const nombre = localStorage.getItem("nombre");
const torre = localStorage.getItem("torre");
const apartamento = localStorage.getItem("apartamento");

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

            // Limpiar input
            precioInput.value = "";

            // Ocultar input y botón
            precioInput.style.display = "none";
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
            <p><strong>Precio:</strong> ${actual.precio}</p>
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
                    <td>${s.precio}</td>
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
// CARGA INICIAL
//--------------------------------------------------------------
cargarMisServicios();
console.log("Cliente cargado:", torre, apartamento);
