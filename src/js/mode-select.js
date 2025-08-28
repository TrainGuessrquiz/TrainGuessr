let selectedMode = null;

function initModeSelection() {
    const cards = document.querySelectorAll('.mode-card');
    const backButton = document.getElementById('back-button');

    cards.forEach(card => {
        card.addEventListener('click', () => {
            selectedMode = card.getAttribute('data-mode');
            
            localStorage.setItem('multiplayerRole', selectedMode);
            
            window.location.href = 'char-select.html';
        });
    });

    backButton.addEventListener('click', () => {
        localStorage.removeItem('multiplayerRole');
        window.location.href = 'start.html';
    });
}

document.addEventListener('DOMContentLoaded', initModeSelection);