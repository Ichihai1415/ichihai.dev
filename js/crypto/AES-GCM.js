import * as converter from "/js/converter.js";

/**
 * 鍵を生成します。
 * @returns {Promise<CryptoKey>} 生成された鍵
 */
export async function generateKey() {
    return crypto.subtle.generateKey(
        { name: "AES-GCM", length: 256 },
        true, // exportable
        ["encrypt", "decrypt"]
    );
}

/**
 *鍵をBase64文字列でエクスポートします。
 * @param {CryptoKey} key
 * @returns
 */
export async function exportKey(key) {
    const raw = await crypto.subtle.exportKey("raw", key);
    return converter.arrayBufferToBase64(raw);
}

// Base64 文字列から鍵をインポート
/**
 *
 * @param {string} base64Key
 * @returns
 */
export async function importKey(base64Key) {
    const raw = converter.base64ToArrayBuffer(base64Key);
    return crypto.subtle.importKey("raw", raw, { name: "AES-GCM" }, true, [
        "encrypt",
        "decrypt",
    ]);
}

// 暗号化
export async function encryptText(plainText, key) {
    const iv = crypto.getRandomValues(new Uint8Array(12)); //初期化ベクトル
    const encoded = converter.stringToArrayBuffer(plainText);
    const cipherBuffer = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv },
        key,
        encoded
    );
    return {
        iv: converter.arrayBufferToBase64(iv),
        data: converter.arrayBufferToBase64(cipherBuffer),
    };
}

// 復号
export async function decryptText(encryptedData, key) {
    const iv = converter.base64ToArrayBuffer(encryptedData.iv);
    const cipherBuffer = converter.base64ToArrayBuffer(encryptedData.data);
    const decryptedBuffer = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv: new Uint8Array(iv) },
        key,
        cipherBuffer
    );
    return new TextDecoder().decode(decryptedBuffer);
}

/**
 * 暗号化します。鍵も返します。
 * @returns {iv: string, data: string, key: string}
 */
export async function encryptText_ReturnKey(plainText) {
    const key = await generateKey();
    const base64Key = await exportKey(key);
    const encrypted = await encryptText(plainText, key);
    return {
        iv: encrypted.iv,
        data: encrypted.data,
        key: base64Key,
    };
}

export async function decryptWithBase64Key(ivBase64, dataBase64, base64Key) {
    const key = await importKey(base64Key);
    const iv = new Uint8Array(converter.base64ToArrayBuffer(ivBase64));
    const cipherBuffer = converter.base64ToArrayBuffer(dataBase64);
    const decryptedBuffer = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv: iv },
        key,
        cipherBuffer
    );
    return new TextDecoder().decode(decryptedBuffer);
}
