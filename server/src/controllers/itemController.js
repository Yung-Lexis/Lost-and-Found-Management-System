const mongoose = require('mongoose');
const Item = require('../models/Item');

/**
 * @desc    Create a new lost or found item report
 * @route   POST /api/items
 * @access  Public
 */
const createItem = async (req, res) => {
  try {
    const {
      title,
      type,
      category,
      description,
      location,
      date,
      reporterName,
      reporterContact,
      reporterEmail,
      reporterPhone,
      status
    } = req.body;

    let imagePath = '';
    if (req.file) {
      imagePath = `/uploads/${req.file.filename}`;
    } else if (req.body.image && typeof req.body.image === 'string') {
      imagePath = req.body.image.trim();
    }

    const itemStatus = status || (type === 'found' ? 'found' : 'lost');

    const newItem = new Item({
      title,
      type,
      category,
      description,
      location,
      date: date ? new Date(date) : new Date(),
      status: itemStatus,
      reporterName,
      reporterContact: reporterContact || reporterPhone || reporterEmail,
      image: imagePath
    });

    const savedItem = await newItem.save();

    res.status(201).json({
      success: true,
      message: `${type === 'lost' ? 'Lost' : 'Found'} item reported successfully`,
      data: savedItem
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors: messages
      });
    }

    console.error('Error creating item:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create item report',
      error: error.message
    });
  }
};

/**
 * @desc    Get all items with advanced search, filtering, pagination & sorting
 * @route   GET /api/items
 * @access  Public
 */
const getItems = async (req, res) => {
  try {
    const {
      q,
      search,
      type,
      status,
      category,
      location,
      startDate,
      endDate,
      page = 1,
      limit = 12,
      sort = '-createdAt'
    } = req.query;

    const query = { isArchived: false };

    // Search query across title, description, and location
    const keyword = (q || search || '').trim();
    if (keyword) {
      const regex = new RegExp(keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      query.$or = [
        { title: regex },
        { description: regex },
        { location: regex },
        { category: regex }
      ];
    }

    // Type filter (lost, found)
    if (type && ['lost', 'found'].includes(type.toLowerCase())) {
      query.type = type.toLowerCase();
    }

    // Status filter (lost, found, claimed)
    if (status && ['lost', 'found', 'claimed'].includes(status.toLowerCase())) {
      query.status = status.toLowerCase();
    }

    // Category filter
    if (category && category !== 'All') {
      query.category = category;
    }

    // Location filter (specific substring)
    if (location && location.trim()) {
      query.location = new RegExp(location.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    }

    // Date range filter
    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 12));
    const skip = (pageNum - 1) * limitNum;

    // Sorting format handling
    let sortOptions = { createdAt: -1 };
    if (sort === 'oldest' || sort === 'createdAt') {
      sortOptions = { createdAt: 1 };
    } else if (sort === 'date_desc' || sort === '-date') {
      sortOptions = { date: -1 };
    } else if (sort === 'date_asc' || sort === 'date') {
      sortOptions = { date: 1 };
    } else if (sort === 'title_asc' || sort === 'title') {
      sortOptions = { title: 1 };
    } else if (sort === 'title_desc' || sort === '-title') {
      sortOptions = { title: -1 };
    }

    const total = await Item.countDocuments(query);
    const items = await Item.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: items.length,
      total,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1,
        hasNextPage: pageNum * limitNum < total,
        hasPrevPage: pageNum > 1
      },
      data: items
    });
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch items',
      error: error.message
    });
  }
};

/**
 * @desc    Get single item by ID
 * @route   GET /api/items/:id
 * @access  Public
 */
const getItemById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid item ID format'
      });
    }

    const item = await Item.findOne({ _id: id, isArchived: false });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    res.status(200).json({
      success: true,
      data: item
    });
  } catch (error) {
    console.error('Error fetching item by id:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch item details',
      error: error.message
    });
  }
};

/**
 * @desc    Update item details
 * @route   PUT /api/items/:id
 * @access  Public
 */
const updateItem = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid item ID format'
      });
    }

    const existingItem = await Item.findOne({ _id: id, isArchived: false });
    if (!existingItem) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    const {
      title,
      type,
      category,
      description,
      location,
      date,
      reporterName,
      reporterContact,
      status,
      image
    } = req.body;

    if (title !== undefined) existingItem.title = title;
    if (type !== undefined) existingItem.type = type;
    if (category !== undefined) existingItem.category = category;
    if (description !== undefined) existingItem.description = description;
    if (location !== undefined) existingItem.location = location;
    if (date !== undefined) existingItem.date = new Date(date);
    if (reporterName !== undefined) existingItem.reporterName = reporterName;
    if (reporterContact !== undefined) existingItem.reporterContact = reporterContact;
    if (status !== undefined) existingItem.status = status;

    if (req.file) {
      existingItem.image = `/uploads/${req.file.filename}`;
    } else if (image !== undefined) {
      existingItem.image = image;
    }

    const updatedItem = await existingItem.save();

    res.status(200).json({
      success: true,
      message: 'Item updated successfully',
      data: updatedItem
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors: messages
      });
    }

    console.error('Error updating item:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update item',
      error: error.message
    });
  }
};

/**
 * @desc    Update item status (lost, found, claimed/returned)
 * @route   PATCH /api/items/:id/status
 * @access  Public
 */
const updateItemStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, claimedBy, claimantContact, notes } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid item ID format'
      });
    }

    if (!status || !['lost', 'found', 'claimed'].includes(status.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Status must be "lost", "found", or "claimed"'
      });
    }

    const item = await Item.findOne({ _id: id, isArchived: false });
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    item.status = status.toLowerCase();

    if (item.status === 'claimed') {
      item.claimDetails = {
        claimedBy: claimedBy || 'Unknown Claimant',
        claimantContact: claimantContact || 'Not provided',
        claimedDate: new Date(),
        notes: notes || ''
      };
    } else {
      item.claimDetails = {
        claimedBy: '',
        claimantContact: '',
        notes: ''
      };
    }

    const updatedItem = await item.save();

    res.status(200).json({
      success: true,
      message: `Item status updated to '${item.status}' successfully`,
      data: updatedItem
    });
  } catch (error) {
    console.error('Error updating item status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update item status',
      error: error.message
    });
  }
};

/**
 * @desc    Delete or archive an item
 * @route   DELETE /api/items/:id
 * @access  Public
 */
const deleteItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { permanent } = req.query;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid item ID format'
      });
    }

    if (permanent === 'true') {
      const deletedItem = await Item.findByIdAndDelete(id);
      if (!deletedItem) {
        return res.status(404).json({
          success: false,
          message: 'Item not found'
        });
      }
    } else {
      const item = await Item.findById(id);
      if (!item || item.isArchived) {
        return res.status(404).json({
          success: false,
          message: 'Item not found'
        });
      }
      item.isArchived = true;
      await item.save();
    }

    res.status(200).json({
      success: true,
      message: 'Item removed successfully',
      data: { id }
    });
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete item',
      error: error.message
    });
  }
};

/**
 * @desc    Find smart match candidates between lost & found items
 * @route   GET /api/items/:id/matches
 * @access  Public
 */
const getMatchesForItem = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid item ID format'
      });
    }

    const currentItem = await Item.findOne({ _id: id, isArchived: false });
    if (!currentItem) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    // Look for opposite type items that are not yet claimed
    const oppositeType = currentItem.type === 'lost' ? 'found' : 'lost';

    // Extract significant keywords from current item's title and description
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'in', 'on', 'at', 'to', 'for', 'with',
      'by', 'about', 'like', 'through', 'over', 'before', 'between', 'after',
      'since', 'without', 'under', 'within', 'along', 'following', 'across',
      'behind', 'beyond', 'plus', 'except', 'but', 'up', 'out', 'around',
      'down', 'off', 'above', 'near', 'of', 'is', 'was', 'are', 'were', 'my', 'item'
    ]);

    const tokenize = (text) => {
      if (!text) return [];
      return text
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter((word) => word.length > 2 && !stopWords.has(word));
    };

    const currentTokens = tokenize(`${currentItem.title} ${currentItem.description} ${currentItem.location}`);
    const tokenSet = new Set(currentTokens);

    // Find candidate items of opposite type
    const candidateItems = await Item.find({
      _id: { $ne: currentItem._id },
      type: oppositeType,
      status: { $ne: 'claimed' },
      isArchived: false
    });

    const scoredMatches = candidateItems.map((candidate) => {
      let score = 0;
      const reasons = [];

      // 1. Same Category (+40 points)
      if (candidate.category === currentItem.category) {
        score += 40;
        reasons.push(`Same Category (${candidate.category})`);
      }

      // 2. Keyword matching in title and description (+15 points per matched token, up to 45)
      const candidateTokens = tokenize(`${candidate.title} ${candidate.description}`);
      const matchingTokens = candidateTokens.filter((t) => tokenSet.has(t));
      const uniqueMatchedTokens = Array.from(new Set(matchingTokens));

      if (uniqueMatchedTokens.length > 0) {
        const tokenPoints = Math.min(45, uniqueMatchedTokens.length * 15);
        score += tokenPoints;
        reasons.push(`Matching keywords: ${uniqueMatchedTokens.slice(0, 3).join(', ')}`);
      }

      // 3. Location matching (+15 points)
      const locationTokens = tokenize(candidate.location);
      const matchedLocation = locationTokens.filter((t) => tokenSet.has(t));
      if (matchedLocation.length > 0) {
        score += 15;
        reasons.push(`Nearby/Matching location`);
      }

      // 4. Date Proximity (+10 points if within 7 days)
      const daysDiff = Math.abs(
        (new Date(candidate.date) - new Date(currentItem.date)) / (1000 * 60 * 60 * 24)
      );
      if (daysDiff <= 7) {
        score += 10;
        reasons.push(`Reported within ${Math.max(1, Math.round(daysDiff))} day(s)`);
      }

      // Normalize score to percentage (max 100)
      const matchPercentage = Math.min(100, score);

      return {
        item: candidate,
        score: matchPercentage,
        reasons
      };
    });

    // Filter out low scores and sort by highest match percentage
    const qualifiedMatches = scoredMatches
      .filter((m) => m.score >= 35)
      .sort((a, b) => b.score - a.score);

    res.status(200).json({
      success: true,
      totalMatches: qualifiedMatches.length,
      targetItem: {
        _id: currentItem._id,
        title: currentItem.title,
        type: currentItem.type,
        category: currentItem.category
      },
      data: qualifiedMatches
    });
  } catch (error) {
    console.error('Error calculating matches:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to find match candidates',
      error: error.message
    });
  }
};

module.exports = {
  createItem,
  getItems,
  getItemById,
  updateItem,
  updateItemStatus,
  deleteItem,
  getMatchesForItem
};
