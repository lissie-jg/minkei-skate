const skater = document.getElementById("minkei");
const stage = document.getElementById("game-stage");
const scoreDisplay = document.getElementById("score-card");
const startScreen = document.getElementById("start-screen");

let score = 0;
let isJumping = false;
let isGameOver = false;
let gameStarted = false;
let gameSpeed = 8;
let gravity = 0.9; 
let velocity = 0;
let position = 0;
let bgPosition = 0;
let lastSpawnType = null;
let canSpawn = true;

function startGame() {
    gameStarted = true;
    startScreen.style.display = "none";
    
    skater.style.width = "100px";
    skater.style.height = "auto";
    
    const music = document.querySelector("audio");
    if (music) music.play();

    setInterval(gameLoop, 20);
    spawnObstacle();
}

function jump() {
    if (isJumping || isGameOver || !gameStarted) return;
    isJumping = true;
    velocity = 16; 
    skater.classList.add("jumping");
}

function gameLoop() {
    if (isGameOver) return;

    bgPosition -= (gameSpeed - 2); 
    stage.style.backgroundPosition = bgPosition + "px 0px";

    if (isJumping) {
        position += velocity;
        velocity -= gravity;

        if (position <= 0) {
            position = 0;
            isJumping = false;
            velocity = 0;
            skater.classList.remove("jumping");
        }
        skater.style.bottom = position + "px";
    }
}

function spawnObstacle() {
    if (isGameOver || !canSpawn) return;

    canSpawn = false; 
    const obstacle = document.createElement("div");
    obstacle.classList.add("obstacle");
    obstacle.style.fontSize = "55px"; 
    obstacle.style.position = "absolute";
    
    // FIX: Hide it initially so it doesn't flicker on the left
    obstacle.style.visibility = "hidden"; 
    
    let isTop;
    if (lastSpawnType === "top") {
        isTop = false; 
    } else {
        isTop = Math.random() > 0.7; 
    }
    
    lastSpawnType = isTop ? "top" : "ground";

    if (isTop) {
        obstacle.innerText = "🚁"; 
        obstacle.style.bottom = "140px"; 
    } else {
        const types = ["🚧", "🛑", "📸", "📦"];
        obstacle.innerText = types[Math.floor(Math.random() * types.length)];
        obstacle.style.bottom = "0px";
    }
    
    stage.appendChild(obstacle);
    
    // Position it way off-screen FIRST
    let obstacleLeft = stage.offsetWidth + 150;
    obstacle.style.left = obstacleLeft + "px";
    
    // NOW make it visible once it's in its starting place
    obstacle.style.visibility = "visible";

    let moveObstacle = setInterval(() => {
        if (isGameOver) {
            clearInterval(moveObstacle);
            return;
        }

        obstacleLeft -= gameSpeed;
        obstacle.style.left = obstacleLeft + "px";

        const skaterBottom = position;
        const skaterTop = position + 65; 

        // HITBOX: Widened slightly to 40px wide for fairness
        if (obstacleLeft > 60 && obstacleLeft < 100) {
            if (isTop) {
                if (skaterTop > 135) endGame();
            } else {
                if (skaterBottom < 45) endGame();
            }
        }

        if (obstacleLeft < -150) {
            clearInterval(moveObstacle);
            obstacle.remove();
            score++;
            scoreDisplay.innerText = "SCORE: " + score;

            if (score % 5 === 0) {
                gameSpeed += 0.3; 
                if (gameSpeed > 13) gameSpeed = 13;
            }
        }
    }, 20);

    let nextSpawnDelay = (Math.random() * 800 + 2000); 
    setTimeout(() => {
        canSpawn = true;
        spawnObstacle();
    }, nextSpawnDelay);
}

function endGame() {
    isGameOver = true;
    alert("WIPEOUT! Final Score: " + score);
    location.reload();
}

window.addEventListener("keydown", (e) => {
    if (e.code === "Space") jump();
});

window.addEventListener("touchstart", (e) => {
    if (gameStarted) e.preventDefault(); 
    jump();
}, { passive: false });

document.getElementById("start-button").addEventListener("click", startGame);