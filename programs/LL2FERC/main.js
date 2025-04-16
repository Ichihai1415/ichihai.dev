import { codes } from "./codes.js";
import { nameList_ja } from "./namelist_ja.js";
import { nameList_enUS } from "./namelist_enUS.js";

export class LL2FERC {
    static getCode(lat, lon) {
        if (lat < -90 || lat > 90 || isNaN(lat)) {
            throw new RangeError(
                `The specified argument \"lat\" is not in the valid range of values. (${lat})`
            );
        }
        if (lon < -180 || lon > 180 || isNaN(lon)) {
            throw new RangeError(
                `The specified argument \"lon\" is not in the valid range of values. (${lon})`
            );
        }
        const latIndex = Math.floor(90 - lat);
        const lonIndex = Math.floor(180 + lon);
        return codes[latIndex][lonIndex];
    }

    static getName_ja(code) {
        if (code < 1 || code > 757) {
            throw new RangeError(
                `The specified argument \"code\" is not in the valid range of values. (${code})`
            );
        }
        return nameList_ja[code];
    }

    static getName_ja_fromLatLon(lat, lon) {
        return nameList_ja[this.getCode(lat, lon)];
    }

    static getName_enUS(code) {
        if (code < 1 || code > 757) {
            throw new RangeError(
                `The specified argument \"code\" is not in the valid range of values. (${code})`
            );
        }
        return nameList_enUS[code];
    }

    static getName_enUS_fromLatLon(lat, lon) {
        return nameList_enUS[this.getCode(lat, lon)];
    }
}

export class FromFile {
    constructor(path = "LL2FERC.FromFile.csv") {
        const fs = require("fs");
        if (!fs.existsSync(path)) {
            throw new Error(`Place name data file not found at ${path}`);
        }

        this.nameList_File = {};
        const fileTexts = fs.readFileSync(path, "utf-8").split("\n");

        for (let i = 1; i <= 757; i++) {
            const parts = fileTexts[i].split(",");
            this.nameList_File[parseInt(parts[0], 10)] = parts[1];
        }
    }

    getName_File(code) {
        if (code < 1 || code > 757) {
            throw new RangeError(
                `The specified argument \"code\" is not in the valid range of values. (${code})`
            );
        }
        return this.nameList_File[code];
    }

    getName_File_fromLatLon(lat, lon) {
        const code = LL2FERC.getCode(lat, lon);
        return this.nameList_File[code];
    }
}
