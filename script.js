document.addEventListener('DOMContentLoaded', () => {
    // Load word list from an external file
    async function fetchWordList(url) {
        const response = await fetch(url);
        const text = await response.text();
        return text.split('\n')
            .map(word => word.trim().toLowerCase())
            .filter(word => /^[a-z]+$/.test(word) && word.length > 0); // Adjust for Armenian alphabet
    }
    const faqItems = document.querySelectorAll('.faq-item h2');

    faqItems.forEach(item => {
        item.addEventListener('click', () => {
            const answer = item.nextElementSibling;

            if (answer.style.display === 'block') {
                answer.style.display = 'none';
            } else {
                answer.style.display = 'block';
            }
        });
    });
    
    let wordList = [];
    let generatedWord = '';
    let history = [];
    let usedWords = new Set();
    let lives = 3;

    // DOM elements
    const generatedWordElement = document.getElementById('generated-word');
    const historyElement = document.getElementById('history');
    const livesElement = document.getElementById('lives');
    const errorMessageElement = document.getElementById('error-message');
    const userWordInput = document.getElementById('user-word');
    const gameForm = document.getElementById('game-form');

    // Load game state from localStorage
    function loadGameState() {
        const savedState = JSON.parse(localStorage.getItem('gameState'));
        if (savedState) {
            history = savedState.history || [];
            lives = savedState.lives || 3;
            generatedWord = savedState.generatedWord || 'start'; // Armenian default start
        } else {
            resetGame();
        }
    }

    // Save game state to localStorage
    function saveGameState() {
        localStorage.setItem('gameState', JSON.stringify({
            history,
            lives,
            generatedWord
        }));
    }

    // Pick a random word from the word list
    function pickRandomWord() {
        return wordList[Math.floor(Math.random() * wordList.length)];
    }

    // Update the DOM with current game state
    function updateUI() {
        generatedWordElement.textContent = `The generated word is: ${generatedWord}`;
        historyElement.textContent = `History: ${history.join(' -> ')}`;
        livesElement.textContent = `Lives: ${lives}`;
        saveGameState();
    }

    // Check if the user's word is valid
    function validateWord(userWord) {
        const lowerWord = userWord.toLowerCase();
        if (!wordList.includes(lowerWord)) {
            return 'The word is not in the word list.';
        }
        if (usedWords.has(lowerWord)) {
            return 'You already used this word.';
        }
        if (lowerWord.charAt(0) !== generatedWord.charAt(generatedWord.length - 1)) {
            return `The word must start with '${generatedWord.charAt(generatedWord.length - 1)}' but starts with '${lowerWord.charAt(0)}'.`;
        }
        return true;
    }

    // Reset the game state
    function resetGame() {
        history = [];
        usedWords = new Set();
        lives = 3;
        generatedWord = pickRandomWord();
        saveGameState();
        updateUI();
    }

    // Handle game form submission
    gameForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const userWord = userWordInput.value.trim().toLowerCase();
        const validationResult = validateWord(userWord);

        if (validationResult === true) {
            usedWords.add(userWord);
            history.push(userWord);
            errorMessageElement.textContent = '';

            const nextLetter = userWord.charAt(userWord.length - 1);
            const nextWords = wordList.filter(word => word.startsWith(nextLetter) && !usedWords.has(word));

            if (nextWords.length > 0) {
                generatedWord = nextWords[Math.floor(Math.random() * nextWords.length)];
            } else {
                endGame('No more words available. You win!', history.length);
            }
        } else {
            errorMessageElement.textContent = validationResult;
            if (lives > 0) {
                lives -= 1;
                if (lives === 0) {
                    endGame("Game over! You've run out of lives.", history.length);
                }
            }
        }

        updateUI();
        userWordInput.value = '';
    });
    let timerInterval;
    const timerElement = document.getElementById('timer');
    const timeLeftElement = document.getElementById('time-left');
    const timedModeButton = document.getElementById('timed-mode');
    const untimedModeButton = document.getElementById('untimed-mode');
    let timeLeft = 60; // Default time for timed mode in seconds

    // Function to start the timer
    function startTimer() {
        timerElement.style.display = 'block';
        timeLeft = 60;
        updateTimerUI();

        timerInterval = setInterval(() => {
            timeLeft -= 1;
            updateTimerUI();

            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                endGame("Time's up! Game over!", history.length);
            }
        }, 1000);
    }

    // Update timer UI
    function updateTimerUI() {
        timeLeftElement.textContent = timeLeft;
    }

    // Stop the timer
    function stopTimer() {
        clearInterval(timerInterval);
        timerElement.style.display = 'none';
    }

    // Event listeners for mode selection
    timedModeButton.addEventListener('click', () => {
        resetGame();
        startTimer();
    });

    untimedModeButton.addEventListener('click', () => {
        resetGame();
        stopTimer();
    });

    // Initialize game state as untimed by default
    stopTimer();
    // Initialize game state
    loadGameState();
    fetchWordList('wordlist.txt').then(loadedWordList => {
        wordList = loadedWordList;
        if (generatedWord === 'start') {
            generatedWord = pickRandomWord();
        }
        updateUI();
    });
    function endGame(message, score) {
        stopTimer(); // Ensure timer stops
        const username = prompt("Enter your username:") || "Guest";
        updateLeaderboard(username, score); // Save to leaderboard
        alert(`${message} Your score: ${score}`);
        resetGame();
    }
    
    // Save player score to leaderboard
    function updateLeaderboard(username, score) {
        const leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];
    
        const existingUserIndex = leaderboard.findIndex(
            (entry) => entry.username === username
        );
    
        if (existingUserIndex !== -1) {
            if (leaderboard[existingUserIndex].score < score) {
                leaderboard[existingUserIndex].score = score;
            }
        } else {
            leaderboard.push({ username, score });
        }
    
        leaderboard.sort((a, b) => b.score - a.score);
        localStorage.setItem("leaderboard", JSON.stringify(leaderboard));
    }

});
