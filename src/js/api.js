const API_BASE = window.location.origin;

// Socket.IO client initialization for multiplayer
let multiplayerSocket = null;

function initializeMultiplayerSocket() {
    if (multiplayerSocket) return multiplayerSocket;
    
    multiplayerSocket = io();
    
    multiplayerSocket.on('connect', () => {
        console.log('Connected to multiplayer server');
    });
    
    multiplayerSocket.on('disconnect', () => {
        console.log('Disconnected from multiplayer server');
    });
    
    multiplayerSocket.on('connect_error', (error) => {
        console.error('Multiplayer connection error:', error);
    });
    
    return multiplayerSocket;
}

function getMultiplayerSocket() {
    return multiplayerSocket;
}

// Single player API functions
async function getRankings() {
    try {
        const response = await fetch(`${API_BASE}/api/rankings`);
        if (!response.ok) throw new Error('Failed to fetch rankings');
        return await response.json();
    } catch (error) {
        console.error('Error fetching rankings:', error);
        return [];
    }
}

async function saveScore(username, score) {
    try {
        const response = await fetch(`${API_BASE}/api/score`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, score })
        });
        
        if (!response.ok) throw new Error('Failed to save score');
        return await response.json();
    } catch (error) {
        console.error('Error saving score:', error);
        return { success: false };
    }
}

// Multiplayer API functions
function createRoom(roomData) {
    const socket = getMultiplayerSocket();
    if (socket) {
        socket.emit('create-room', roomData);
    }
}

function joinRoom(roomData) {
    const socket = getMultiplayerSocket();
    if (socket) {
        socket.emit('join-room', roomData);
    }
}

function leaveRoom() {
    const socket = getMultiplayerSocket();
    if (socket) {
        socket.emit('leave-room');
    }
}

function startGame() {
    const socket = getMultiplayerSocket();
    if (socket) {
        socket.emit('start-game');
    }
}

function submitAnswer(answerData) {
    const socket = getMultiplayerSocket();
    if (socket) {
        socket.emit('submit-answer', answerData);
    }
}

function rejoinGame(gameData) {
    const socket = getMultiplayerSocket();
    if (socket) {
        socket.emit('rejoin-game', gameData);
    }
}

// New game events
function notifyTimerExpired() {
    const socket = getMultiplayerSocket();
    if (socket) {
        socket.emit('timer-expired');
    }
}

// Socket event listeners for game events
function addGameEventListeners(callbacks) {
    const socket = getMultiplayerSocket();
    if (!socket) return;

    if (callbacks.onNewQuestion) {
        socket.on('new-question', callbacks.onNewQuestion);
    }
    
    if (callbacks.onUpdateScore) {
        socket.on('update-score', callbacks.onUpdateScore);
    }
    
    if (callbacks.onTimerExpired) {
        socket.on('timer-expired', callbacks.onTimerExpired);
    }
}