import * as ichihai from "/js/ichihai.js";

const canvas = document.getElementById("main");
const ctx = canvas.getContext("2d");

let latSta = 33;
let latEnd = 38;
let lonSta = 135;
let lonEnd = 140;
let size = [1, 1];
let zoomW = size[0] / (lonEnd - lonSta);
let zoomH = size[1] / (latEnd - latSta);

let map_data = null;
let railroad_data = null;
export let station_data = null;

// スクリーン → 地理座標
function screenToGeo(sx, sy) {
    const lon = lonSta + sx / zoomW;
    const lat = latEnd - sy / zoomH; // Y軸反転（北が上）
    return { lat, lon };
}

// 地理座標 → スクリーン
function geoToScreen(lat, lon) {
    const sx = (lon - lonSta) * zoomW;
    const sy = (latEnd - lat) * zoomH;
    return { sx, sy };
}

const ZOOM_FACTOR = 1.2;

canvas.addEventListener(
    "wheel",
    (e) => {
        e.preventDefault();

        // ① マウス位置の地理座標を記録（この点を固定する）
        const pivot = screenToGeo(e.offsetX, e.offsetY);

        // ② 範囲をスケール
        const scale = e.deltaY < 0 ? 1 / ZOOM_FACTOR : ZOOM_FACTOR;
        const newW = (lonEnd - lonSta) * scale;
        const newH = (latEnd - latSta) * scale;

        // ③ pivot点がマウス位置に来るよう範囲を再計算
        const rx = e.offsetX / size[0]; // canvas内の相対位置 (0〜1)
        const ry = e.offsetY / size[1];

        lonSta = pivot.lon - newW * rx;
        lonEnd = pivot.lon + newW * (1 - rx);
        latEnd = pivot.lat + newH * ry;
        latSta = pivot.lat - newH * (1 - ry);

        // ④ zoom再計算
        zoomW = size[0] / (lonEnd - lonSta);
        zoomH = size[1] / (latEnd - latSta);

        draw();
    },
    { passive: false },
);

let dragging = false;
let dragStart = null;

canvas.addEventListener("mousedown", (e) => {
    dragging = true;
    dragStart = screenToGeo(e.offsetX, e.offsetY);
});

canvas.addEventListener("mousemove", (e) => {
    if (!dragging) return;

    const cur = screenToGeo(e.offsetX, e.offsetY);
    const dLon = dragStart.lon - cur.lon; // ドラッグ差分
    const dLat = dragStart.lat - cur.lat;

    lonSta += dLon;
    lonEnd += dLon;
    latSta += dLat;
    latEnd += dLat;

    // dragStartを更新しないとラグが出る
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

    // 経度範囲を基準に zoom を決め、緯度範囲をアスペクト比から逆算
    zoomW = size[0] / (lonEnd - lonSta);
    const latCenter = (latSta + latEnd) / 2;
    const latHalf = size[1] / zoomW / 2; // 同じ zoom を使う
    latSta = latCenter - latHalf;
    latEnd = latCenter + latHalf;
    zoomH = zoomW; // 縦横同じ倍率

    draw();
}

let station_prop = [];

window.addEventListener("resize", updateWindowSize);

ichihai
    .getData("data/N03-20250101.geojson.gzip")
    .then((res) => res.text())
    .then((txt) => ichihai.gzipDecompress(txt))
    .then((res2) => {
        map_data = JSON.parse(res2);
        ichihai
            .getData("data/N02-24_RailroadSection.geojson.gzip")
            .then((res) => res.text())
            .then((txt) => ichihai.gzipDecompress(txt))
            .then((res2) => {
                railroad_data = JSON.parse(res2);
                ichihai
                    .getData("data/N02-24_Station.geojson.gzip")
                    .then((res) => res.text())
                    .then((txt) => ichihai.gzipDecompress(txt))
                    .then((res2) => {
                        station_data = JSON.parse(res2);

                        station_data.features.forEach((feature) => {
                            const newD = [
                                feature.properties.N02_001,
                                feature.properties.N02_002,
                                feature.properties.N02_003,
                                feature.properties.N02_004,
                                feature.properties.N02_005,
                                feature.properties.N02_005c,
                                feature.properties.N02_005g,
                            ];
                            station_prop.push(newD);
                        });

                        document.getElementById("st").onclick = setStation;
                        updateWindowSize();
                    });
            });
    });

function setStation() {
    let i;
    let c = 100000;
    let flg = false;
    while (!flg) {
        i = Math.floor(Math.random() * station_prop.length);

        flg = document.getElementById("company-type-" + station_prop[i][1]);
        if (flg)
            flg = document.getElementById(
                "railroad-type-" + station_prop[i][0],
            );
        c--;
        if (c == 0) {
            alert(
                "駅抽出試行回数の上限を超えました。条件に合う駅がない可能性があります。",
            );
            console.log(
                "駅抽出試行回数の上限を超えました。条件に合う駅がない可能性があります。",
            );
            flg = true;
        }
    }

    document.getElementById("company-name").innerText = station_prop[i][3];
    document.getElementById("railroad-name").innerText = station_prop[i][2];
    document.getElementById("station-name").innerText = station_prop[i][4];
}

function draw() {
    ctx.clearRect(0, 0, size[0], size[1]);
    ctx.strokeStyle = "#888";
    ctx.lineWidth = 1;

    map_data.features.forEach((feature) => {
        if (feature.geometry) {
            const geoType = feature.geometry.type;
            feature.geometry.coordinates.forEach((coordinate) => {
                let isF = true;
                ctx.beginPath();
                coordinate.forEach((coordinate2) => {
                    if (isF) {
                        ctx.moveTo(
                            (coordinate2[0] - lonSta) * zoomW,
                            (latEnd - coordinate2[1]) * zoomH,
                        );
                    } else {
                        ctx.lineTo(
                            (coordinate2[0] - lonSta) * zoomW,
                            (latEnd - coordinate2[1]) * zoomH,
                        );
                    }
                    isF = false;
                });
                //ctx.closePath();
                ctx.stroke();
            });
        }
    });

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

            if (companyTypeCode == 1) {
                ctx.strokeStyle = "#f00";
                ctx.lineWidth = 2;
            } else if (companyTypeCode == 2) {
                ctx.strokeStyle = "#00f";
                ctx.lineWidth = 1;
            } else if (companyTypeCode == 3) {
                ctx.strokeStyle = "#0f0";
                ctx.lineWidth = 1;
            } else if (companyTypeCode == 4) {
                ctx.strokeStyle = "#f0f";
                ctx.lineWidth = 1;
            } else if (companyTypeCode == 5) {
                ctx.strokeStyle = "#0ff";
                ctx.lineWidth = 1;
            } else if (typeCode > 12) {
                ctx.strokeStyle = "#ff0";
                ctx.lineWidth = 1;
            } else {
                //ないはず
                ctx.strokeStyle = "#000";
                ctx.lineWidth = 1;
            }

            feature.geometry.coordinates.forEach((coordinate) => {
                if (isF) {
                    ctx.moveTo(
                        (coordinate[0] - lonSta) * zoomW,
                        (latEnd - coordinate[1]) * zoomH,
                    );
                } else {
                    ctx.lineTo(
                        (coordinate[0] - lonSta) * zoomW,
                        (latEnd - coordinate[1]) * zoomH,
                    );
                }
                isF = false;
            });
            ctx.stroke();
        }
    });

    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;

    station_data.features.forEach((feature) => {
        if (feature.geometry) {
            const geoType = feature.geometry.type;
            ctx.beginPath();
            let isF = true;
            feature.geometry.coordinates.forEach((coordinate) => {
                if (isF) {
                    ctx.moveTo(
                        (coordinate[0] - lonSta) * zoomW,
                        (latEnd - coordinate[1]) * zoomH,
                    );
                } else {
                    ctx.lineTo(
                        (coordinate[0] - lonSta) * zoomW,
                        (latEnd - coordinate[1]) * zoomH,
                    );
                }
                isF = false;
            });
            ctx.stroke();
        }
    });
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
    },
    { passive: false },
);

canvas.addEventListener(
    "touchmove",
    (e) => {
        e.preventDefault();
        const touches = e.touches;

        if (touches.length === 1 && lastTouches?.length === 1) {
            // 1本指：ドラッグ
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
            // 2本指：ピンチズーム
            const rect = canvas.getBoundingClientRect();

            const prevDist = getTouchDistance(lastTouches);
            const curDist = getTouchDistance(touches);
            const scale = prevDist / curDist; // 縮小>1, 拡大<1

            // ピンチ中心点（地理座標）を固定点にする
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

            zoomW = size[0] / (lonEnd - lonSta);
            zoomH = size[1] / (latEnd - latSta);
        }

        lastTouches = touches;
        draw();
    },
    { passive: false },
);

canvas.addEventListener("touchend", (e) => {
    lastTouches = e.touches; // 残った指を記録
});
