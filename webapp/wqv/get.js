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

function getU() {
    const url =
        "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_week.geojson";
    getRawData(url)
        .then((data) => {
            console.log(data);
        })
        .catch((error) => {
            console.error("Error fetching data:", error);
        });
}

function getG() {
    const url =
        "https://geofon.gfz-potsdam.de/fdsnws/event/1/query?format=text&minmag=4.5&limit=10&end=2100-01-01";
    getRawData(url)
        .then((data) => {
            console.log(data);
        })
        .catch((error) => {
            console.error("Error fetching data:", error);
        });
}
