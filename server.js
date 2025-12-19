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
const db = admin.firestore();


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


// =============================
//  SOCKET BROADCAST
// =============================
async function broadcastPedidos() {
    const snapshot = await db
        .collection("pedidos")
        .orderBy("fecha", "desc")
        .get();

    const pedidos = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));

    io.emit("pedidos_actualizados", pedidos);
}


app.get("/", (req, res) => {
    res.sendFile(__dirname + "/public/login.html");
});


// =============================
//  RUTAS API
// =============================

// Crear pedido
app.post("/api/pedidos", async (req, res) => {
    try {
        const { cliente, descripcion, precio } = req.body;

        const nuevo = {
            cliente,
            descripcion,
            precio,
            estado: "pendiente",
            trabajador: null,
            fecha: admin.firestore.FieldValue.serverTimestamp()
        };

        const doc = await db.collection("pedidos").add(nuevo);

        await broadcastPedidos();

        res.json({ ok: true, pedido: { id: doc.id, ...nuevo } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error creando pedido" });
    }
});


// Trabajador toma el pedido
app.post("/api/tomar/:id", async (req, res) => {
    try {
        const { trabajador } = req.body;
        const ref = db.collection("pedidos").doc(req.params.id);

        await ref.update({
            estado: "tomado",
            trabajador
        });

        await broadcastPedidos();
        res.json({ ok: true });
    } catch (error) {
        res.status(404).json({ error: "No existe" });
    }
});


// Marcar completado
app.post("/api/completar/:id", async (req, res) => {
    try {
        const ref = db.collection("pedidos").doc(req.params.id);

        await ref.update({
            estado: "completado"
        });

        await broadcastPedidos();
        res.json({ ok: true });
    } catch (error) {
        res.status(404).json({ error: "No existe" });
    }
});


// ------------------------------------------------------
//  Obtener pedidos de un cliente (estado + historial)
//  GET /api/misPedidos?torre=A&apartamento=301
// ------------------------------------------------------
app.get("/api/misPedidos", async (req, res) => {
    const { torre, apartamento } = req.query;
    if (!torre || !apartamento) return res.json([]);

    const clienteID = `${torre}-${apartamento}`;

    const snapshot = await db
        .collection("pedidos")
        .where("cliente", "==", clienteID)
        .orderBy("fecha", "desc")
        .get();

    const lista = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));

    res.json(lista);
});



// =============================
//  SERVIDOR
// =============================
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log("API lista en puerto " + PORT);
});
