import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import {
    getFirestore,
    doc,
    setDoc,
    getDoc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js";

// Initialize Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDoM2DyaxuSD-1vSiHGnZGkKpiEQAcH-M4",
    authDomain: "leaderboard-3197e.firebaseapp.com",
    projectId: "leaderboard-3197e",
    storageBucket: "leaderboard-3197e.appspot.com",
    messagingSenderId: "74363128000",
    appId: "1:74363128000:web:b398cf2849d17670914525",
    measurementId: "G-5065D2Q9LM"
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
export { db, auth };

// Sync leaderboard with Firestore
async function syncLeaderboardToFirestore(username, newScore) {
    if (!username || username.toLowerCase() === "guest") return; 

    const userRef = doc(db, "leaderboard", username);
    try {
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
            const data = docSnap.data();
            if (newScore > data.score) {
                await updateDoc(userRef, { score: newScore });
                console.log(`✅ Score updated for ${username}`);
            } else {
                console.log(`⚠️ Not updating: ${newScore} is lower than ${data.score}`);
            }
        } else {
            await setDoc(userRef, { username, score: newScore });
            console.log(`🆕 Added ${username} to Firestore leaderboard.`);
        }
    } catch (error) {
        console.error("❌ Firestore update error:", error);
    }
}

// Listen for auth changes and sync leaderboard
onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log("User signed in, checking leaderboard sync...");
        const leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];
        if (leaderboard.length > 0) {
            syncLeaderboardToFirestore();
        }
    }
});

// Listen for localStorage changes
window.addEventListener("storage", (event) => {
    if (event.key === "leaderboard") {
        console.log("Leaderboard updated, syncing with Firestore...");
        syncLeaderboardToFirestore();
    }
});

// Check every 10 seconds in case storage event doesn't fire
setInterval(() => {
    const leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];
    if (leaderboard.length > 0) {
        syncLeaderboardToFirestore();
    }
}, 10000);
