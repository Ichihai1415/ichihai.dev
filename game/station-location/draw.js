import * as ichihai from "/js/ichihai.js";

const canvas = document.getElementById("main");
const ctx = canvas.getContext("2d");

let latSta = 36;
let latEnd = 37;
let lonSta = 138;
let lonEnd = 139;
let size = [1, 1];
let zoomW = size[0] / (lonEnd - lonSta);
let zoomH = size[1] / (latEnd - latSta);

let map_data = null;
let railroad_data = null;
let station_data = null;

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
                        updateWindowSize();
                    });
            });
    });

function draw() {
    ctx.clearRect(0, 0, size[0], size[1]);
    ctx.strokeStyle = "#888";
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

    ctx.strokeStyle = "#000";

    railroad_data.features.forEach((feature) => {
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

    ctx.strokeStyle = "#f00";
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
