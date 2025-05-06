import { useState, useRef, useEffect } from 'react'
import DropZone from './components/DropZone'

function App() {
  const [imgUrl, setImgUrl] = useState("");
  const [isImageReady, setIsImageReady] = useState(false);
  const [startDraw, setStartDraw] = useState(false);
  const [startXY, setStartXY] = useState({x: 0, y: 0}); //픽셀이 등장할 위치
  const canvasRef = useRef();
  const imgRef = useRef();
  const particlesRef = useRef([]);
  const mouseRef = useRef({ x: 0, y: 0 });

  const PARTICLE_SIZE = 20;

  useEffect(() => {
    const handleMouseMove = (e) => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    if (startDraw && isImageReady) {
      handleImageLoad();
    }
  }, [startDraw, isImageReady])

  // 이미지가 로드되었을 때 캔버스에 그리기
  const handleImageLoad = () => {
    const img = imgRef.current;
    const canvas = canvasRef.current;
    if (!img || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const particles = [];

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    //이미지는 캔버스의 절반 사이즈
    const targetWidth = canvas.width * 0.5;
    const aspectRatio = img.naturalHeight / img.naturalWidth;
    const targetHeight = targetWidth * aspectRatio;

    const offsetX = (canvas.width - targetWidth) / 2;
    const offsetY = (canvas.height - targetHeight) / 2;

    //각 픽셀에 부여할 랜덤 딜레이 맥스 값
    const delay = 1000;

    // 중앙에 이미지 그리기
    ctx.drawImage(img, offsetX, offsetY, targetWidth, targetHeight);
    
    const sx = Math.floor(offsetX);
    const sy = Math.floor(offsetY);
    const sw = Math.floor(targetWidth);
    const sh = Math.floor(targetHeight);

    //이미지를 그린 영역 픽셀 추출
    const imageData = ctx.getImageData(sx, sy, sw, sh).data;

    //픽셀 분해
    for (let y = 0; y < sh; y += PARTICLE_SIZE) {
      for (let x = 0; x < sw; x += PARTICLE_SIZE) {
        const i = (y * sw + x) * 4;
        const r = imageData[i];
        const g = imageData[i + 1];
        const b = imageData[i + 2];
        const a = imageData[i + 3];

        if (a > 0) {
          particles.push({
            x: startXY.x,
            y: startXY.y,
            ox: x + sx,
            oy: y + sy,
            vx: 0,
            vy: 0,
            color: `rgba(${r},${g},${b},${a / 255})`,
            delay: Math.random() * delay,
          });
        }
      }
    }

    particlesRef.current = particles;
    animate();
  };

  const animate = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx || !canvas) return;

    const particles = particlesRef.current;
    const repelRadius = 50; //밀어내는 원의 크기
    const repelForce = 20;

    let isEntering = true; //시작 등장 애니메이션을 위한 플래그
    let isEnteringDone = false;
    let enteredCount = 0;

    const enterDuration = 1000; // 1초간 (0,0)에서 자기 자리로 이동
    const enterStart = performance.now();

    const draw = (timestamp) => {
      const mouse = mouseRef.current;
      const elapsed = timestamp - enterStart;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 마우스 움직임에 반발
      for (let p of particles) {
        if (isEntering) {
          const t = Math.min((elapsed - p.delay) / enterDuration, 1);

          if (t < 0) {
            // 아직 시작 안 된 입자는 시작 위치에 고정
            p.x = startXY.x;
            p.y = startXY.y;
            ctx.fillStyle = p.color;
            ctx.fillRect(p.x, p.y, PARTICLE_SIZE, PARTICLE_SIZE);
            continue;
          }

          const clamped = Math.min(t, 1);
          const ease = clamped * clamped * (3 - 2 * clamped);
          p.x = startXY.x + (p.ox - startXY.x) * ease;
          p.y = startXY.y + (p.oy - startXY.y) * ease;

          if (clamped >= 1 && !p.hasEntered) {
            p.hasEntered = true;
            enteredCount++;
          }
        } else {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < repelRadius) {
            const angle = Math.atan2(dy, dx);
            const force = (1 - dist / repelRadius) * repelForce;
            p.vx += Math.cos(angle) * force;
            p.vy += Math.sin(angle) * force;
          }

          p.vx *= 0.85;
          p.vy *= 0.85;
          p.x += p.vx;
          p.y += p.vy;
        }

        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, PARTICLE_SIZE, PARTICLE_SIZE);
      }

      // 모든 입자가 자리 도착했는지 검사
      if (isEntering && enteredCount === particles.length) {
        isEntering = false;
        isEnteringDone = true;
      }      

      if (isEnteringDone) {
        // 충돌 처리
        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const a = particles[i];
            const b = particles[j];
            const dx = b.x - a.x;
            const dy = b.y - a.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const minDist = PARTICLE_SIZE;

            if (dist < minDist && dist > 0) {
              const overlap = (minDist - dist) / 2;
              const angle = Math.atan2(dy, dx);

              a.x -= Math.cos(angle) * overlap;
              a.y -= Math.sin(angle) * overlap;
              b.x += Math.cos(angle) * overlap;
              b.y += Math.sin(angle) * overlap;

              [a.vx, b.vx] = [b.vx, a.vx];
              [a.vy, b.vy] = [b.vy, a.vy];
            }
          }
        }
      }
      requestAnimationFrame(draw);
    };

    requestAnimationFrame(draw);
  };


  return (
      <main>
        {imgUrl && (
        <img
          onLoad={() => setIsImageReady(true)}
          src={imgUrl}
          ref={imgRef}
          style={{ display: "none" }}
          alt="source"
        />
      )}
        <canvas ref={canvasRef}/>
        <DropZone setImgUrl={setImgUrl} setStartXY={setStartXY} startDraw={startDraw} setStartDraw={setStartDraw}/>
      </main>
  )
}

export default App
