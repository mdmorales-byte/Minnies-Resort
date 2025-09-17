import React, { useState, useEffect } from 'react';

const ResortImageManager = () => {
  const [images, setImages] = useState([]);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Load existing images from memory on component mount
  useEffect(() => {
    const savedImages = JSON.parse(localStorage.getItem('resortImages') || '[]');
    if (savedImages.length > 0) {
      setImages(savedImages);
      setUploadedImages(savedImages);
    }
  }, []);

  // Save images to localStorage whenever images change
  useEffect(() => {
    if (images.length > 0) {
      localStorage.setItem('resortImages', JSON.stringify(images));
    }
  }, [images]);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (files) => {
    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const newImage = {
            id: Date.now() + Math.random(),
            name: file.name,
            size: file.size,
            url: e.target.result,
            uploadDate: new Date().toISOString(),
            isHero: false,
            category: 'general'
          };
          
          setImages(prev => [...prev, newImage]);
          setUploadedImages(prev => [...prev, newImage]);
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const removeImage = (imageId) => {
    setImages(prev => prev.filter(img => img.id !== imageId));
    setUploadedImages(prev => prev.filter(img => img.id !== imageId));
  };

  const setAsHeroImage = (imageId) => {
    setImages(prev => prev.map(img => ({
      ...img,
      isHero: img.id === imageId
    })));
  };

  const updateImageCategory = (imageId, category) => {
    setImages(prev => prev.map(img => 
      img.id === imageId ? { ...img, category } : img
    ));
  };

  const clearAllImages = () => {
    if (window.confirm('Are you sure you want to remove all images? This action cannot be undone.')) {
      setImages([]);
      setUploadedImages([]);
      localStorage.removeItem('resortImages');
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const categories = [
    { value: 'general', label: 'General' },
    { value: 'rooms', label: 'Rooms' },
    { value: 'amenities', label: 'Amenities' },
    { value: 'dining', label: 'Dining' },
    { value: 'activities', label: 'Activities' },
    { value: 'exterior', label: 'Exterior' }
  ];

  return (
    <div className="image-manager">
      <div className="image-manager-header">
        <h2>
          <i className="fas fa-images"></i>
          Resort Image Management
        </h2>
        <p>Upload and manage resort images. Set hero images and organize by categories.</p>
      </div>

      {/* Upload Area */}
      <div className="upload-section">
        <div 
          className={`upload-dropzone ${dragActive ? 'drag-active' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="upload-content">
            <i className="fas fa-cloud-upload-alt upload-icon"></i>
            <h3>Drag & drop images here</h3>
            <p>or click to browse files</p>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleChange}
              className="file-input"
            />
            <div className="upload-info">
              <small>Supported formats: JPG, PNG, GIF, WebP (Max 10MB per file)</small>
            </div>
          </div>
        </div>
      </div>

      {/* Image Stats */}
      {images.length > 0 && (
        <div className="image-stats">
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-number">{images.length}</span>
              <span className="stat-label">Total Images</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{images.filter(img => img.isHero).length}</span>
              <span className="stat-label">Hero Images</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">
                {formatFileSize(images.reduce((total, img) => total + img.size, 0))}
              </span>
              <span className="stat-label">Total Size</span>
            </div>
          </div>
          <button 
            onClick={clearAllImages}
            className="btn btn-danger btn-clear-all"
          >
            <i className="fas fa-trash"></i>
            Clear All Images
          </button>
        </div>
      )}

      {/* Image Grid */}
      {images.length > 0 && (
        <div className="images-grid-section">
          <h3>Uploaded Images ({images.length})</h3>
          <div className="images-grid">
            {images.map((image, index) => (
              <div key={image.id} className={`image-card ${image.isHero ? 'hero-image' : ''}`}>
                <div className="image-preview">
                  <img 
                    src={image.url} 
                    alt={image.name}
                    onClick={() => setSelectedImageIndex(index)}
                  />
                  {image.isHero && (
                    <div className="hero-badge">
                      <i className="fas fa-star"></i>
                      Hero
                    </div>
                  )}
                </div>
                
                <div className="image-details">
                  <h4>{image.name}</h4>
                  <p>{formatFileSize(image.size)}</p>
                  <p>{new Date(image.uploadDate).toLocaleDateString()}</p>
                  
                  <div className="image-category">
                    <select
                      value={image.category}
                      onChange={(e) => updateImageCategory(image.id, e.target.value)}
                      className="category-select"
                    >
                      {categories.map(cat => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="image-actions">
                  <button
                    onClick={() => setAsHeroImage(image.id)}
                    className={`btn btn-small ${image.isHero ? 'btn-warning' : 'btn-primary'}`}
                    title={image.isHero ? 'Remove as Hero' : 'Set as Hero'}
                  >
                    <i className="fas fa-star"></i>
                  </button>
                  <button
                    onClick={() => removeImage(image.id)}
                    className="btn btn-small btn-danger"
                    title="Delete Image"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {images.length > 0 && selectedImageIndex !== null && (
        <div className="image-preview-modal" onClick={() => setSelectedImageIndex(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button 
              className="modal-close"
              onClick={() => setSelectedImageIndex(null)}
            >
              <i className="fas fa-times"></i>
            </button>
            {selectedImageIndex !== null && (
              <img 
                src={images[selectedImageIndex]?.url} 
                alt={images[selectedImageIndex]?.name}
                className="preview-image"
              />
            )}
          </div>
        </div>
      )}

      {/* Empty State */}
      {images.length === 0 && (
        <div className="empty-state">
          <i className="fas fa-image empty-icon"></i>
          <h3>No images uploaded yet</h3>
          <p>Start by uploading some beautiful resort images to showcase your property.</p>
        </div>
      )}
    </div>
  );
};

export default ResortImageManager;
