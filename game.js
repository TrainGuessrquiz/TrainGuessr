const quizData = [
    {
        lines: ["山手線", "中央線", "埼京線", "湘南新宿ライン", "小田急線", "京王線", "東京メトロ丸ノ内線", "都営新宿線", "都営大江戸線"],
        answer: "新宿"
    },
    {
        lines: ["山手線", "京浜東北線", "中央線", "東海道線", "横須賀・総武快速線", "京葉線", "上野東京ライン", "東北新幹線", "東海道新幹線", "東京メトロ丸ノ内線"],
        answer: "東京"
    },
    {
        lines: ["山手線", "埼京線", "湘南新宿ライン", "東急東横線", "東急田園都市線", "東京メトロ銀座線", "東京メトロ半蔵門線", "東京メトロ副都心線", "京王井の頭線"],
        answer: "渋谷"
    },
    {
        lines: ["山手線", "埼京線", "湘南新宿ライン", "東武東上線", "西武池袋線", "東京メトロ丸ノ内線", "有楽町線", "副都心線"],
        answer: "池袋"
    },
    {
        lines: ["中央総武線", "東京メトロ東西線", "南北線", "有楽町線", "都営大江戸線"],
        answer: "飯田橋"
    },
    {
        lines: ["山手線", "京浜東北線", "東海道線", "横須賀線", "上野東京ライン", "京急線", "東海道新幹線"],
        answer: "品川"
    },
    {
        lines: ["山手線", "京浜東北線", "常磐線", "宇都宮線", "高崎線", "上野東京ライン", "東北新幹線", "上越新幹線", "北陸新幹線", "東京メトロ銀座線", "東京メトロ日比谷線"],
        answer: "上野"
    },
        {
        lines: ["山手線", "京浜東北線", "東海道線", "横須賀線", "東京メトロ銀座線", "都営浅草線", "ゆりかもめ"],
        answer: "新橋"
    },
    {
        lines: ["東京メトロ銀座線", "日比谷線", "丸ノ内線"],
        answer: "銀座"
    },
    {
        lines: ["山手線", "京浜東北線", "東京メトロ有楽町線"],
        answer: "有楽町"
    },
    {
        lines: ["山手線", "埼京線", "湘南新宿ライン", "東京メトロ日比谷線"],
        answer: "恵比寿"
    },
    {
        lines: ["山手線", "京浜東北線", "東京モノレール", "都営大江戸線", "都営浅草線"],
        answer: "浜松町"
    },
    {
        lines: ["東京メトロ日比谷線", "都営大江戸線"],
        answer: "六本木"
    },
    {
        lines: ["東京メトロ丸ノ内線", "東西線", "千代田線", "半蔵門線", "都営三田線"],
        answer: "大手町"
    },
    {
        lines: ["東京メトロ銀座線", "丸ノ内線"],
        answer: "赤坂見附"
    }
];

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
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
const startButton = document.getElementById('start-button');
const restartButton = document.getElementById('restart-button');

const resultScreenEl = document.getElementById('result-screen');
const finalResultsEl = document.getElementById('final-results');

let currentQuizIndex = 0;
let timeLeft = 30;
let timerId;
let score = 0;
let correctCount = 0;
let incorrectCount = 0;

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
            incorrectCount++;
        }
    }, 1000);
}

function showQuiz(index) {
    const quiz = quizData[index];
    questionEl.textContent = quiz.lines.join('、');
    inputBox.value = '';
    resultEl.textContent = '';
    inputBox.disabled = false;
    submitButton.disabled = false;
    restartButton.classList.add('hidden');
    inputBox.focus();
}

function startGame() {
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

startButton.addEventListener('click', () => {
    startGame();
});

restartButton.addEventListener('click', () => {
    startGame();
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
    // ★★★ 飯田橋の隠しページ遷移を追加 ★★★
    else if (currentQuiz.answer === "飯田橋" && userAnswer === "いいだばし") {
        window.location.href = "https://www.instagram.com/canalcafe_official/";
        return;
    }
    // ★★★ 銀座の隠しページ遷移を追加 ★★★
    else if (currentQuiz.answer === "銀座" && userAnswer === "ざぎん") {
        window.location.href = "https://ginza-kiyota.com/";
        return;
    }

    if (userAnswer === correctAnswer) {
        resultEl.textContent = `正解です！`;
        score++;
        correctCount++;
        updateScoreDisplay();
    } else {
        resultEl.textContent = `残念、不正解です。`;
        incorrectCount++;
    }

    resultEl.textContent += ` 正解は「${currentQuiz.answer}」でした。`;
    
    inputBox.disabled = true;
    submitButton.disabled = true;
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
            }
        } else {
            konamiCodePosition = 0;
        }
        
        if (key === 'Enter') {
            if (!inputBox.disabled && inputBox.value.trim() !== '') {
                submitButton.click();
            } 
            else if (inputBox.disabled) {
                moveToNextQuiz();
            } 
            else {
                inputBox.focus();
            }
        }
    }
});