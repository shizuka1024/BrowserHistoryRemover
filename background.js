// 目標網域清單
const targetDomains = [
    'www.example.com',
];

// 監聽標籤頁導航完成事件
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url) {
        const url = new URL(tab.url);
        const hostname = url.hostname;
        
        // 檢查是否是目標網域
        const isTargetDomain = targetDomains.some(domain => 
            hostname === domain || hostname.endsWith('.' + domain)
        );
        
        if (isTargetDomain) {
            // 延遲 500 毫秒後清除該網域的所有歷史記錄
            setTimeout(() => {
                // 搜尋該網域的所有歷史記錄（更精確的方式）
                chrome.history.search({ 
                    text: '', 
                    maxResults: 999999,
                    startTime: 0  // 搜尋所有時間的歷史
                }, (results) => {
                    // 過濾出該域名的歷史
                    const targetUrls = results.filter(result => {
                        try {
                            const resultUrl = new URL(result.url);
                            return resultUrl.hostname === hostname || resultUrl.hostname.endsWith('.' + hostname);
                        } catch (e) {
                            return false;
                        }
                    });
                    
                    // 逐個刪除
                    targetUrls.forEach(result => {
                        chrome.history.deleteUrl({ url: result.url });
                        console.log('✓ 已清除歷史記錄:', result.url);
                    });
                    
                    if (targetUrls.length > 0) {
                        console.log(`✓ 共清除 ${targetUrls.length} 筆 ${hostname} 的歷史記錄`);
                    } else {
                        console.log(`⚠ 未找到 ${hostname} 的歷史記錄`);
                    }
                });
            }, 500);
        }
    }
});

// 也監聽 webNavigation 事件，用於更實時的清理
chrome.webNavigation.onCommitted.addListener((details) => {
    if (details.frameId === 0) { // 只監聽主框架
        const url = new URL(details.url);
        const hostname = url.hostname;
        
        const isTargetDomain = targetDomains.some(domain => 
            hostname === domain || hostname.endsWith('.' + domain)
        );
        
        if (isTargetDomain) {
            console.log('✓ 檢測到訪問:', hostname);
        }
    }
});
