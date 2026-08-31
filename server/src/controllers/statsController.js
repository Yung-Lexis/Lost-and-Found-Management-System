const Item = require('../models/Item');

/**
 * @desc    Get system dashboard analytics, counts & category breakdown
 * @route   GET /api/stats/summary
 * @access  Public
 */
const getDashboardSummary = async (req, res) => {
  try {
    const baseQuery = { isArchived: false };

    // Parallel aggregate count queries for high performance
    const [
      totalCount,
      lostCount,
      foundCount,
      claimedCount,
      categoryStats,
      recentItems,
      recentClaimed
    ] = await Promise.all([
      Item.countDocuments(baseQuery),
      Item.countDocuments({ ...baseQuery, status: 'lost' }),
      Item.countDocuments({ ...baseQuery, status: 'found' }),
      Item.countDocuments({ ...baseQuery, status: 'claimed' }),
      Item.aggregate([
        { $match: baseQuery },
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
            lost: {
              $sum: { $cond: [{ $eq: ['$status', 'lost'] }, 1, 0] }
            },
            found: {
              $sum: { $cond: [{ $eq: ['$status', 'found'] }, 1, 0] }
            },
            claimed: {
              $sum: { $cond: [{ $eq: ['$status', 'claimed'] }, 1, 0] }
            }
          }
        },
        { $sort: { count: -1 } }
      ]),
      Item.find(baseQuery)
        .sort({ createdAt: -1 })
        .limit(6)
        .select('title type category location date status image createdAt'),
      Item.find({ ...baseQuery, status: 'claimed' })
        .sort({ 'claimDetails.claimedDate': -1, updatedAt: -1 })
        .limit(5)
        .select('title category location claimDetails updatedAt')
    ]);

    const resolutionRate = totalCount > 0 
      ? Math.round((claimedCount / totalCount) * 100) 
      : 0;

    res.status(200).json({
      success: true,
      data: {
        counts: {
          total: totalCount,
          lost: lostCount,
          found: foundCount,
          claimed: claimedCount,
          active: lostCount + foundCount
        },
        resolutionRate,
        categories: categoryStats.map((c) => ({
          category: c._id,
          total: c.count,
          lost: c.lost,
          found: c.found,
          claimed: c.claimed
        })),
        recentItems,
        recentClaimed
      }
    });
  } catch (error) {
    console.error('Error computing dashboard summary:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate dashboard summary',
      error: error.message
    });
  }
};

module.exports = {
  getDashboardSummary
};
