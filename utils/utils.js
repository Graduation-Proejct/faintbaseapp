const { getDatabase, ref } = require("firebase/database");
const { getAuth } = require("firebase/auth");
const { initializeApp } = require("firebase/app");

const firebaseConfig = {
  apiKey: "AIzaSyAQrVmEij0MZ4l33nvDGXR93Pg4jyzF9JQ",
  authDomain: "testnodejs-c98d2.firebaseapp.com",
  projectId: "testnodejs-c98d2",
  storageBucket: "testnodejs-c98d2.appspot.com",
  messagingSenderId: "617972834114",
  appId: "1:617972834114:web:5b68bedb92fbb65b21b2db",
  measurementId: "G-HJ1LRZL788",
};

const firebase_app = initializeApp(firebaseConfig);
const db = getDatabase(firebase_app);
const dbRef = ref(db);
const auth = getAuth();

exports.dbRef = dbRef;
exports.auth = auth;
exports.db = db;
