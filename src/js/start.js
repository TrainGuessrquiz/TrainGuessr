async function displayRankings(container) {
    const rankings = await getRankings();
    const topRankings = rankings.slice(0, 10);
    
    container.innerHTML = '';
    
    if (topRankings.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #888;">まだランキングがありません</p>';
        return;
    }
    
    topRankings.forEach((entry, index) => {
        const rankingItem = document.createElement('div');
        rankingItem.className = 'ranking-item';
        
        rankingItem.innerHTML = `
            <span class="ranking-rank">${index + 1}位</span>
            <span class="ranking-name">${entry.username}</span>
            <span class="ranking-score">${entry.score}点</span>
        `;
        
        container.appendChild(rankingItem);
    });
}

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

document.addEventListener('DOMContentLoaded', async () => {
    await displayRankings(document.getElementById('ranking-list'));
    document.getElementById('username-input').focus();
});