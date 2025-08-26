const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
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