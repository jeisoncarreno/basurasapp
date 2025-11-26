(function () {
    const socket = io();
    const lista = document.getElementById("listaPendientes");
    const inputTrab = document.getElementById("trabajador");
    const btnRefresh = document.getElementById("btnRefresh");

    function render(pedidos) {
        // mostrar todos y botones para tomar cuando estén pendientes
        lista.innerHTML = pedidos.map(p => `
      <div class="item">
        <b>ID:</b> ${p.id} — <b>${p.cliente}</b><br>
        Precio: $${p.precio}<br>
        Estado: ${p.estado}<br>
        ${p.estado === 'pendiente' ? `<button onclick="tomarPedido(${p.id})">Tomar</button>` : ''}
      </div>
    `).join("");
    }

    socket.on("pedidos_actualizados", pedidos => {
        render(pedidos);
    });

    window.tomarPedido = async function (id) {
        const trabajador = inputTrab.value.trim() || "Anon";
        try {
            const res = await fetch(`/api/tomar/${id}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ trabajador })
            });
            const data = await res.json();
            if (!data.ok) alert("Error al tomar: " + (data.error || JSON.stringify(data)));
        } catch (e) {
            console.error(e);
            alert("Error en red al tomar pedido");
        }
    };

    if (btnRefresh) btnRefresh.addEventListener("click", () => {
        // Forzamos nada; la vista actual se actualizará por socket cuando haya cambios
        alert("La lista se actualizará automáticamente por sockets cuando haya cambios.");
    });
})();
