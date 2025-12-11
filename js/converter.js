/**
 * 文字列をArrayBufferに変換します。
 * @param {string} str 文字列
 * @returns {Uint8Array<ArrayBuffer>} ArrayBuffer
 */
export function stringToArrayBuffer(str) {
    return new TextEncoder().encode(str);
}

/**
 * ArrayBufferをBase64文字列に変換します。
 * @param {Uint8Array<ArrayBuffer>} buffer ArrayBuffer
 * @returns {string} Base64文字列
 */
export function arrayBufferToBase64(buffer) {
    return btoa(String.fromCharCode(...new Uint8Array(buffer)));
}

/**
 * Base64文字列をArrayBufferに変換します。
 * @param {string} base64 Base64文字列
 * @returns {Uint8Array<ArrayBuffer>} ArrayBuffer
 */
export function base64ToArrayBuffer(base64) {
    return Uint8Array.from(atob(base64), (c) => c.charCodeAt(0)).buffer;
}
