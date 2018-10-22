// Globals
let d;
let game;
let score = 0;
let shipHP = 100;
let overheat = 0;
let meteorSpawnDistance = 1200;
let meteorsSpeed = 1;
const displayShipHP = document.querySelector(".ship-hpFill");
const notificationText = document.querySelector(".notification");
const menu = document.querySelector(".menu");
const displayScore = document.querySelector("#score");
const displayImage = document.querySelector("#displayImage");
const message = document.querySelector("#message");
const pauseMenu = document.querySelector(".pause--menu");

// Flag variables
let isSpaceDown = false;
let gameStarted = false;
let isOverheated = false;
let enemiesSpawned = false;
let displayTimer = false;
let speedBooster = false;

// Canvas
const canvas = document.querySelector("#canvas");
const ctx = canvas.getContext("2d");
const cWidth = canvas.width;
const cHeight = canvas.height;
let minHeight = 0;
let maxHeight = 500;

// Assets
const bg = new Image();
const ship = new Image();
const enemy = new Image();
const missile = new Image();
const explosion = new Image();
const firstAid = new Image();
const alienMissile = new Image();
const missileSound = new Audio();
const alienMissileSound = new Audio();
const explosionSound = new Audio();

ship.src = "images/spaceship.png";
bg.src = "images/bg2.jpg";
enemy.src = "images/enemySpaceship.png";
missile.src = "images/testRocket.png";
explosion.src = `images/explosion/2.png`;
firstAid.src = "images/firstAid.png";
alienMissile.src = "images/testEnemyRocket.png";
missileSound.src = "Audio/weapon_player.wav";
missileSound.volume = 0.1;
explosionSound.src = "Audio/explosion_asteroid.wav";
explosionSound.volume = 0.1;
alienMissileSound.src = "Audio/weapon_enemy.wav";
alienMissileSound.volume = 0.1;

// Spaceship starting coordinates
let shipX = 50;
let shipY = 250;
let hitBoundary = false;
let playerSpeed = 5;

// Alien spaceship coordinates
let alienX = cWidth - 200;
let alienY = 250;

// Player ammo
let ammo = [];

// Enemies
let enemies = [];
enemies[0] = {
    x: cWidth,
    y: Math.floor(Math.random() * ( (maxHeight-enemy.height) - minHeight) + minHeight)
}

// Health renew
let healthRenew = [];
healthRenew[0] = {
    x: cWidth,
    y: Math.floor(Math.random() * ( (maxHeight - firstAid.height) - minHeight) + minHeight)
}
let initialHealthPushed = false;

// Aliens (enemies) / Boss ammo
let alienAmmo = [];

// Timer variables
let countdown;
const timerDisplay = document.querySelector("#timerDisplay");
const time = 30;

// Start game
function startGame(){
    const mainMenu = document.querySelector(".main-menu");
    mainMenu.classList.add("mainMenuFade")

    setTimeout(() => {
        mainMenu.style.display = "none";
        
        // Display the MENU/SCORE panel
        menu.style.display = "flex";
        setTimeout(() => {
            menu.classList.add("menuActive");
        }, 5000);

        // Show the info box
        const infobox = document.querySelector(".infobox");
        infobox.style.display = "flex";
        setTimeout(() => {
            infobox.classList.add("infoBoxActive");

            // After 5 seconds make the infobox fade away. (remove the active class).
            setTimeout(() => {
                infobox.classList.remove('infoBoxActive')

                // Activate enemies and ship movement.
                gameStarted = true;

                // Enemies shoot every 2 seconds
                enemiesSpawned = true;

                // Display timer
                displayTimer = true;
                
                // Start the timer countdown untill boss spawns
                timer(time);
            }, 5000);
        }, 1000);

        const controlsInfo = document.querySelector(".controlsInfo");
        setTimeout(() => {
            controlsInfo.style.display = "block";

            // Hide the controls info
            setTimeout(() => {
                controlsInfo.classList.add("controlsInfoActive");
            }, 2000);
        }, 8000);

        game = setInterval(draw, 1000/60);
    }, 2500);
}

// Move the spaceship
function shipCommands(e){
    let key = e.keyCode;
    console.log(key);
    // If game has started, enable ship movement.
    if(gameStarted) { 
        if(key == 37) {
            d = "LEFT"
        } else if (key == 38) {
            d = "UP"
        } else if (key == 39) {
            d = "RIGHT"
        } else if (key == 40) {
            d = "DOWN"
        }

        // Player spaceship speed boost
        if(key == 16 && d == "LEFT" || key == 16 && d == "RIGHT") {
            playerSpeed = 15;
        }
    }
}

// Clear spaceship's commands when key is released
function clearShipCommands() {
    playerSpeed = 5;
}

// Player shoots
function shoot(e){
    let key = e.keyCode;
    if(gameStarted && isOverheated == false) { 
        if(key == 32) {
            isSpaceDown = true;
            // Display the rocket WHEN the user shoots.
            ammo[0] = {
                x:shipX + ship.width,
                y: shipY + (ship.height / 2)
            }
            ammo.push({
                x: shipX + ship.width,
                y: shipY + (ship.height / 2)
            })
            missileSound.play();
            missileSound.currentTime = 0;
            overheated();
        } else {
            isSpaceDown = false;
        }
    }
}

// Overheat the spaceship's guns.
const overheatFill = document.querySelector(".gunOverheat-fill");
function overheated(){
    overheat = overheat + 5;
    overheatFill.style.width = `${overheat}%`;
    // If overheat meter reaches max(100), stop the ship from shooting, when it starts cooling off enable shooting.
    if(overheat == 100) {
        isOverheated = true;
        coolOut();
    } else if (overheat < 100 && overheat > 0) {
        isOverheated = false;
    }
}

// Gradually cool out the gun BEFORE it reaches overheating point
function graduallyCoolOut(){
    if(overheat <= 95 && overheat > 5) {
        overheat = overheat - 5;
        overheatFill.style.width = `${overheat}%`;
    }
}
setInterval(graduallyCoolOut, 800)

// When gun overheats, wait 1 second, then cool it out and enable shooting.
function coolOut(){
    setTimeout(() => {
        overheat = 0;
        isOverheated = false;
        overheatFill.style.width = `${overheat}%`;
    }, 1000);
}

// The game
function draw(){
    canvas.style.display = "block";
    ctx.drawImage(bg, 0,0);
    
    // Check if the game started
    if(gameStarted) {
        for(let i = 0; i < enemies.length;i++){
            // Draw a enemy
            ctx.drawImage(enemy, enemies[i].x, enemies[i].y);

            enemies[i].x -= meteorsSpeed;

            if(enemies[i].x == meteorSpawnDistance) {
                enemies.push({
                    x: cWidth,
                    y: Math.floor(Math.random() * ( (maxHeight-enemy.height) - minHeight) + minHeight) 
                })
            }
            // If spaceship and enemy colide
            if(shipX + ship.width >= enemies[i].x && shipX <= enemies[i].x + enemy.width && shipY + ship.height >= enemies[i].y && shipY <= enemies[i].y + enemy.height) {
                alert("HIT THE ENEMY")
                // Draw explosion at those coords.
                ctx.drawImage(explosion, enemies[i].x - enemy.width, enemies[i].y - enemy.height);
                
                // Delete the enemy from screen.
                destroyEnemy();

                // Deduct HP on hit.
                decreaseShipHP();

                // If spaceship HP reaches 0, end game.
                if(shipHP == 0) {
                    clearInterval(game);
                    endgame();
                }
            }
        }
        // Create a new enemy if all enemies on screen are destroyed.
        if(enemies.length == 0) {
            enemies.push({
                x: cWidth,
                y: Math.floor(Math.random() * ( (maxHeight-enemy.height) - minHeight) + minHeight) 
            })
        }
    }

    // PLAYERS ROCKETS
    if(gameStarted){
        for(let j = 0; j < ammo.length; j++) {
            ctx.drawImage(missile, ammo[j].x, ammo[j].y);
            ammo[j].x += 15;

            // Ammo colides enemy
            for(let i = 0; i < enemies.length; i++) {
                if(ammo[j].x >= enemies[i].x && ammo[j].x <= enemies[i].x + enemy.width && ammo[j].y >= enemies[i].y && ammo[j].y <= enemies[i].y + enemy.height){
                    // Draw explosion of the enemy.
                    ctx.drawImage(explosion, enemies[i].x - enemy.width, enemies[i].y - enemy.height);

                    // Delete enemy from screen and add points.
                    destroyEnemy();
                }
            }

            // If player's ammo goes past canvas width
            if(ammo[j].x > cWidth){
                let missile = ammo[j];
                let missileIndex = ammo.indexOf(missile);
                if(missileIndex > -1) {
                    ammo.splice(missileIndex, 1);
                }
            }
        }
    }

    // Display health renew with a timeout
    for(let i = 0; i < healthRenew.length; i++){
        ctx.drawImage(firstAid, healthRenew[i].x, healthRenew[i].y);

        // If the ship touches the health, restore the ship's HP.
        if(shipX + ship.width >= healthRenew[i].x && shipX <= healthRenew[i].x + firstAid.width && shipY + ship.height >= healthRenew[i].y && shipY <= healthRenew[i].y + firstAid.height) {
            // Remove the HP restore.
            let hpItem = healthRenew[i];
            let hpIndex = healthRenew.indexOf(hpItem);
            if(hpIndex > -1) {
                healthRenew.splice(hpIndex, 1)
            }

            // Restore ship's HP.
            restoreShipHP();
        }
        // If HP restore goes past the canvas width, remove it.
        if(healthRenew[i].x + firstAid.width < 0 ) {
            healthRenew.splice(healthRenew[i], 1);
        }
    }
    // Start moving the HP renew after a set timeout.
    setTimeout(() => {
        for(let i = 0; i < healthRenew.length; i++) {
            healthRenew[i].x--;
        }
        initialHealthPushed = true;
    }, 30 * 1000);

    // Move the ship
    if(d == "LEFT") {
        shipX -= playerSpeed;
    }
    if(d == "RIGHT"){
        shipX += playerSpeed;
    }
    if(d == "UP") {
        shipY -= playerSpeed;
    }
    if(d == "DOWN") {
        shipY += playerSpeed;
    }

    // ALIEN (ENEMY) ROCKETS
    if(gameStarted && enemiesSpawned){
        for(let i = 0; i < alienAmmo.length;i++) {
            ctx.drawImage(alienMissile, alienAmmo[i].x, alienAmmo[i].y);
            alienAmmo[i].x -= 15;
        
            if(alienAmmo[i].x >= shipX && alienAmmo[i].x <= shipX + ship.width && alienAmmo[i].y >= shipY && alienAmmo[i].y <= shipY + ship.height && enemiesSpawned == true ) {
                // Draw explosion at the spot
                ctx.drawImage(explosion, shipX, shipY);
        
                // Run function when player's ship is hit.
                playerHit();
            }

            // If the alien rocket goes behind player's ship
            if(alienAmmo[i].x < 0) {
                let alienRocket = alienAmmo[i];
                let alienRocketIndex = alienAmmo.indexOf(alienRocket);
                if(alienRocketIndex > -1) {
                    alienAmmo.splice(alienRocketIndex, 1)
                }
            }
        }
    }

    // If spaceship hits the boundry, remove the direction
    if(shipX <= 0) {
        shipX += 5;
    } else if (shipX >= 1300 - ship.width) {
        shipX -= 5;
    } else if (shipY <= 0) {
        shipY += 5;
    } else if (shipY >= 500 - ship.height) {
        shipY -= 5;
    }

    // Draw the ship
    ctx.drawImage(ship, shipX, shipY);
}

// Timer
function timer(seconds) {
    clearInterval(countdown);

    const now = Date.now();
    const then = now + seconds * 1000;
    displayTimeLeft(seconds);

    countdown = setInterval(() =>{
        const secondsLeft = Math.round((then - Date.now()) / 1000);
        // Show a warning for few seconds left
        if(secondsLeft === 10) {
            displayNotification(secondsLeft);
        }
        if(secondsLeft < 0) {
            // If the timer ran out, end the game
            clearInterval(countdown);
            clearInterval(game);
            return;
        }
        displayTimeLeft(secondsLeft);
    }, 1000)
}

function displayTimeLeft(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainder = seconds % 60;
    timerDisplay.textContent = `${minutes}:${remainder < 10 ? 0 : ""}${remainder}`;
}

// Enemies 
function enemiesShoot(){
    // If the enemies are spawned
    if(enemiesSpawned) {
        let minShip = 0;
        let maxShip = enemies.length;
        minShip = Math.ceil(minShip);
        maxShip = Math.floor(maxShip);
        let randomShip = Math.floor(Math.random() * (maxShip - minShip + 1)) + minShip;
        // Randomize
        alienAmmo.push({
            x: enemies[randomShip].x - enemy.width,
            y: enemies[randomShip].y + (enemy.height / 2)
        })
        alienMissileSound.currentTime = 0;
        alienMissileSound.play();
        }
}

const enemiesShootingInterval = setInterval(enemiesShoot, 400);

// When player's ship is hit by aliens missiles
function playerHit(){
    // Destroy the alien ammo upon hit
    for(let i = 0; i < alienAmmo.length; i++) {
        let alienRockets = alienAmmo[i];
        let alienIndex = alienAmmo.indexOf(alienRockets);
        if(alienIndex > -1) {
            alienAmmo.splice(alienIndex, 1);
        } 
    }

    // Decrease ship HP
    decreaseShipHP();
    if(shipHP == 0) {
        clearInterval(game);
        clearInterval(alienShootingInterval);
        endgame();
    }
}

// Update the score and deal with difficulty
function updateScore() {
    // Update score
    score += 100;
    displayScore.textContent = score;
    
    // Increase difficulty when user reaches a certain score point.
    if(score == 3000) {
        meteorsSpeed = 2;
        displayNotification();
    }
    if (score == 6000) {
        meteorsSpeed = 4;
        meteorSpawnDistance = 1000;
        displayNotification();
    }
}

// Display notifications
function displayNotification(secondsLeft){
    notificationText.classList.add("activeNotification");
    if(score == 3000) {
        notificationText.innerHTML = `<i class="material-icons">warning</i> <p>Another Disturbance!</p>`
    } else if (score == 6000) {
        notificationText.innerHTML= `<i class="material-icons">warning</i> <p>Another Disturbance!</p>`
    } else if (score == 10000) {
        notificationText.innerHTML = `<i class="material-icons">warning</i> <p>Watch out for the alien spaceship!!</p>`
    }

    // If there are 10 seconds left, show a warning
    if(secondsLeft === 10) {
        notificationText.innerHTML = `<i class="material-icons">warning</i><p>Few seconds left!</p>`
    }

    // Remove the class after 4 seconds
    setTimeout(() => {
        notificationText.classList.remove('activeNotification');
    }, 4000);
}

// Destroy meteor / alien ship on impact.
function destroyEnemy(){
    for(let j = 0; j < ammo.length; j++){
        for(let i = 0; i < enemies.length; i++) {
            // Ammo hits enemy
            let ammoDestroysMeteor = ammo[j].x >= enemies[i].x && ammo[j].x <= enemies[i].x + enemy.width && ammo[j].y >= enemies[i].y && ammo[j].y <= enemies[i].y + enemy.height;

            // Ship hits enemy
            let shipDestroysMeteor = shipX + ship.width >= enemies[i].x && shipX <= enemies[i].x + enemy.width && shipY + ship.height >= enemies[i].y && shipY <= enemies[i].y + enemy.height;

            // // Destory missile if ammo destoys enemy
            if(ammoDestroysMeteor) {
                let missile = ammo[j];
                let missileIndex = ammo.indexOf(missile);
                if(missileIndex > -1) {
                    ammo.splice(missileIndex, 1);
                }
            }

            // Either the ammo destorys the enemy, or the ship.
            if(ammoDestroysMeteor || shipDestroysMeteor) {
                let item = enemies[i];
                let index = enemies.indexOf(item);
                if(index > -1) {
                    enemies.splice(index, 1);
                }
            }
            explosionSound.play();
            explosionSound.currentTime = 0;
        }
    }
    updateScore();
}

// SHIP AND EARTH HEALTH:
function decreaseShipHP()   {
    shipHP = shipHP - 20;
    displayShipHP.style.width = `${shipHP}%`;
}

function restoreShipHP() {
    if(shipHP == 100) {
        shipHP = shipHP;
    } else {
        shipHP = shipHP + 20;
        displayShipHP.style.width = `${shipHP}%`;
        notificationText.innerHTML = `<i class="material-icons">local_hospital</i><p>Health renewed!</p>`;
        displayNotification();
    }
}

// When the game has ended / been completed.
function endgame(){
    // Disable intervals
    clearInterval(enemiesShootingInterval);
    clearInterval(alienShootingInterval);

    // Stop movements
    gameStarted = false;

    // Game Over / Game finished menu
    const gameOver = document.querySelector(".game--over");
    gameOver.style.display = "block";

    // If player was killed.
    if(shipHP === 0){
        displayImage.src = "images/gravestone.svg";
        message.textContent = "Thank you for your service. At least you tried.";
    }

    // Score and Highscore
    document.querySelector("#finalScore").textContent = score;
    let highscore = localStorage.getItem("highscore");
    document.querySelector("#highscore").textContent = highscore;
    if(score > highscore) {
        localStorage.setItem("highscore", score);
        document.querySelector("#highscore").textContent = localStorage.getItem("highscore");
    }
}

// Callback function to spawn health renew every 30 seconds.
function healthRenewFunction() {
    if(initialHealthPushed == true) {
        setTimeout(() => {
            healthRenew.push({
                x: cWidth,
                y: Math.floor(Math.random() * ( (maxHeight - firstAid.height) - minHeight) + minHeight)
            })
        
            healthRenewFunction();
        }, 30 * 1000);
    } else {
        setTimeout(() => {
            healthRenewFunction();
        }, 30 * 1000);
    }
}
healthRenewFunction();

// Pause game
function displayPauseMenu(){
    // Display the menu
    pauseMenu.style.display = "flex";

    // Clear the interval for the game
    clearInterval(game);

    // Stop enemies and ship from moving
    gameStarted = false;
}

// Continue game
function continueGame(){
    // Hide the menu
    pauseMenu.style.display = "none";

    // Run the interval
    game = setInterval(draw, 1000 / 60);

    // Enable enemies and ship movement
    gameStarted = true;
}

// Exit game
document.querySelectorAll(".exitGame").forEach(exit => exit.addEventListener("click", ()=>{
    location.reload();
}))

// Event listeners
document.addEventListener("keydown", shipCommands);
document.addEventListener("keyup", clearShipCommands);
document.querySelector("#startGame").addEventListener("click", startGame);
document.addEventListener("keyup", shoot);
document.querySelector("#openMenu").addEventListener("click", displayPauseMenu);
document.querySelector("#continueGame").addEventListener("click", continueGame);


