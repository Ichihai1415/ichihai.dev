import * as ichihai from "/js/ichihai.js";

const VERSION = "v0.4.4";

const canvas = document.getElementById("main");
const ctx = canvas.getContext("2d");

let latSta = 20;
let latEnd = 50;
let lonSta = 120;
let lonEnd = 150;
let size = [1, 1];
let zoom = 1;

let zoom_factor = 1.2;
let zoom_min = 20;
let zoom_max = 50000;

let map_data_01 = null;
let map_data_1 = null;
let map_data_5 = null;
let map_pref_data_01 = null;
let map_pref_data_1 = null;
let map_pref_data_5 = null;
let railroad_data = null;
let station_data = null;

let s_railroad = true;

let answer = [];
let answerPos = null;

function screenToGeo(sx, sy) {
    const lon = lonSta + sx / zoom;
    const lat = latEnd - sy / zoom;
    return { lat, lon };
}

function geoToScreen(lat, lon) {
    const sx = (lon - lonSta) * zoom;
    const sy = (latEnd - lat) * zoom;
    return { sx, sy };
}

canvas.addEventListener(
    "wheel",
    (e) => {
        e.preventDefault();

        const pivot = screenToGeo(e.offsetX, e.offsetY);

        const scale = e.deltaY < 0 ? 1 / zoom_factor : zoom_factor;

        const rx = e.offsetX / size[0];
        const ry = e.offsetY / size[1];

        const newZoom = Math.min(Math.max(zoom / scale, zoom_min), zoom_max);
        const effectiveScale = zoom / newZoom;

        zoom = newZoom;

        const newH = size[1] / zoom;
        const newW = (lonEnd - lonSta) * effectiveScale;

        latEnd = pivot.lat + newH * ry;
        latSta = pivot.lat - newH * (1 - ry);
        lonSta = pivot.lon - newW * rx;
        lonEnd = pivot.lon + newW * (1 - rx);

        draw();
    },
    { passive: false },
);

let dragging = false;
let dragStart = null;

canvas.addEventListener("mousedown", (e) => {
    if (!dragging) answerPos = screenToGeo(e.offsetX, e.offsetY);
    dragging = true;
    dragStart = screenToGeo(e.offsetX, e.offsetY);
});

canvas.addEventListener("mousemove", (e) => {
    if (!dragging) return;

    const cur = screenToGeo(e.offsetX, e.offsetY);
    const dLon = dragStart.lon - cur.lon;
    const dLat = dragStart.lat - cur.lat;

    lonSta += dLon;
    lonEnd += dLon;
    latSta += dLat;
    latEnd += dLat;

    dragStart = screenToGeo(e.offsetX, e.offsetY);

    draw();
});

canvas.addEventListener("mouseup", () => (dragging = false));
canvas.addEventListener("mouseleave", () => (dragging = false));

function updateWindowSize() {
    size = [window.innerWidth, window.innerHeight];
    const canvas = document.querySelector("canvas");
    canvas.width = size[0];
    canvas.height = size[1];

    const zoomX = size[0] / (lonEnd - lonSta);
    const zoomY = size[1] / (latEnd - latSta);
    zoom = Math.max(Math.min(zoomX, zoomY, zoom_max), zoom_min);

    const lonCenter = (lonSta + lonEnd) / 2;
    const latCenter = (latSta + latEnd) / 2;
    lonSta = lonCenter - size[0] / zoom / 2;
    lonEnd = lonCenter + size[0] / zoom / 2;
    latSta = latCenter - size[1] / zoom / 2;
    latEnd = latCenter + size[1] / zoom / 2;

    draw();
}

let station_prop = [];
let companyList = [];
let companyRailroadList = [[]];
let answerLocation = [];

window.addEventListener("resize", updateWindowSize);

function setStation() {
    const shuffled = [...station_prop];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    for (const st of shuffled) {
        console.log(
            document.getElementById("company-type-select-" + st[1]).checked,
        );
        if (
            (document.getElementById("company-type-select").selectedOptions
                .length == 0 ||
                document.getElementById("company-type-select-" + st[1])
                    .selected) &&
            (document.getElementById("railroad-type-select").selectedOptions
                .length == 0 ||
                document.getElementById("railroad-type-select-" + st[0])
                    .selected) &&
            (document.getElementById("company-select").selectedOptions.length ==
                0 ||
                Array.from(
                    document.getElementById("company-select").selectedOptions,
                )
                    .map((o) => o.innerText)
                    .includes(st[3]))
        ) {
            answer = st;
            document.getElementById("company-name").innerText = st[3];
            document.getElementById("railroad-name").innerText = st[2];
            document.getElementById("station-name").innerText = st[4];
            return;
        }
    }
    console.log("条件に合う駅がありません。");
    document.getElementById("company-name").innerText =
        "条件に合う駅がありません。";
    document.getElementById("railroad-name").innerText = "";
    document.getElementById("station-name").innerText = "";
}

function mapDraw_feature(feature) {
    if (feature.geometry) {
        const geoType = feature.geometry.type;
        feature.geometry.coordinates.forEach((coordinate) => {
            let isF = true;
            ctx.beginPath();
            coordinate.forEach((coordinate2) => {
                if (isF) {
                    ctx.moveTo(
                        (coordinate2[0] - lonSta) * zoom,
                        (latEnd - coordinate2[1]) * zoom,
                    );
                } else {
                    ctx.lineTo(
                        (coordinate2[0] - lonSta) * zoom,
                        (latEnd - coordinate2[1]) * zoom,
                    );
                }
                isF = false;
            });
            ctx.stroke();
        });
    }
}

function draw() {
    //console.log(zoom);

    ctx.clearRect(0, 0, size[0], size[1]);

    ctx.strokeStyle = "#888";
    ctx.lineWidth = 1;
    if (document.getElementById("drawMap-city").checked)
        if (zoom < 50) {
        } else if (zoom < 200) {
            map_data_01.features.forEach((feature) => {
                mapDraw_feature(feature);
            });
        } else if (zoom < 1000) {
            map_data_1.features.forEach((feature) => {
                mapDraw_feature(feature);
            });
        } else {
            map_data_5.features.forEach((feature) => {
                mapDraw_feature(feature);
            });
        }

    ctx.strokeStyle = "#000";
    if (zoom > 500) ctx.lineWidth = 2;
    if (zoom < 50) {
        map_pref_data_01.features.forEach((feature) => {
            mapDraw_feature(feature);
        });
    } else if (zoom < 1000) {
        map_pref_data_1.features.forEach((feature) => {
            mapDraw_feature(feature);
        });
    } else {
        map_pref_data_5.features.forEach((feature) => {
            mapDraw_feature(feature);
        });
    }

    if (document.getElementById("drawRailroad").checked)
        railroad_data.features.forEach((feature) => {
            if (feature.geometry) {
                const geoType = feature.geometry.type;
                ctx.beginPath();
                let isF = true;
                const typeCode = feature.properties.N02_001;
                const companyTypeCode = feature.properties.N02_002;
                const lineName = feature.properties.N02_003;
                const company = feature.properties.N02_004;
                //const stationName = feature.properties.N02_005;
                //const stationCode1 = feature.properties.N02_005c;
                //const stationCode2 = feature.properties.N02_005g;

                if (
                    (document.getElementById("company-type-select")
                        .selectedOptions.length == 0 ||
                        document.getElementById(
                            "company-type-select-" + companyTypeCode,
                        ).selected) &&
                    (document.getElementById("railroad-type-select")
                        .selectedOptions.length == 0 ||
                        document.getElementById(
                            "railroad-type-select-" + typeCode,
                        ).selected) &&
                    (document.getElementById("company-select").selectedOptions
                        .length == 0 ||
                        Array.from(
                            document.getElementById("company-select")
                                .selectedOptions,
                        )
                            .map((o) => o.innerText)
                            .includes(company))
                ) {
                    ctx.lineWidth = 1;
                    if (companyTypeCode == 1) {
                        ctx.strokeStyle = "#f00";
                        ctx.lineWidth = 2;
                    } else if (companyTypeCode == 2) ctx.strokeStyle = "#00f";
                    else if (companyTypeCode == 3) ctx.strokeStyle = "#0f0";
                    else if (companyTypeCode == 4) ctx.strokeStyle = "#f0f";
                    else if (companyTypeCode == 5) ctx.strokeStyle = "#0ff";
                    //以降ないはず
                    else if (typeCode > 12) ctx.strokeStyle = "#ff0";
                    else ctx.strokeStyle = "#000";

                    feature.geometry.coordinates.forEach((coordinate) => {
                        if (isF) {
                            ctx.moveTo(
                                (coordinate[0] - lonSta) * zoom,
                                (latEnd - coordinate[1]) * zoom,
                            );
                        } else {
                            ctx.lineTo(
                                (coordinate[0] - lonSta) * zoom,
                                (latEnd - coordinate[1]) * zoom,
                            );
                        }
                        isF = false;
                    });
                    ctx.stroke();
                }
            }
        });

    ctx.strokeStyle = "#0008";
    ctx.lineWidth = 2;

    if (
        document.getElementById("drawStation").checked ||
        document.getElementById("drawStationCenter").checked
    )
        station_data.features.forEach((feature) => {
            if (feature.geometry) {
                const geoType = feature.geometry.type;
                const companyTypeCode = feature.properties.N02_002;

                if (document.getElementById("drawStation").checked) {
                    ctx.beginPath();
                    let isF = true;
                    feature.geometry.coordinates.forEach((coordinate) => {
                        if (isF) {
                            ctx.moveTo(
                                (coordinate[0] - lonSta) * zoom,
                                (latEnd - coordinate[1]) * zoom,
                            );
                        } else {
                            ctx.lineTo(
                                (coordinate[0] - lonSta) * zoom,
                                (latEnd - coordinate[1]) * zoom,
                            );
                        }
                        isF = false;
                    });

                    ctx.stroke();
                }

                if (document.getElementById("drawStationCenter").checked) {
                    if (companyTypeCode == 1) ctx.fillStyle = "#f00";
                    else if (companyTypeCode == 2) ctx.fillStyle = "#00f";
                    else if (companyTypeCode == 3) ctx.fillStyle = "#0f0";
                    else if (companyTypeCode == 4) ctx.fillStyle = "#f0f";
                    else if (companyTypeCode == 5) ctx.fillStyle = "#0ff";
                    else ctx.fillStyle = "#0ff";

                    ctx.beginPath();
                    const p1 = feature.geometry.coordinates[0];
                    const p2 =
                        feature.geometry.coordinates[
                            feature.geometry.coordinates.length - 1
                        ];

                    ctx.arc(
                        ((p2[0] + p1[0]) / 2 - lonSta) * zoom,
                        (latEnd - (p2[1] + p1[1]) / 2) * zoom,
                        3,
                        0,
                        2 * Math.PI,
                    );
                    ctx.fill();
                }
            }
        });

    if (answerPos) {
        const cx = (answerPos.lon - lonSta) * zoom;
        const cy = (latEnd - answerPos.lat) * zoom;

        ctx.lineWidth = 6;
        ctx.strokeStyle = "#0008";
        ctx.beginPath();
        ctx.moveTo(cx + 20, cy);
        ctx.lineTo(cx - 20, cy);
        ctx.moveTo(cx, cy + 20);
        ctx.lineTo(cx, cy - 20);
        ctx.stroke();
    }
}

let lastTouches = null;

function getTouchDistance(touches) {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
}

function getTouchCenter(touches) {
    return {
        x: (touches[0].offsetX + touches[1].offsetX) / 2,
        y: (touches[0].offsetY + touches[1].offsetY) / 2,
    };
}

canvas.addEventListener(
    "touchstart",
    (e) => {
        e.preventDefault();
        lastTouches = e.touches;
        const rect = canvas.getBoundingClientRect();
        answerPos = screenToGeo(
            lastTouches[0].clientX - rect.left,
            lastTouches[0].clientY - rect.top,
        );
    },
    { passive: false },
);

canvas.addEventListener(
    "touchmove",
    (e) => {
        e.preventDefault();
        const touches = e.touches;

        if (touches.length === 1 && lastTouches?.length === 1) {
            const rect = canvas.getBoundingClientRect();
            const prevGeo = screenToGeo(
                lastTouches[0].clientX - rect.left,
                lastTouches[0].clientY - rect.top,
            );
            const curGeo = screenToGeo(
                touches[0].clientX - rect.left,
                touches[0].clientY - rect.top,
            );
            const dLon = prevGeo.lon - curGeo.lon;
            const dLat = prevGeo.lat - curGeo.lat;

            lonSta += dLon;
            lonEnd += dLon;
            latSta += dLat;
            latEnd += dLat;
        } else if (touches.length === 2 && lastTouches?.length === 2) {
            const rect = canvas.getBoundingClientRect();

            const prevDist = getTouchDistance(lastTouches);
            const curDist = getTouchDistance(touches);
            const scale = prevDist / curDist; // 縮小>1, 拡大<1

            const cx =
                (touches[0].clientX + touches[1].clientX) / 2 - rect.left;
            const cy = (touches[0].clientY + touches[1].clientY) / 2 - rect.top;
            const pivot = screenToGeo(cx, cy);

            const newW = (lonEnd - lonSta) * scale;
            const newH = (latEnd - latSta) * scale;
            const rx = cx / size[0];
            const ry = cy / size[1];

            lonSta = pivot.lon - newW * rx;
            lonEnd = pivot.lon + newW * (1 - rx);
            latEnd = pivot.lat + newH * ry;
            latSta = pivot.lat - newH * (1 - ry);

            zoom = size[1] / (latEnd - latSta);
        }

        lastTouches = touches;
        draw();
    },
    { passive: false },
);

canvas.addEventListener("touchend", (e) => {
    lastTouches = e.touches;
});

document.getElementById("setting-open").onclick = () => {
    document.querySelector(".setting-out").style.visibility = "visible";
};

document.getElementById("setting-close").onclick = () => {
    document.querySelector(".setting-out").style.visibility = "hidden";
};

document.querySelector(".setting-out").onclick = () => {
    document.querySelector(".setting-out").style.visibility = "hidden";
    draw();
};

document.querySelector(".setting-out *").onclick = (e) => {
    e.stopPropagation();
};

document.getElementById("home-pos").onclick = () => {
    latSta = 20;
    latEnd = 50;
    lonSta = 120;
    lonEnd = 150;
    updateWindowSize();
};

{
    const v = document.getElementById("version").innerText;
    if (v != VERSION) {
        document.getElementById("version").innerText =
            `注意：スクリプトが最新でない可能性があります（HTML: ${document.getElementById("version").innerText} / JS: ${VERSION}）。`;
        document.getElementById("version").style.color = "red";
    }
}

document.getElementById("answerLocation").onclick = () => {
    if (!answerPos) {
        alert(
            "解答の位置が設定されていません。クリック・タッチで設定されます（十字印が付きます）。",
        );
        return;
    }
    alert(`【　結　果　発　表　（　仮　）　】
問題: ${answer[3]} ${answer[2]} ${answer[4]}駅  
正解: 北緯${answer[8]}度, 東経${answer[7]}度 
指定: 北緯${answerPos.lat}度, 東経${answerPos.lon}度 
距離: （未実装）`);
};

window.onload = async () => {
    document.getElementById("init-message").textContent =
        "取得中... data/N03-20250101_0.1.gzgj";
    map_data_01 = JSON.parse(
        await ichihai.gzipDecompress(
            await (await ichihai.getData("data/N03-20250101_0.1.gzgj")).text(),
        ),
    );

    document.getElementById("init-message").textContent =
        "取得中... data/N03-20250101_1.gzgj";
    map_data_1 = JSON.parse(
        await ichihai.gzipDecompress(
            await (await ichihai.getData("data/N03-20250101_1.gzgj")).text(),
        ),
    );

    document.getElementById("init-message").textContent =
        "取得中... data/N03-20250101_5.gzgj";
    map_data_5 = JSON.parse(
        await ichihai.gzipDecompress(
            await (await ichihai.getData("data/N03-20250101_5.gzgj")).text(),
        ),
    );

    document.getElementById("init-message").textContent =
        "取得中... data/N03-20250101_prefecture_0.1.gzgj";
    map_pref_data_01 = JSON.parse(
        await ichihai.gzipDecompress(
            await (
                await ichihai.getData("data/N03-20250101_prefecture_0.1.gzgj")
            ).text(),
        ),
    );

    document.getElementById("init-message").textContent =
        "取得中... data/N03-20250101_prefecture_1.gzgj";
    map_pref_data_1 = JSON.parse(
        await ichihai.gzipDecompress(
            await (
                await ichihai.getData("data/N03-20250101_prefecture_1.gzgj")
            ).text(),
        ),
    );

    document.getElementById("init-message").textContent =
        "取得中... data/N03-20250101_prefecture_5.gzgj";
    map_pref_data_5 = JSON.parse(
        await ichihai.gzipDecompress(
            await (
                await ichihai.getData("data/N03-20250101_prefecture_5.gzgj")
            ).text(),
        ),
    );

    document.getElementById("init-message").textContent =
        "取得中... data/N02-24_RailroadSection.gzgj";
    railroad_data = JSON.parse(
        await ichihai.gzipDecompress(
            await (
                await ichihai.getData("data/N02-24_RailroadSection.gzgj")
            ).text(),
        ),
    );

    document.getElementById("init-message").textContent =
        "取得中... data/N02-24_Station.gzgj";
    station_data = JSON.parse(
        await ichihai.gzipDecompress(
            await (await ichihai.getData("data/N02-24_Station.gzgj")).text(),
        ),
    );

    document.getElementById("init-message").textContent = "データ処理中...";
    station_data.features.forEach((feature) => {
        const p1 = feature.geometry.coordinates[0];
        const p2 =
            feature.geometry.coordinates[
                feature.geometry.coordinates.length - 1
            ];

        const newD = [
            //"properties": { "N02_001": "11", "N02_002": "2", "N02_003": "指宿枕崎線", "N02_004": "九州旅客鉄道", "N02_005": "二月田", "N02_005c": "010112", "N02_005g": "010112" }
            feature.properties.N02_001,
            feature.properties.N02_002,
            feature.properties.N02_003,
            feature.properties.N02_004,
            feature.properties.N02_005,
            feature.properties.N02_005c,
            feature.properties.N02_005g,
            (p1[0] + p2[0]) / 2,
            (p1[1] + p2[1]) / 2,
        ];
        station_prop.push(newD);

        if (!companyList.includes(newD[3])) companyList.push(newD[3]);

        let row = companyRailroadList.find((r) => r[0] == newD[3]);
        if (!row) {
            row = [newD[3], []];
            companyRailroadList.push(row);
        } else if (!row[1].includes(newD[2])) row[1].push(newD[2]);
    });

    //console.log(companyRailroadList);
    document.getElementById("setStation").onclick = setStation;
    companyList.sort();
    let compEle = document.getElementById("company-select");
    let i = 0;
    companyList.forEach((comp) => {
        //console.log(comp);
        let opt = document.createElement("option");
        opt.value = i;
        opt.textContent = comp;
        compEle.appendChild(opt);
        i++;
    });

    document.getElementById("init-message").textContent = "初期描画中...";
    updateWindowSize();

    document.querySelector(".init-info-out").onclick = () => {
        document.querySelector(".init-info-out").style.display = "none";
    };

    document.querySelector(".init-info-out a").onclick = (e) => {
        e.stopPropagation();
    };
    document.getElementById("init-message").textContent =
        "初期化が完了しました。どこかクリックするとこの表示を閉じます。";
    document.getElementById("init-message").style.fontWeight = "bold";
};
