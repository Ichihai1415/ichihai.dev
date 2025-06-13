/**
 *Cookieの配列を取得します。処理例:Object.keys(cookies).forEach((key) => { });
 * @returns {Array} Cookieの配列
 */
function getCookies() {
    //https://qiita.com/mocha_xx/items/e0897e9f251da042af59
    /**
     * @type {Array} Cookieの配列
     */
    let cookieArr = new Array();
    const cookie = decodeURIComponent(document.cookie);
    if (cookie != "") {
        console.log("[ichihai.js/getCookies]cookie(raw): " + cookie);
        const cookies = document.cookie.split("; ");
        for (let i = 0; i < cookies.length; i++) {
            const cookie_ = cookies[i].split("=");
            cookieArr[cookie_[0]] = cookie_[1];
        }
    } else {
        console.log("[ichihai.js/getCookies]cookie not found.");
    }
    return cookieArr;
}

/**
 * Cookieを保存します。
 * @param {*} value 保存する値("name=data"など形式(; はいらない))
 * @param {*} maxAge 有効期間(秒) 既定は30日
 */
function setCookie(value, maxAge = 2592000) {
    const saveCookie = value + "; max-age=" + maxAge + "; ";
    document.cookie = saveCookie;
    console.log("[ichihai.js/setCookie]cookie saved: " + saveCookie);
}

/**
 * URLパラメータを取得します。
 * @param {*} name パラメータ名
 * @returns 対応するパラメータ
 */
function getParam(name) {
    const url = new URL(window.location.href);
    const params = url.searchParams;
    return params.get(name);
}

/**
 * 文字列をgzip圧縮し、Base64文字列として返します。
 * @param {string} str 圧縮する文字列
 * @returns {Promise<string>} 圧縮されたデータ（Base64文字列）
 */
async function gzipCompress(str) {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const cs = new CompressionStream("gzip");
    const writer = cs.writable.getWriter();
    writer.write(data);
    writer.close();
    const compressed = await new Response(cs.readable).arrayBuffer();
    return btoa(String.fromCharCode(...new Uint8Array(compressed)));
}

/**
 * gzip圧縮データを解凍して文字列に戻します。
 * @param {string} compressed 圧縮されたデータ
 * @returns {Promise<string>} 解凍された文字列
 */
async function gzipDecompress(base64) {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const compressed = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        compressed[i] = binaryString.charCodeAt(i);
    }
    const ds = new DecompressionStream("gzip");
    const writer = ds.writable.getWriter();
    writer.write(compressed);
    writer.close();
    const decompressed = await new Response(ds.readable).arrayBuffer();
    const decoder = new TextDecoder();
    return decoder.decode(decompressed);
}

/**
 * 指定したURLからXHRで生テキストを取得します。
 * @param {string} url 取得するURL
 * @returns {Promise<string>} レスポンステキスト
 */
function fetchTextXHR(url) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("GET", url, true);
        xhr.onreadystatechange = function () {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                if (xhr.status >= 200 && xhr.status < 300) {
                    resolve(xhr.responseText);
                } else {
                    reject(new Error("XHR failed: " + xhr.status));
                }
            }
        };
        xhr.onerror = function () {
            reject(new Error("XHR network error"));
        };
        xhr.send();
    });
}
