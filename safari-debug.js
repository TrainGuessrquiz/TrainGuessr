// Safari デバッグ用スクリプト（iOS 16.1.1 互換性強化版）
(function() {
    var isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
    var isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
    
    if (isSafari || isIOS) {
        console.log('Safari/iOS detected - Version:', navigator.userAgent);
        
        // JavaScriptとCSS読み込みエラーをキャッチ
        window.addEventListener('error', function(e) {
            if (e.target.tagName === 'IMG') {
                console.error('Image load failed:', e.target.src);
            } else if (e.target.tagName === 'SCRIPT') {
                console.error('Script load failed:', e.target.src);
            } else if (e.target.tagName === 'LINK') {
                console.error('CSS load failed:', e.target.href);
            } else {
                console.error('General error:', e.message, 'at', e.filename, ':', e.lineno);
            }
        }, true);
        
        // DOM要素の存在確認
        document.addEventListener('DOMContentLoaded', function() {
            var elements = ['line-logos', 'heart-1', 'timer', 'score', 'input-box', 'submit-button'];
            elements.forEach(function(id) {
                var el = document.getElementById(id);
                console.log('Element ' + id + ':', el ? 'Found' : 'Missing');
            });
            
            // CSS読み込み状況を確認
            console.log('Stylesheets count:', document.styleSheets.length);
            
            // Socket.IO読み込み確認
            console.log('Socket.IO loaded:', typeof io !== 'undefined');
        });
        
        // ネットワークリクエストのモニタリング
        if (typeof fetch !== 'undefined') {
            var originalFetch = window.fetch;
            window.fetch = function() {
                console.log('Fetch request:', arguments[0]);
                return originalFetch.apply(this, arguments).catch(function(error) {
                    console.error('Fetch error:', error);
                    throw error;
                });
            };
        }
    }
})();