const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;
const RANKINGS_FILE = path.join(__dirname, 'rankings.json');

app.use(cors());
app.use(express.json());

// Safari対応のMIMEタイプ設定
app.use((req, res, next) => {
    if (req.path.endsWith('.js')) {
        res.type('application/javascript');
    } else if (req.path.endsWith('.css')) {
        res.type('text/css');
    } else if (req.path.endsWith('.png')) {
        res.type('image/png');
    } else if (req.path.endsWith('.jpg') || req.path.endsWith('.jpeg')) {
        res.type('image/jpeg');
    }
    // Safari向けキャッシュ制御
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    next();
});

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
app.get('/api/rankings', (req, res) => {
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

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});