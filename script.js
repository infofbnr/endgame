document.addEventListener("DOMContentLoaded", () => {
    // Function to load and clean the word list
    async function loadAndCleanWordlist(filename) {
        const response = await fetch(filename);
        const data = await response.text();
        return data
            .split("\n")
            .map(line => line.trim().toLowerCase())
            .filter(word => /^[a-z]+$/.test(word) && word.length > 0);
    }

    let wordlist = [];
    let generatedWord = "";
    let history = [];
    let usedWords = new Set();
    let lives = 3;

    const playerScores = JSON.parse(localStorage.getItem("playerScores")) || {};

    // DOM Elements
    const generatedWordEl = document.getElementById("generated-word");
    const historyEl = document.getElementById("history");
    const livesEl = document.getElementById("lives");
    const errorMessageEl = document.getElementById("error-message");
    const userWordInput = document.getElementById("user-word");
    const gameForm = document.getElementById("game-form");

    const modal = document.getElementById("score-modal");
    const closeModalBtn = document.querySelector(".close");
    const saveScoreBtn = document.getElementById("save-score-btn");
    const playerNameInput = document.getElementById("player-name");

    function getRandomWord() {
        return wordlist[Math.floor(Math.random() * wordlist.length)];
    }

    function updateGameState() {
        generatedWordEl.textContent = `The generated word is: ${generatedWord}`;
        historyEl.textContent = `History: ${history.join(" -> ")}`;
        livesEl.textContent = `Lives: ${lives}`;
    }

    function validateWord(userWord) {
        const lowercasedWord = userWord.toLowerCase();
        if (!wordlist.includes(lowercasedWord)) {
            return "The word is not in the word list.";
        }
        if (usedWords.has(lowercasedWord)) {
            return "You already used this word.";
        }
        if (lowercasedWord.charAt(0) !== generatedWord.charAt(generatedWord.length - 1)) {
            return `The word must start with '${generatedWord.charAt(generatedWord.length - 1)}' but starts with '${lowercasedWord.charAt(0)}'.`;
        }
        return true;
    }

    function handleGameOver(message, score) {
        alert(message); // Optional: Display the final message
        openSaveScoreModal(score);
    }

    function openSaveScoreModal(score) {
        modal.style.display = "flex";
        saveScoreBtn.onclick = () => {
            const playerName = playerNameInput.value.trim();
            if (playerName) {
                playerScores[playerName] = (playerScores[playerName] || 0) + score;
                localStorage.setItem("playerScores", JSON.stringify(playerScores));
                modal.style.display = "none";
                playerNameInput.value = ""; // Clear input
                window.location.reload(); // Restart the game
            } else {
                alert("Please enter your name to save your score.");
            }
        };
    }

    closeModalBtn.onclick = () => {
        modal.style.display = "none";
    };

    window.onclick = (event) => {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    };

    gameForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const userWord = userWordInput.value.trim().toLowerCase();
        const validation = validateWord(userWord);

        if (validation === true) {
            usedWords.add(userWord);
            history.push(userWord);
            errorMessageEl.textContent = "";

            // Find the next word
            const lastChar = userWord.charAt(userWord.length - 1);
            const filteredWordlist = wordlist.filter(word => word.startsWith(lastChar) && !usedWords.has(word));

            if (filteredWordlist.length > 0) {
                generatedWord = filteredWordlist[Math.floor(Math.random() * filteredWordlist.length)];
            } else {
                handleGameOver("No more words available. You win!", history.length);
            }
        } else {
            errorMessageEl.textContent = validation;
            lives -= 1;

            if (lives === 0) {
                handleGameOver("Game over! You've run out of lives.", history.length);
            }
        }
        updateGameState();
        userWordInput.value = "";
    });

    // Initialize the game
    loadAndCleanWordlist("wordlist.txt").then(cleanedWords => {
        wordlist = cleanedWords;
        generatedWord = getRandomWord();
        updateGameState();
    });
});
