import {useState} from 'react';

export default function DropZone({setImgUrl}) {
    const [isDraggingOver, setIsDraggingOver] = useState(false);
    const [isReady, setIsReady] = useState(false);
 
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
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    }

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDraggingOver(false);
    }

    return (
        <section className='drop-area'>
            <div className={`trash-can ${isDraggingOver ? "drag-over" : ""}`} onDragLeave={handleDragLeave} onDragEnter={handleDragEnter} onDrop={handleDrop} onDragOver={handleDragOver}>
                <div className='top'>
                    <div className='handle'/>
                    <div className='base'/>
                </div>
                <div className='body'>
                    {isReady && <div className='junk'>
                        {[...Array(20)].map((_, i) => (
                            <div key={i} className={`trash trash-${i}`} />
                        ))}
                    </div>}
                </div>
                <div className='name'>
                    <span>Recycle Bin</span>
                </div>
            </div>
        </section>
    )
}