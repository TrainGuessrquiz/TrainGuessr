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

document.getElementById('start-button').addEventListener('click', startGame);

document.getElementById('username-input').addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        startGame();
    }
});

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('username-input').focus();
});
