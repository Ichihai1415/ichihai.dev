import { LL2FERC } from "../../programs/LL2FERC/main.js";

function getRawData(url) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("GET", url, true);
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    resolve(xhr.responseText);
                } else {
                    reject(
                        new Error(`Request failed with status: ${xhr.status}`)
                    );
                }
            }
        };
        xhr.send();
    });
}

window.getU = () => {
    const url =
        "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_week.geojson";
    getRawData(url)
        .then((data) => {
            const json = JSON.parse(data);
            console.log(json);
            let newTable =
                "<tr><th>発生日時</th><th>震央</th><th>マグニチュード</th><th>深さ</th></tr>";
            json.features.forEach((element) => {
                //console.log(element);
                const time = new Date(element.properties.time).toLocaleString();
                const hypoName = element.properties.place;
                const magnitude = element.properties.mag;
                const depth = element.geometry.coordinates[2];
                newTable += `<tr><td>${time}</td><td>${hypoName}</td><td>${magnitude}</td><td>${depth}km</td></tr>`;
            });
            document.getElementById("infoT").innerHTML = newTable;
        })
        .catch((error) => {
            console.error("Error fetching data:", error);
        });
};

window.getG = () => {
    const url =
        "https://geofon.gfz-potsdam.de/fdsnws/event/1/query?format=text&minmag=4.5&limit=10&end=2100-01-01";
    getRawData(url)
        .then((data) => {
            let newTable =
                "<tr><th>発生日時</th><th>震央</th><th>マグニチュード</th><th>深さ</th></tr>";

            const lines = data.split("\n");
            lines.forEach((element) => {
                const data = element.split("|");
                if (data.length == 0) return;
                if (data[0] == "#EventID") return;

                //#EventID|Time|Latitude|Longitude|Depth/km|Author|Catalog|Contributor|ContributorID|MagType|Magnitude|MagAuthor|EventLocationName|EventType
                const time = data[1];
                const hypoName = data[13];
                const magnitude = data[10];
                const depth = data[4];
                newTable += `<tr><td>${time}</td><td>${hypoName}</td><td>${magnitude}</td><td>${depth}km</td></tr>`;
            });
            document.getElementById("infoT").innerHTML = newTable;
        })
        .catch((error) => {
            console.error("Error fetching data:", error);
        });
};

window.getCode = (lat, lon) => {
    console.log(LL2FERC.getCode(lat, lon));
};

window.getName_ja = (lat, lon) => {
    console.log(LL2FERC.getName_ja_fromLatLon(lat, lon));
};

window.getName_enUS = (lat, lon) => {
    console.log(LL2FERC.getName_enUS_fromLatLon(lat, lon));
};

