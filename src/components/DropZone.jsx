import {useState, useRef, useEffect} from 'react';

export default function DropZone({setImgUrl, setStartXY, setStartDraw, startDraw}) {
    const [isDragging, setIsDragging] = useState(false);
    const [isReady, setIsReady] = useState(false);
    const trashRef = useRef();
    const TRASH_COUNT = 20;

    useEffect(() => {
        const handleDragOver = (e) => {
            e.preventDefault();
      
            const { clientX, clientY } = e;

            const trashRect = trashRef.current?.getBoundingClientRect();
            if (!trashRect) return;

            const centerX = trashRect.left + trashRect.width / 2;
            const centerY = trashRect.top + trashRect.height / 2;
            setStartXY({x: centerX, y: centerY - 20});
      
            const isInside =
                clientX >= trashRect.left &&
                clientX <= trashRect.right &&
                clientY >= trashRect.top &&
                clientY <= trashRect.bottom;
      
            setIsDragging(isInside);
        };
      
        document.addEventListener("dragover", handleDragOver);
        return () => {
            document.removeEventListener("dragover", handleDragOver);
        };
      }, []);
 
    const handleDragEnter = (e) => {
        e.preventDefault();
        //setIsDraggingOver(true);
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
            setIsDragging(false);
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
        <section className='icons'>
            <div ref={trashRef} className={`icon trash-can ${isDragging ? "drag" : ""} ${startDraw ? "open-right" : ""}`} onDragLeave={handleDragLeave} onDragEnter={handleDragEnter} onDrop={handleDrop} onDragOver={handleDragOver}>
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
                    <img alt="recycle sign" src="/src/assets/recycling_icon.svg"></img>
                </div>
                <div className='name'>
                    <span>Recycle Bin</span>
                </div>
            </div>
            <div className='icon ccc'>
                <img alt="ccc icon" src="/src/assets/ccclogo.jpg"></img>
                <div className='shortcut'></div>
                <div className='name'>
                    <span>ccc.kr</span>
                </div>
            </div>
        </section>
    )
}