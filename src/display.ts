import SSD1306 from './modules/SSD1306';
import StaticData, { StaticDataStruct } from './modules/StaticData';
import images from '../static-data/index';

export type Image = {
    width: number,
    height: number,
    bpp: number,
    transparent?: number,
    buffer: any
}

export default class Display {
    d: any;
    f: any;
    i: StaticData;

    constructor(SCLPin: Pin, SDAPin: Pin, cb: Function) {
        const i2c = new I2C();
        i2c.setup({ scl: SCLPin, sda: SDAPin, bitrate: 400000 });
        const self = this;
        const display = SSD1306.connect(i2c, function() {
            self.d = display;
            self.d.clear();
            self.d.flip();
            cb(display);
        });

        this.i = new StaticData(images);

        this.update = this.update.bind(this);
        this.image = this.image.bind(this);
    }

    update() {
        this.d.clear();
        this.drawWifi();
        this.drawTime();
        this.d.flip();
    }

    drawWifi() {
        const wifiImg = this.i.getImage('wifi');
        this.image(wifiImg, 0, 0, false);
    }

    drawTime() {
        var t = new Date();
        var time = t.getHours() + ":" + ("0" + t.getMinutes()).substr(-2) + ":" + ("0" + t.getSeconds()).substr(-2);
        var timeWidth = this.d.stringWidth(time);
        this.d.drawString(time, (this.d.getWidth() - timeWidth) / 2, 50);
    }

    image(image?: Image, x:number=0, y:number=0, flip=true) {
        if(!image) return;
        this.d.setColor(0);
        this.d.fillRect(x, y, x + image.width, y + image.height);
        this.d.setColor(1);
        this.d.drawImage(image, x, y);
        if(flip) { this.d.flip(); }
    }
}