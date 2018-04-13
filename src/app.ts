import Display from './display';

let display: Display;

function main(){
    display = new Display(__CONFIG__.pins.sclPin, __CONFIG__.pins.sdaPin, function() {
        display.update();
    });

    setInterval(() => {
        display.drawTime();
    }, 1000);
}

E.on('init', main);
