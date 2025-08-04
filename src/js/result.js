async function displayRankings(container, highlightUser = null) {
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
        
        if (highlightUser && entry.username === highlightUser) {
            rankingItem.classList.add('current-user');
        }
        
        rankingItem.innerHTML = `
            <span class="ranking-rank">${index + 1}位</span>
            <span class="ranking-name">${entry.username}</span>
            <span class="ranking-score">${entry.score}点</span>
        `;
        
        container.appendChild(rankingItem);
    });
}

async function initResult() {
    const gameResult = localStorage.getItem('gameResult');
    if (!gameResult) {
        window.location.href = 'start.html';
        return;
    }
    
    const result = JSON.parse(gameResult);
    await saveScore(result.username, result.score);
    
    document.getElementById('final-results').innerHTML = `
        <p><strong>${result.username}</strong>さんの結果</p>
        <p>正解数: ${result.correctCount}問</p>
        <p>不正解数: ${result.incorrectCount}問</p>
        <h3>最終スコア: ${result.score}点</h3>
    `;
    
    await displayRankings(document.getElementById('ranking-list-result'), result.username);
    localStorage.removeItem('gameResult');
}

document.getElementById('restart-button').addEventListener('click', () => {
    window.location.href = 'start.html';
});

document.addEventListener('DOMContentLoaded', initResult);