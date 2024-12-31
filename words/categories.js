document.addEventListener('DOMContentLoaded', async () => {
    const armenianAlphabet = [
        'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 
        'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 
        'U', 'V', 'W', 'X', 'Y', 'Z'
    ];
    const wordListUrl = '../wordlist.txt';
    let wordList = [];

    // Fetch the word list
    async function fetchWordList(url) {
        try {
            const response = await fetch(url);
            const text = await response.text();
            return text.split('\n').map(word => word.trim()).filter(Boolean);
        } catch (error) {
            console.error('Error fetching word list:', error);
            return [];
        }
    }

    // Generate a random word starting with the given letter
    function getWordByLetter(letter) {
        // Filter words starting with the given letter (case-insensitive)
        const filteredWords = wordList.filter(word => {
            return word.toLowerCase().startsWith(letter.toLowerCase());
        });
    
        // If no words found, return message
        if (filteredWords.length === 0) {
            return 'No words found for this letter.';
        }
    
        // Pick a random word from the filtered list
        const randomWord = filteredWords[Math.floor(Math.random() * filteredWords.length)];
        return randomWord;
    }
    
    

    // Create the letter buttons
    function createLetterButtons() {
        const lettersContainer = document.getElementById('letters');
        armenianAlphabet.forEach(letter => {
            const button = document.createElement('button');
            button.textContent = letter;
            button.classList.add('letter-button');
            button.addEventListener('click', () => {
                const word = getWordByLetter(letter);
                displayGeneratedWord(letter, word);
            });
            lettersContainer.appendChild(button);
        });
    }

    // Display the generated word
    function displayGeneratedWord(letter, word) {
        const wordContainer = document.getElementById('generated-word');
        wordContainer.innerHTML = `<strong>${letter}</strong>: ${word}`;
    }

    // Initialize the app
    wordList = await fetchWordList(wordListUrl);
    createLetterButtons();
});
