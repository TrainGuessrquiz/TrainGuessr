function initResult() {
    const gameResult = localStorage.getItem('gameResult');
    if (!gameResult) {
        window.location.href = 'start.html';
        return;
    }
    
    const result = JSON.parse(gameResult);
    
    document.getElementById('final-results').innerHTML = `
        <p><strong>${result.username}</strong>さんの結果</p>
        <p>正解数: ${result.correctCount}問</p>
        <p>不正解数: ${result.incorrectCount}問</p>
        <h3>最終スコア: ${result.score}点</h3>
    `;
    
    localStorage.removeItem('gameResult');
}

document.getElementById('restart-button').addEventListener('click', () => {
    window.location.href = 'start.html';
});

document.addEventListener('DOMContentLoaded', initResult);
