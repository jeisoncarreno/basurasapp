// app-cliente.js (colocar en public/)
(function () {
    const socket = io(); // usa /socket.io/socket.io.js servido por tu server

    const btn = document.getElementById("btnCrear");
    const misPedidosDiv = document.getElementById("misPedidos");

    function renderPedidos(pedidos) {
        const torre = document.getElementById("torre").value || "";
        const apto = document.getElementById("apartamento").value || "";
        // muestra solo los del cliente actual si ingresó torre+apto
        const own = pedidos.filter(p => p.cliente === `${torre}-${apto}`);
        misPedidosDiv.innerHTML = own.map(p => `
      <div class="item">
        <b>ID:</b> ${p.id} — $${p.precio}<br>
        <b>Estado:</b> ${p.estado} — <b>Trabajador:</b> ${p.trabajador || '-'}
      </div>
    `).join("") || "<div>No hay pedidos para esta unidad</div>";
    }

    // escuchar actualizaciones del server
    socket.on("pedidos_actualizados", (pedidos) => {
        renderPedidos(pedidos);
    });

    // crear pedido
    window.crearServicio = async function () {
        const torre = document.getElementById("torre").value.trim();
        const apto = document.getElementById("apartamento").value.trim();
        const precio = document.getElementById("precio").value.trim();

        if (!torre || !apto || !precio) { alert("Completa torre, apto y precio"); return; }

        const cliente = `${torre}-${apto}`;

        try {
            const res = await fetch("/api/pedidos", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ cliente, descripcion: "", precio: Number(precio) })
            });
            const data = await res.json();
            if (data.ok) {
                // limpio campo
                document.getElementById("precio").value = "";
            } else {
                console.error("Error al crear", data);
                alert("Error al crear pedido");
            }
        } catch (e) {
            console.error(e);
            alert("Error de red al crear pedido");
        }
    };

    // conectar botón si existe
    if (btn) btn.addEventListener("click", () => window.crearServicio());

    // petición inicial para mostrar pedidos actuales (opcional)
    // Puedes pedir al backend que emita el broadcastPedidos al conectar; el servidor actual no emite al conectar, solo cuando hay cambios.
    // Forzamos pedir la lista actual realizando una petición que no existe: en tu server no tienes endpoint GET, pero socket.io conectará y el server no envía nada hasta que haya datos.
})();
