const mongoose = require('mongoose');
const { CATEGORIES } = require('./categories');

const ItemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide an item title/name'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters']
    },
    type: {
      type: String,
      required: [true, 'Type is required (lost or found)'],
      enum: ['lost', 'found'],
      index: true
    },
    category: {
      type: String,
      required: [true, 'Please select a category'],
      enum: CATEGORIES,
      index: true
    },
    description: {
      type: String,
      required: [true, 'Please provide a detailed description of the item'],
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    location: {
      type: String,
      required: [true, 'Please specify the location where item was lost/found'],
      trim: true,
      maxlength: [150, 'Location cannot exceed 150 characters'],
      index: true
    },
    date: {
      type: Date,
      required: [true, 'Please provide the date when item was lost/found'],
      default: Date.now,
      index: true
    },
    status: {
      type: String,
      enum: ['lost', 'found', 'claimed'],
      default: function () {
        return this.type === 'found' ? 'found' : 'lost';
      },
      index: true
    },
    reporterName: {
      type: String,
      required: [true, 'Please provide your name'],
      trim: true,
      maxlength: [80, 'Reporter name cannot exceed 80 characters']
    },
    reporterContact: {
      type: String,
      required: [true, 'Please provide a contact phone or email'],
      trim: true,
      maxlength: [120, 'Contact info cannot exceed 120 characters']
    },
    image: {
      type: String,
      default: ''
    },
    claimDetails: {
      claimedBy: {
        type: String,
        trim: true,
        default: ''
      },
      claimantContact: {
        type: String,
        trim: true,
        default: ''
      },
      claimedDate: {
        type: Date
      },
      notes: {
        type: String,
        trim: true,
        default: ''
      }
    },
    isArchived: {
      type: Boolean,
      default: false,
      index: true
    }
  },
  {
    timestamps: true
  }
);

// Compound text index for robust searching
ItemSchema.index({
  title: 'text',
  description: 'text',
  location: 'text',
  category: 'text'
});

const Item = mongoose.model('Item', ItemSchema);

module.exports = Item;
