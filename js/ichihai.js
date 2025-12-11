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
 * URLを指定してデータを取得します。
 * @param {string} url URL
 * @returns （.thenで処理）
 */
async function getRawData(url) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("GET", url, true);
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    resolve(xhr.responseText);
                } else {
                    reject(
                        new Error(`Request failed with status: ${xhr.status}`)
                    );
                }
            }
        };
        xhr.send();
    });
}

// UTF-8 文字列を ArrayBuffer に変換
function strToArrayBuffer(str) {
    return new TextEncoder().encode(str);
}

// ArrayBuffer を Base64 に変換
function arrayBufferToBase64(buffer) {
    return btoa(String.fromCharCode(...new Uint8Array(buffer)));
}

// Base64 を ArrayBuffer に変換
function base64ToArrayBuffer(base64) {
    return Uint8Array.from(atob(base64), (c) => c.charCodeAt(0)).buffer;
}

// 鍵を生成（AES-GCM 256bit）
async function generateKey() {
    return crypto.subtle.generateKey(
        { name: "AES-GCM", length: 256 },
        true, // exportable
        ["encrypt", "decrypt"]
    );
}

// 鍵を Base64 文字列にエクスポート
async function exportKey(key) {
    const raw = await crypto.subtle.exportKey("raw", key);
    return arrayBufferToBase64(raw);
}

// Base64 文字列から鍵をインポート
async function importKey(base64Key) {
    const raw = base64ToArrayBuffer(base64Key);
    return crypto.subtle.importKey("raw", raw, { name: "AES-GCM" }, true, [
        "encrypt",
        "decrypt",
    ]);
}

// 暗号化
async function encryptText(plainText, key) {
    const iv = crypto.getRandomValues(new Uint8Array(12)); // 初期化ベクトル
    const encoded = strToArrayBuffer(plainText);
    const cipherBuffer = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv },
        key,
        encoded
    );

    return {
        iv: arrayBufferToBase64(iv),
        data: arrayBufferToBase64(cipherBuffer),
    };
}

// 復号
async function decryptText(encryptedData, key) {
    const iv = base64ToArrayBuffer(encryptedData.iv);
    const cipherBuffer = base64ToArrayBuffer(encryptedData.data);
    const decryptedBuffer = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv: new Uint8Array(iv) },
        key,
        cipherBuffer
    );
    return new TextDecoder().decode(decryptedBuffer);
}

async function decryptWithBase64Key(ivBase64, dataBase64, base64Key) {
    // 鍵をインポート
    const key = await importKey(base64Key);

    // IV と暗号文を ArrayBuffer に変換
    const iv = new Uint8Array(base64ToArrayBuffer(ivBase64));
    const cipherBuffer = base64ToArrayBuffer(dataBase64);

    // 復号処理
    const decryptedBuffer = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv },
        key,
        cipherBuffer
    );

    return new TextDecoder().decode(decryptedBuffer);
}
