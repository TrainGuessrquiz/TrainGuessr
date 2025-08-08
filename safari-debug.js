// Safari デバッグ用スクリプト
(function() {
    if (/Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent)) {
        console.log('Safari detected');
        
        // 404エラーをキャッチ
        window.addEventListener('error', function(e) {
            if (e.target.tagName === 'IMG') {
                console.error('Image load failed:', e.target.src);
            }
        }, true);
        
        // DOM要素の存在確認
        document.addEventListener('DOMContentLoaded', function() {
            const elements = ['line-logos', 'heart-1', 'timer', 'score'];
            elements.forEach(id => {
                const el = document.getElementById(id);
                console.log(`Element ${id}:`, el ? 'Found' : 'Missing');
            });
        });
    }
})();