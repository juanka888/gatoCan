"use client";

import { useEffect, useRef, useState, useCallback } from "react";
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
  const [statusText, setStatusText] = useState("");
  const { data: session } = useSession();

  // Refs para que el bucle de dibujo acceda a valores actualizados sin re-renderizar
  const scoreRef = useRef(0);
  const distanceRef = useRef(0);

  useEffect(() => {
    const localBest = Number(localStorage.getItem(BEST_SCORE_KEY) || 0);
    const localBestDistance = Number(localStorage.getItem(BEST_DISTANCE_KEY) || 0);
    setBestScore(localBest);
    setBestDistance(localBestDistance);
  }, []);

  const persistRemoteRecord = async (runScore: number, runDistance: number) => {
    try {
      await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ score: runScore, distance: runDistance }),
      });
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
      run: new Image(), jump: new Image(), fall: new Image(),
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
    Object.entries(catSprites).forEach(([name, image]) => {
      image.onload = () => { spriteReady[name as keyof typeof catSprites] = true; };
    });

    const game = {
      started: false,
      running: false,
      score: 0,
      distance: 0,
      speed: 4,
      gravity: 0.7,
      cat: { x: 50, y: 0, w: 34, h: 28, vy: 0, onGround: true },
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
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
      ctx.imageSmoothingEnabled = false;
      game.width = rect.width;
      game.height = rect.height;
      game.groundY = game.height - 50;
      game.cat.y = game.groundY;
    };

    const overlap = (a: any, b: any) =>
      a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

    const jump = () => {
      if (!game.started) {
        resetGame();
        return;
      }
      if (game.cat.onGround && game.running) {
        game.cat.vy = -10;
        game.cat.onGround = false;
      }
    };

    const doGameOver = () => {
      game.running = false;
      setRunning(false);
      setGameOver(true);
      const finalDist = Math.floor(game.distance);
      
      const oldBestS = Number(localStorage.getItem(BEST_SCORE_KEY) || 0);
      const oldBestD = Number(localStorage.getItem(BEST_DISTANCE_KEY) || 0);
      if (game.score > oldBestS) {
        localStorage.setItem(BEST_SCORE_KEY, String(game.score));
        setBestScore(game.score);
      }
      if (finalDist > oldBestD) {
        localStorage.setItem(BEST_DISTANCE_KEY, String(finalDist));
        setBestDistance(finalDist);
      }
      persistRemoteRecord(game.score, finalDist);
    };

    const resetGame = () => {
      game.started = true;
      game.running = true;
      game.score = 0;
      game.distance = 0;
      game.speed = 4;
      game.obstacles = [];
      game.mice = [];
      game.cat.y = game.groundY;
      game.cat.vy = 0;
      game.cat.onGround = true;
      scoreRef.current = 0;
      distanceRef.current = 0;
      setScore(0);
      setDistance(0);
      setGameOver(false);
      setStarted(true);
      setRunning(true);
      setStatusText("");
    };

    const drawCat = (name: "run" | "jump" | "fall", now: number) => {
      const sprite = catSprites[name];
      const meta = spriteMeta[name];
      if (!spriteReady[name]) return false;
      
      if (game.animation.current !== name) {
        game.animation.current = name;
        game.animation.frame = 0;
        game.animation.lastFrameAt = now;
      } else if (now - game.animation.lastFrameAt > meta.frameDuration) {
        game.animation.lastFrameAt = now;
        game.animation.frame = meta.loop ? (game.animation.frame + 1) % meta.frames : Math.min(game.animation.frame + 1, meta.frames - 1);
      }

      const frameWidth = sprite.width / meta.frames;
      ctx.drawImage(sprite, game.animation.frame * frameWidth, 0, frameWidth, sprite.height, game.cat.x - 10, game.cat.y - 15, 50, 50);
      return true;
    };

    const tick = (now: number) => {
      if (game.running) {
        game.speed += 0.001;
        game.distance += game.speed * 0.1;
        game.cat.vy += game.gravity;
        game.cat.y += game.cat.vy;
        if (game.cat.y >= game.groundY) { game.cat.y = game.groundY; game.cat.vy = 0; game.cat.onGround = true; }

        game.obstacleSpawn--;
        if (game.obstacleSpawn <= 0) {
          game.obstacles.push({ x: game.width, y: game.groundY + 10, w: 25, h: 25, type: "yarn" });
          game.obstacleSpawn = 100 + Math.random() * 50;
        }
        game.mouseSpawn--;
        if (game.mouseSpawn <= 0) {
          game.mice.push({ x: game.width, y: game.groundY - 40 - Math.random() * 40, w: 20, h: 20, caught: false });
          game.mouseSpawn = 150 + Math.random() * 100;
        }

        game.obstacles.forEach(o => o.x -= game.speed);
        game.mice.forEach(m => m.x -= game.speed + 1);
        game.obstacles = game.obstacles.filter(o => o.x > -50);
        game.mice = game.mice.filter(m => m.x > -50 && !m.caught);

        const catBox = { x: game.cat.x + 5, y: game.cat.y + 5, w: game.cat.w - 10, h: game.cat.h - 5 };
        game.obstacles.forEach(o => { if (overlap(catBox, o)) doGameOver(); });
        game.mice.forEach(m => { if (!m.caught && overlap(catBox, m)) { m.caught = true; game.score += 10; setScore(game.score); scoreRef.current = game.score; } });
        
        distanceRef.current = Math.floor(game.distance);
        if (distanceRef.current % 10 === 0) setDistance(distanceRef.current);
      }

      // DIBUJO
      ctx.clearRect(0, 0, game.width, game.height);
      const bg = ctx.createLinearGradient(0, 0, 0, game.height);
      bg.addColorStop(0, "#f0f9ff"); bg.addColorStop(1, "#dbeffd");
      ctx.fillStyle = bg; ctx.fillRect(0, 0, game.width, game.height);

      ctx.strokeStyle = "#7cb4d5"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(0, game.groundY + game.cat.h + 1); ctx.lineTo(game.width, game.groundY + game.cat.h + 1); ctx.stroke();

      game.obstacles.forEach(o => { ctx.fillStyle = "#ef4444"; ctx.beginPath(); ctx.arc(o.x + 12, o.y + 12, 12, 0, Math.PI * 2); ctx.fill(); });
      game.mice.forEach(m => { ctx.font = "18px serif"; ctx.fillText("🐭", m.x, m.y + 15); });

      const catDrawn = drawCat(game.running ? (game.cat.onGround ? "run" : "jump") : "fall", now);
      if (!catDrawn) { ctx.font = "20px serif"; ctx.fillText("🐱", game.cat.x, game.cat.y + 20); }

      // --- MARCADORES INCRUSTADOS ---
      if (game.started) {
        ctx.fillStyle = "rgba(0,0,0,0.7)";
        ctx.font = "bold 14px Arial";
        ctx.textAlign = "left";
        ctx.fillText(`✨ ${scoreRef.current}`, 15, 25); // Puntos arriba izq
        ctx.textAlign = "right";
        ctx.fillText(`${distanceRef.current} m`, game.width - 15, 25); // Metros arriba der
      }

      if (!game.started) {
        ctx.fillStyle = "rgba(0,0,0,0.3)"; ctx.fillRect(0, 0, game.width, game.height);
        ctx.fillStyle = "#fff"; ctx.textAlign = "center"; ctx.font = "bold 16px Arial";
        ctx.fillText("Toca para jugar", game.width / 2, game.height / 2);
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    controlsRef.current = { start: () => resetGame(), restart: () => resetGame() };
    resizeGameCanvas();
    window.addEventListener("resize", resizeGameCanvas);
    const handleKey = (e: KeyboardEvent) => { if (e.code === "Space" || e.code === "ArrowUp") { e.preventDefault(); jump(); } };
    window.addEventListener("keydown", handleKey);
    canvas.addEventListener("pointerdown", (e) => { e.preventDefault(); jump(); });

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resizeGameCanvas);
      window.removeEventListener("keydown", handleKey);
    };
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", maxWidth: "100%" }}>
      <div style={{ position: "relative", width: "100%", borderRadius: "12px", overflow: "hidden", border: "2px solid #d3e1e8" }}>
        <canvas
          ref={canvasRef}
          style={{ width: "100%", height: "180px", display: "block", background: "#fff", cursor: "pointer", touchAction: "none" }}
        />
        
        {/* Pantalla de Game Over superpuesta */}
        {gameOver && (
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#fff", zIndex: 10 }}>
            <p style={{ fontSize: "1.2rem", fontWeight: "bold", margin: "0 0 10px 0" }}>¡Vaya golpe! 🙀</p>
            <button 
              onClick={() => controlsRef.current.restart()}
              style={{ padding: "8px 20px", borderRadius: "20px", border: "none", background: "#ff4757", color: "#fff", fontWeight: "bold", cursor: "pointer" }}
            >
              Reintentar ↻
            </button>
          </div>
        )}

        {/* Botón inicial si no ha empezado */}
        {!started && (
          <div 
            onClick={() => controlsRef.current.start()}
            style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", zIndex: 5 }}
          >
            <button style={{ padding: "10px 25px", borderRadius: "25px", border: "none", background: "#2ed573", color: "#fff", fontWeight: "bold", fontSize: "1.1rem", boxShadow: "0 4px 15px rgba(0,0,0,0.2)" }}>
              ¡INICIAR JUEGO! 🐾
            </button>
          </div>
        )}
      </div>

      {/* Récords en formato compacto para móvil */}
      <div style={{ display: "flex", justifyContent: "space-around", padding: "5px", background: "#f8fafd", borderRadius: "8px", fontSize: "0.85rem", fontWeight: "bold", color: "#444" }}>
        <span>🏆 Mejor: {bestScore} pts</span>
        <span>🏁 Récord: {bestDistance} m</span>
      </div>
      
      {statusText && <p style={{ textAlign: "center", margin: 0, fontSize: "0.8rem", color: "#ff4757" }}>{statusText}</p>}
    </div>
  );
}
