import React from 'react';
import './Modal.css';

// Base Modal Component
export const Modal = ({ isOpen, onClose, title, children, showCloseButton = true }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          {showCloseButton && (
            <button className="modal-close" onClick={onClose}>
              ✕
            </button>
          )}
        </div>
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );
};

// Confirmation Modal
export const ConfirmationModal = ({ isOpen, onClose, title, message, onConfirm, confirmText = "Done" }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} showCloseButton={true}>
      <div className="confirmation-modal">
        <p className="confirmation-message">{message}</p>
        <div className="confirmation-actions">
          <button className="btn-confirm" onClick={() => { onConfirm(); onClose(); }}>
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};

// Delete Confirmation Modal
export const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete Profile" showCloseButton={true}>
      <div className="confirmation-modal">
        <p className="confirmation-message">
          Are you sure you want to delete this profile.
        </p>
        <div className="delete-confirmation-actions">
          <button className="btn-no" onClick={onClose}>
            No
          </button>
          <button className="btn-yes" onClick={() => { onConfirm(); onClose(); }}>
            Yes
          </button>
        </div>
      </div>
    </Modal>
  );
};

// Image Upload Modal
export const ImageUploadModal = ({ isOpen, onClose, onUpload, currentImage }) => {
  const [selectedFile, setSelectedFile] = React.useState(null);
  const [previewUrl, setPreviewUrl] = React.useState(currentImage || null);
  const fileInputRef = React.useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.size <= 5 * 1024 * 1024) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      alert("File size must be less than 5MB");
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.size <= 5 * 1024 * 1024) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      onUpload(selectedFile);
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Select a Profile Picture" showCloseButton={true}>
      <div className="image-upload-modal">
        <div 
          className="drop-zone"
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => fileInputRef.current?.click()}
        >
          {previewUrl ? (
            <img src={previewUrl} alt="Preview" className="preview-image" />
          ) : (
            <div className="drop-zone-content">
              <p>Drop file here or Click below!</p>
              <button className="btn-upload-select" type="button">Upload</button>
              <p className="file-size-limit">You can upload files up to 5 mb</p>
            </div>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
        <button className="btn-add-image" onClick={handleUpload} disabled={!selectedFile}>
          Add
        </button>
      </div>
    </Modal>
  );
};

export default Modal;