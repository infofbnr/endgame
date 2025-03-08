import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js";  // Make sure this is included

const firebaseConfig = {
    apiKey: "AIzaSyDoM2DyaxuSD-1vSiHGnZGkKpiEQAcH-M4",
    authDomain: "leaderboard-3197e.firebaseapp.com",
    projectId: "leaderboard-3197e",
    storageBucket: "leaderboard-3197e.appspot.com",
    messagingSenderId: "74363128000",
    appId: "1:74363128000:web:b398cf2849d17670914525",
    measurementId: "G-5065D2Q9LM"
};

// Initialize Firebase (only once)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

const db = getFirestore(app);
const auth = getAuth(app);

// Function to sync leaderboard with Firestore
async function syncLeaderboardToFirestore() {
    const user = auth.currentUser;
    if (!user) return; // Don't store if user isn't signed in

    const leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];

    for (const entry of leaderboard) {
        if (!entry.username || entry.username.toLowerCase() === "guest") {
            console.warn("Skipping invalid username:", entry.username);
            continue;
        }

        const userRef = doc(db, "leaderboard", entry.username);
        try {
            const docSnap = await getDoc(userRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                if (entry.score > data.score) {
                    await setDoc(userRef, { username: entry.username, score: entry.score }, { merge: true });
                    console.log(`✅ Updated score for ${entry.username} in Firestore.`);
                } else {
                    console.log(`⚠️ Score not updated: ${entry.score} is not higher than ${data.score}.`);
                }
            } else {
                await setDoc(userRef, { username: entry.username, score: entry.score });
                console.log(`🆕 New user ${entry.username} added to Firestore leaderboard.`);
            }
        } catch (error) {
            console.error("❌ Error updating Firestore leaderboard:", error);
        }
    }
}

// Listen for auth state changes and sync leaderboard when a user is signed in
onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log("User signed in, syncing leaderboard...");
        syncLeaderboardToFirestore();
    } else {
        console.log("No user signed in.");
    }
});

// Listen for localStorage changes
window.addEventListener("storage", (event) => {
    if (event.key === "leaderboard") {
        console.log("Leaderboard updated, syncing with Firestore...");
        syncLeaderboardToFirestore();
    }
});
