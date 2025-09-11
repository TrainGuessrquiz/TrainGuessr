// 整理: グローバル変数の定義
let socket = null;
let currentQuiz = null;
let timeLeft = 30;
let heartsRemaining = 5;
let currentQuestionNumber = 1;
let totalQuestions = 15;
let hasAnswered = false;
let gameEnded = false;

function initMultiplayerGame() {
    // 整理: DOM要素の取得
    const questionCounter = document.getElementById('question-counter');
    const timer = document.getElementById('timer');
    const lineLogos = document.getElementById('line-logos');
    const inputBox = document.getElementById('input-box');
    const submitButton = document.getElementById('submit-button');
    const result = document.getElementById('result');
    const answerStatus = document.getElementById('answer-status');
    const answerMessage = document.getElementById('answer-message');
    
    // ハートの初期化
    updateHearts();

    const username = localStorage.getItem('currentUsername');
    const avatar = localStorage.getItem('selectedAvatar');
    const roomPassword = localStorage.getItem('roomPassword');
    const roomId = localStorage.getItem('roomId');

    if (!username || !avatar) {
        alert('セッション情報が見つかりません。');
        window.location.href = 'start.html';
        return;
    }
    
    // 修正: ルーム識別子の取得ロジックを整理
    const effectiveRoomId = roomId || roomPassword;
    if (!effectiveRoomId) {
        alert('ルーム情報が見つかりません。');
        window.location.href = 'start.html';
        return;
    }

    socket = io();

    socket.on('connect', () => {
        // DOM要素とイベントリスナーの初期化完了を確実にするため遅延実行
        setTimeout(() => {
            socket.emit('rejoin-game', {
                roomId: effectiveRoomId,
                password: roomPassword, // 後方互換性のため保持
                username: username,
                avatar: avatar
            });
        }, 200);
    });

    // 修正: エラーハンドリングを整理
    socket.on('rejoin-failed', (data) => {
        alert(`ゲームへの再参加に失敗しました: ${data.reason}`);
        window.location.href = 'start.html';
    });

    // 修正: 初期プレイヤー情報の読み込み処理を整理
    const gameStartPlayers = localStorage.getItem('gameStartPlayers');
    if (gameStartPlayers) {
        try {
            const players = JSON.parse(gameStartPlayers);
            updatePlayersPanel(players);
            localStorage.removeItem('gameStartPlayers');
        } catch (error) {
            console.error('Error parsing initial players:', error);
        }
    }


    // 修正: 問題受信イベントハンドラーを整理
    socket.on('new-question', (data) => {
        currentQuiz = data;
        hasAnswered = false;
        currentQuestionNumber = data.questionNumber;
        totalQuestions = data.totalQuestions;
        showQuestion(data);
        updateQuestionCounter();
    });


    // 修正: プレイヤー情報更新イベントハンドラーを一元化
    socket.on('players-update', updatePlayersPanel);

    // 整理: 正解時の回答結果処理（正解が表示される）
    socket.on('answer-result', (data) => {
        if (data.correct) {
            showAnswerStatus('正解！', 'correct');
            result.textContent = `正解は「${data.correctAnswer}」でした。`;
        }
        
        inputBox.disabled = true;
        submitButton.disabled = true;
    });
    
    // 整理: 不正解時の個別通知処理（正解を表示しない）
    socket.on('player-incorrect', (data) => {
        showAnswerStatus('不正解', 'incorrect');
        result.textContent = data.message || '不正解です。ゲームは継続します。';
        heartsRemaining = Math.max(0, heartsRemaining - 1);
        updateHearts();
        
        inputBox.disabled = true;
        submitButton.disabled = true;
        
        if (heartsRemaining <= 0) {
            result.textContent += ' ゲームオーバー！';
        }
    });

    // 修正: サーバー管理タイマー更新処理
    socket.on('timer-update', (data) => {
        timeLeft = data.timeLeft;
        timer.textContent = `残り時間: ${timeLeft}秒`;
    });

    // 修正: タイムアップ処理を整理
    socket.on('time-up', (data) => {
        showAnswerStatus('時間切れ！', 'incorrect');
        result.textContent = `時間切れ！正解は「${data.correctAnswer}」でした。`;
        inputBox.disabled = true;
        submitButton.disabled = true;
        
        if (!hasAnswered) {
            heartsRemaining = Math.max(0, heartsRemaining - 1);
            updateHearts();
        }
    });

    socket.on('next-question', () => {
        setTimeout(() => {
            currentQuestionNumber++;
            if (currentQuestionNumber <= totalQuestions) {
                resetQuestionUI();
            }
        }, 3000);
    });

    // 修正: ゲーム終了処理を整理
    socket.on('game-over', (data) => {
        console.log('Received game-over event with data:', data);
        if (!gameEnded) {
            gameEnded = true;
            showGameOverScreen(data);
        }
    });

    // 修正: プレイヤー状態変更通知を整理
    socket.on('player-eliminated', (data) => {
        showAnswerStatus(`${data.username} が脱落しました`, 'incorrect');
    });

    socket.on('player-disconnected', (data) => {
        showAnswerStatus(`${data.username} が切断されました`, 'incorrect');
    });

    submitButton.addEventListener('click', () => {
        if (hasAnswered || inputBox.disabled) return;
        
        const answer = inputBox.value.trim();
        if (!answer) return;
        
        hasAnswered = true;
        socket.emit('submit-answer', {
            answer: answer.toLowerCase()
        });
        
        inputBox.disabled = true;
        submitButton.disabled = true;
    });

    inputBox.addEventListener('keypress', (event) => {
        if (event.key === 'Enter' && !hasAnswered && !inputBox.disabled) {
            submitButton.click();
        }
    });

    document.getElementById('home-button').addEventListener('click', () => {
        socket.emit('leave-room');
        localStorage.removeItem('multiplayerRole');
        localStorage.removeItem('roomPassword');
        localStorage.removeItem('selectedAvatar');
        window.location.href = 'start.html';
    });

    function showQuestion(quiz) {
        lineLogos.innerHTML = '';
        quiz.lines.forEach(line => {
            const lineItem = document.createElement('div');
            lineItem.className = 'line-item';
            
            const img = document.createElement('img');
            img.src = `/images/line-logos/${line}.png`;
            img.alt = line;
            img.className = 'line-logo';
            img.onerror = () => {
                img.style.display = 'none';
            };
            
            const name = document.createElement('div');
            name.className = 'line-name';
            name.textContent = line;
            
            lineItem.appendChild(img);
            lineItem.appendChild(name);
            lineLogos.appendChild(lineItem);
        });
    }


    function updateQuestionCounter() {
        questionCounter.textContent = `問題 ${currentQuestionNumber} / ${totalQuestions}`;
    }

    function updateHearts() {
        // 整理: 右から左へ減らすハート表示ロジック
        for (let i = 0; i < 5; i++) {
            const heartElement = document.getElementById(`heart-${i}`);
            if (heartElement) {
                if (i >= 5 - heartsRemaining) {
                    heartElement.src = '/images/heart/heart_max.png';
                } else {
                    heartElement.src = '/images/heart/heart_empty.png';
                }
            }
        }
    }

    function resetQuestionUI() {
        // 整理: 新しい問題時のUIリセット
        inputBox.value = '';
        inputBox.disabled = false;
        submitButton.disabled = false;
        result.textContent = '';
        hasAnswered = false;
        hideAnswerStatus();
        inputBox.focus();
    }

    function showAnswerStatus(message, type) {
        answerMessage.textContent = message;
        answerStatus.className = `answer-status ${type}`;
        answerStatus.style.display = 'block';
        
        setTimeout(() => {
            hideAnswerStatus();
        }, 3000);
    }

    function hideAnswerStatus() {
        answerStatus.style.display = 'none';
    }

    // 整理: プレイヤーパネル更新処理
    function updatePlayersPanel(players) {
        if (!players || !Array.isArray(players)) return;
        
        const maxScore = Math.max.apply(Math, players.map(function(p) { return p.score || 0; }));
        
        // 全スロットを空にリセット
        for (let i = 0; i < 4; i++) {
            const slot = document.getElementById(`player-slot-${i}`);
            if (slot) {
                slot.className = 'player-window empty';
                slot.innerHTML = '<div class="empty-message">待機中...</div>';
            }
        }
        
        // プレイヤー情報でスロットを埋める
        players.forEach((player, index) => {
            if (index < 4) {
                const slot = document.getElementById(`player-slot-${index}`);
                if (!slot) return;
                
                const isLeader = (player.score || 0) === maxScore && maxScore > 0;
                slot.className = `player-window${isLeader ? ' leader' : ''}`;
                
                const avatarElement = player.avatar && player.avatar.includes('.png') 
                    ? `<img src="/images/avatars/${player.avatar}" alt="アバター" style="width: 48px; height: 48px; border-radius: 50%; margin-bottom: 8px;">`
                    : `<div style="font-size: 48px; margin-bottom: 8px;">${player.avatar || '👤'}</div>`;
                
                slot.innerHTML = `
                    ${isLeader ? '<div class="leader-crown">👑</div>' : ''}
                    <div class="player-avatar">${avatarElement}</div>
                    <div class="player-name" style="font-size: 14px; font-weight: bold; color: #e0e6ed; margin-bottom: 4px;">${player.username || 'Unknown'}</div>
                    <div class="player-score" style="font-size: 16px; font-weight: bold; color: #fff200; margin-bottom: 4px;">${player.score || 0}点</div>
                    <div class="player-hearts" style="font-size: 12px;">
                        ${generateHeartIcons(player.hearts || 5)}
                    </div>
                `;
            }
        });
    }

    function generateHeartIcons(hearts) {
        let heartIcons = '';
        for (let i = 0; i < 5; i++) {
            // 右から左へ減るロジック（メインハートと同じ）
            if (i >= 5 - hearts) {
                heartIcons += '❤️';
            } else {
                heartIcons += '🖤';
            }
        }
        return heartIcons;
    }

    function showGameOverScreen(data) {
        const gameOverScreen = document.getElementById('game-over-screen');
        const winnerAnnouncement = document.getElementById('winner-announcement');
        const finalRankings = document.getElementById('final-rankings');
        
        if (!data || !data.rankings || data.rankings.length === 0) {
            console.error('Invalid ranking data received:', data);
            winnerAnnouncement.textContent = 'ゲーム終了';
            finalRankings.innerHTML = '<div>ランキングデータが利用できません</div>';
            gameOverScreen.style.display = 'flex';
            return;
        }
        
        const winner = data.rankings[0];
        winnerAnnouncement.textContent = `🏆 ${winner.username} の勝利！`;
        
        finalRankings.innerHTML = '';
        data.rankings.forEach((player, index) => {
            const rankingItem = document.createElement('div');
            rankingItem.className = 'ranking-item-final';
            const avatarElement = player.avatar && player.avatar.includes('.png') 
                ? `<img src="/images/avatars/${player.avatar}" alt="アバター" style="width: 40px; height: 40px; border-radius: 50%;">`
                : `<div style="font-size: 32px;">${player.avatar || '👤'}</div>`;
            
            rankingItem.innerHTML = `
                <div class="ranking-position">${index + 1}位</div>
                <div class="player-avatar">${avatarElement}</div>
                <div class="player-details">
                    <div class="player-name">${player.username}</div>
                    <div class="player-score">${player.score}点</div>
                </div>
            `;
            finalRankings.appendChild(rankingItem);
        });
        
        gameOverScreen.style.display = 'flex';
    }

    window.addEventListener('beforeunload', () => {
        if (socket) {
            socket.emit('leave-room');
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    // 整理: DOM読み込み後にゲーム初期化
    setTimeout(initMultiplayerGame, 100);
});