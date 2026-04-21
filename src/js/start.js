function startGame() {
    const username = document.getElementById('username-input').value.trim();
    if (!username) {
        alert('ユーザー名を入力してください');
        document.getElementById('username-input').focus();
        return;
    }
    
    localStorage.setItem('currentUsername', username);
    window.location.href = 'gamemode.html';
}

function showComingSoon(messageElementId) {
    const messageElement = document.getElementById(messageElementId);
    if (messageElement) {
        messageElement.textContent = '準備中です';
    }
}

document.getElementById('start-button').addEventListener('click', startGame);
document.getElementById('multiplayer-button').addEventListener('click', () => {
    showComingSoon('coming-soon-message');
});
document.getElementById('ranking-button').addEventListener('click', () => {
    showComingSoon('ranking-message');
});

document.getElementById('username-input').addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        startGame();
    }
});

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('username-input').focus();
});
