import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile
} from "https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js";

// Initialize Firebase (Replace with your Firebase config)
const firebaseConfig = {
    apiKey: "AIzaSyDoM2DyaxuSD-1vSiHGnZGkKpiEQAcH-M4",
    authDomain: "leaderboard-3197e.firebaseapp.com",
    databaseURL: "https://leaderboard-3197e-default-rtdb.firebaseio.com",
    projectId: "leaderboard-3197e",
    storageBucket: "leaderboard-3197e.firebasestorage.app",
    messagingSenderId: "74363128000",
    appId: "1:74363128000:web:b398cf2849d17670914525",
    measurementId: "G-5065D2Q9LM"
  };
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Elements
const authForm = document.getElementById("auth-form");
const signUpEmail = document.getElementById("signUpEmail");
const signUpPassword = document.getElementById("signUpPassword");
const signUpButton = document.getElementById("signUpButton");
const signInEmail = document.getElementById("signInEmail");
const signInPassword = document.getElementById("signInPassword");
const signInButton = document.getElementById("signInButton");
const signOutButton = document.getElementById("signOutButton");
const usernameInput = document.getElementById("username"); 
const authStatus = document.getElementById("auth-status"); 

// Sign Up Function
signUpButton.addEventListener("click", async () => {
    const email = signUpEmail.value;
    const password = signUpPassword.value;
    const username = usernameInput.value || "Guest";

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: username });
        alert("Account created successfully! You are now logged in.");
    } catch (error) {
        console.error("Sign-up error:", error.message);
        alert(error.message);
    }
});

const gameContainer = document.getElementById("game-container"); 

// Check if the user is signed in
onAuthStateChanged(auth, (user) => {
    if (user) {
        // User is signed in
        authForm.style.display = "none";  // Hide login form
        gameContainer.classList.remove("hidden");  // Show the game
        authStatus.innerText = `Logged in as: ${user.displayName || user.email}`;
        signOutButton.style.display = "block";
    } else {
        // User is not signed in
        authForm.style.display = "block";  // Show login form
        gameContainer.classList.add("hidden");  // Hide the game
        authStatus.innerText = "Not signed in";
        signOutButton.style.display = "none";
    }
});

// Sign In Function
signInButton.addEventListener("click", async () => {
    const email = signInEmail.value;
    const password = signInPassword.value;

    try {
        await signInWithEmailAndPassword(auth, email, password);
        alert("Signed in successfully!");
    } catch (error) {
        console.error("Sign-in error:", error.message);
        alert(error.message);
    }
});

// Sign Out Function
signOutButton.addEventListener("click", async () => {
    await signOut(auth);
    alert("Signed out successfully.");
});

// Check if User is Signed In
onAuthStateChanged(auth, (user) => {
    if (user) {
        authStatus.innerText = `Logged in as: ${user.displayName || user.email}`;
        signOutButton.style.display = "block";
    } else {
        authStatus.innerText = "Not signed in";
        signOutButton.style.display = "none";
    }
});
