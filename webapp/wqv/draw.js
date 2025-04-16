function drawData(/*data*/) {
    let data = new Data();
    data.Lat = 90;
    data.Lon = 180;
    data.Depth = 10;

    //console.log("data:");
    //console.log(data);

    let canvas = document.getElementById("img");
    let ctx = canvas.getContext("2d");
    const zoom = 10;
    let img = new Image();
    img.src = "map.png";
    img.onload = function () {
        const locX =
            data.Lon > 0 ? (data.Lon + 90) * zoom : (data.Lon + 450) * zoom; //地図画像での経度の位置
        const locY = (90 - data.Lat) * zoom; //地図画像での緯度の位置
        const locX_image = 400 - locX;
        let locY_image = 600 - locY;
        locY_image = Math.min(200, Math.max(-180 * zoom + 1000, locY_image));
        //console.log("locX:" + locX);
        //console.log("locY:" + locY);
        //console.log("locX_image:" + locX_image);
        //console.log("locY_image:" + locY_image);
        ctx.drawImage(img, locX_image, locY_image, img.width, img.height);
        const hypoSizeHalf = 40;
        const locX_hypo = 400;
        const locY_hypo = locY + locY_image;
        ctx.beginPath();
        ctx.moveTo(locX_hypo - hypoSizeHalf * 0.75, locY_hypo - hypoSizeHalf);
        ctx.lineTo(locX_hypo - hypoSizeHalf, locY_hypo - hypoSizeHalf * 0.75);
        ctx.lineTo(locX_hypo - hypoSizeHalf * 0.25, locY_hypo);
        ctx.lineTo(locX_hypo - hypoSizeHalf, locY_hypo + hypoSizeHalf * 0.75);
        ctx.lineTo(locX_hypo - hypoSizeHalf * 0.75, locY_hypo + hypoSizeHalf);
        ctx.lineTo(locX_hypo, locY_hypo + hypoSizeHalf * 0.25);
        ctx.lineTo(locX_hypo + hypoSizeHalf * 0.75, locY_hypo + hypoSizeHalf);
        ctx.lineTo(locX_hypo + hypoSizeHalf, locY_hypo + hypoSizeHalf * 0.75);
        ctx.lineTo(locX_hypo + hypoSizeHalf * 0.25, locY_hypo);
        ctx.lineTo(locX_hypo + hypoSizeHalf, locY_hypo - hypoSizeHalf * 0.75);
        ctx.lineTo(locX_hypo + hypoSizeHalf * 0.75, locY_hypo - hypoSizeHalf);
        ctx.lineTo(locX_hypo, locY_hypo - hypoSizeHalf * 0.25);
        ctx.lineTo(locX_hypo - hypoSizeHalf * 0.75, locY_hypo - hypoSizeHalf);

        ctx.strokeStyle = "#FFFF00";
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.closePath();

        ctx.fillStyle = "#00001E";
        ctx.fillRect(0, 0, 800, 200);
        ctx.fillRect(800, 0, 800, 1000);
        ctx.fillStyle = "#1E1E3C";
        ctx.fillRect(4, 40, 792, 156);
        //ctx.fillRect(0, 200, 800, 800);
        ctx.fillStyle = "#2D2D5A";
        for (var i = 0; i < 6; i++) {
            ctx.fillRect(804, 40 + 160 * i, 792, 156);
        }
        ctx.beginPath();
        ctx.moveTo(800, 0);
        ctx.lineTo(800, 1000);
        ctx.moveTo(0, 200);
        ctx.lineTo(800, 200);

        ctx.strokeStyle = "#FFF6";
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.closePath();

        ctx.fillStyle = "#0006";
        ctx.fillRect(504, 958, 296, 42);
        ctx.fillStyle = "#FFF";
        ctx.font = "24px Noto Sans JP";
        ctx.fillText("地図データ:Natural Earth", 512, 990);
    };
}
