let socket = null;
let userRole = null;
let roomPassword = null;
let isHost = false;
let gameStarted = false;

function initWaitingRoom() {
    const roomPasswordDisplay = document.getElementById('room-password');
    const playersGrid = document.getElementById('players-grid');
    const playerCountDisplay = document.getElementById('player-count');
    const startButton = document.getElementById('start-button');
    const leaveButton = document.getElementById('leave-button');
    const waitingMessage = document.getElementById('waiting-message');
    const countdownSection = document.getElementById('countdown-section');
    const countdownTimer = document.getElementById('countdown-timer');

    const username = localStorage.getItem('currentUsername');
    const avatar = localStorage.getItem('selectedAvatar');
    userRole = localStorage.getItem('multiplayerRole');
    roomPassword = localStorage.getItem('roomPassword');

    if (!username || !avatar || !userRole || !roomPassword) {
        alert('セッション情報が見つかりません。最初からやり直してください。');
        window.location.href = 'start.html';
        return;
    }

    isHost = userRole === 'host';
    roomPasswordDisplay.textContent = roomPassword;

    if (isHost) {
        startButton.style.display = 'inline-block';
        waitingMessage.style.display = 'none';
    }

    socket = io();

    // 修正: Socket接続とルーム処理を整理
    socket.on('connect', () => {
        if (isHost) {
            socket.emit('create-room', {
                password: roomPassword,
                username: username,
                avatar: avatar
            });
        } else {
            socket.emit('join-room', {
                password: roomPassword,
                username: username,
                avatar: avatar
            });
        }
    });

    socket.on('room-created', (data) => {
        updatePlayersDisplay(data.players);
    });

    socket.on('room-joined', (data) => {
        updatePlayersDisplay(data.players);
    });

    socket.on('player-joined', (data) => {
        updatePlayersDisplay(data.players);
    });

    socket.on('player-left', (data) => {
        updatePlayersDisplay(data.players);
    });

    socket.on('room-not-found', () => {
        alert('指定されたルームが見つかりません。パスワードを確認してください。');
        window.location.href = 'char-select.html';
    });

    socket.on('room-full', () => {
        alert('ルームが満員です。');
        window.location.href = 'char-select.html';
    });

    socket.on('game-starting', (data) => {
        startCountdown(data.countdown);
    });

    // 修正: ゲーム開始イベント処理を整理
    socket.on('game-started', (data) => {
        if (!gameStarted) {
            gameStarted = true;
            
            // ルームIDを確実に保存
            if (data && data.roomId) {
                localStorage.setItem('roomId', data.roomId);
            } else if (roomPassword) {
                localStorage.setItem('roomId', roomPassword);
            }
            
            // プレイヤー情報も保存（ゲーム画面で使用）
            if (data && data.players) {
                localStorage.setItem('gameStartPlayers', JSON.stringify(data.players));
            }
            
            window.location.href = 'game-vs.html';
        }
    });

    startButton.addEventListener('click', () => {
        socket.emit('start-game');
        startButton.disabled = true;
    });

    leaveButton.addEventListener('click', () => {
        socket.emit('leave-room');
        localStorage.removeItem('multiplayerRole');
        localStorage.removeItem('roomPassword');
        localStorage.removeItem('selectedAvatar');
        window.location.href = 'start.html';
    });

    function updatePlayersDisplay(players) {
        playerCountDisplay.textContent = players.length;
        
        playersGrid.innerHTML = '';
        
        for (let i = 0; i < 4; i++) {
            const playerCard = document.createElement('div');
            
            if (i < players.length) {
                const player = players[i];
                playerCard.className = `player-card${player.isHost ? ' host' : ''}`;
                const avatarElement = player.avatar && player.avatar.includes('.png') 
                    ? `<img src="/images/avatars/${player.avatar}" alt="アバター" style="width: 40px; height: 40px; border-radius: 50%;">`
                    : `<div style="font-size: 32px;">${player.avatar || '👤'}</div>`;
                
                playerCard.innerHTML = `
                    ${player.isHost ? '<div class="host-crown">👑</div>' : ''}
                    <div class="player-avatar">${avatarElement}</div>
                    <div class="player-name">${player.username}</div>
                    <div class="player-role">${player.isHost ? 'HOST' : 'PLAYER'}</div>
                `;
            } else {
                playerCard.className = 'player-card empty';
                playerCard.innerHTML = '<div class="empty-slot">プレイヤーを待っています...</div>';
            }
            
            playersGrid.appendChild(playerCard);
        }

        if (isHost && players.length >= 2) {
            startButton.disabled = false;
        }
    }

    function startCountdown(seconds) {
        countdownSection.style.display = 'block';
        startButton.style.display = 'none';
        leaveButton.disabled = true;
        
        let remainingSeconds = seconds;
        countdownTimer.textContent = remainingSeconds;
        
        const countdownInterval = setInterval(() => {
            remainingSeconds--;
            countdownTimer.textContent = remainingSeconds;
            
            if (remainingSeconds <= 0) {
                clearInterval(countdownInterval);
            }
        }, 1000);
    }

    window.addEventListener('beforeunload', () => {
        if (socket) {
            socket.emit('leave-room');
        }
    });
}

document.addEventListener('DOMContentLoaded', initWaitingRoom);