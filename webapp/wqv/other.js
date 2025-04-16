function resizeCanvas() {
    //いらんかも
    canvas.width = window.innerWidth;
    canvas.height = (window.innerWidth * 10) / 16;
}

class Data {
    constructor() {
        this.Author = null;
        this.ID = null;
        this.ID2 = null;
        this.Time = null;
        this.UpdtTime = null;
        this.Hypo = null;
        this.Lat = null;
        this.Lon = null;
        this.Depth = null;
        this.MagType = null;
        this.Mag = null;
        this.MMI = null;
        this.alert = null;
        this.Source = null;
    }
}
