import { db } from "../firestore-sync.js";
import { collection, getDocs, query, orderBy, limit } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js";

async function loadLeaderboard() {
    const leaderboardRef = collection(db, "leaderboard");
    const leaderboardQuery = query(leaderboardRef, orderBy("score", "desc"), limit(10)); // Top 10 players
    const leaderboardSnapshot = await getDocs(leaderboardQuery);

    const leaderboardTable = document.querySelector(".leaderboard-table tbody");
    leaderboardTable.innerHTML = ""; // Clear previous data

    let rank = 1;
    leaderboardSnapshot.forEach((doc) => {
        const data = doc.data();
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${rank}</td>
            <td>${data.username}</td>
            <td>${data.score}</td>
        `;

        leaderboardTable.appendChild(row);
        rank++;
    });
}

// Load leaderboard when page loads
document.addEventListener("DOMContentLoaded", loadLeaderboard);
