//使う場合
import * as ichihai from "/js/ichihai.js";

const colors = {};
const colorDataSt = await ichihai.getText("data/color/_sample.txt");
const colorData = colorDataSt.replace("/: /g", ":").split(/\r?\n/);
colorData.forEach((line) => {
    const kv = line.split(":");
    colors[kv[0]] = kv[1];
});

const data_all_raw =
    "1$text:快速@5,2;〇,1|dotId:num-k/3,1|text:～,1|dotId:num-k/8,1|dotId:zero-32,1|text:18：20@4,2;敦　賀@4,1\n" +
    "4$dotId:type/new-rapid.2,3|dotId:name/kosei-omimaiko,3|dotId:zero-16|text:13：20@3,2|dotId:zero-8|dotId:destination/himeji-dir-osaka\n" +
    "5$text:北陸特快@5,3;△1～6@5,1;20：05@4,2;米　原@4,1\n" +
    "6$text:急行@5,3;☐1～9@5,1; 0：45@3,2|dotId:zero-8|dotId:destination/osaka-dir-kyoto\n" +
    "0$text:特急ｻﾝﾀﾞｰﾊﾞｰﾄﾞ@7,3|dotId:num-k/1,1|dotId:num-k/7,1|text:号@2,1|dotId:num-k/1,2|dotId:num-k/3,2|text:：,2|dotId:num-k/2,2|dotId:num-k/7,2|text: 和倉温泉,1\n" +
    "2$text:普通　　,1;黄,1|dotId:position/arrow,1|text:1～20,1; 3：33@4,2;直江津,1\n" +
    "3$text:☆☆☆,2;本日の運転は終了しました,1;☆☆☆,2";
//dot ex:  |dot:01\\00\\01\\00\\01\\00\\01\\00\\01\\00\\01\\00\\01\\00\\12\\34,3

/*
            const data_all_raw =
                "0$text:93@1.5,2;遅れ約15分@5.5,3;12：34@3,2;  金沢駅  @5,1;Ｂ@1.5,2\n" +
                "1$text:93@1.5,2;快速@5.5,2; 8：00@3,2; 金沢大学 @5,1;Ａ@1.5,2\n" +
                "2$text:  @1.5,2;市立病院線@5.5,1; 8：00@3,2; 金沢大学 @5,1;Ｃ@1.5,2\n" +
                "3$text:94@1.5,2; @5.5,1; 8：00@3,2; 旭町@2.5,1|dotId:destination/via|text:金沢駅@3.5,1;Ｄ@1.5,2\n" +
                "4$text:94@1.5,2;通学急行@5.5,3; 7：34@3,2;旭町@2,1|dotId:destination/via,1|text:金沢大学@4,1;Ｃ@1.5,2";
            */
const dotCache = {};

async function color(data_all_raw) {
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
                            "data/dot/16/parts/" + data_dIc[0] + ".txt",
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
