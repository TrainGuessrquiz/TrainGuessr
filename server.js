const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const { Server } = require('socket.io');
const http = require('http');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const PORT = 3000;
const RANKINGS_FILE = path.join(__dirname, 'rankings.json');

app.use(cors());
app.use(express.json());

// Safari/モバイルブラウザ対応のMIMEタイプ設定
app.use((req, res, next) => {
    // MIMEタイプの設定
    if (req.path.endsWith('.js')) {
        res.type('application/javascript; charset=utf-8');
    } else if (req.path.endsWith('.css')) {
        res.type('text/css; charset=utf-8');
    } else if (req.path.endsWith('.png')) {
        res.type('image/png');
    } else if (req.path.endsWith('.jpg') || req.path.endsWith('.jpeg')) {
        res.type('image/jpeg');
    } else if (req.path.endsWith('.gif')) {
        res.type('image/gif');
    } else if (req.path.endsWith('.svg')) {
        res.type('image/svg+xml');
    } else if (req.path.endsWith('.webp')) {
        res.type('image/webp');
    }
    
    // Safari向け特別ヘッダー設定
    res.set('Cache-Control', 'public, max-age=3600, must-revalidate');
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Cache-Control');
    res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    
    // Safari向け追加ヘッダー
    if (req.path.includes('/images/')) {
        res.set('Vary', 'Accept-Encoding');
        res.set('X-Content-Type-Options', 'nosniff');
    }
    
    next();
});

// Safari対応: 画像ファイル専用ルート
app.use('/images', express.static('./images', {
    maxAge: '1h',
    setHeaders: (res, path) => {
        if (path.endsWith('.png')) {
            res.setHeader('Content-Type', 'image/png');
        } else if (path.endsWith('.jpg') || path.endsWith('.jpeg')) {
            res.setHeader('Content-Type', 'image/jpeg');
        }
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Cache-Control', 'public, max-age=3600');
    }
}));

// Safari対応: JavaScriptファイル専用ルート
app.use('/src', express.static('./src', {
    maxAge: '1h',
    setHeaders: (res, path) => {
        if (path.endsWith('.js')) {
            res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Cache-Control', 'public, max-age=3600, must-revalidate');
        } else if (path.endsWith('.css')) {
            res.setHeader('Content-Type', 'text/css; charset=utf-8');
            res.setHeader('Access-Control-Allow-Origin', '*');
        }
    }
}));

app.use(express.static('.', {
    setHeaders: (res, path) => {
        if (path.endsWith('.js')) {
            res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
        }
    }
}));

// ランキングファイルの初期化
if (!fs.existsSync(RANKINGS_FILE)) {
    fs.writeFileSync(RANKINGS_FILE, JSON.stringify([]));
}

// ランキング取得API
app.get('/api/rankings', (_, res) => {
    try {
        const rankings = JSON.parse(fs.readFileSync(RANKINGS_FILE, 'utf8'));
        const topRankings = rankings.slice(0, 50);
        res.json(topRankings);
    } catch (error) {
        res.status(500).json({ error: 'Failed to read rankings' });
    }
});

// スコア保存API
app.post('/api/score', (req, res) => {
    try {
        const { username, score } = req.body;
        
        if (!username || typeof score !== 'number') {
            return res.status(400).json({ error: 'Invalid data' });
        }

        const rankings = JSON.parse(fs.readFileSync(RANKINGS_FILE, 'utf8'));
        
        const newEntry = {
            username: username,
            score: score,
            date: new Date().toISOString()
        };
        
        rankings.push(newEntry);
        rankings.sort((a, b) => b.score - a.score);
        
        const topRankings = rankings.slice(0, 50);
        fs.writeFileSync(RANKINGS_FILE, JSON.stringify(topRankings, null, 2));
        
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to save score' });
    }
});

const rooms = new Map();

const quizData = [
    {
        lines: ["山手線", "中央線", "埼京線", "湘南新宿ライン", "小田急線", "京王線", "東京メトロ丸ノ内線", "都営新宿線", "都営大江戸線"],
        answer: "新宿",
        tags: ["東京23区", "東京", "関東", "山手線"]
    },
    {
        lines: ["山手線", "京浜東北線", "中央線", "東海道線", "横須賀・総武快速線", "京葉線", "上野東京ライン", "東北新幹線", "東海道新幹線", "東京メトロ丸ノ内線"],
        answer: "東京",
        tags: ["東京23区", "東京", "関東", "山手線", "新幹線"]
    },
    {
        lines: ["山手線", "埼京線", "湘南新宿ライン", "東急東横線", "東急田園都市線", "東京メトロ銀座線", "東京メトロ半蔵門線", "東京メトロ副都心線", "京王井の頭線"],
        answer: "渋谷",
        tags: ["東京23区", "東京", "関東", "山手線"]
    },
    {
        lines: ["山手線", "埼京線", "湘南新宿ライン", "東武東上線", "西武池袋線", "東京メトロ丸ノ内線", "東京メトロ有楽町線", "東京メトロ副都心線"],
        answer: "池袋",
        tags: ["東京23区", "東京", "関東", "山手線"]
    },
    {
        lines: ["中央総武線", "東京メトロ東西線", "東京メトロ南北線", "東京メトロ有楽町線", "都営大江戸線"],
        answer: "飯田橋",
        tags: ["東京23区", "東京", "関東"]
    },
    {
        lines: ["山手線", "京浜東北線", "東海道線", "横須賀線", "上野東京ライン", "京急線", "東海道新幹線"],
        answer: "品川",
        tags: ["東京23区", "東京", "関東", "山手線", "新幹線"]
    },
    {
        lines: ["山手線", "京浜東北線", "常磐線", "宇都宮線", "高崎線", "上野東京ライン", "東北新幹線", "上越新幹線", "北陸新幹線", "東京メトロ銀座線", "東京メトロ日比谷線"],
        answer: "上野",
        tags: ["東京23区", "東京", "関東", "山手線", "新幹線"]
    },
    {
        lines: ["山手線", "京浜東北線", "東海道線", "横須賀線", "東京メトロ銀座線", "都営浅草線", "ゆりかもめ"],
        answer: "新橋",
        tags: ["東京23区", "東京", "関東", "山手線"]
    },
    {
        lines: ["東京メトロ銀座線", "東京メトロ日比谷線", "東京メトロ丸ノ内線"],
        answer: "銀座",
        tags: ["東京23区", "東京", "関東"]
    },
    {
        lines: ["山手線", "京浜東北線", "東京メトロ有楽町線"],
        answer: "有楽町",
        tags: ["東京23区", "東京", "関東", "山手線"]
    },
    {
        lines: ["山手線", "埼京線", "湘南新宿ライン", "東京メトロ日比谷線"],
        answer: "恵比寿",
        tags: ["東京23区", "東京", "関東", "山手線"]
    },
    {
        lines: ["山手線", "京浜東北線", "東京モノレール", "都営大江戸線", "都営浅草線"],
        answer: "浜松町",
        tags: ["東京23区", "東京", "関東", "山手線"]
    },
    {
        lines: ["東京メトロ日比谷線", "都営大江戸線"],
        answer: "六本木",
        tags: ["東京23区", "東京", "関東"]
    },
    {
        lines: ["東京メトロ丸ノ内線", "東京メトロ東西線", "東京メトロ千代田線", "東京メトロ半蔵門線", "都営三田線"],
        answer: "大手町",
        tags: ["東京23区", "東京", "関東"]
    },
    {
        lines: ["東京メトロ銀座線", "東京メトロ丸ノ内線"],
        answer: "赤坂見附",
        tags: ["東京23区", "東京", "関東"]
    }
];

function shuffleArray(array) {
    const newArray = array.slice();
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

function createRoom(password, host) {
    const room = {
        id: password,
        password: password,
        players: [host],
        host: host.id,
        currentQuestion: 0,
        questions: shuffleArray(quizData).slice(0, 15),
        gameState: 'waiting',
        timer: null,
        questionTimer: null
    };
    rooms.set(password, room);
    return room;
}

io.on('connection', (socket) => {

    socket.on('create-room', (data) => {
        const player = {
            id: socket.id,
            username: data.username,
            avatar: data.avatar,
            score: 0,
            hearts: 5,
            isHost: true,
            hasAnswered: false,
            connected: true,
            socketId: socket.id
        };

        const room = createRoom(data.password, player);
        socket.join(data.password);
        socket.roomId = data.password;
        socket.playerId = socket.id;

        socket.emit('room-created', {
            password: data.password,
            players: room.players
        });
    });

    socket.on('join-room', (data) => {
        const room = rooms.get(data.password);
        
        if (!room) {
            socket.emit('room-not-found');
            return;
        }

        if (room.players.length >= 4) {
            socket.emit('room-full');
            return;
        }

        const player = {
            id: socket.id,
            username: data.username,
            avatar: data.avatar,
            score: 0,
            hearts: 5,
            isHost: false,
            hasAnswered: false,
            connected: true,
            socketId: socket.id
        };

        room.players.push(player);
        socket.join(data.password);
        socket.roomId = data.password;
        socket.playerId = socket.id;

        socket.emit('room-joined', {
            password: data.password,
            players: room.players
        });

        socket.to(data.password).emit('player-joined', {
            players: room.players
        });
    });

    socket.on('rejoin-game', (data) => {
        const roomIdentifier = data.roomId || data.password;
        
        if (!roomIdentifier) {
            socket.emit('rejoin-failed', { reason: 'No room identifier' });
            return;
        }
        
        const room = rooms.get(roomIdentifier);
        
        if (room && room.gameState === 'playing') {
            const existingPlayer = room.players.find(p => p.username === data.username);
            if (existingPlayer) {
                existingPlayer.connected = true;
                existingPlayer.id = socket.id;
                existingPlayer.socketId = socket.id;
            } else {
                room.players.push({
                    id: socket.id,
                    username: data.username,
                    avatar: data.avatar,
                    score: 0,
                    hearts: 5,
                    isHost: false,
                    hasAnswered: false,
                    connected: true,
                    socketId: socket.id
                });
            }
            
            socket.join(roomIdentifier);
            socket.roomId = roomIdentifier;
            socket.playerId = socket.id;
            
            socket.emit('players-update', room.players);
            
            socket.to(roomIdentifier).emit('players-update', room.players);
            
            if (room.currentQuestion < room.questions.length) {
                const question = room.questions[room.currentQuestion];
                
                const questionData = {
                    ...question,
                    questionNumber: room.currentQuestion + 1,
                    totalQuestions: room.questions.length,
                    timeLimit: 30
                };
                
                socket.emit('new-question', questionData);
            }
        } else if (!room) {
            socket.emit('rejoin-failed', { reason: 'Room not found' });
        } else {
            socket.emit('rejoin-failed', { reason: 'Game not active' });
        }
    });

    socket.on('start-game', () => {
        const room = rooms.get(socket.roomId);
        
        if (!room || room.host !== socket.id || room.players.length < 2) {
            return;
        }

        room.gameState = 'starting';
        io.to(socket.roomId).emit('game-starting', { countdown: 10 });

        setTimeout(() => {
            room.gameState = 'playing';
            room.currentQuestion = 0;
            
            io.to(socket.roomId).emit('game-started', { 
                roomId: socket.roomId,
                players: room.players 
            });
            
            if (room.players.length === 0) {
                console.error('CRITICAL ERROR: Player list is empty when starting game!');
            }
            
            io.to(socket.roomId).emit('players-update', room.players);
            
            setTimeout(() => {
                startQuestion(room);
            }, 1500);
        }, 10000);
    });

    socket.on('submit-answer', (data) => {
        const room = rooms.get(socket.roomId);
        if (!room || room.gameState !== 'playing') return;

        const player = room.players.find(p => p.id === socket.id);
        if (!player || player.hasAnswered || player.hearts <= 0) return;

        const currentQuiz = room.questions[room.currentQuestion];
        const isCorrect = data.answer === currentQuiz.answer.toLowerCase();

        player.hasAnswered = true;

        if (isCorrect) {
            player.score += 1;
            
            if (room.serverTimerId) {
                clearInterval(room.serverTimerId);
            }
            if (room.questionTimer) {
                clearTimeout(room.questionTimer);
            }
            
            io.to(socket.roomId).emit('answer-result', {
                correct: true,
                answeredBy: player.username,
                correctAnswer: currentQuiz.answer
            });

            setTimeout(() => {
                nextQuestion(room);
            }, 3000);
        } else {
            player.hearts = Math.max(0, player.hearts - 1);
            
            socket.emit('player-incorrect', {
                message: '不正解です'
            });

            if (player.hearts <= 0) {
                io.to(socket.roomId).emit('player-eliminated', {
                    username: player.username
                });
            }

            const activePlayers = room.players.filter(p => p.hearts > 0);
            if (activePlayers.length === 0) {
                if (room.serverTimerId) {
                    clearInterval(room.serverTimerId);
                }
                endGame(room);
                return;
            }
        }

        io.to(socket.roomId).emit('players-update', room.players);
    });

    socket.on('leave-room', () => {
        leaveRoom(socket);
    });


    socket.on('disconnect', () => {
        leaveRoom(socket);
    });

    function startQuestion(room) {
        if (room.currentQuestion >= room.questions.length) {
            endGame(room);
            return;
        }

        room.players.forEach(player => {
            player.hasAnswered = false;
        });

        const question = room.questions[room.currentQuestion];
        
        const questionData = {
            ...question,
            questionNumber: room.currentQuestion + 1,
            totalQuestions: room.questions.length,
            timeLimit: 30
        };
        
        io.to(room.id).emit('new-question', questionData);
        io.to(room.id).emit('players-update', room.players);
        
        let timeRemaining = 30;
        
        const serverTimerId = setInterval(() => {
            timeRemaining--;
            
            io.to(room.id).emit('timer-update', {
                timeLeft: timeRemaining
            });
            
            if (timeRemaining <= 0) {
                clearInterval(serverTimerId);
                
                const currentQuiz = room.questions[room.currentQuestion];
                
                room.players.forEach(player => {
                    if (!player.hasAnswered && player.hearts > 0) {
                        player.hearts = Math.max(0, player.hearts - 1);
                    }
                });

                io.to(room.id).emit('time-up', {
                    correctAnswer: currentQuiz.answer
                });

                const activePlayers = room.players.filter(p => p.hearts > 0);
                if (activePlayers.length === 0) {
                    setTimeout(() => endGame(room), 3000);
                    return;
                }

                setTimeout(() => {
                    nextQuestion(room);
                }, 3000);
            }
        }, 1000);
        
        room.serverTimerId = serverTimerId;
    }

    function nextQuestion(room) {
        room.currentQuestion++;
        
        if (room.currentQuestion >= room.questions.length) {
            endGame(room);
            return;
        }

        const activePlayers = room.players.filter(p => p.hearts > 0);
        if (activePlayers.length === 0) {
            endGame(room);
            return;
        }

        io.to(room.id).emit('next-question');
        
        setTimeout(() => {
            startQuestion(room);
        }, 3000);
    }

    function endGame(room) {
        if (room.serverTimerId) {
            clearInterval(room.serverTimerId);
        }
        if (room.questionTimer) {
            clearTimeout(room.questionTimer);
        }
        room.gameState = 'finished';

        const rankings = room.players.slice().sort((a, b) => {
            if (b.score !== a.score) {
                return b.score - a.score;
            }
            return b.hearts - a.hearts;
        });

        io.to(room.id).emit('game-over', {
            rankings: rankings
        });
        
        io.to(room.id).emit('game-ended', {
            roomId: room.id,
            finalRankings: rankings
        });

        setTimeout(() => {
            const currentRoom = rooms.get(room.id);
            if (currentRoom) {
                rooms.delete(room.id);
            }
        }, 60000);
    }

    function leaveRoom(socket) {
        if (!socket.roomId) return;

        const room = rooms.get(socket.roomId);
        if (!room) return;

        const playerIndex = room.players.findIndex(p => p.id === socket.id);
        if (playerIndex !== -1) {
            if (room.gameState === 'playing') {
                room.players[playerIndex].connected = false;
                room.players[playerIndex].socketId = null;
                
                socket.leave(socket.roomId);
                
                socket.to(socket.roomId).emit('player-disconnected', {
                    username: room.players[playerIndex].username,
                    playerId: room.players[playerIndex].id
                });
            } else {
                room.players.splice(playerIndex, 1);
                socket.leave(socket.roomId);

                if (room.players.length === 0) {
                    rooms.delete(socket.roomId);
                } else {
                    if (room.host === socket.id && room.players.length > 0) {
                        room.host = room.players[0].id;
                        room.players[0].isHost = true;
                    }

                    socket.to(socket.roomId).emit('player-left', {
                        players: room.players
                    });
                }
            }
        }
    }
});

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});