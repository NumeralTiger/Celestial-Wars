(function () {

    const backgrounds = [
        { name: "Deep Space", url: "ImagesAndGifs/Gravity Falls Journal.gif" },
        { name: "Nebula", url: "ImagesAndGifs/nebula.jpeg" },
        { name: "Alien Planet", url: "ImagesAndGifs/alien planet.webp" }
    ];

    const bgSelectionOverlay = document.getElementById('bg-selection-overlay');
    const btnDeepSpace = document.getElementById('bg-deep-space');
    const btnNebula = document.getElementById('bg-nebula');
    const btnAlien = document.getElementById('bg-alien');
    const btnRandom = document.getElementById('bg-random');
    const gameContainer = document.getElementById('game-container');

    function setBackground(bgObj) {
        gameContainer.style.backgroundImage = `url('${bgObj.url}')`;
    }

    // Pick a random background
    function setRandomBackground() {
        const randomIndex = Math.floor(Math.random() * backgrounds.length);
        setBackground(backgrounds[randomIndex]);
    }
    function closeBgOverlay() {
        bgSelectionOverlay.style.display = 'none';
    }

    // Event listeners for selection
    btnDeepSpace.addEventListener('click', () => {
        setBackground(backgrounds[0]);
        closeBgOverlay();
    });
    btnNebula.addEventListener('click', () => {
        setBackground(backgrounds[1]);
        closeBgOverlay();
    });
    btnAlien.addEventListener('click', () => {
        setBackground(backgrounds[2]);
        closeBgOverlay();
    });
    btnRandom.addEventListener('click', () => {
        setRandomBackground();
        closeBgOverlay();
    });


    let highScores = JSON.parse(localStorage.getItem('highScores')) || [];
    const MAX_SCORES = 5;

    const leaderboardOverlay = document.getElementById('leaderboard-overlay');
    const leaderboardList = document.getElementById('leaderboard-list');
    const closeLeaderboardButton = document.getElementById('close-leaderboard-button');
    const resetScoresButton = document.getElementById('reset-scores-button');

    function checkAndUpdateHighScores() {
        if (highScores.length < MAX_SCORES || score > highScores[highScores.length - 1].score) {
            const playerName = prompt("You got a high score! Enter your name or initials:");
            const newScore = {
                name: playerName && playerName.trim() ? playerName.trim() : "Anonymous",
                score: score
            };
            highScores.push(newScore);
            highScores.sort((a, b) => b.score - a.score);
            highScores.splice(MAX_SCORES);
            localStorage.setItem('highScores', JSON.stringify(highScores));
        }
    }

    function showLeaderboardOverlay() {
        leaderboardList.innerHTML = '';
        highScores = JSON.parse(localStorage.getItem('highScores')) || [];
        highScores.forEach((entry) => {
            const li = document.createElement('li');
            li.textContent = `${entry.name} - ${entry.score}`;
            leaderboardList.appendChild(li);
        });
        leaderboardOverlay.style.display = 'flex';
    }
    function closeLeaderboardOverlay() {
        leaderboardOverlay.style.display = 'none';
    }
    function resetScores() {
        localStorage.removeItem('highScores');
        highScores = [];
        showLeaderboardOverlay();
    }
    closeLeaderboardButton.addEventListener('click', closeLeaderboardOverlay);
    resetScoresButton.addEventListener('click', resetScores);

    const instructionsOverlay = document.getElementById('instructions-overlay');
    const startGameButton = document.getElementById('start-game-button');
    const viewLeaderboardBtn = document.getElementById('view-leaderboard-btn');

    const spaceshipWrapper = document.getElementById('spaceship-wrapper');
    const thrusterEl = document.getElementById('ship-thruster');
    const scoreEl = document.getElementById('score-value');
    const livesContainer = document.getElementById('lives-container');
    const weaponNameEl = document.getElementById('weapon-name');
    const weaponCooldownEl = document.getElementById('weapon-cooldown-fill');
    const gameOverOverlay = document.getElementById('game-over-overlay');
    const finalScoreEl = document.getElementById('final-score');
    const restartBtn = document.getElementById('restart-button');

    const GAME_WIDTH = window.innerWidth;
    const GAME_HEIGHT = window.innerHeight;

    // Spaceship state
    let shipX = GAME_WIDTH / 2;
    let shipY = GAME_HEIGHT / 2;
    let shipVX = 0;
    let shipVY = 0;
    const maxSpeed = 5;
    const acceleration = 0.35;
    const friction = 0.92;

    // Controls
    let keyUp = false, keyDown = false, keyLeft = false, keyRight = false;
    let shooting = false;

    // Game state
    let lives = 3;
    let score = 0;
    let gameRunning = false;

    // Asteroids
    let asteroids = [];
    let lasers = [];
    let missiles = [];
    let shockwaves = [];
    let beams = [];

    // Difficulty
    let spawnInterval = 2000;
    let lastSpawnTime = 0;
    let difficultyCounter = 0;

    // Weapons
    let weaponMode = 1;
    const maxCooldown = 80;
    let weaponCooldown = 0;

    // Charged beam logic
    let charging = false;
    let chargeLevel = 0;
    const maxChargeLevel = 100;

    function initGame() {
        score = 0;
        lives = 3;
        updateLivesDisplay();
        scoreEl.textContent = score.toString();

        shipX = GAME_WIDTH / 2;
        shipY = GAME_HEIGHT / 2;
        shipVX = 0;
        shipVY = 0;

        asteroids.forEach(a => a.el.remove());
        asteroids = [];
        lasers.forEach(l => l.el.remove());
        lasers = [];
        missiles.forEach(m => m.el.remove());
        missiles = [];
        shockwaves.forEach(s => s.el.remove());
        shockwaves = [];
        beams.forEach(b => b.el.remove());
        beams = [];

        spawnInterval = 2000;
        lastSpawnTime = performance.now();
        difficultyCounter = 0;
        weaponCooldown = 0;
        chargeLevel = 0;
        charging = false;

        gameOverOverlay.style.display = 'none';
        instructionsOverlay.style.display = 'none';

        gameRunning = true;
        requestAnimationFrame(update);
    }

    function endGame() {
        gameRunning = false;
        finalScoreEl.textContent = 'Your Score: ' + score;
        gameOverOverlay.style.display = 'flex';
        checkAndUpdateHighScores();
    }


    function updateLivesDisplay() {
        livesContainer.innerHTML = '';
        for (let i = 0; i < lives; i++) {
            const lifeEl = document.createElement('div');
            lifeEl.className = 'life-indicator';
            livesContainer.appendChild(lifeEl);
        }
    }
    function setWeaponName(mode) {
        switch (mode) {
            case 1: weaponNameEl.textContent = 'Laser'; break;
            case 2: weaponNameEl.textContent = 'Spread Shot'; break;
            case 3: weaponNameEl.textContent = 'Seeker Missile'; break;
            case 4: weaponNameEl.textContent = 'Shockwave'; break;
            case 5: weaponNameEl.textContent = 'Charged Beam'; break;
        }
    }


    function spawnAsteroid() {
        const side = Math.floor(Math.random() * 4);
        let x, y, vx, vy;
        const size = 30 + Math.random() * 40;

        if (side === 0) { // top
            x = Math.random() * GAME_WIDTH;
            y = -size;
            vx = (Math.random() - 0.5) * 2;
            vy = 1 + Math.random() * 2;
        } else if (side === 1) { // right
            x = GAME_WIDTH + size;
            y = Math.random() * GAME_HEIGHT;
            vx = -(1 + Math.random() * 2);
            vy = (Math.random() - 0.5) * 2;
        } else if (side === 2) { // bottom
            x = Math.random() * GAME_WIDTH;
            y = GAME_HEIGHT + size;
            vx = (Math.random() - 0.5) * 2;
            vy = -(1 + Math.random() * 2);
        } else { // left
            x = -size;
            y = Math.random() * GAME_HEIGHT;
            vx = 1 + Math.random() * 2;
            vy = (Math.random() - 0.5) * 2;
        }

        const el = document.createElement('div');
        el.className = 'asteroid spin';
        el.style.width = size + 'px';
        el.style.height = size + 'px';
        gameContainer.appendChild(el);

        asteroids.push({
            el, x, y, vx, vy, size
        });
    }
    function destroyAsteroid(index) {
        const a = asteroids[index];
        a.el.remove();
        asteroids.splice(index, 1);
    }
    function breakAsteroid(a) {
        if (a.size < 30) return;
        const fragCount = 2 + Math.floor(Math.random() * 2);
        const fragSize = a.size / fragCount;
        for (let i = 0; i < fragCount; i++) {
            const angle = Math.random() * 2 * Math.PI;
            const speed = 1.5 + Math.random() * 2;
            const fx = Math.cos(angle) * speed;
            const fy = Math.sin(angle) * speed;

            const el = document.createElement('div');
            el.className = 'asteroid spin';
            el.style.width = fragSize + 'px';
            el.style.height = fragSize + 'px';
            gameContainer.appendChild(el);

            asteroids.push({
                el,
                x: a.x + a.size / 2 - fragSize / 2,
                y: a.y + a.size / 2 - fragSize / 2,
                vx: fx,
                vy: fy,
                size: fragSize
            });
        }
    }


    function shootWeapon() {
        if (weaponCooldown > 0) return;
        if (weaponMode !== 5) {
            weaponCooldown = 80;
        }
        switch (weaponMode) {
            case 1: shootLaser(); break;
            case 2: shootSpread(); break;
            case 3: shootSeeker(); break;
            case 4: shootShockwave(); break;
            case 5: startChargingBeam(); break;
        }
    }

    // Basic Laser
    function shootLaser() {
        const laserEl = document.createElement('div');
        laserEl.className = 'laser';
        gameContainer.appendChild(laserEl);

        lasers.push({
            el: laserEl,
            x: shipX - 2,
            y: shipY - 25,
            vx: 0,
            vy: -10,
            width: 4,
            height: 20
        });
    }
    // Spread Shot
    function shootSpread() {
        const angles = [-0.3, 0, 0.3];
        angles.forEach(angle => {
            const spreadEl = document.createElement('div');
            spreadEl.className = 'laser-spread';
            gameContainer.appendChild(spreadEl);

            const speed = 10;
            const vx = speed * Math.sin(angle);
            const vy = -speed * Math.cos(angle);

            lasers.push({
                el: spreadEl,
                x: shipX - 2,
                y: shipY - 20,
                vx,
                vy,
                width: 4,
                height: 15
            });
        });
    }
    // Seeker
    function shootSeeker() {
        const missileEl = document.createElement('div');
        missileEl.className = 'missile';
        gameContainer.appendChild(missileEl);

        missiles.push({
            el: missileEl,
            x: shipX - 6,
            y: shipY - 6,
            vx: 0,
            vy: -4
        });
    }
    // Shockwave
    function shootShockwave() {
        const waveEl = document.createElement('div');
        waveEl.className = 'shockwave';
        waveEl.style.left = (shipX - 10) + 'px';
        waveEl.style.top = (shipY - 10) + 'px';
        gameContainer.appendChild(waveEl);

        shockwaves.push({
            el: waveEl,
            x: shipX,
            y: shipY,
            radius: 0,
            maxRadius: 120
        });
    }
    // Charged Beam
    function startChargingBeam() {
        charging = true;
    }
    function releaseChargedBeam() {
        if (chargeLevel > 20) {
            const beamEl = document.createElement('div');
            beamEl.className = 'charged-beam';
            gameContainer.appendChild(beamEl);

            const beamSize = 30 + (chargeLevel * 0.3);
            beamEl.style.height = beamSize + 'px';

            beams.push({
                el: beamEl,
                x: shipX - 6,
                y: shipY - beamSize,
                vx: 0,
                vy: -15,
                width: 12,
                height: beamSize,
                damage: 2 + Math.floor(chargeLevel / 20)
            });
        }
        chargeLevel = 0;
        charging = false;
        weaponCooldown = 80;
    }


    function boxCollision(ax, ay, aw, ah, bx, by, bw, bh) {
        return (ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by);
    }
    function findClosestAsteroid(x, y) {
        let closest = null;
        let minDist = Infinity;
        for (let i = 0; i < asteroids.length; i++) {
            const a = asteroids[i];
            const dx = (a.x + a.size / 2) - x;
            const dy = (a.y + a.size / 2) - y;
            const dist = dx * dx + dy * dy;
            if (dist < minDist) {
                minDist = dist;
                closest = a;
            }
        }
        return closest;
    }


    function update() {
        if (!gameRunning) return;

        // Movement
        if (keyUp) shipVY -= acceleration;
        if (keyDown) shipVY += acceleration;
        if (keyLeft) shipVX -= acceleration;
        if (keyRight) shipVX += acceleration;

        shipVX *= friction;
        shipVY *= friction;

        if (shipVX > maxSpeed) shipVX = maxSpeed;
        if (shipVX < -maxSpeed) shipVX = -maxSpeed;
        if (shipVY > maxSpeed) shipVY = maxSpeed;
        if (shipVY < -maxSpeed) shipVY = -maxSpeed;

        shipX += shipVX;
        shipY += shipVY;

        const halfW = 20, halfH = 25;
        if (shipX < halfW) { shipX = halfW; shipVX = 0; }
        if (shipX > GAME_WIDTH - halfW) { shipX = GAME_WIDTH - halfW; shipVX = 0; }
        if (shipY < halfH) { shipY = halfH; shipVY = 0; }
        if (shipY > GAME_HEIGHT - halfH) { shipY = GAME_HEIGHT - halfH; shipVY = 0; }

        spaceshipWrapper.style.left = (shipX - halfW) + 'px';
        spaceshipWrapper.style.top = (shipY - halfH) + 'px';

        if (keyUp) thrusterEl.classList.add('boost');
        else thrusterEl.classList.remove('boost');

        // Lasers
        for (let i = lasers.length - 1; i >= 0; i--) {
            const l = lasers[i];
            l.x += l.vx;
            l.y += l.vy;
            if (l.x < -50 || l.x > GAME_WIDTH + 50 || l.y < -50 || l.y > GAME_HEIGHT + 50) {
                l.el.remove();
                lasers.splice(i, 1);
                continue;
            }
            l.el.style.left = l.x + 'px';
            l.el.style.top = l.y + 'px';
        }

        // Missiles
        for (let i = missiles.length - 1; i >= 0; i--) {
            const m = missiles[i];
            const target = findClosestAsteroid(m.x, m.y);
            if (target) {
                const angle = Math.atan2(
                    (target.y + target.size / 2) - m.y,
                    (target.x + target.size / 2) - m.x
                );
                m.vx += 0.2 * Math.cos(angle);
                m.vy += 0.2 * Math.sin(angle);
                const speedLimit = 6;
                const speed = Math.sqrt(m.vx * m.vx + m.vy * m.vy);
                if (speed > speedLimit) {
                    m.vx = (m.vx / speed) * speedLimit;
                    m.vy = (m.vy / speed) * speedLimit;
                }
            }
            m.x += m.vx;
            m.y += m.vy;
            if (m.x < -50 || m.x > GAME_WIDTH + 50 || m.y < -50 || m.y > GAME_HEIGHT + 50) {
                m.el.remove();
                missiles.splice(i, 1);
                continue;
            }
            m.el.style.left = m.x + 'px';
            m.el.style.top = m.y + 'px';
        }

        // Shockwaves 
        for (let i = shockwaves.length - 1; i >= 0; i--) {
            const sw = shockwaves[i];
            sw.radius += 6;
            for (let j = asteroids.length - 1; j >= 0; j--) {
                const a = asteroids[j];
                const distX = (a.x + a.size / 2) - sw.x;
                const distY = (a.y + a.size / 2) - sw.y;
                const dist = Math.sqrt(distX * distX + distY * distY);
                if (dist < sw.radius + a.size * 0.5) {
                    destroyAsteroid(j);
                    if (a.size >= 30) {
                        breakAsteroid(a);
                    }
                    score += Math.floor(a.size);
                    scoreEl.textContent = score;
                }
            }
            if (sw.radius > sw.maxRadius) {
                sw.el.remove();
                shockwaves.splice(i, 1);
                continue;
            }
        }

        //  Beams
        for (let i = beams.length - 1; i >= 0; i--) {
            const b = beams[i];
            b.x += b.vx;
            b.y += b.vy;
            if (b.x < -100 || b.x > GAME_WIDTH + 100 || b.y < -200 || b.y > GAME_HEIGHT + 200) {
                b.el.remove();
                beams.splice(i, 1);
                continue;
            }
            b.el.style.left = b.x + 'px';
            b.el.style.top = b.y + 'px';
        }

        // Asteroids
        for (let i = asteroids.length - 1; i >= 0; i--) {
            const a = asteroids[i];
            a.x += a.vx;
            a.y += a.vy;
            if (a.x < -200 || a.x > GAME_WIDTH + 200 || a.y < -200 || a.y > GAME_HEIGHT + 200) {
                destroyAsteroid(i);
                continue;
            }
            a.el.style.left = a.x + 'px';
            a.el.style.top = a.y + 'px';
        }

        // Laser collisions
        for (let i = asteroids.length - 1; i >= 0; i--) {
            const a = asteroids[i];
            for (let j = lasers.length - 1; j >= 0; j--) {
                const l = lasers[j];
                if (boxCollision(a.x, a.y, a.size, a.size, l.x, l.y, l.width, l.height)) {
                    destroyAsteroid(i);
                    if (a.size >= 30) {
                        breakAsteroid(a);
                    }
                    score += Math.floor(a.size);
                    scoreEl.textContent = score;
                    l.el.remove();
                    lasers.splice(j, 1);
                    break;
                }
            }
        }

        //Missile collisions
        for (let i = asteroids.length - 1; i >= 0; i--) {
            const a = asteroids[i];
            for (let j = missiles.length - 1; j >= 0; j--) {
                const m = missiles[j];
                if (boxCollision(a.x, a.y, a.size, a.size, m.x, m.y, 12, 12)) {
                    destroyAsteroid(i);
                    if (a.size >= 30) {
                        breakAsteroid(a);
                    }
                    score += Math.floor(a.size);
                    scoreEl.textContent = score;
                    m.el.remove();
                    missiles.splice(j, 1);
                    break;
                }
            }
        }

        // Beam collisions
        for (let i = asteroids.length - 1; i >= 0; i--) {
            const a = asteroids[i];
            for (let j = beams.length - 1; j >= 0; j--) {
                const b = beams[j];
                if (boxCollision(a.x, a.y, a.size, a.size, b.x, b.y, b.width, b.height)) {
                    destroyAsteroid(i);
                    if (a.size >= 30) {
                        breakAsteroid(a);
                    }
                    score += Math.floor(a.size) * b.damage;
                    scoreEl.textContent = score;
                    b.el.remove();
                    beams.splice(j, 1);
                    break;
                }
            }
        }

        //Asteroid and Ship collision
        for (let i = asteroids.length - 1; i >= 0; i--) {
            const a = asteroids[i];
            if (boxCollision(a.x, a.y, a.size, a.size, shipX - halfW, shipY - halfH, 40, 50)) {
                lives--;
                updateLivesDisplay();
                destroyAsteroid(i);
                if (lives <= 0) {
                    endGame();
                    return;
                }
            }
        }

        // Weapon cooldown
        if (weaponCooldown > 0) {
            weaponCooldown--;
        }
        const fillPct = 100 - (weaponCooldown / maxCooldown) * 100;
        weaponCooldownEl.style.width = Math.max(0, fillPct) + '%';

        //  Charge beam
        if (charging) {
            chargeLevel = Math.min(maxChargeLevel, chargeLevel + 1);
        }

        // Difficulty & spawn
        difficultyCounter++;
        if (difficultyCounter % 600 === 0) {
            spawnInterval = Math.max(500, spawnInterval - 200);
        }
        const now = performance.now();
        if (now - lastSpawnTime > spawnInterval) {
            lastSpawnTime = now;
            spawnAsteroid();
        }

        requestAnimationFrame(update);
    }


    window.addEventListener('keydown', e => {
        if (e.code === 'ArrowUp' || e.code === 'KeyW') keyUp = true;
        if (e.code === 'ArrowDown' || e.code === 'KeyS') keyDown = true;
        if (e.code === 'ArrowLeft' || e.code === 'KeyA') keyLeft = true;
        if (e.code === 'ArrowRight' || e.code === 'KeyD') keyRight = true;

        if (e.code === 'Space') {
            shooting = true;
            if (weaponMode !== 5) {
                shootWeapon();
            } else {
                shootWeapon(); // starts charging
            }
        }

        // Switch weapons
        if (e.code === 'Digit1') { weaponMode = 1; setWeaponName(1); }
        if (e.code === 'Digit2') { weaponMode = 2; setWeaponName(2); }
        if (e.code === 'Digit3') { weaponMode = 3; setWeaponName(3); }
        if (e.code === 'Digit4') { weaponMode = 4; setWeaponName(4); }
        if (e.code === 'Digit5') { weaponMode = 5; setWeaponName(5); }

        if (instructionsOverlay.style.display !== 'none' && e.code === 'Enter') {
            hideInstructionsAndStart();
        }
    });

    window.addEventListener('keyup', e => {
        if (e.code === 'ArrowUp' || e.code === 'KeyW') keyUp = false;
        if (e.code === 'ArrowDown' || e.code === 'KeyS') keyDown = false;
        if (e.code === 'ArrowLeft' || e.code === 'KeyA') keyLeft = false;
        if (e.code === 'ArrowRight' || e.code === 'KeyD') keyRight = false;

        if (e.code === 'Space') {
            shooting = false;
            if (weaponMode === 5 && charging) {
                releaseChargedBeam();
            }
        }
    });

    restartBtn.addEventListener('click', initGame);


    function hideInstructionsAndStart() {
        instructionsOverlay.style.display = 'none';
        initGame();
    }
    startGameButton.addEventListener('click', hideInstructionsAndStart);
    viewLeaderboardBtn.addEventListener('click', showLeaderboardOverlay);

    function setup() {
        setWeaponName(1);
        updateLivesDisplay();
    }
    setup();
})();