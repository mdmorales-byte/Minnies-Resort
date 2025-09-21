const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Check if file is an image
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// In-memory storage for image metadata (in production, use database)
let imageMetadata = [];

// @route   POST /api/images/upload
// @desc    Upload image
// @access  Private (Admin)
router.post('/upload', authenticateToken, requireAdmin, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    const { category = 'general', description = '' } = req.body;

    const imageData = {
      id: Date.now().toString(),
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      category,
      description,
      uploadedBy: req.user.username,
      uploadedAt: new Date().toISOString(),
      url: `/api/images/serve/${req.file.filename}`
    };

    imageMetadata.push(imageData);

    res.status(201).json({
      success: true,
      message: 'Image uploaded successfully',
      image: imageData
    });

  } catch (error) {
    console.error('Upload image error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while uploading image'
    });
  }
});

// @route   GET /api/images
// @desc    Get all images
// @access  Private (Admin)
router.get('/', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { category, page = 1, limit = 20 } = req.query;
    
    let filteredImages = imageMetadata;
    
    if (category) {
      filteredImages = imageMetadata.filter(img => img.category === category);
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedImages = filteredImages.slice(startIndex, endIndex);

    res.json({
      success: true,
      images: paginatedImages,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(filteredImages.length / limit),
        totalImages: filteredImages.length,
        hasNext: endIndex < filteredImages.length,
        hasPrev: startIndex > 0
      }
    });

  } catch (error) {
    console.error('Get images error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching images'
    });
  }
});

// @route   GET /api/images/serve/:filename
// @desc    Serve image file
// @access  Public
router.get('/serve/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(uploadsDir, filename);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }

    // Set appropriate headers
    const ext = path.extname(filename).toLowerCase();
    const mimeTypes = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp'
    };

    const mimeType = mimeTypes[ext] || 'application/octet-stream';
    res.setHeader('Content-Type', mimeType);
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year

    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

  } catch (error) {
    console.error('Serve image error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while serving image'
    });
  }
});

// @route   PUT /api/images/:id
// @desc    Update image metadata
// @access  Private (Admin)
router.put('/:id', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const { category, description } = req.body;

    const imageIndex = imageMetadata.findIndex(img => img.id === id);
    if (imageIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }

    // Update metadata
    if (category) imageMetadata[imageIndex].category = category;
    if (description !== undefined) imageMetadata[imageIndex].description = description;
    imageMetadata[imageIndex].updatedAt = new Date().toISOString();

    res.json({
      success: true,
      message: 'Image updated successfully',
      image: imageMetadata[imageIndex]
    });

  } catch (error) {
    console.error('Update image error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating image'
    });
  }
});

// @route   DELETE /api/images/:id
// @desc    Delete image
// @access  Private (Admin)
router.delete('/:id', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { id } = req.params;

    const imageIndex = imageMetadata.findIndex(img => img.id === id);
    if (imageIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }

    const image = imageMetadata[imageIndex];
    const filePath = path.join(uploadsDir, image.filename);

    // Delete file from filesystem
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Remove from metadata
    imageMetadata.splice(imageIndex, 1);

    res.json({
      success: true,
      message: 'Image deleted successfully'
    });

  } catch (error) {
    console.error('Delete image error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting image'
    });
  }
});

// @route   DELETE /api/images
// @desc    Delete all images
// @access  Private (Admin)
router.delete('/', authenticateToken, requireAdmin, (req, res) => {
  try {
    // Delete all files
    imageMetadata.forEach(image => {
      const filePath = path.join(uploadsDir, image.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });

    // Clear metadata
    imageMetadata = [];

    res.json({
      success: true,
      message: 'All images deleted successfully'
    });

  } catch (error) {
    console.error('Delete all images error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting images'
    });
  }
});

// @route   GET /api/images/stats
// @desc    Get image statistics
// @access  Private (Admin)
router.get('/stats', authenticateToken, requireAdmin, (req, res) => {
  try {
    const totalImages = imageMetadata.length;
    const totalSize = imageMetadata.reduce((sum, img) => sum + img.size, 0);
    
    const categoryStats = imageMetadata.reduce((stats, img) => {
      stats[img.category] = (stats[img.category] || 0) + 1;
      return stats;
    }, {});

    res.json({
      success: true,
      stats: {
        totalImages,
        totalSize,
        averageSize: totalImages > 0 ? Math.round(totalSize / totalImages) : 0,
        categoryBreakdown: categoryStats
      }
    });

  } catch (error) {
    console.error('Get image stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching image statistics'
    });
  }
});

module.exports = router;
