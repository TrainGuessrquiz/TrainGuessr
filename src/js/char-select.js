let selectedAvatar = null;
let userRole = null;
let roomPassword = null;
let socket = null;

function initCharacterSelection() {
    const usernameDisplay = document.getElementById('username-display');
    const roleDisplay = document.getElementById('role-display');
    const passwordSection = document.getElementById('password-section');
    const passwordDisplay = document.getElementById('password-display');
    const passwordInputContainer = document.getElementById('password-input-container');
    const passwordCode = document.getElementById('password-code');
    const passwordInput = document.getElementById('password-input');
    const avatarOptions = document.querySelectorAll('.avatar-option');
    const enterRoomButton = document.getElementById('enterRoomButton');
    const backButton = document.getElementById('back-button');

    const username = localStorage.getItem('currentUsername');
    userRole = localStorage.getItem('multiplayerRole');
    

    if (!username || !userRole) {
        alert('セッション情報が見つかりません。最初からやり直してください。');
        window.location.href = 'start.html';
        return;
    }

    usernameDisplay.textContent = username;

    // Socket.IO client initialization
    socket = io();

    if (userRole === 'host') {
        roleDisplay.textContent = '👑 ホスト';
        roomPassword = generateRoomPassword();
        passwordCode.textContent = roomPassword;
        passwordDisplay.style.display = 'block';
        passwordInputContainer.style.display = 'none';
        localStorage.setItem('roomPassword', roomPassword);
        enterRoomButton.textContent = 'ルームを作成して待機画面へ';
    } else {
        roleDisplay.textContent = '🚪 ゲスト';
        passwordDisplay.style.display = 'none';
        passwordInputContainer.style.display = 'block';
        enterRoomButton.textContent = 'ルームに参加して待機画面へ';
        
        passwordInput.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/[^0-9]/g, '');
            checkCanProceed();
        });
    }

    avatarOptions.forEach(option => {
        option.addEventListener('click', () => {
            avatarOptions.forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');
            selectedAvatar = option.getAttribute('data-avatar');
            checkCanProceed();
        });
    });

    // Socket.IO event listeners
    socket.on('connect', () => {
        // Socket connected
    });

    socket.on('disconnect', () => {
        // Socket disconnected
    });

    socket.on('room-created', (data) => {
        localStorage.setItem('selectedAvatar', selectedAvatar);
        // ルームIDをlocalStorageに保存
        if (data && data.roomId) {
            localStorage.setItem('roomId', data.roomId);
        } else {
            // パスワードをルームIDとして使用
            localStorage.setItem('roomId', roomPassword);
        }
        window.location.href = 'waiting.html';
    });

    socket.on('room-joined', (data) => {
        localStorage.setItem('selectedAvatar', selectedAvatar);
        // ルームIDをlocalStorageに保存
        if (data && data.roomId) {
            localStorage.setItem('roomId', data.roomId);
        } else {
            // パスワードをルームIDとして使用
            const enteredPassword = passwordInput.value.trim();
            localStorage.setItem('roomId', enteredPassword);
        }
        window.location.href = 'waiting.html';
    });

    socket.on('room-not-found', () => {
        alert('指定されたルームが見つかりません。パスワードを確認してください。');
        enterRoomButton.disabled = false;
        enterRoomButton.textContent = userRole === 'host' ? 'ルームを作成して待機画面へ' : 'ルームに参加して待機画面へ';
    });

    socket.on('room-full', () => {
        alert('ルームが満員です。');
        enterRoomButton.disabled = false;
        enterRoomButton.textContent = userRole === 'host' ? 'ルームを作成して待機画面へ' : 'ルームに参加して待機画面へ';
    });

    enterRoomButton.addEventListener('click', () => {
        if (!selectedAvatar) {
            alert('アバターを選択してください');
            return;
        }

        if (userRole === 'guest') {
            const enteredPassword = passwordInput.value.trim();
            if (enteredPassword.length !== 4) {
                alert('4桁のパスワードを入力してください');
                return;
            }
            localStorage.setItem('roomPassword', enteredPassword);
            roomPassword = enteredPassword;
        }

        enterRoomButton.disabled = true;
        enterRoomButton.textContent = userRole === 'host' ? 'ルーム作成中...' : '参加中...';

        const roomData = {
            username: username,
            avatar: selectedAvatar,
            password: roomPassword
        };

        if (userRole === 'host') {
            socket.emit('create-room', roomData);
        } else {
            socket.emit('join-room', roomData);
        }
    });

    backButton.addEventListener('click', () => {
        localStorage.removeItem('multiplayerRole');
        localStorage.removeItem('roomPassword');
        window.location.href = 'mode-select.html';
    });

    function checkCanProceed() {
        let canProceed = selectedAvatar !== null;
        
        if (userRole === 'guest') {
            const enteredPassword = passwordInput ? passwordInput.value.trim() : '';
            canProceed = canProceed && enteredPassword.length === 4;
        }
        
        enterRoomButton.disabled = !canProceed;
    }

    // 初期状態をチェック
    checkCanProceed();

    function generateRoomPassword() {
        return Math.floor(1000 + Math.random() * 9000).toString();
    }
}

document.addEventListener('DOMContentLoaded', initCharacterSelection);