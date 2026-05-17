import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";

export default function ImageCropper({ image, onClose, onSave }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedArea, setCroppedArea] = useState(null);

  const onCropComplete = useCallback((_, croppedAreaPixels) => {
    setCroppedArea(croppedAreaPixels);
  }, []);

  // 🔥 Convert cropped image
  const createImage = (url) =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.src = url;
      img.onload = () => resolve(img);
      img.onerror = reject;
    });

  const getCroppedImg = async () => {
    const img = await createImage(image);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = croppedArea.width;
    canvas.height = croppedArea.height;

    ctx.drawImage(
      img,
      croppedArea.x,
      croppedArea.y,
      croppedArea.width,
      croppedArea.height,
      0,
      0,
      croppedArea.width,
      croppedArea.height
    );

    return canvas.toDataURL("image/jpeg");
  };

  const handleSave = async () => {
    const croppedImage = await getCroppedImg();
    onSave(croppedImage);
  };

  return (
    <div className="crop-modal">
      <div className="crop-container">
        <div style={{ position: "relative", width: "100%", height: "300px" }}>
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            aspect={1}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>

        <div className="controls">
          <input
            type="range"
            min={1}
            max={3}
            step={0.1}
            value={zoom}
            onChange={(e) => setZoom(e.target.value)}
          />

          <div className="btn-group">
            <button onClick={onClose}>Cancel</button>
            <button onClick={handleSave}>Crop & Save</button>
          </div>
        </div>
      </div>
    </div>
  );
}