import * as ichihai from "/js/ichihai.js";

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
                        //こないはず
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
    document.querySelector(".setting-out").style.display = "inherit";
};

document.getElementById("setting-close").onclick = () => {
    document.querySelector(".setting-out").style.display = "none";
};

document.querySelector(".setting-out").onclick = () => {
    document.querySelector(".setting-out").style.display = "none";
    draw();
};

document.querySelector(".setting-out *").onclick = (e) => {
    e.stopPropagation();
};

document.querySelector(".init-info-out").onclick = () => {
    document.querySelector(".init-info-out").style.display = "none";
};

document.querySelector(".init-info-out a").onclick = (e) => {
    e.stopPropagation();
};

window.onload = () => {
    ichihai
        .getData("data/N03-20250101_0.1.gzgj")
        .then((res) => res.text())
        .then((txt) => ichihai.gzipDecompress(txt))
        .then((res2) => {
            map_data_01 = JSON.parse(res2);

            ichihai
                .getData("data/N03-20250101_1.gzgj")
                .then((res) => res.text())
                .then((txt) => ichihai.gzipDecompress(txt))
                .then((res2) => {
                    map_data_1 = JSON.parse(res2);

                    ichihai
                        .getData("data/N03-20250101_5.gzgj")
                        .then((res) => res.text())
                        .then((txt) => ichihai.gzipDecompress(txt))
                        .then((res2) => {
                            map_data_5 = JSON.parse(res2);

                            ichihai
                                .getData(
                                    "data/N03-20250101_prefecture_0.1.gzgj",
                                )
                                .then((res) => res.text())
                                .then((txt) => ichihai.gzipDecompress(txt))
                                .then((res2) => {
                                    map_pref_data_01 = JSON.parse(res2);

                                    ichihai
                                        .getData(
                                            "data/N03-20250101_prefecture_1.gzgj",
                                        )
                                        .then((res) => res.text())
                                        .then((txt) =>
                                            ichihai.gzipDecompress(txt),
                                        )
                                        .then((res2) => {
                                            map_pref_data_1 = JSON.parse(res2);

                                            ichihai
                                                .getData(
                                                    "data/N03-20250101_prefecture_5.gzgj",
                                                )
                                                .then((res) => res.text())
                                                .then((txt) =>
                                                    ichihai.gzipDecompress(txt),
                                                )
                                                .then((res2) => {
                                                    map_pref_data_5 =
                                                        JSON.parse(res2);

                                                    ichihai
                                                        .getData(
                                                            "data/N02-24_RailroadSection.geojson.gzip",
                                                        )
                                                        .then((res) =>
                                                            res.text(),
                                                        )
                                                        .then((txt) =>
                                                            ichihai.gzipDecompress(
                                                                txt,
                                                            ),
                                                        )
                                                        .then((res2) => {
                                                            railroad_data =
                                                                JSON.parse(
                                                                    res2,
                                                                );
                                                            ichihai
                                                                .getData(
                                                                    "data/N02-24_Station.geojson.gzip",
                                                                )
                                                                .then((res) =>
                                                                    res.text(),
                                                                )
                                                                .then((txt) =>
                                                                    ichihai.gzipDecompress(
                                                                        txt,
                                                                    ),
                                                                )
                                                                .then(
                                                                    (res2) => {
                                                                        station_data =
                                                                            JSON.parse(
                                                                                res2,
                                                                            );

                                                                        station_data.features.forEach(
                                                                            (
                                                                                feature,
                                                                            ) => {
                                                                                const p1 =
                                                                                    feature
                                                                                        .geometry
                                                                                        .coordinates[0];
                                                                                const p2 =
                                                                                    feature
                                                                                        .geometry
                                                                                        .coordinates[
                                                                                        feature
                                                                                            .geometry
                                                                                            .coordinates
                                                                                            .length -
                                                                                            1
                                                                                    ];

                                                                                const newD =
                                                                                    [
                                                                                        feature
                                                                                            .properties
                                                                                            .N02_001,
                                                                                        feature
                                                                                            .properties
                                                                                            .N02_002,
                                                                                        feature
                                                                                            .properties
                                                                                            .N02_003,
                                                                                        feature
                                                                                            .properties
                                                                                            .N02_004,
                                                                                        feature
                                                                                            .properties
                                                                                            .N02_005,
                                                                                        feature
                                                                                            .properties
                                                                                            .N02_005c,
                                                                                        feature
                                                                                            .properties
                                                                                            .N02_005g,
                                                                                        (p1[0] +
                                                                                            p2[0]) /
                                                                                            2,
                                                                                        (p1[1] +
                                                                                            p2[1]) /
                                                                                            2,
                                                                                    ];
                                                                                station_prop.push(
                                                                                    newD,
                                                                                );

                                                                                if (
                                                                                    !companyList.includes(
                                                                                        newD[3],
                                                                                    )
                                                                                )
                                                                                    companyList.push(
                                                                                        newD[3],
                                                                                    );

                                                                                let row =
                                                                                    companyRailroadList.find(
                                                                                        (
                                                                                            r,
                                                                                        ) =>
                                                                                            r[0] ==
                                                                                            newD[3],
                                                                                    );
                                                                                if (
                                                                                    !row
                                                                                ) {
                                                                                    row =
                                                                                        [
                                                                                            newD[3],
                                                                                            [],
                                                                                        ];
                                                                                    companyRailroadList.push(
                                                                                        row,
                                                                                    );
                                                                                } else if (
                                                                                    !row[1].includes(
                                                                                        newD[2],
                                                                                    )
                                                                                )
                                                                                    row[1].push(
                                                                                        newD[2],
                                                                                    );
                                                                            },
                                                                        );

                                                                        //console.log(companyRailroadList);
                                                                        document.getElementById(
                                                                            "setStation",
                                                                        ).onclick =
                                                                            setStation;
                                                                        companyList.sort();
                                                                        let compEle =
                                                                            document.getElementById(
                                                                                "company-select",
                                                                            );
                                                                        let i = 0;
                                                                        companyList.forEach(
                                                                            (
                                                                                comp,
                                                                            ) => {
                                                                                //console.log(comp);
                                                                                let opt =
                                                                                    document.createElement(
                                                                                        "option",
                                                                                    );
                                                                                opt.value =
                                                                                    i;
                                                                                opt.textContent =
                                                                                    comp;
                                                                                compEle.appendChild(
                                                                                    opt,
                                                                                );
                                                                                i++;
                                                                            },
                                                                        );
                                                                        updateWindowSize();
                                                                    },
                                                                );
                                                        });
                                                });
                                        });
                                });
                        });
                });
        });
};
