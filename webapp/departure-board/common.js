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

import * as ichihai from "/js/ichihai.js";

function clearDisplay() {
    document.querySelectorAll(".display-column-row").forEach((el) => {
        el.style.backgroundColor = colors["0"];
    });
}

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
    clearDisplay();
    document.querySelector(".departure-board").style.visibility = "visible";
}

let colors = {};

let dotCache = {};

let dotJson = {};

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
                case "text_old": {
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
                }
                case "text":
                    const tx_tcs = data_tn[1].split(";");
                    for (let ti = 0; ti < tx_tcs.length; ti++) {
                        const tx_tc = tx_tcs[ti].split(",");
                        if (tx_tc == "") {
                            console.log("Empty text, skipping.");
                            continue;
                        }

                        const tx_tc_s = tx_tc[0].split("@");
                        const text = tx_tc_s[0].replaceAll("[at]", "@");
                        const tx_size =
                            tx_tc_s.length == 2
                                ? parseFloat(tx_tc_s[1])
                                : text.length;

                        const chars = [...text];
                        let data_t = null;

                        for (const char of chars) {
                            const code = char.codePointAt(0);
                            let char_dot = dotJson[code];

                            if (code == 12288)
                                //全角スペース
                                char_dot = ("0".repeat(16) + "\n").repeat(16);
                            if (!char_dot) {
                                console.log(
                                    `Character not found: ${char} (code=${code})`,
                                );
                                continue;
                            }

                            console.log(
                                `${char}, ${code}, ${char_dot.split(/\r?\n/)[0].length}`,
                            );
                            if (char_dot === null)
                                if (char == " ")
                                    char_dot = ("0".repeat(8) + "\n").repeat(
                                        16,
                                    );
                                else if (char == "　")
                                    char_dot = ("0".repeat(16) + "\n").repeat(
                                        16,
                                    );

                            if (data_t === null) {
                                data_t = char_dot;
                            } else {
                                const char_dot_l = char_dot.split(/\r?\n/);
                                const data_t_l = data_t.split(/\r?\n/);
                                for (let li = 0; li < data_t_l.length; li++) {
                                    data_t_l[li] += char_dot_l[li] ?? "";
                                }
                                data_t = data_t_l.join("\n");
                            }
                        }

                        if (!data_t) data_t = "\n".repeat(16);

                        if (tx_tc_s.length == 2) {
                            const data_t_l = data_t.split(/\r?\n/);
                            const dotW_default = data_t_l[0].length;
                            const dotW_override = tx_size * 16;

                            const sized_lines = data_t_l.map((line) => {
                                if (dotW_override <= dotW_default) {
                                    return line.slice(0, dotW_override);
                                } else {
                                    return (
                                        line +
                                        "0".repeat(dotW_override - dotW_default)
                                    );
                                }
                            });
                            data_t = sized_lines.join("\n");
                            console.log(
                                `${text} : ${dotW_default} -> ${dotW_override}`,
                            );
                        }

                        if (tx_tc.length > 1) {
                            if (tx_tc.length > 2) {
                                data_t = data_t.replaceAll("0", "/"); //01反転用一時置換
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

                    if (data.includes("html")) {
                        console.log("ID指定ミスです");
                        continue;
                    }
                    if (data_dIc.length > 1) {
                        if (data_dIc.length > 2) {
                            data = data.replaceAll("0", "/"); //01反転用一時置換
                        }
                        data = data.replaceAll("1", data_dIc[1]);
                        if (data_dIc.length > 2) {
                            data = data.replaceAll("/", data_dIc[2]);
                        }
                    }
                    break;
                case "dot":
                    const data_dc = data_tn[1].split(",");
                    data = "userInput\n" + data_dc[0].replaceAll("\\", "\n");
                    if (data_dc.length > 1) {
                        if (data_dc.length > 2) {
                            data = data.replaceAll("0", "/"); //01反転用一時置換
                        }
                        data = data.replaceAll("1", data_dc[1]);
                        if (data_dc.length > 2) {
                            data = data.replaceAll("/", data_dc[2]);
                        }
                    }
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
                            if (document.getElementById(`d${d}-c${c}-r${r}`))
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

function text2dot(text) {
    const texts = text.split("@");
    text = texts[0];
    const textLength = texts.length == 2 ? Number(texts[1]) : text.length;

    const H = 16;
    const W = H * textLength;
    const fontSize = 16;

    const cv = document.createElement("canvas");
    const ctx = cv.getContext("2d");

    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = "#000";
    ctx.font = `${fontSize}px "MS Gothic", "JF Dot jiskan16s"`;
    ctx.textBaseline = "top";
    ctx.fillText(text, 0, 0);

    const img = ctx.getImageData(0, 0, W, H).data;

    let lines = [];
    for (let y = 0; y < H; y++) {
        let row = "";
        for (let x = 0; x < W; x++) {
            const i = (y * W + x) * 4;
            const r = img[i],
                g = img[i + 1],
                b = img[i + 2];

            const bit = r < 128 ? 1 : 0;
            row += bit;
        }
        lines.push(row);
    }

    return lines.join("\n");
}

let hideOther = false;
let ready = false;

function onReady(func) {
    if (ready) func();
    else setTimeout(() => onReady(func), 100);
}

window.onload = async () => {
    window.color = color;
    window.onReady = onReady;

    while (document.querySelectorAll("div.display").length == 0) {
        await new Promise((resolve) => setTimeout(resolve, 100));
    }
    display_init();

    const font = new FontFace(
        "JF Dot jiskan16s",
        "url('/font/jfdotfont/JF-Dot-jiskan16s.ttf')",
    );

    font.load().then((loadedFont) => {
        document.fonts.add(loadedFont);
    });

    const colorDataSt = await ichihai.getText(
        "/webapp/departure-board/data/color/_sample.txt",
    );
    const colorData = colorDataSt.replace("/: /g", ":").split(/\r?\n/);
    colorData.forEach((line) => {
        const kv = line.split(":");
        colors[kv[0]] = kv[1];
    });

    const dotJsonSt = await ichihai.getText(
        "/webapp/departure-board/data/dot/16/dot-text.json",
    );
    dotJson = JSON.parse(dotJsonSt);

    document.querySelector(".info").onclick = () => {
        const changeTo = hideOther ? "inherit" : "none";
        document.querySelector("header").style.display = changeTo;
        document.querySelector("footer").style.display = changeTo;
        document.querySelector(".info").style.display = changeTo;
        document.querySelector(".info2").style.display = changeTo;
        hideOther = !hideOther;
    };
    document.getElementById("target").onclick = () => {
        const changeTo = hideOther ? "inherit" : "none";
        document.querySelector("header").style.display = changeTo;
        document.querySelector("footer").style.display = changeTo;
        document.querySelector(".info").style.display = changeTo;
        if (document.querySelector(".info2"))
            document.querySelector(".info2").style.display = changeTo;
        hideOther = !hideOther;
    };

    ready = true;

    //color("0$text:あああ");
};
