//--------------------------------------------------------------
//  DATOS DEL CLIENTE (desde localStorage)
//--------------------------------------------------------------
const nombre = localStorage.getItem("nombre");
const torre = localStorage.getItem("torre");
const apartamento = localStorage.getItem("apartamento");


//--------------------------------------------------------------
//  PEQUEÑA FUNCIÓN DE ALERTA BONITA
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


// ==============================
// CREAR PEDIDO
// ==============================
async function crearPedido() {
    const precioInput = document.getElementById("precio");
    let precio = precioInput.value.trim();
    precio = Number(precio);

    if (!precio) return miniToast("Debes ingresar un precio");

    // Validaciones extras
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
                precio: precio
            })
        });

        if (!resp.ok) {
            miniToast("Error en el servidor");
            return;
        }

        const data = await resp.json();

        if (data.ok) {
            miniToast("Servicio solicitado correctamente");

            // Limpiar input
            precioInput.value = "";

            // 🔥 OCULTAR input y botón original
            precioInput.style.display = "none";
            document.getElementById("btnCrear").style.display = "none";

            // 🔥 MOSTRAR botón "Crear nuevo servicio"
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

    // Mostrar input y botón de solicitar
    precioInput.style.display = "inline-block";
    document.getElementById("btnCrear").style.display = "inline-block";

    // Ocultar botón "Crear nuevo servicio"
    document.getElementById("btnNuevo").style.display = "none";

    // Limpiar input
    precioInput.value = "";

    miniToast("Listo para crear un nuevo servicio");
});


//--------------------------------------------------------------
//  MOSTRAR DATOS DEL CLIENTE
//--------------------------------------------------------------
document.getElementById("datosCliente").innerHTML = `
    <strong>Nombre:</strong> ${nombre}<br>
    <strong>Torre:</strong> ${torre}<br>
    <strong>Apartamento:</strong> ${apartamento}
`;


//--------------------------------------------------------------
//  CARGAR SERVICIOS (estado + historial)
//--------------------------------------------------------------
async function cargarMisServicios() {
    const res = await fetch(`/api/misPedidos?torre=${torre}&apartamento=${apartamento}`);
    const pedidos = await res.json();

    const divHistorial = document.getElementById("misPedidos");
    const divEstado = document.getElementById("estadoActual");

    divHistorial.innerHTML = "";
    divEstado.innerHTML = "";

    if (pedidos.length === 0) {
        divEstado.innerHTML = "<p>No tienes servicios activos</p>";

        // 🔥 Si no hay servicios activos, mostrar input y botón
        document.getElementById("precio").style.display = "inline-block";
        document.getElementById("btnCrear").style.display = "inline-block";
        document.getElementById("btnNuevo").style.display = "none";

        return;
    }

    const actual = pedidos[0];

    divEstado.innerHTML = `
        <div class="card">
            <p><strong>Estado:</strong> ${actual.estado}</p>
            <p><strong>Precio:</strong> ${actual.precio}</p>
        </div>
    `;

    pedidos.slice(1).forEach(s => {
        divHistorial.innerHTML += `
            <div class="card">
                <p><strong>Estado:</strong> ${s.estado}</p>
                <p><strong>Precio:</strong> ${s.precio}</p>
            </div>
        `;
    });

    // 🔥 Si hay un servicio activo, ocultar input y botón original
    document.getElementById("precio").style.display = "none";
    document.getElementById("btnCrear").style.display = "none";
    document.getElementById("btnNuevo").style.display = "inline-block";
}


//--------------------------------------------------------------
//  SOCKET.IO (actualizaciones en tiempo real)
//--------------------------------------------------------------
const socket = io();

socket.on("pedidos_actualizados", () => {
    cargarMisServicios();
});


//--------------------------------------------------------------
//  CARGA INICIAL
//--------------------------------------------------------------
cargarMisServicios();
console.log("Cliente cargado:", torre, apartamento);
