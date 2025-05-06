import { useState, useRef } from 'react'
import DropZone from './components/DropZone'

function App() {
  const [imgUrl, setImgUrl] = useState("");
  const canvasRef = useRef();
  const imgRef = useRef();

  const PARTICLE_SIZE = 10;

  // 이미지가 로드되었을 때 캔버스에 그리기
  const handleImageLoad = () => {
    const img = imgRef.current;
    const canvas = canvasRef.current;
    if (!img || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;

    ctx.drawImage(img, 0, 0);

    const { width, height } = canvas;
    const imageData = ctx.getImageData(0, 0, width, height).data;

    // 픽셀 분해
    for (let y = 0; y < height; y += PARTICLE_SIZE) {
      for (let x = 0; x < width; x += PARTICLE_SIZE) {
        const i = (y * width + x) * 4;
        const r = imageData[i];
        const g = imageData[i + 1];
        const b = imageData[i + 2];
        const a = imageData[i + 3];

        if (a > 0) {
          ctx.fillStyle = `rgba(${r},${g},${b},${a / 255})`;
          ctx.fillRect(x, y, PARTICLE_SIZE, PARTICLE_SIZE);
        }
      }
    }
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
