/* This note was updated on 2025/12/12.
The template (latest note): https://ichihai.dev/_temp.html

ichihai.dev - (c) 2024 Ichihai1415 All right reserved.
- ichihai.dev is a personal static website by Ichihai1415.
- Contact information can be found at https://ichihai.dev/aboutme/links.html. I would recommend contacting me at X (@ProjectS31415_1).
- ichihai.dev is hosted on Cloudflare Pages. Domain was registered on Cloudflare on 2024/03/01.
- The repository is on GitHub: https://github.com/Ichihai1415/ichihai.dev
- This repository is licensed under the MIT License.
- Some content includes AI-generated content.
- Some text is machine translated. I'm not good at English so please excuse any mistakes.
- Data from other sources are under the license of that source.
- Most of codes are formatted by Prettier.
*/

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
