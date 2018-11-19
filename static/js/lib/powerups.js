import {game} from "./game.js";
import {graphics} from "./assets.js";

class Powerups{
    constructor() {
        this.healthRenew = [];
        this.healthRenew[0] = {
            x: game.cWidth,
            y: Math.floor(Math.random() * ( (game.maxHeight - graphics.healthImage) - game.minHeight) + game.minHeight)
        }
        this.shieldRenew = [];
        this.shieldRenew[0] = {
            x: game.cWidth,
            y: Math.floor(Math.random() * ( (game.maxHeight - graphics.shieldImage) - game.minHeight) + game.minHeight)
        }
        this.timeRenew = [];
        this.timeRenew[0] = {
            x: game.cWidth,
            y: Math.floor(Math.random() * ( (game.maxHeight - graphics.timerImage) - game.minHeight) + game.minHeight)
        }

        // If initial ones were pushed
        this.initialHealthPushed = false;
        this.initialShieldPushed = false;
        this.initialTimeRenewPushed = false;
    }

    // Spawn health restoration every 30 seconds
    healthRenewFunction() {
        if(this.initialHealthPushed) {
            setTimeout(() => {
                // console.log("pushed");
                this.healthRenew.push({
                    x: game.cWidth,
                    y: Math.floor(Math.random() * (game.maxHeight - graphics.healthImage.height) - game.minHeight) + game.minHeight
                })
                this.healthRenewFunction();
            }, 10 * 1000);
        } else {
            setTimeout(() => {
                console.log("not yet pushed", this);
                this.healthRenewFunction();
            }, 10 * 1000);
        }
    }

    // Spawn shield restoration every 60 seconds
    shieldRenewFunction() {
        if(this.initialShieldPushed) {
            setTimeout(() => {
                this.shieldRenew.push({
                    x: game.cWidth,
                    y:Math.floor(Math.random() * (game.maxHeight - graphics.shieldImage.height) - game.minHeight) + game.minHeight
                })
                this.shieldRenewFunction();
            }, 15 * 1000);
        } else {
            setTimeout(() => {
                this.shieldRenewFunction();
            }, 15 * 1000);
        }
    }

    // Spawn a timer to add more playing time every 10 to 15 seconds
    timeRenewFunction() {
        // console.log("test");
        // let min = 10;
        // let max = 15;
        // min = Math.ceil(min);
        // max = Math.floor(max);
        // let randomTime = Math.floor(Math.random() * (max - min + 1)) + min;
        if(this.initialTimeRenewPushed) {
            setTimeout(() => {
                this.timeRenew.push({
                    x: game.cWidth,
                    y: Math.floor(Math.random() * (game.maxHeight - graphics.timerImage.height) - game.minHeight) + game.minHeight
                })
                this.timeRenewFunction();
            }, 10 * 1000);
        } else {
            setTimeout(() => {
                this.timeRenewFunction();
            }, 20 * 1000);
        }
    }

}
export const powerups = new Powerups(); 


// POWERUPS CLASS (OBJECT):
powerups.healthRenewFunction();
powerups.shieldRenewFunction();
powerups.timeRenewFunction();