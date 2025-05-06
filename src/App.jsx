import { useState, useRef, useEffect } from 'react'
import DropZone from './components/DropZone'

function App() {
  const [imgUrl, setImgUrl] = useState("");
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
            x: x + sx,
            y: y + sy,
            ox: x + sx,
            oy: y + sy,
            vx: 0,
            vy: 0,
            color: `rgba(${r},${g},${b},${a / 255})`,
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
    const ease = 0.1;

    const draw = () => {
      const mouse = mouseRef.current;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 마우스 움직임에 반발발
      for (let p of particles) {
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < repelRadius) {
          const angle = Math.atan2(dy, dx);
          const force = (1 - dist / repelRadius) * repelForce;
          p.vx += Math.cos(angle) * force;
          p.vy += Math.sin(angle) * force;
        }

        // const ox = p.ox - p.x;
        // const oy = p.oy - p.y;
        // p.vx += ox * ease;
        // p.vy += oy * ease;

        p.vx *= 0.85;
        p.vy *= 0.85;

        p.x += p.vx;
        p.y += p.vy;

        // ctx.fillStyle = p.color;
        // ctx.fillRect(p.x, p.y, PARTICLE_SIZE, PARTICLE_SIZE);
      }

      //입자끼리 밀쳐내기
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
    
            // 서로 반으로 밀어내기
            a.x -= Math.cos(angle) * overlap;
            a.y -= Math.sin(angle) * overlap;
            b.x += Math.cos(angle) * overlap;
            b.y += Math.sin(angle) * overlap;
    
            // 속도 교환 (탄성 효과)
            [a.vx, b.vx] = [b.vx, a.vx];
            [a.vy, b.vy] = [b.vy, a.vy];
          }
        }
      }

      for (let p of particles) {
        p.vx *= 0.85;
        p.vy *= 0.85;
        p.x += p.vx;
        p.y += p.vy;
    
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, PARTICLE_SIZE, PARTICLE_SIZE);
      }

      requestAnimationFrame(draw);
    };

    

    draw();
  };


  return (
      <main>
        {imgUrl && (
        <img
          src={imgUrl}
          ref={imgRef}
          onLoad={handleImageLoad}
          style={{ display: "none" }}
          alt="source"
        />
      )}
        <canvas ref={canvasRef}/>
        <DropZone setImgUrl={setImgUrl}/>
      </main>
  )
}

export default App
