"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type SpriteMetrics = {
  frameWidth: number;
  frameHeight: number;
};

const TOTAL_RUN_FRAMES = 7;
const ANIMATION_SPEED_MS = 100;
const HORIZONTAL_SPEED = 4.2;

export default function GatoRunnerPage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isReady, setIsReady] = useState(false);

  const jumpRequestedRef = useRef(false);
  const movementRef = useRef({
    left: false,
    right: false,
  });

  const requestJump = useCallback(() => {
    jumpRequestedRef.current = true;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    let rafId = 0;
    let isDisposed = false;

    const sprite = new Image();
    sprite.src = "/assets/gato_runner_new.png";

    const spriteMetrics: SpriteMetrics = {
      frameWidth: 0,
      frameHeight: 0,
    };

    const game = {
      gravity: 0.85,
      jumpStrength: -13,
      floorY: 230,
      cat: {
        x: 130,
        y: 230,
        velocityY: 0,
        velocityX: 0,
        onGround: true,
      },
      animation: {
        frame: 0,
        lastFrameAt: 0,
      },
      cloudOffset: 0,
    };

    const resize = () => {
      const ratio = window.devicePixelRatio || 1;
      const width = 960;
      const height = 300;

      canvas.width = Math.floor(width * ratio);
      canvas.height = Math.floor(height * ratio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      context.imageSmoothingEnabled = false;
    };

    const drawBackground = () => {
      context.fillStyle = "#f7efe2";
      context.fillRect(0, 0, 960, 300);

      context.fillStyle = "#f2d9a9";
      context.fillRect(0, game.floorY + 14, 960, 300 - game.floorY - 14);

      context.strokeStyle = "#e7c58c";
      context.lineWidth = 2;
      context.beginPath();
      context.moveTo(0, game.floorY + 14);
      context.lineTo(960, game.floorY + 14);
      context.stroke();

      context.fillStyle = "rgba(255,255,255,0.65)";
      for (let i = 0; i < 4; i += 1) {
        const x = ((i * 260 - game.cloudOffset) % 1180) - 180;
        context.fillRect(x, 40 + i * 18, 140, 26);
      }
    };

    const updatePhysics = () => {
      const horizontalInput =
        Number(movementRef.current.right) - Number(movementRef.current.left);
      game.cat.velocityX = horizontalInput * HORIZONTAL_SPEED;

      if (jumpRequestedRef.current && game.cat.onGround) {
        game.cat.velocityY = game.jumpStrength;
        game.cat.onGround = false;
      }
      jumpRequestedRef.current = false;

      game.cat.x += game.cat.velocityX;
      game.cat.velocityY += game.gravity;
      game.cat.y += game.cat.velocityY;

      const minX = 50;
      const maxX = 910;
      game.cat.x = Math.max(minX, Math.min(maxX, game.cat.x));

      if (game.cat.y >= game.floorY) {
        game.cat.y = game.floorY;
        game.cat.velocityY = 0;
        game.cat.onGround = true;
      }

      game.cloudOffset += 1.2;
    };

    const updateAnimationFrame = (time: number) => {
      if (game.animation.lastFrameAt === 0) {
        game.animation.lastFrameAt = time;
      }

      if (time - game.animation.lastFrameAt >= ANIMATION_SPEED_MS) {
        game.animation.frame = (game.animation.frame + 1) % TOTAL_RUN_FRAMES;
        game.animation.lastFrameAt = time;
      }
    };

    const drawCat = () => {
      if (!spriteMetrics.frameWidth || !spriteMetrics.frameHeight) return;

      const sourceX = game.animation.frame * spriteMetrics.frameWidth;
      const sourceY = 0;

      const renderScale = 2.9;
      const drawWidth = spriteMetrics.frameWidth * renderScale;
      const drawHeight = spriteMetrics.frameHeight * renderScale;

      // Centrado exacto: el punto lógico del gato es su centro horizontal y su base en el suelo.
      const drawX = game.cat.x - drawWidth / 2;
      const drawY = game.cat.y - drawHeight;

      context.drawImage(
        sprite,
        sourceX,
        sourceY,
        spriteMetrics.frameWidth,
        spriteMetrics.frameHeight,
        drawX,
        drawY,
        drawWidth,
        drawHeight,
      );
    };

    const render = (time: number) => {
      if (isDisposed) return;

      updatePhysics();
      updateAnimationFrame(time);

      context.clearRect(0, 0, 960, 300);
      drawBackground();
      drawCat();

      rafId = window.requestAnimationFrame(render);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code === "Space" || event.code === "ArrowUp") {
        event.preventDefault();
        requestJump();
        return;
      }

      if (event.code === "ArrowLeft" || event.code === "KeyA") {
        movementRef.current.left = true;
      }

      if (event.code === "ArrowRight" || event.code === "KeyD") {
        movementRef.current.right = true;
      }
    };

    const onKeyUp = (event: KeyboardEvent) => {
      if (event.code === "ArrowLeft" || event.code === "KeyA") {
        movementRef.current.left = false;
      }

      if (event.code === "ArrowRight" || event.code === "KeyD") {
        movementRef.current.right = false;
      }
    };

    const onPointerDown = () => {
      requestJump();
    };

    sprite.onload = () => {
      // Cálculo dinámico obligatorio para una tira horizontal de 7 frames.
      spriteMetrics.frameWidth = sprite.width / TOTAL_RUN_FRAMES;
      spriteMetrics.frameHeight = sprite.height;

      resize();
      setIsReady(true);

      window.addEventListener("resize", resize);
      window.addEventListener("keydown", onKeyDown);
      window.addEventListener("keyup", onKeyUp);
      canvas.addEventListener("pointerdown", onPointerDown);

      rafId = window.requestAnimationFrame(render);
    };

    sprite.onerror = () => {
      setIsReady(false);
    };

    return () => {
      isDisposed = true;
      window.cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      canvas.removeEventListener("pointerdown", onPointerDown);
    };
  }, [requestJump]);

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        gap: 12,
        padding: "24px 12px",
        background: "#f5e6c8",
      }}
    >
      <h1 style={{ margin: 0 }}>Gato Runner</h1>
      <p style={{ margin: 0, textAlign: "center" }}>
        Muévete con <strong>← →</strong> / <strong>A D</strong> y salta con{" "}
        <strong>Espacio</strong> o <strong>↑</strong>.
      </p>

      <canvas
        ref={canvasRef}
        width={960}
        height={300}
        style={{
          border: "3px solid #8f5a2d",
          borderRadius: 12,
          background: "#f7efe2",
          maxWidth: "100%",
          height: "auto",
          touchAction: "manipulation",
          boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
        }}
        aria-label="Juego Gato Runner"
        role="img"
      />

      {!isReady && (
        <p style={{ margin: 0, color: "#7a2e00", fontWeight: 700 }}>
          Cargando sprite en /assets/gato_runner_new.png...
        </p>
      )}
    </main>
  );
}
