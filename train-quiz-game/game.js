const quizData = [
    {
        lines: ["yamanote", "chuo", "saikyo", "shonan-shinjuku", "odakyu", "keio", "marunouchi", "toei-shinjuku", "toei-oedo"],
        answer: "新宿"
    },
    {
        lines: ["yamanote", "keihin-tohoku", "chuo", "tokaido", "yokosuka-sobu", "keiyo", "ueno-tokyo", "tohoku-shinkansen", "tokaido-shinkansen", "marunouchi"],
        answer: "東京"
    },
    {
        lines: ["yamanote", "saikyo", "shonan-shinjuku", "tokyu-toyoko", "tokyu-denentoshi", "ginza", "hanzomon", "fukutoshin", "keio-inokashira"],
        answer: "渋谷"
    },
    {
        lines: ["yamanote", "saikyo", "shonan-shinjuku", "tobu-tojo", "seibu-ikebukuro", "marunouchi", "yurakucho", "fukutoshin"],
        answer: "池袋"
    },
    {
        lines: ["chuo-sobu", "tozai", "nanboku", "yurakucho", "toei-oedo"],
        answer: "飯田橋"
    },
    {
        lines: ["yamanote", "keihin-tohoku", "tokaido", "yokosuka-sobu", "ueno-tokyo", "keikyu", "tokaido-shinkansen"],
        answer: "品川"
    },
    {
        lines: ["yamanote", "keihin-tohoku", "joban", "utsunomiya", "takasaki", "ueno-tokyo", "tohoku-shinkansen", "joetsu-shinkansen", "hokuriku-shinkansen", "ginza", "hibiya"],
        answer: "上野"
    },
    {
        lines: ["yamanote", "keihin-tohoku", "tokaido", "yokosuka-sobu", "ginza", "toei-asakusa", "yurikamome"],
        answer: "新橋"
    },
    {
        lines: ["ginza", "hibiya", "marunouchi"],
        answer: "銀座"
    },
    {
        lines: ["yamanote", "keihin-tohoku", "yurakucho"],
        answer: "有楽町"
    },
    {
        lines: ["yamanote", "saikyo", "shonan-shinjuku", "hibiya"],
        answer: "恵比寿"
    },
    {
        lines: ["yamanote", "keihin-tohoku", "tokyo-monorail", "toei-oedo", "toei-asakusa"],
        answer: "浜松町"
    },
    {
        lines: ["hibiya", "toei-oedo"],
        answer: "六本木"
    },
    {
        lines: ["marunouchi", "tozai", "hanzomon", "nanboku", "toei-mita"],
        answer: "大手町"
    },
    {
        lines: ["ginza", "marunouchi"],
        answer: "赤坂見附"
    }
];

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// クラス名から路線名を取得するヘルパー関数
function getLineName(lineClass) {
    const lineMap = {
        'yamanote': '山手線',
        'chuo': '中央線',
        'saikyo': '埼京線',
        'shonan-shinjuku': '湘南新宿ライン',
        'odakyu': '小田急線',
        'keio': '京王線',
        'marunouchi': '東京メトロ丸ノ内線',
        'toei-shinjuku': '都営新宿線',
        'toei-oedo': '都営大江戸線',
        'keihin-tohoku': '京浜東北線',
        'tokaido': '東海道線',
        'yokosuka-sobu': '横須賀・総武快速線',
        'keiyo': '京葉線',
        'ueno-tokyo': '上野東京ライン',
        'tohoku-shinkansen': '東北新幹線',
        'tokaido-shinkansen': '東海道新幹線',
        'ginza': '東京メトロ銀座線',
        'hanzomon': '東京メトロ半蔵門線',
        'fukutoshin': '東京メトロ副都心線',
        'tokyu-toyoko': '東急東横線',
        'tokyu-denentoshi': '東急田園都市線',
        'keio-inokashira': '京王井の頭線',
        'tobu-tojo': '東武東上線',
        'seibu-ikebukuro': '西武池袋線',
        'yurakucho': '東京メトロ有楽町線',
        'chuo-sobu': '中央・総武線',
        'tozai': '東京メトロ東西線',
        'nanboku': '南北線',
        'joban': '常磐線',
        'utsunomiya': '宇都宮線',
        'takasaki': '高崎線',
        'joetsu-shinkansen': '上越新幹線',
        'hokuriku-shinkansen': '北陸新幹線',
        'hibiya': '東京メトロ日比谷線',
        'toei-asakusa': '都営浅草線',
        'toei-mita': '都営三田線',
        'keikyu': '京急線',
        'tokyo-monorail': '東京モノレール',
        'yurikamome': 'ゆりかもめ',
        'seibu-shinjuku': '西武新宿線'
    };
    return lineMap[lineClass] || lineClass;
}

const konamiCode = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
let konamiCodePosition = 0;

const questionEl = document.getElementById('question');
const inputBox = document.getElementById('input-box');
const submitButton = document.getElementById('submit-button');
const resultEl = document.getElementById('result');
const timerEl = document.getElementById('timer');
const scoreEl = document.getElementById('score');

const startScreenEl = document.getElementById('start-screen');
const gameScreenEl = document.getElementById('game-screen');
const resultScreenEl = document.getElementById('result-screen');
const finalResultsEl = document.getElementById('final-results');

// 新しいボタンのIDを取得
const startMarkButton = document.getElementById('start-mark-button');
const startNameButton = document.getElementById('start-name-button');
const restartButton = document.getElementById('restart-button');

let currentQuizIndex = 0;
let timeLeft = 30;
let timerId;
let score = 0;
let correctCount = 0;
let incorrectCount = 0;
let currentMode = ''; // 'mark' or 'name'

function updateScoreDisplay() {
    if (scoreEl) {
        scoreEl.textContent = `スコア: ${score}点`;
    }
}

function startTimer() {
    timerId = setInterval(() => {
        timeLeft--;
        timerEl.textContent = `残り時間: ${timeLeft}秒`;
        if (timeLeft <= 0) {
            clearInterval(timerId);
            const correctAnswer = quizData[currentQuizIndex].answer;
            resultEl.textContent = `時間切れ！正解は「${correctAnswer}」でした。`;
            submitButton.disabled = true;
            inputBox.disabled = true;
            incorrectCount++;
            setTimeout(moveToNextQuiz, 2000);
        }
    }, 1000);
}

function showQuiz(index) {
    const quiz = quizData[index];
    questionEl.innerHTML = '';
    questionEl.classList.remove('mark-quiz', 'name-quiz');

    if (currentMode === 'mark') {
        questionEl.classList.add('mark-quiz');
        quiz.lines.forEach(lineClass => {
            const lineItem = document.createElement('div');
            lineItem.classList.add('line-item');

            const markSpan = document.createElement('span');
            markSpan.classList.add('line-mark', lineClass);

            const nameP = document.createElement('p');
            nameP.textContent = getLineName(lineClass);

            lineItem.appendChild(markSpan);
            lineItem.appendChild(nameP);
            questionEl.appendChild(lineItem);
        });
    } else if (currentMode === 'name') {
        questionEl.classList.add('name-quiz');
        quiz.lines.forEach(lineClass => {
            const nameP = document.createElement('p');
            nameP.textContent = getLineName(lineClass);
            questionEl.appendChild(nameP);
        });
    }

    inputBox.value = '';
    resultEl.textContent = '';
    inputBox.disabled = false;
    submitButton.disabled = false;
    inputBox.focus();
}

function startGame(mode) {
    currentMode = mode;
    startScreenEl.classList.add('hidden');
    gameScreenEl.classList.remove('hidden');
    resultScreenEl.classList.add('hidden');
    
    shuffleArray(quizData);
    
    currentQuizIndex = 0;
    timeLeft = 30;
    score = 0;
    correctCount = 0;
    incorrectCount = 0;
    showQuiz(currentQuizIndex);
    startTimer();
    updateScoreDisplay();
}

function moveToNextQuiz() {
    clearInterval(timerId);
    
    currentQuizIndex++;
    if (currentQuizIndex < quizData.length) {
        timeLeft = 30;
        showQuiz(currentQuizIndex);
        startTimer();
    } else {
        endGame();
    }
}

function endGame() {
    gameScreenEl.classList.add('hidden');
    resultScreenEl.classList.remove('hidden');
    finalResultsEl.innerHTML = `
        <p>正解数: ${correctCount}問</p>
        <p>不正解数: ${incorrectCount}問</p>
        <h3>最終スコア: ${score}点</h3>
    `;
}

// イベントリスナーを新しいボタンに設定
startMarkButton.addEventListener('click', () => {
    startGame('mark');
});

startNameButton.addEventListener('click', () => {
    startGame('name');
});

restartButton.addEventListener('click', () => {
    startScreenEl.classList.remove('hidden');
    resultScreenEl.classList.add('hidden');
});

submitButton.addEventListener('click', () => {
    const userAnswer = inputBox.value.trim().toLowerCase();
    const currentQuiz = quizData[currentQuizIndex];
    const correctAnswer = currentQuiz.answer.toLowerCase();
    
    // 隠しページ遷移の判定
    if (currentQuiz.answer === "六本木" && userAnswer === "ぎろっぽん") {
        window.location.href = "https://www.notion.so/Tokyo-ver-1-1d104f40304880d6aa87fa46f6ce4778";
        return;
    } 
    else if (currentQuiz.answer === "飯田橋" && userAnswer === "いいだばし") {
        window.location.href = "https://www.instagram.com/canalcafe_official/";
        return;
    }
    else if (currentQuiz.answer === "銀座" && userAnswer === "ざぎん") {
        window.location.href = "https://ginza-kiyota.com/";
        return;
    }

    if (userAnswer === correctAnswer) {
        resultEl.textContent = `正解です！`;
        score++;
        correctCount++;
        updateScoreDisplay();
        resultEl.style.color = '#00bfff';
    } else {
        resultEl.textContent = `残念、不正解です。`;
        incorrectCount++;
        resultEl.style.color = '#ff5e62';
    }

    resultEl.textContent += ` 正解は「${currentQuiz.answer}」でした。`;
    
    inputBox.disabled = true;
    submitButton.disabled = true;

    // 答え合わせ後に次の問題へ進む
    setTimeout(moveToNextQuiz, 2000);
});

document.addEventListener('keyup', (event) => {
    if (!gameScreenEl.classList.contains('hidden')) {
        const key = event.key;
        
        if (key === konamiCode[konamiCodePosition]) {
            konamiCodePosition++;
            
            if (konamiCodePosition === konamiCode.length) {
                score += 100;
                updateScoreDisplay();
                konamiCodePosition = 0;
                resultEl.textContent = `隠しコマンド成功！スコアが100点アップしました！`;
                resultEl.style.color = '#fff200';
            }
        } else {
            konamiCodePosition = 0;
        }
        
        if (key === 'Enter') {
            if (!inputBox.disabled && inputBox.value.trim() !== '') {
                submitButton.click();
            } else if (inputBox.disabled) {
                // 回答後にEnterで次の問題へ
                moveToNextQuiz();
            } else {
                inputBox.focus();
            }
        }
    }
});
