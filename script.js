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

    // DOM Elements
    const generatedWordEl = document.getElementById("generated-word");
    const historyEl = document.getElementById("history");
    const livesEl = document.getElementById("lives");
    const errorMessageEl = document.getElementById("error-message");
    const userWordInput = document.getElementById("user-word");
    const gameForm = document.getElementById("game-form");

    // Load Game State
    function loadGameState() {
        const savedState = JSON.parse(localStorage.getItem("gameState"));
        if (savedState) {
            history = savedState.history || [];
            lives = savedState.lives || 3;
            generatedWord = savedState.generatedWord || "start";
        } else {
            history = [];
            lives = 3;
            generatedWord = "start";
        }
    }

    // Save Game State
    function saveGameState() {
        localStorage.setItem("gameState", JSON.stringify({
            history: history,
            lives: lives,
            generatedWord: generatedWord
        }));
    }

    function getRandomWord() {
        return wordlist[Math.floor(Math.random() * wordlist.length)];
    }

    function updateGameState() {
        generatedWordEl.textContent = `The generated word is: ${generatedWord}`;
        historyEl.textContent = `History: ${history.join(" -> ")}`;
        livesEl.textContent = `Lives: ${lives}`;
        saveGameState(); // Save state after every update
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
            if (lives > 0) {
                lives -= 1;
                if (lives === 0) {
                    handleGameOver("Game over! You've run out of lives.", history.length);
                }
            }
        }
        updateGameState();
        userWordInput.value = "";
    });

    function handleGameOver(message, score) {
        alert(`${message} Your score: ${score}`);
        resetGameState();
    }

    function resetGameState() {
        history = [];
        usedWords = new Set();
        lives = 3;
        generatedWord = getRandomWord();
        saveGameState();
        updateGameState();
    }

    // Initialize the game
    loadGameState();
    loadAndCleanWordlist("wordlist.txt").then(cleanedWords => {
        wordlist = cleanedWords;
        if (generatedWord === "start") {
            generatedWord = getRandomWord(); // Only generate a word if it's a fresh game
        }
        updateGameState();
    });
});
