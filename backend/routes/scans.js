const express  = require('express');
const multer   = require('multer');
const path     = require('path');
const fs       = require('fs');
const Scan     = require('../models/Scan');
const protect  = require('../middleware/auth');

const router = express.Router();

// Flask model server URL
const MODEL_API = process.env.MODEL_API_URL || 'http://localhost:8000';

// Multer disk storage
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename:    (_req, file, cb) => {
    const ext  = path.extname(file.originalname);
    const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, name);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) return cb(new Error('Only image files are allowed.'));
    cb(null, true);
  },
});

// Call Flask YOLO model
async function runYoloDetection(base64Image) {
  const response = await fetch(`${MODEL_API}/predict`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ image: base64Image }),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || 'Model server error');
  }
  return response.json();
}

// POST /api/scans
router.post('/', protect, upload.single('image'), async (req, res) => {
  try {
    const { plantName, notes, imageData } = req.body;
    if (!plantName) return res.status(400).json({ error: 'plantName is required.' });

    let base64Image = null;
    let imageUrl    = null;

    if (req.file) {
      const fileBuffer = fs.readFileSync(req.file.path);
      base64Image = `data:${req.file.mimetype};base64,${fileBuffer.toString('base64')}`;
      imageUrl    = `/uploads/${req.file.filename}`;
    } else if (imageData) {
      base64Image = imageData;
    } else {
      return res.status(400).json({ error: 'No image provided.' });
    }

    let label, displayName, isHealthy, confidence, severity, description, treatment;
    try {
      const result = await runYoloDetection(base64Image);
      label       = result.label;
      displayName = result.displayName || '';
      isHealthy   = result.isHealthy;
      confidence  = result.confidence;
      severity    = result.severity    || '';
      description = result.description || '';
      treatment   = result.treatment   || [];
    } catch (modelErr) {
      console.error('Model API error:', modelErr.message);
      return res.status(502).json({ error: `Detection failed: ${modelErr.message}. Is the Python model server running on port 8000?` });
    }

    const scan = await Scan.create({
      userId:      req.user._id,
      userName:    req.user.name,
      plantName:   'Rice',
      notes:       notes || '',
      imageUrl,
      imageData:   imageUrl ? null : base64Image,
      displayName,
      severity,
      description,
      treatment,
      label,
      isHealthy,
      confidence,
    });

    res.status(201).json({ message: 'Scan saved.', scan });
  } catch (err) {
    console.error('Save scan error:', err);
    res.status(500).json({ error: 'Failed to save scan.' });
  }
});

// GET /api/scans
router.get('/', protect, async (req, res) => {
  try {
    const { filter, search, page = 1, limit = 50 } = req.query;
    const query = { userId: req.user._id };
    if (filter === 'healthy')  query.isHealthy = true;
    if (filter === 'diseased') query.isHealthy = false;
    if (search) { const re = new RegExp(search, 'i'); query.$or = [{ plantName: re }, { label: re }]; }
    const skip  = (Number(page) - 1) * Number(limit);
    const total = await Scan.countDocuments(query);
    const scans = await Scan.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).select('-__v');
    res.json({ total, page: Number(page), scans });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch scans.' });
  }
});

// DELETE /api/scans/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const scan = await Scan.findOne({ _id: req.params.id, userId: req.user._id });
    if (!scan) return res.status(404).json({ error: 'Scan not found.' });
    if (scan.imageUrl) { const fp = path.join(__dirname, '..', scan.imageUrl); if (fs.existsSync(fp)) fs.unlinkSync(fp); }
    await scan.deleteOne();
    res.json({ message: 'Scan deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete scan.' });
  }
});

// DELETE /api/scans
router.delete('/', protect, async (req, res) => {
  try {
    const scans = await Scan.find({ userId: req.user._id });
    for (const scan of scans) {
      if (scan.imageUrl) { const fp = path.join(__dirname, '..', scan.imageUrl); if (fs.existsSync(fp)) fs.unlinkSync(fp); }
    }
    await Scan.deleteMany({ userId: req.user._id });
    res.json({ message: 'All scans deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to clear scans.' });
  }
});

module.exports = router;
