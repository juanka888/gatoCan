"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";

type GatitoRunnerProps = {
  embedded?: boolean;
  showLeaderboard?: boolean;
};

type Obstacle = { x: number; y: number; w: number; h: number; type: "yarn" | "mouseObstacle" };
type Mouse = { x: number; y: number; w: number; h: number; caught: boolean };

const BEST_SCORE_KEY = "gatocanBestScore";
const BEST_DISTANCE_KEY = "gatocanBestDistance";

export default function GatitoRunner({ embedded = false, showLeaderboard = true }: GatitoRunnerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const controlsRef = useRef<{ start: () => void; restart: () => void }>({
    start: () => {},
    restart: () => {},
  });
  const [score, setScore] = useState(0);
  const [distance, setDistance] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [bestDistance, setBestDistance] = useState(0);
  const [started, setStarted] = useState(false);
  const [running, setRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [statusText, setStatusText] = useState("Juego en espera. Pulsa Iniciar para empezar.");
  const { data: session } = useSession();

  useEffect(() => {
    const localBest = Number(localStorage.getItem(BEST_SCORE_KEY) || 0);
    const localBestDistance = Number(localStorage.getItem(BEST_DISTANCE_KEY) || 0);
    setBestScore(localBest);
    setBestDistance(localBestDistance);
  }, []);

  useEffect(() => {
    const email = session?.user?.email;
    if (email) {
      console.log(`Preparado para enviar puntuación de ${email}`);
    }
  }, [session?.user?.email]);



  const persistRemoteRecord = async (runScore: number, runDistance: number) => {
    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ score: runScore, distance: runDistance }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        console.error("No se pudo guardar récord remoto:", data || response.statusText);
      }
    } catch (error) {
      console.error("Error enviando récord remoto:", error);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const catSprites = {
      run: new Image(),
      jump: new Image(),
      fall: new Image(),
    };

    catSprites.run.src = "/img/walk_sprite.png";
    catSprites.jump.src = "/img/jump_sprite.png";
    catSprites.fall.src = "/img/idle_sprite.png";

    const spriteMeta = {
      run: { frames: 7, frameDuration: 90, loop: true },
      jump: { frames: 4, frameDuration: 110, loop: false },
      fall: { frames: 8, frameDuration: 120, loop: true },
    } as const;

    const spriteReady = { run: false, jump: false, fall: false };
    (Object.entries(catSprites) as Array<[keyof typeof catSprites, HTMLImageElement]>).forEach(([name, image]) => {
      image.onload = () => {
        spriteReady[name] = true;
      };
      image.onerror = () => {
        spriteReady[name] = false;
      };
    });

    const game = {
      started: false,
      running: false,
      score: 0,
      distance: 0,
      speed: 4,
      gravity: 0.7,
      cat: { x: 65, y: 170, w: 34, h: 28, vy: 0, onGround: true },
      groundY: 170,
      width: 860,
      height: 260,
      obstacles: [] as Obstacle[],
      mice: [] as Mouse[],
      obstacleSpawn: 0,
      mouseSpawn: 0,
      animation: { current: "run" as "run" | "jump" | "fall", frame: 0, lastFrameAt: 0 },
    };

    const resizeGameCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.max(window.devicePixelRatio || 1, 1);
      const cssWidth = Math.max(320, Math.floor(rect.width || 860));
      const cssHeight = Math.max(240, Math.floor(rect.height || 260));
      canvas.width = Math.floor(cssWidth * dpr);
      canvas.height = Math.floor(cssHeight * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.imageSmoothingEnabled = false;
      game.width = cssWidth;
      game.height = cssHeight;
      game.groundY = Math.max(150, game.height - 60);
      if (game.cat.onGround || game.cat.y > game.groundY) {
        game.cat.y = game.groundY;
        game.cat.vy = 0;
        game.cat.onGround = true;
      }
    };

    const overlap = (a: { x: number; y: number; w: number; h: number }, b: { x: number; y: number; w: number; h: number }) =>
      a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

    const jump = () => {
      if (!game.started) {
        game.started = true;
        game.running = true;
        setStarted(true);
        setRunning(true);
      }
      if (!game.running) return;
      if (game.cat.onGround) {
        game.cat.vy = -11;
        game.cat.onGround = false;
        setStatusText("¡Buen salto!");
      }
    };

    const persistBest = (runScore: number, runDistance: number) => {
      const nextBestScore = Math.max(Number(localStorage.getItem(BEST_SCORE_KEY) || 0), runScore);
      const nextBestDistance = Math.max(Number(localStorage.getItem(BEST_DISTANCE_KEY) || 0), runDistance);
      localStorage.setItem(BEST_SCORE_KEY, String(nextBestScore));
      localStorage.setItem(BEST_DISTANCE_KEY, String(nextBestDistance));
      setBestScore(nextBestScore);
      setBestDistance(nextBestDistance);
    };

    const doGameOver = () => {
      if (!game.running) return;
      game.running = false;
      const runDistance = Math.floor(game.distance);
      setRunning(false);
      setGameOver(true);
      setStatusText(`Game over: ${runDistance} m recorridos. Pulsa reintentar para volver a jugar.`);
      persistBest(game.score, runDistance);
      void persistRemoteRecord(game.score, runDistance);
    };

    const resetGame = () => {
      game.started = true;
      game.running = true;
      game.score = 0;
      game.distance = 0;
      game.speed = 4;
      game.cat.y = game.groundY;
      game.cat.vy = 0;
      game.cat.onGround = true;
      game.obstacles = [];
      game.mice = [];
      game.obstacleSpawn = 0;
      game.mouseSpawn = 0;
      setScore(0);
      setDistance(0);
      setGameOver(false);
      setStarted(true);
      setRunning(true);
      setStatusText("Partida reiniciada. ¡Vamos!");
    };

    const updateAnimation = (name: "run" | "jump" | "fall", now: number) => {
      const meta = spriteMeta[name];
      if (game.animation.current !== name) {
        game.animation.current = name;
        game.animation.frame = 0;
        game.animation.lastFrameAt = now;
        return;
      }
      if (now - game.animation.lastFrameAt < meta.frameDuration) return;
      game.animation.lastFrameAt = now;
      game.animation.frame = meta.loop
        ? (game.animation.frame + 1) % meta.frames
        : Math.min(game.animation.frame + 1, meta.frames - 1);
    };

    const drawCat = (name: "run" | "jump" | "fall", now: number) => {
      const sprite = catSprites[name];
      const meta = spriteMeta[name];
      if (!spriteReady[name] || !sprite.width) return false;
      updateAnimation(name, now);
      const frameWidth = Math.floor(sprite.width / meta.frames);
      const sourceX = game.animation.frame * frameWidth;
      ctx.drawImage(sprite, sourceX, 0, frameWidth, sprite.height, game.cat.x - 10, game.cat.y - 20, 60, 60);
      return true;
    };

    const update = () => {
      if (!game.started || !game.running) return;
      game.speed += 0.0012;
      game.distance += game.speed * 0.12;
      game.cat.vy += game.gravity;
      game.cat.y += game.cat.vy;

      if (game.cat.y >= game.groundY) {
        game.cat.y = game.groundY;
        game.cat.vy = 0;
        game.cat.onGround = true;
      }

      game.obstacleSpawn -= 1;
      game.mouseSpawn -= 1;

      if (game.obstacleSpawn <= 0) {
        const isYarn = Math.random() < 0.7;
        const h = isYarn ? 30 : 22;
        const w = isYarn ? 30 : 26;
        game.obstacles.push({ x: game.width, y: game.groundY + game.cat.h - h, w, h, type: isYarn ? "yarn" : "mouseObstacle" });
        game.obstacleSpawn = 80 + Math.random() * 65;
      }

      if (game.mouseSpawn <= 0) {
        const miceMinY = Math.max(96, game.groundY - 85);
        const miceMaxY = Math.max(miceMinY + 10, game.groundY - 28);
        game.mice.push({ x: game.width, y: miceMinY + Math.random() * (miceMaxY - miceMinY), w: 18, h: 14, caught: false });
        game.mouseSpawn = 100 + Math.random() * 95;
      }

      game.obstacles.forEach((item) => {
        item.x -= game.speed;
      });
      game.mice.forEach((item) => {
        item.x -= game.speed + 1.2;
      });

      game.obstacles = game.obstacles.filter((item) => item.x + item.w > -20);
      game.mice = game.mice.filter((item) => item.x + item.w > -20 && !item.caught);

      const catBox = { x: game.cat.x, y: game.cat.y, w: game.cat.w, h: game.cat.h };
      for (const obstacle of game.obstacles) {
        if (overlap(catBox, obstacle)) {
          doGameOver();
          break;
        }
      }

      for (const mouse of game.mice) {
        if (!mouse.caught && overlap(catBox, mouse)) {
          mouse.caught = true;
          game.score += 10;
          setScore(game.score);
          setStatusText(`¡Ratón atrapado! +10 | Distancia: ${Math.floor(game.distance)} m`);
        }
      }

      setDistance(Math.floor(game.distance));
    };

    const draw = (now: number) => {
      ctx.clearRect(0, 0, game.width, game.height);

      const bg = ctx.createLinearGradient(0, 0, 0, game.height);
      bg.addColorStop(0, "#f0f9ff");
      bg.addColorStop(1, "#dbeffd");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, game.width, game.height);

      ctx.strokeStyle = "#7cb4d5";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, game.groundY + game.cat.h + 1);
      ctx.lineTo(game.width, game.groundY + game.cat.h + 1);
      ctx.stroke();

      const catSpriteName = !game.running ? "fall" : game.cat.onGround ? "run" : "jump";
      const catDrawn = drawCat(catSpriteName, now);
      if (!catDrawn) {
        ctx.fillStyle = "#22303c";
        ctx.font = "700 13px Segoe UI";
        ctx.fillText("🐾", game.cat.x + 2, game.cat.y + 20);
      }

      game.obstacles.forEach((item) => {
        if (item.type === "yarn") {
          ctx.fillStyle = "#ef4444";
          ctx.beginPath();
          ctx.arc(item.x + item.w / 2, item.y + item.h / 2, Math.max(item.w, item.h) / 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = "#b91c1c";
          ctx.lineWidth = 2;
          ctx.stroke();
        } else {
          ctx.fillStyle = "#64748b";
          ctx.fillRect(item.x, item.y, item.w, item.h);
          ctx.fillStyle = "#334155";
          ctx.fillRect(item.x + 4, item.y + 4, item.w - 8, 4);
        }
      });

      game.mice.forEach((item) => {
        ctx.font = "16px Segoe UI";
        ctx.fillText("🐭", item.x, item.y + 12);
      });

      if (!game.started) {
        ctx.fillStyle = "rgba(15, 23, 42, 0.45)";
        ctx.fillRect(0, 0, game.width, game.height);
        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "center";
        ctx.font = "700 20px Segoe UI";
        ctx.fillText("Pulsa Iniciar para comenzar", game.width / 2, game.height / 2 - 8);
        ctx.font = "500 14px Segoe UI";
        ctx.fillText("También puedes tocar el canvas o usar Espacio", game.width / 2, game.height / 2 + 20);
        ctx.textAlign = "start";
      }
    };

    const tick = (now: number) => {
      update();
      draw(now || performance.now());
      rafRef.current = window.requestAnimationFrame(tick);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code === "Space" || event.code === "ArrowUp") {
        event.preventDefault();
        if (game.started && !game.running) {
          resetGame();
          return;
        }
        jump();
      }
    };

    const onPointerDown = () => {
      if (!game.started) {
        game.started = true;
        game.running = true;
        setStarted(true);
        setRunning(true);
        setStatusText("¡Vamos!");
        return;
      }
      jump();
    };

    const onStart = () => {
      if (game.started && game.running) return;
      game.started = true;
      game.running = true;
      setStarted(true);
      setRunning(true);
      setGameOver(false);
      setStatusText("¡Vamos!");
    };
    const onRestart = () => resetGame();
    controlsRef.current = { start: onStart, restart: onRestart };

    resizeGameCanvas();
    window.addEventListener("resize", resizeGameCanvas);
    window.addEventListener("keydown", onKeyDown);
    canvas.addEventListener("pointerdown", onPointerDown);

    rafRef.current = window.requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resizeGameCanvas);
      window.removeEventListener("keydown", onKeyDown);
      canvas.removeEventListener("pointerdown", onPointerDown);
    };
  }, []);

  return (
    <div style={{ display: "grid", gap: "1rem" }}>
      <div style={{ display: "grid", gridTemplateColumns: embedded ? "1fr" : "1.5fr 1fr", gap: "1rem", alignItems: "start" }}>
        <div style={{ position: "relative" }}>
          <canvas
            id="cat-runner"
            ref={canvasRef}
            width={860}
            height={260}
            role="img"
            aria-label="Juego de gatito que salta"
            style={{ width: "100%", height: "clamp(240px, 36vh, 320px)", display: "block", border: "1px solid #d3e1e8", borderRadius: 10, background: "#fff" }}
          />
          {gameOver && (
            <div
              id="game-over-overlay"
              style={{ position: "absolute", inset: 0, display: "grid", placeContent: "center", justifyItems: "center", gap: "0.55rem", background: "rgba(10, 17, 23, 0.68)", borderRadius: 10, textAlign: "center", padding: "1.25rem", zIndex: 30 }}
            >
              <p style={{ margin: 0, color: "#fff", fontSize: "1.45rem", fontWeight: 800 }}>💥 Game Over</p>
              <p style={{ margin: 0, color: "#f4f9fc", fontWeight: 600 }}>Te chocaste. ¿Reintentar?</p>
              <button id="retry-overlay-btn" type="button" onClick={() => controlsRef.current.restart()} style={{ minWidth: 52, minHeight: 52, borderRadius: "50%", fontSize: "1.35rem", fontWeight: 900, lineHeight: 1, padding: "0.2rem", position: "relative", zIndex: 40 }}>↻</button>
            </div>
          )}
        </div>

        <div style={{ display: "grid", gap: "0.55rem", alignContent: "start" }}>
          {!started && !running && !gameOver && <button id="start-btn" type="button" onClick={() => controlsRef.current.start()}>Iniciar Juego</button>}
          <p style={{ margin: 0, fontWeight: 700 }}>Puntos: <span>{score}</span></p>
          <p style={{ margin: 0, fontWeight: 700 }}>Metros recorridos: <span>{distance}</span> m</p>
          <p style={{ margin: 0, fontWeight: 700 }}>Récord local (puntos): <span>{bestScore}</span></p>
          <p style={{ margin: 0, fontWeight: 700 }}>Récord local (más metros): <span>{Math.floor(bestDistance)}</span> m</p>
          <p style={{ margin: 0 }}>{statusText}</p>
        </div>
      </div>

      {!embedded && showLeaderboard && <p style={{ margin: 0, fontSize: "0.9rem" }}>Modo local-first activo para evitar bloqueos de red.</p>}
    </div>
  );
}
