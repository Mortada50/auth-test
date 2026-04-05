import { useState, useRef } from "react";

export default function FileUpload({
  label,
  hint,
  accept,
  onChange,
  error,
  uploading,
  progress,
}) {
  const [preview, setPreview] = useState(null);
  const [fileName, setFileName] = useState(null);
  const [fileSize, setFileSize] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef();

  const handleFile = (file) => {
    if (!file) return;
    setFileName(file.name);
    setFileSize((file.size / 1024).toFixed(0) + " KB");
    if (file.type.startsWith("image/")) {
      setPreview(URL.createObjectURL(file));
    } else {
      setPreview("pdf");
    }
    onChange(file);
  };

  const handleChange = (e) => handleFile(e.target.files[0]);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleRemove = () => {
    setPreview(null);
    setFileName(null);
    inputRef.current.value = "";
    onChange(null);
  };

  return (
    <div className="form-group">
      <label className="form-label">
        {label} <span className="required">*</span>
      </label>

      {!fileName ? (
        <div
          className={`upload-area ${dragOver ? "drag-over" : ""}`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}>
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            onChange={handleChange}
          />
          <div className="upload-icon">📎</div>
          <div className="upload-text">
            <strong>اضغط للرفع</strong> أو اسحب الملف هنا
          </div>
          <div className="upload-hint">{hint}</div>
        </div>
      ) : (
        <div>
          <div className="upload-preview">
            <span className="preview-icon">
              {preview === "pdf" ? "📄" : "🖼️"}
            </span>
            <div className="preview-info">
              <div className="preview-name">{fileName}</div>
              <div className="preview-size">{fileSize}</div>
            </div>
            {!uploading && (
              <button
                type="button"
                className="preview-remove"
                onClick={handleRemove}>
                ✕
              </button>
            )}
          </div>

          {uploading && (
            <div className="upload-progress">
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {error && <div className="form-error">⚠️ {error}</div>}
    </div>
  );
}
