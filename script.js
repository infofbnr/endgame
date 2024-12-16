document.addEventListener("DOMContentLoaded", () => {
    // Function to load the word list from a file
    function loadWordlist(filename) {
        return fetch(filename)
            .then(response => response.text())
            .then(data => data.split("\n").map(line => line.trim().toLowerCase()));
    }

    // Function to clean the word list
    function cleanWordlist(wordlist) {
        return wordlist.map(word => word.replace(/[^a-zA-Z]/g, '')).filter(word => word.length > 0);
    }

    let wordlist = [];
    let generatedWord = "";
    let history = [];
    let usedWords = new Set();
    let lives = 3;

    function getRandomWord() {
        return wordlist[Math.floor(Math.random() * wordlist.length)];
    }

    function updateGameState(word) {
        generatedWord = word;
        document.getElementById("generated-word").textContent = `The generated word is: ${generatedWord}`;
        document.getElementById("history").textContent = `History: ${history.join(' -> ')}`;
        document.getElementById("lives").textContent = `Lives: ${lives}`;
    }

    function validateWord(userWord) {
        if (!wordlist.includes(userWord)) {
            return "The word is not in the word list.";
        }
        if (usedWords.has(userWord)) {
            return "You already used this word.";
        }
        if (userWord.charAt(0) !== generatedWord.charAt(generatedWord.length - 1)) {
            return `The word must start with '${generatedWord.charAt(generatedWord.length - 1)}' but starts with '${userWord.charAt(0)}'.`;
        }
        return true;
    }

    document.getElementById("game-form").addEventListener("submit", (event) => {
        event.preventDefault();
        const userWord = document.getElementById("user-word").value.trim().toLowerCase();

        const validation = validateWord(userWord);
        if (validation === true) {
            usedWords.add(userWord);
            history.push(userWord);
            updateGameState(userWord);
            document.getElementById("user-word").value = "";
            document.getElementById("error-message").textContent = "";

            // Update the word list based on the last letter of the user's word
            const newGeneratedWord = userWord.charAt(userWord.length - 1);
            wordlist = wordlist.filter(word => word.startsWith(newGeneratedWord));

            if (wordlist.length > 0) {
                updateGameState(getRandomWord());
            } else {
                alert("No more words available starting with that letter.");
                window.location.reload(); // Reload the game when no more words are available
            }

        } else {
            document.getElementById("error-message").textContent = validation;
            lives -= 1;
            document.getElementById("lives").textContent = `Lives: ${lives}`;

            if (lives === 0) {
                alert("Game over! You've run out of lives.");
                window.location.reload();
            }
        }
    });

    // Load and clean the word list
    loadWordlist("wordlist.txt")
        .then(data => cleanWordlist(data))
        .then(cleanedWords => {
            wordlist = cleanedWords;
            // Initialize the game with a random word
            updateGameState(getRandomWord());
        });
});
