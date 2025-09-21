import React, { useState, useEffect } from 'react';
// Mock image management system - uses localStorage

const ResortImageManager = ({ onBackToDashboard }) => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Load images from API
  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    let authData = {};
    let token = null;
    
    try {
      setLoading(true);
      setError('');
      
      // Get auth token from localStorage
      authData = JSON.parse(localStorage.getItem('authData') || '{}');
      token = authData.token;
      
      // For demo purposes, use mock data instead of API calls
      // This prevents the "Failed to fetch" errors since there's no backend
      setImages([
        {
          id: 1,
          original_name: 'resort-pool.jpg',
          description: 'Beautiful resort swimming pool',
          category: 'facilities',
          file_size: 2048576,
          is_hero: true,
          url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&h=300&fit=crop',
          created_at: new Date().toISOString()
        },
        {
          id: 2,
          original_name: 'cottage-view.jpg',
          description: 'Cozy cottage with garden view',
          category: 'accommodation',
          file_size: 1536000,
          is_hero: false,
          url: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&h=300&fit=crop',
          created_at: new Date().toISOString()
        },
        {
          id: 3,
          original_name: 'dining-area.jpg',
          description: 'Outdoor dining area',
          category: 'dining',
          file_size: 1843200,
          is_hero: false,
          url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=300&fit=crop',
          created_at: new Date().toISOString()
        }
      ]);
      
      // Clear any previous errors if successful
      setError('');
    } catch (error) {
      console.error('Error fetching images:', error);
      console.error('Error details:', {
        message: error.message,
        token: token ? 'Token exists' : 'No token',
        authData: authData
      });
      setError(`Failed to load images: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

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

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = async (files) => {
    setUploading(true);
    setError('');
    setSuccess('');

    try {
      for (let file of files) {
        if (!file.type.startsWith('image/')) {
          setError('Please select only image files.');
          continue;
        }

        if (file.size > 5 * 1024 * 1024) {
          setError('File size must be less than 5MB.');
          continue;
        }

        // Simulate upload delay for demo purposes
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Create a mock uploaded image object
        const newImage = {
          id: Date.now() + Math.random(),
          original_name: file.name,
          description: 'Uploaded image',
          category: 'gallery',
          file_size: file.size,
          is_hero: false,
          url: URL.createObjectURL(file),
          created_at: new Date().toISOString()
        };
        
        // Add to existing images
        setImages(prevImages => [...prevImages, newImage]);
      }

      setSuccess('Images uploaded successfully! (Demo mode - images are stored locally)');
    } catch (error) {
      console.error('Upload error:', error);
      setError(error.message || 'Failed to upload images. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const updateImage = async (id, updates) => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update image in local state
      setImages(prevImages => 
        prevImages.map(img => 
          img.id === id ? { ...img, ...updates } : img
        )
      );

      setSuccess('Image updated successfully! (Demo mode)');
      setShowModal(false);
      setSelectedImage(null);
    } catch (error) {
      console.error('Update error:', error);
      setError(error.message || 'Failed to update image. Please try again.');
    }
  };

  const deleteImage = async (id) => {
    if (!window.confirm('Are you sure you want to delete this image? This action cannot be undone.')) {
      return;
    }

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Remove image from local state
      setImages(prevImages => prevImages.filter(img => img.id !== id));

      setSuccess('Image deleted successfully! (Demo mode)');
      setShowModal(false);
      setSelectedImage(null);
    } catch (error) {
      console.error('Delete error:', error);
      setError(error.message || 'Failed to delete image. Please try again.');
    }
  };

  const toggleHero = async (id, isHero) => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update hero status in local state
      setImages(prevImages => 
        prevImages.map(img => 
          img.id === id ? { ...img, is_hero: !isHero } : img
        )
      );

      setSuccess(`Image ${!isHero ? 'set as' : 'removed from'} hero images! (Demo mode)`);
    } catch (error) {
      console.error('Hero toggle error:', error);
      setError(error.message || 'Failed to update hero status. Please try again.');
    }
  };

  const openImageModal = (image) => {
    setSelectedImage(image);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedImage(null);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="resort-image-manager">
      {/* Header */}
      <div className="admin-header-bar">
        <div className="header-content">
          <div className="header-left">
            <h1>
              <i className="fas fa-images"></i>
              Resort Image Manager
            </h1>
            <p>Upload and manage resort images</p>
          </div>
          <div className="header-right">
            {onBackToDashboard && (
              <button 
                onClick={onBackToDashboard}
                style={{
                  background: '#6b7280',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  marginRight: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <i className="fas fa-arrow-left"></i>
                Back to Dashboard
              </button>
            )}
            <button 
              className="btn-refresh"
              onClick={fetchImages}
              disabled={loading}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                padding: '0.75rem 1.5rem',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <i className={`fas fa-sync-alt ${loading ? 'fa-spin' : ''}`}></i>
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Upload Area */}
      <div className="upload-section" style={{
        background: 'white',
        padding: '2rem',
        marginBottom: '2rem',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
      }}>
        <h2 style={{ marginBottom: '1.5rem', color: '#2c3e50' }}>Upload Images</h2>
        
        <div
          className={`upload-area ${dragActive ? 'drag-active' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          style={{
            border: `2px dashed ${dragActive ? '#4a7c59' : '#e2e8f0'}`,
            borderRadius: '12px',
            padding: '3rem',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            background: dragActive ? '#f8f9fa' : 'white'
          }}
        >
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileInput}
            style={{ display: 'none' }}
            id="file-input"
          />
          <label htmlFor="file-input" style={{ cursor: 'pointer' }}>
            <i className="fas fa-cloud-upload-alt" style={{
              fontSize: '3rem',
              color: dragActive ? '#4a7c59' : '#9ca3af',
              marginBottom: '1rem',
              display: 'block'
            }}></i>
            <h3 style={{ color: '#2c3e50', marginBottom: '0.5rem' }}>
              {dragActive ? 'Drop images here' : 'Click to upload or drag and drop'}
            </h3>
            <p style={{ color: '#5a5a5a', marginBottom: '1rem' }}>
              PNG, JPG, GIF up to 5MB each
            </p>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('file-input').click();
              }}
              style={{
                background: '#4a7c59',
                color: 'white',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              Choose Files
            </button>
          </label>
        </div>

        {uploading && (
          <div style={{
            marginTop: '1rem',
            textAlign: 'center',
            color: '#4a7c59'
          }}>
            <i className="fas fa-spinner fa-spin" style={{ marginRight: '0.5rem' }}></i>
            Uploading images...
          </div>
        )}
      </div>

      {/* Messages */}
      {error && (
        <div style={{
          background: '#fed7d7',
          color: '#c53030',
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <i className="fas fa-exclamation-triangle"></i>
          {error}
        </div>
      )}

      {success && (
        <div style={{
          background: '#d4edda',
          color: '#155724',
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <i className="fas fa-check-circle"></i>
          {success}
        </div>
      )}

      {/* Images Grid */}
      <div className="images-section" style={{
        background: 'white',
        padding: '2rem',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
      }}>
        <h2 style={{ marginBottom: '1.5rem', color: '#2c3e50' }}>
          Resort Images ({images.length})
        </h2>

        {loading ? (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '4rem',
            color: '#5a5a5a'
          }}>
            <i className="fas fa-spinner fa-spin" style={{ marginRight: '1rem' }}></i>
            Loading images...
          </div>
        ) : images.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '4rem',
            color: '#5a5a5a'
          }}>
            <i className="fas fa-images" style={{ fontSize: '3rem', marginBottom: '1rem' }}></i>
            <h3>No images uploaded yet</h3>
            <p>Upload some images to get started</p>
          </div>
        ) : (
          <div className="images-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
            gap: '1.5rem'
          }}>
            {images.map((image) => (
              <div key={image.id} className="image-card" style={{
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                overflow: 'hidden',
                transition: 'all 0.2s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)'}
              onMouseLeave={(e) => e.target.style.boxShadow = 'none'}
              onClick={() => openImageModal(image)}
              >
                <div style={{ position: 'relative' }}>
                  <img
                    src={image.url}
                    alt={image.description || image.original_name}
                    style={{
                      width: '100%',
                      height: '200px',
                      objectFit: 'cover'
                    }}
                  />
                  {image.is_hero && (
                    <div style={{
                      position: 'absolute',
                      top: '0.5rem',
                      right: '0.5rem',
                      background: '#ff9800',
                      color: 'white',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '12px',
                      fontSize: '0.8rem',
                      fontWeight: '600'
                    }}>
                      HERO
                    </div>
                  )}
                </div>
                <div style={{ padding: '1rem' }}>
                  <h4 style={{
                    margin: '0 0 0.5rem 0',
                    color: '#2c3e50',
                    fontSize: '1rem',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {image.original_name}
                  </h4>
                  <p style={{
                    margin: '0 0 0.5rem 0',
                    color: '#5a5a5a',
                    fontSize: '0.9rem',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {image.description || 'No description'}
                  </p>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '0.8rem',
                    color: '#5a5a5a'
                  }}>
                    <span>{image.category}</span>
                    <span>{formatFileSize(image.file_size)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Image Details Modal */}
      {showModal && selectedImage && (
        <div className="modal-overlay" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '2rem'
        }}>
          <div className="modal-content" style={{
            background: 'white',
            borderRadius: '12px',
            padding: '2rem',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '2rem',
              paddingBottom: '1rem',
              borderBottom: '2px solid #e2e8f0'
            }}>
              <h2 style={{ margin: 0, color: '#2c3e50' }}>
                Image Details
              </h2>
              <button
                onClick={closeModal}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: '#5a5a5a'
                }}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div style={{ display: 'grid', gap: '1.5rem' }}>
              {/* Image Preview */}
              <div style={{ textAlign: 'center' }}>
                <img
                  src={selectedImage.url}
                  alt={selectedImage.description || selectedImage.original_name}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '300px',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                  }}
                />
              </div>

              {/* Image Information */}
              <div>
                <h3 style={{ color: '#2c3e50', marginBottom: '1rem' }}>Image Information</h3>
                <div style={{ display: 'grid', gap: '0.5rem' }}>
                  <div><strong>Filename:</strong> {selectedImage.original_name}</div>
                  <div><strong>Category:</strong> {selectedImage.category}</div>
                  <div><strong>Description:</strong> {selectedImage.description || 'No description'}</div>
                  <div><strong>File Size:</strong> {formatFileSize(selectedImage.file_size)}</div>
                  <div><strong>Uploaded:</strong> {formatDate(selectedImage.created_at)}</div>
                  <div><strong>Hero Image:</strong> {selectedImage.is_hero ? 'Yes' : 'No'}</div>
                </div>
              </div>

              {/* Actions */}
              <div style={{
                display: 'flex',
                gap: '1rem',
                paddingTop: '1rem',
                borderTop: '2px solid #e2e8f0'
              }}>
                <button
                  onClick={() => toggleHero(selectedImage.id, selectedImage.is_hero)}
                  style={{
                    background: selectedImage.is_hero ? '#ff9800' : '#4caf50',
                    color: 'white',
                    border: 'none',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    flex: 1
                  }}
                >
                  <i className="fas fa-star" style={{ marginRight: '0.5rem' }}></i>
                  {selectedImage.is_hero ? 'Remove from Hero' : 'Set as Hero'}
                </button>

                <button
                  onClick={() => deleteImage(selectedImage.id)}
                  style={{
                    background: '#f44336',
                    color: 'white',
                    border: 'none',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    flex: 1
                  }}
                >
                  <i className="fas fa-trash" style={{ marginRight: '0.5rem' }}></i>
                  Delete Image
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResortImageManager;