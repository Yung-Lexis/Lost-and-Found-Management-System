const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const {
  createItem,
  getItems,
  getItemById,
  updateItem,
  updateItemStatus,
  deleteItem,
  getMatchesForItem
} = require('../controllers/itemController');

// GET /api/items - List all items (with advanced search, filters & pagination)
router.get('/', getItems);

// GET /api/items/:id/matches - Find smart matching candidates between lost & found
router.get('/:id/matches', getMatchesForItem);

// GET /api/items/:id - Get single item
router.get('/:id', getItemById);

// POST /api/items - Create a new item report (with optional image file)
router.post('/', upload.single('image'), createItem);

// PUT /api/items/:id - Update item report
router.put('/:id', upload.single('image'), updateItem);

// PATCH /api/items/:id/status - Update item status (lost, found, claimed)
router.patch('/:id/status', updateItemStatus);

// DELETE /api/items/:id - Delete or archive item
router.delete('/:id', deleteItem);

module.exports = router;
