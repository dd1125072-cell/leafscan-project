const mongoose = require('mongoose');

const scanSchema = new mongoose.Schema(
  {
    userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    userName:    { type: String, required: true },
    plantName:   { type: String, required: [true, 'Plant name is required'], trim: true },
    notes:       { type: String, default: '' },
    imageUrl:    { type: String, default: null },
    imageData:   { type: String, default: null },
    // Detection result
    label:       { type: String, required: true },
    displayName: { type: String, default: '' },
    isHealthy:   { type: Boolean, required: true },
    confidence:  { type: Number, required: true, min: 0, max: 100 },
    severity:    { type: String, default: '' },
    description: { type: String, default: '' },
    treatment:   { type: [String], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Scan', scanSchema);
