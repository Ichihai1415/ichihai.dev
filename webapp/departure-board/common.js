//使う場合
import * as ichihai from "/js/ichihai.js";

display_init();

function display_init() {
    const div_displays = document.querySelectorAll("div.display");
    for (let di = 0; di < div_displays.length; di++) {
        const div_display = div_displays[di];
        const d = Number(div_display.id.replace("d", ""));
        const rows = Number(div_display.getAttribute("db_r"));
        const columns = rows * Number(div_display.getAttribute("db_c"));

        for (let c = 0; c < columns; c++) {
            let div_display_column = document.createElement("div");
            div_display_column.classList.add("display-column");
            div_display_column.id = "d" + d + "-c" + c;

            for (let r = 0; r < rows; r++) {
                let div_display_column_row = document.createElement("div");
                div_display_column_row.classList.add("display-column-row");
                div_display_column_row.id = "d" + d + "-c" + c + "-r" + r;

                div_display_column.appendChild(div_display_column_row);
            }
            div_display.appendChild(div_display_column);
        }
    }
}

const colors = {};
const colorDataSt = await ichihai.getText(
    "/webapp/departure-board/data/color/_sample.txt",
);
const colorData = colorDataSt.replace("/: /g", ":").split(/\r?\n/);
colorData.forEach((line) => {
    const kv = line.split(":");
    colors[kv[0]] = kv[1];
});

//dot ex:  |dot:01\\00\\01\\00\\01\\00\\01\\00\\01\\00\\01\\00\\01\\00\\12\\34,3

const dotCache = {};


export async function color(data_all_raw) {
    clearDisplay();

    const data_raw_lines = data_all_raw.split("\n");
    const data_lines = {};
    for (const line of data_raw_lines) {
        if (line == "") continue;
        const [indexStr, content] = line.split("$");
        const index = Number(indexStr);
        data_lines[index] = content;
    }

    for (let d = 0; d < document.querySelectorAll("div.display").length; d++) {
        if (!data_lines[d]) continue;
        const datas_d = data_lines[d].split("|");
        let cp = 0;
        for (let ps = 0; ps < datas_d.length; ps++) {
            const data_tn = datas_d[ps].split(":");
            let data = null;
            switch (data_tn[0]) {
                case "text":
                    const tx_tcs = data_tn[1].split(";");
                    for (let ti = 0; ti < tx_tcs.length; ti++) {
                        const tx_tc = tx_tcs[ti].split(",");
                        let data_t = text2dot(tx_tc[0]);
                        if (tx_tc.length > 1) {
                            if (tx_tc.length > 2) {
                                //01反転用一時置換
                                data_t = data_t.replaceAll("0", "/");
                            }

                            data_t = data_t.replaceAll("1", tx_tc[1]);

                            if (tx_tc.length > 2) {
                                data_t = data_t.replaceAll("/", tx_tc[2]);
                            }
                        }
                        if (data == null) {
                            data = "text2dot\n" + data_t;
                        } else {
                            const data_t_l = data_t.split(/\r?\n/);
                            const d_l = data.split(/\r?\n/);
                            for (let li = 1; li < d_l.length; li++) {
                                d_l[li] += data_t_l[li - 1];
                            }
                            data = d_l.join("\n");
                        }
                    }
                    break;
                case "dotId":
                    const data_dIc = data_tn[1].split(",");

                    if (dotCache[data_dIc[0]]) {
                        data = dotCache[data_dIc[0]];
                    } else {
                        data = await ichihai.getText(
                            "/webapp/departure-board/data/dot/16/parts/" +
                                data_dIc[0] +
                                ".txt",
                        );
                        dotCache[data_dIc[0]] = data;
                    }

                    if (data.includes("html")) continue;
                    if (data_dIc.length > 1)
                        data = data.replaceAll("1", data_dIc[1]);
                    if (data_dIc.length > 2)
                        data = data.replaceAll("0", data_dIc[2]);
                    break;
                case "dot":
                    const data_dc = data_tn[1].split(",");
                    data = "userInput\n" + data_dc[0].replaceAll("\\", "\n");
                    if (data_dc.length > 1)
                        data = data.replaceAll("1", data_dc[1]);
                    if (data_dc.length > 2)
                        data = data.replaceAll("0", data_dc[2]);
                    break;
            }

            const lines = data.split(/\r?\n/);
            const title = lines[0];

            const rest = lines.slice(1).filter((line) => line.trim() !== "");

            let columns = rest[0].length;
            let rows = rest.length;

            for (let _c = 0; _c < columns; _c++) {
                const c = cp + _c;
                for (let r = 0; r < rows; r++) {
                    const char = rest[r].charAt(_c);
                    if (char != 0)
                        if (Object.hasOwn(colors, char)) {
                            document.getElementById(
                                `d${d}-c${c}-r${r}`,
                            ).style.backgroundColor = colors[char];
                        }
                }
            }
            cp += columns;
        }
    }
}
window.color = color;
//color(data_all_raw);

function text2dot(text) {
    const texts = text.split("@");
    text = texts[0];
    const textLength = texts.length == 2 ? Number(texts[1]) : text.length;

    const H = 16;
    const W = H * textLength;
    const fontSize = 16;

    const cv = document.createElement("canvas");
    const ctx = cv.getContext("2d");

    // 背景白
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, W, H);

    // 黒で MS ゴシック描画
    ctx.fillStyle = "#000";
    ctx.font = `${fontSize}px "MS Gothic"`;
    ctx.textBaseline = "top";
    ctx.fillText(text, 0, 0);

    // ピクセル取得
    const img = ctx.getImageData(0, 0, W, H).data;

    let lines = [];
    for (let y = 0; y < H; y++) {
        let row = "";
        for (let x = 0; x < W; x++) {
            const i = (y * W + x) * 4;
            const r = img[i],
                g = img[i + 1],
                b = img[i + 2];

            // 完全黒なら 1
            const bit = r === 0 && g === 0 && b === 0 ? 1 : 0;
            row += bit;
        }
        lines.push(row);
    }

    return lines.join("\n");
}

function clearDisplay() {
    document.querySelectorAll(".display-column-row").forEach((el) => {
        el.style.backgroundColor = colors["0"];
    });
}

clearDisplay();

let hideOther = false;

document.querySelector("main").onclick = () => {
    const changeTo = hideOther ? "inherit" : "none";
    document.querySelector("header").style.display = changeTo;
    document.querySelector("footer").style.display = changeTo;
    document.querySelector("common-comment").style.display = changeTo;
    document.querySelector("h1").style.display = changeTo;
    document.querySelector(".update-date").style.display = changeTo;
    hideOther = !hideOther;
};
