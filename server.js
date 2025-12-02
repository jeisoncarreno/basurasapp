// =============================
//  IMPORTS
// =============================
const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);
const io = require("socket.io")(server, { cors: { origin: "*" } });

require("dotenv").config();

// =============================
//  FIREBASE ADMIN
// =============================
const admin = require("firebase-admin");

const firebaseConfig = {
    type: process.env.FIREBASE_TYPE,
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: process.env.FIREBASE_AUTH_URI,
    token_uri: process.env.FIREBASE_TOKEN_URI,
    auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_CERT,
    client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT
};

admin.initializeApp({
    credential: admin.credential.cert(firebaseConfig)
});

console.log("Firebase Admin inicializado correctamente!");

// Si luego quieres Firestore:
// const db = admin.firestore();

// =============================
//  MIDDLEWARE
// =============================
app.use(express.json());
app.use(express.static("public"));

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/public/login.html");
});


// =============================
//  BASE DE DATOS TEMPORAL
// =============================
let pedidos = [];
let ultimoId = 1;

// =============================
//  SOCKET BROADCAST
// =============================
function broadcastPedidos() {
    io.emit("pedidos_actualizados", pedidos);
}

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/public/login.html");
});


// =============================
//  RUTAS API
// =============================

// Crear pedido
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

// Marcar completado
app.post("/api/completar/:id", (req, res) => {
    const pedido = pedidos.find(p => p.id == req.params.id);
    if (!pedido) return res.status(404).json({ error: "No existe" });

    pedido.estado = "completado";

    broadcastPedidos();
    res.json({ ok: true, pedido });
});

// =============================
//  SERVIDOR
// =============================
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log("API lista en puerto " + PORT);
});
