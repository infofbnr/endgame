// Fetch leaderboard from localStorage
function getLeaderboard() {
    const leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];
    return leaderboard;
}

// Display leaderboard on the page
function displayLeaderboard() {
    const leaderboard = getLeaderboard();
    const leaderboardElement = document.getElementById("leaderboard-list");
    leaderboardElement.innerHTML = ""; // Clear current leaderboard

    if (leaderboard.length === 0) {
        leaderboardElement.innerHTML = "<li>No scores yet!</li>";
    } else {
        leaderboard.slice(0, 10).forEach((entry) => {
            const leaderboardItem = document.createElement("li");
            leaderboardItem.textContent = `${entry.username}: ${entry.score}`;
            leaderboardElement.appendChild(leaderboardItem);
        });
    }
}

// Initialize leaderboard display
displayLeaderboard();
