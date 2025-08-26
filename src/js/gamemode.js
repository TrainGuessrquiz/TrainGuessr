let selectedGameMode = null;

function initGameModeSelection() {
    const cards = document.querySelectorAll('.gamemode-card');
    const startButton = document.getElementById('start-game-button');
    const backButton = document.getElementById('back-button');

    cards.forEach(card => {
        card.addEventListener('click', () => {
            cards.forEach(c => c.classList.remove('selected'));
            
            card.classList.add('selected');
            
            selectedGameMode = card.getAttribute('data-mode');
            
            startButton.disabled = false;
        });
    });

    startButton.addEventListener('click', () => {
        if (selectedGameMode) {
            localStorage.setItem('currentGameMode', selectedGameMode);
            
            window.location.href = 'game.html';
        }
    });

    backButton.addEventListener('click', () => {
        window.location.href = 'start.html';
    });
}

document.addEventListener('DOMContentLoaded', initGameModeSelection);