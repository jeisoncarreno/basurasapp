const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http, { cors: { origin: "*" } });

app.use(express.json());
app.use(express.static("public"));

// Base de datos temporal
let pedidos = [];
let ultimoId = 1;

// Evento socket para enviar actualizaciones
function broadcastPedidos() {
    io.emit("pedidos_actualizados", pedidos);
}

// Crear pedido (CLIENTE)
app.post("/api/pedidos", (req, res) => {
    const { cliente, descripcion, precio } = req.body;

    const nuevo = {
        id: ultimoId++,
        cliente,
        descripcion,
        precio,
        estado: "pendiente",
        trabajador: null
    };

    pedidos.push(nuevo);
    broadcastPedidos();
    res.json({ ok: true, pedido: nuevo });
});

// Trabajador toma el pedido
app.post("/api/tomar/:id", (req, res) => {
    const pedido = pedidos.find(p => p.id == req.params.id);
    if (!pedido) return res.status(404).json({ error: "No existe" });

    pedido.estado = "tomado";
    pedido.trabajador = req.body.trabajador;

    broadcastPedidos();
    res.json({ ok: true, pedido });
});

// Marcar como completado
app.post("/api/completar/:id", (req, res) => {
    const pedido = pedidos.find(p => p.id == req.params.id);
    if (!pedido) return res.status(404).json({ error: "No existe" });

    pedido.estado = "completado";

    broadcastPedidos();
    res.json({ ok: true, pedido });
});

// Servidor
const PORT = process.env.PORT || 3000;

http.listen(PORT, () => {
    console.log("API lista en puerto " + PORT);
});
