import * as ichihai from "/js/ichihai.js";

const canvas = document.getElementById("main");
const ctx = canvas.getContext("2d");

let latSta = 30;
let latEnd = 40;
let lonSta = 130;
let lonEnd = 140;
let zoom = 600 / (latEnd - latSta);

ctx.strokeStyle = "#000";

let map_data = null;
let station_data = null;
ichihai
    .getData("data/N03-20250101.geojson.gzip")
    .then((res) => res.text())
    .then((txt) => ichihai.gzipDecompress(txt))
    .then((res2) => {
        map_data = JSON.parse(res2);

        ichihai
            .getData("data/N02-24_Station.geojson.gzip")
            .then((res) => res.text())
            .then((txt) => ichihai.gzipDecompress(txt))
            .then((res2) => {
                station_data = JSON.parse(res2);
            });

        map_data.features.forEach((feature) => {
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
                    ctx.closePath();
                    ctx.stroke();
                });
            }
        });
    });
