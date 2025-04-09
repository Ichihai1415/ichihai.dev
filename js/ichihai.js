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
        console.log("[getCookies]cookie(raw): " + cookie);
        const cookies = document.cookie.split("; ");
        for (let i = 0; i < cookies.length; i++) {
            const cookie_ = cookies[i].split("=");
            cookieArr[cookie_[0]] = cookie_[1];
        }
    } else {
        console.log("[getCookies]cookie not found.");
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
    console.log("[setCookie]cookie saved: " + saveCookie);
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
