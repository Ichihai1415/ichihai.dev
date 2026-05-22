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

//https://qiita.com/matsuda_tkm/items/4eba5632535ca2f699b4 の移植(C#:https://github.com/Ichihai1415/PSCircleTest/blob/main/PSCircleTest/CalDist.cs)の移植

//世界測地系(GRS80)
const A = 6378137.0;
const F = 1 / 298.257222101;
const B = A * (1 - F);

// 日本測地系(Bessel)
// private const double A = 6377397.155;
// private const double F = 1 / 299.152813;
// private const double B = A * (1 - F);

// Google Maps
// private const double A = 6371008;
// private const double B = A;
// private const double F = (A - B) / A;

export function getDist(p1_lat, p1_lon, p2_lat, p2_lon) {
    // 緯度経度をラジアンに変換
    let lat1 = ToRadians(p1_lat);
    let lon1 = ToRadians(p1_lon);
    let lat2 = ToRadians(p2_lat);
    let lon2 = ToRadians(p2_lon);

    // 化成緯度に変換
    let phi1 = Math.atan2(B * Math.tan(lat1), A);
    let phi2 = Math.atan2(B * Math.tan(lat2), A);

    // 球面上の距離
    let X = Math.acos(
        Math.sin(phi1) * Math.sin(phi2) +
            Math.cos(phi1) * Math.cos(phi2) * Math.cos(lon2 - lon1),
    );

    // Lambert-Andoyer補正
    let drho =
        (F / 8) *
        (((Math.sin(X) - X) * Math.pow(Math.sin(phi1) + Math.sin(phi2), 2)) /
            Math.pow(Math.cos(X / 2), 2) -
            ((Math.sin(X) + X) * Math.pow(Math.sin(phi1) - Math.sin(phi2), 2)) /
                Math.pow(Math.sin(X / 2), 2));

    // 距離
    let rho = A * (X + drho);

    return rho;
}

function ToRadians(degrees) {
    return degrees * (Math.PI / 180);
}
