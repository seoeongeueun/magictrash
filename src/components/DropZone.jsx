import {useState, useRef, useEffect} from 'react';

export default function DropZone({setImgUrl, setStartXY, setStartDraw, startDraw}) {
    const [isDraggingOver, setIsDraggingOver] = useState(false);
    const [isReady, setIsReady] = useState(false);
    const trashRef = useRef();
    const TRASH_COUNT = 20;

    useEffect(() => {
        if (!trashRef.current || !setStartXY) return;
        const rect = trashRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        setStartXY({x: centerX, y: centerY - 20});
    }, []);
 
    const handleDragEnter = (e) => {
        e.preventDefault();
        setIsDraggingOver(true);
      };

    const handleDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith("image/")) {
            const url = URL.createObjectURL(file);
            setImgUrl(url);
            setIsReady(true);

            const last = document.getElementById(`trash-${TRASH_COUNT-1}`);
            if (last) {
                last.addEventListener("transitionend", handleTrashAnimation);
            }
        }
    };

    const handleTrashAnimation = () => {
        const t = setTimeout(() => {
            setIsReady(false);
            setIsDraggingOver(true);
            setStartDraw(true);
        }, 1000);

        return () => clearTimeout(t);
    }

    const handleDragOver = (e) => {
        e.preventDefault();
    }

    const handleDragLeave = (e) => {
        e.preventDefault();
        //setIsDraggingOver(false);
    }

    return (
        <section className='drop-area'>
            <div ref={trashRef} className={`trash-can ${isDraggingOver ? "drag-over" : ""} ${startDraw ? "open-right" : ""}`} onDragLeave={handleDragLeave} onDragEnter={handleDragEnter} onDrop={handleDrop} onDragOver={handleDragOver}>
                <div className='top'>
                    <div className='handle'/>
                    <div className='base'/>
                </div>
                <div className='body'>
                    <div className='junk'>
                        {[...Array(TRASH_COUNT)].map((_, i) => (
                            <div id={`trash-${i}`} key={i} className={`trash trash-${i} ${isReady ? "fade-in" : ""}`} />
                        ))}
                    </div>
                </div>
                <div className='name'>
                    <span>Recycle Bin</span>
                </div>
            </div>
        </section>
    )
}