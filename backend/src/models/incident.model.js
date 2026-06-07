import mongoose from 'mongoose';

const sourceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    enum: ['PROMETHEUS', 'KIBANA', 'GITHUB', 'ARGO']
  },
  description: {
    type: String,
    required: true
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, { _id: false });

const incidentSchema = new mongoose.Schema(
  {
    heading: {
      type: String,
      required: true,
      trim: true
    },
    summary: {
      type: String,
      required: true,
      trim: true
    },
    sources: {
      type: [sourceSchema],
      default: []
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

// Create index for fast reverse chronological sorting
incidentSchema.index({ createdAt: -1 });

const Incident = mongoose.model('Incident', incidentSchema);

export default Incident;
