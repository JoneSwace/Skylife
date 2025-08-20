(() => {
  const characterData = [
    { name: "Ervix", cost: 0, color: "red", emoji: "🐰" },
    { name: "Zentor", cost: 50, color: "blue", emoji: "🦊" },
    { name: "Nerion", cost: 100, color: "green", emoji: "🐸" },
    { name: "Maxor", cost: 150, color: "purple", emoji: "🐵" },
    { name: "Lunex", cost: 200, color: "orange", emoji: "🦄" },
    { name: "Kairox", cost: 300, color: "teal", emoji: "🐯" },
    { name: "Velron", cost: 400, color: "gold", emoji: "🐲" },
    { name: "Mytra", cost: 500, color: "black", emoji: "🐙" },
    { name: "Erixa", cost: 600, color: "pink", emoji: "🐰" },
    { name: "Xalor", cost: 700, color: "brown", emoji: "🐻" },
    { name: "Drakor", cost: 800, color: "darkred", emoji: "🐉" },
    { name: "Zelara", cost: 900, color: "darkblue", emoji: "🦋" },
    { name: "Firon", cost: 1000, color: "darkgreen", emoji: "🦖" },
    { name: "Quorra", cost: 1200, color: "violet", emoji: "🐩" },
    { name: "Thron", cost: 1400, color: "lime", emoji: "🐝" },
    { name: "Grax", cost: 1600, color: "navy", emoji: "🐬" },
    { name: "Syra", cost: 1800, color: "salmon", emoji: "🐠" },
    { name: "Voltar", cost: 2000, color: "maroon", emoji: "🦇" },
    { name: "Nyrix", cost: 2500, color: "indigo", emoji: "🐺" },
    { name: "Xylon", cost: 3000, color: "darkorange", emoji: "🦉" }
  ];

  let unlocked = JSON.parse(localStorage.getItem("unlocked")) || ["Ervix"];
  let selectedCharacter = "Ervix";

  const menu = document.getElementById("menu");
  const startScreen = document.getElementById("start-screen");
  const charSelect = document.getElementById("character-select");
  const gameDiv = document.getElementById("game");
  const gameOverDiv = document.getElementById("game-over");
  const message = document.getElementById("message");
  const scoreDisplay = document.getElementById("score-display");
  const canvas = document.getElementById("game-canvas");
  const ctx = canvas.getContext("2d");
  const charList = document.getElementById("character-list");
  const backToMenuBtn = document.getElementById("backToMenuBtn");
  const backToMenuBtnGameOver = document.getElementById("backToMenuBtnGameOver");

  let keys = {}, score = 0, gameStarted = false, gameOver = false;
  let player, platforms, scrollX, gravity = 0.8, speed = 3;

  let jumpCount = 0;
  let isSpaceHeld = false;
  let holdTime = 0;
  const maxHoldTime = 40;

  const showMenu = () => {
    menu.style.display = "block";
    startScreen.style.display = "none";
    charSelect.style.display = "none";
    gameDiv.style.display = "none";
    gameOverDiv.style.display = "none";
  };

  const showCharSelect = () => {
    startScreen.style.display = "none";
    charSelect.style.display = "block";
    charList.innerHTML = "";
    characterData.forEach(c => {
      const div = document.createElement("div");
      div.className = "character";
      if (!unlocked.includes(c.name)) div.classList.add("locked");
      div.innerText = `${c.emoji} ${c.name} (${c.cost} pont)`;
      div.style.background = c.color;
      div.dataset.name = c.name;
      charList.appendChild(div);
    });
  };

  charList.addEventListener("click", e => {
    const name = e.target.dataset.name;
    if (!unlocked.includes(name)) return;
    selectedCharacter = name;
    charSelect.style.display = "none";
    gameDiv.style.display = "block";
    message.style.display = "block";
    window.addEventListener("keydown", waitForStart);
  });

  const waitForStart = (e) => {
    if (e.code === "Space") {
      window.removeEventListener("keydown", waitForStart);
      message.style.display = "none";
      startGame();
    }
  };

  const startGame = () => {
    gameStarted = true;
    gameOver = false;
    score = 0;
    scrollX = 0;
    jumpCount = 0;
    isSpaceHeld = false;
    holdTime = 0;

    platforms = [
      { x: 0, y: 350, w: 1200, h: 10 }
    ];

    player = {
      x: 100,
      y: 320,
      w: 30,
      h: 30,
      vy: 0,
      color: characterData.find(c => c.name === selectedCharacter).color,
      emoji: characterData.find(c => c.name === selectedCharacter).emoji
    };

    for (let i = 1; i < 30; i++) {
      platforms.push({
        x: 1200 + i * 200,
        y: 350 - Math.random() * 100,
        w: 100,
        h: 10
      });
    }

    loop();
  };

  const addPlatform = () => {
    const last = platforms[platforms.length - 1];
    const newX = last.x + 200;
    const newY = 350 - Math.random() * 100;
    platforms.push({ x: newX, y: newY, w: 100, h: 10 });
  };

  const update = () => {
    if (keys[" "]) {
      if (!isSpaceHeld) {
        if (jumpCount < 2) {
          player.vy = jumpCount === 0 ? -12 : -15;
          jumpCount++;
          isSpaceHeld = true;
          holdTime = 0;
        }
      } else {
        if (holdTime < maxHoldTime) {
          player.vy -= 0.4;
          holdTime++;
        }
      }
    } else {
      isSpaceHeld = false;
      holdTime = maxHoldTime;
    }

    player.vy += gravity;
    player.y += player.vy;
    player.x += speed;
    scrollX = player.x - 100;

    if (platforms[platforms.length - 1].x - scrollX < canvas.width) {
      addPlatform();
    }

    let onPlatform = false;
    for (const p of platforms) {
      const playerBottom = player.y + player.h;
      const nextPlayerBottom = playerBottom + player.vy;
      const playerRight = player.x + player.w;
      const playerLeft = player.x;

      const horizontalOverlap = playerRight > p.x && playerLeft < p.x + p.w;

      if (horizontalOverlap) {
        if (playerBottom <= p.y && nextPlayerBottom >= p.y) {
          player.y = p.y - player.h;
          player.vy = 0;
          jumpCount = 0;
          onPlatform = true;
          break;
        } else if (playerBottom > p.y && player.y < p.y) {
          player.y = p.y - player.h;
          player.vy = 0;
          jumpCount = 0;
          onPlatform = true;
          break;
        }
      }
    }

    if (player.y > canvas.height) {
      gameOver = true;
      gameDiv.style.display = "none";
      gameOverDiv.style.display = "block";
    }

    score += 0.1;
    scoreDisplay.innerText = `Pont: ${Math.floor(score)}`;
  };

  const draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(-scrollX, 0);

    platforms.forEach(p => {
      ctx.fillStyle = "brown";
      ctx.fillRect(p.x, p.y, p.w, p.h);
    });

    // játékos
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.w, player.h);
    ctx.font = "24px serif";
    ctx.fillText(player.emoji, player.x + 5, player.y + 25);

    ctx.restore();
  };

  const loop = () => {
    if (!gameOver) {
      update();
      draw();
      requestAnimationFrame(loop);
    }
  };

  window.addEventListener("keydown", (e) => {
    keys[e.key] = true;
  });

  window.addEventListener("keyup", (e) => {
    keys[e.key] = false;
  });

  backToMenuBtn.addEventListener("click", () => {
    showMenu();
  });

  backToMenuBtnGameOver.addEventListener("click", () => {
    showMenu();
  });

  // Start screen gomb kezelése
  document.getElementById("startBtn").addEventListener("click", () => {
    startScreen.style.display = "none";
    showCharSelect();
  });

  showMenu();
})();
