import * as ichihai from "/js/ichihai.js";

function compress() {
    const input = document.getElementById("input").value;
    ichihai.gzipCompress(input)
        .then((compressed) => {
            document.getElementById("output").value = compressed;
        })
        .catch((error) => {
            console.error("圧縮中にエラーが発生しました:", error);
            document.getElementById("output").value = "圧縮に失敗しました。";
        });
}

function copy() {
    const output = document.getElementById("output").value;
    if (output) {
        navigator.clipboard
            .writeText(output)
            .then(() => {
                alert("コピーしました。");
            })
            .catch((error) => {
                console.error(error);
                alert("コピーに失敗しました。");
            });
    } else {
        alert("コピーする内容がありません。");
    }
}

document.getElementById("compress").onclick = compress;
document.getElementById("copy").onclick = copy;
