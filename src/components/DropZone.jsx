import {useState} from 'react';

export default function DropZone() {
    const [imageUrl, setImageUrl] = useState();

    const handleDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith("image/")) {
            const url = URL.createObjectURL(file);
            setImageUrl(url);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    }

    return (
        <section className='drop-area' onDrop={handleDrop} onDragOver={handleDragOver}>
            {imageUrl ? <img src={imageUrl} alt="uploaded image" className='main-image'/> : <p>이미지 드랍</p>}
        </section>
    )
}