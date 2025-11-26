// Importar Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";

// Configuración de Firebase
export const firebaseConfig = {
  apiKey: "AIzaSyDExeIAJNP4PwiIczzX5ScjKoVFn9FSTCs",
  authDomain: "basurasapp.firebaseapp.com",
  projectId: "basurasapp",
  storageBucket: "basurasapp.firebasestorage.app",
  messagingSenderId: "771285022096",
  appId: "1:771285022096:web:df28271ba1e71ba7a9af15",
  measurementId: "G-9XDKK0X1YZ"
};

// Inicializar Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
