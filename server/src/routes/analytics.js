const express = require('express');
const router = express.Router();
const { VisaCase, User } = require('../models');
const { authenticateToken } = require('../middleware/auth');
const { 
  validateCreateVisaCase, 
  validateUUID, 
  validatePagination 
} = require('../middleware/validation');
const logger = require('../config/logger');

router.get('/visa', validatePagination, async (req, res) => {
  try {
    const { 
      visaType, 
      processingCenter, 
      timeframe = '12', // months
      year = new Date().getFullYear() 
    } = req.query;

    const startDate = new Date(year, 0, 1); // Start of year
    const endDate = new Date(year, 11, 31); // End of year

    const whereClause = {
      applicationDate: {
        [Op.between]: [startDate, endDate],
      },
      isActive: true,
    };

    if (visaType) whereClause.visaType = visaType;
    if (processingCenter) whereClause.processingCenter = processingCenter;

    // Processing times by month
    const processingTimes = await VisaCase.findAll({
      attributes: [
        [require('sequelize').fn('DATE_TRUNC', 'month', require('sequelize').col('application_date')), 'month'],
        [require('sequelize').fn('AVG', 
          require('sequelize').fn('EXTRACT', 
            require('sequelize').literal('EPOCH FROM (actual_decision_date - application_date)')
          )
        ), 'avgProcessingDays'],
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'caseCount'],
        'priority',
      ],
      where: {
        ...whereClause,
        actualDecisionDate: {
          [Op.ne]: null,
        },
      },
      group: [
        require('sequelize').fn('DATE_TRUNC', 'month', require('sequelize').col('application_date')),
        'priority',
      ],
      order: [
        [require('sequelize').fn('DATE_TRUNC', 'month', require('sequelize').col('application_date')), 'ASC'],
      ],
    });

    // Application volume by month
    const applicationVolume = await VisaCase.findAll({
      attributes: [
        [require('sequelize').fn('DATE_TRUNC', 'month', require('sequelize').col('application_date')), 'month'],
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'totalApplications'],
        [require('sequelize').fn('COUNT', require('sequelize').literal("CASE WHEN current_status = 'Case Approved' THEN 1 END")), 'approved'],
        [require('sequelize').fn('COUNT', require('sequelize').literal("CASE WHEN current_status = 'Case Denied' THEN 1 END")), 'denied'],
        [require('sequelize').fn('COUNT', require('sequelize').literal("CASE WHEN current_status NOT IN ('Case Approved', 'Case Denied') THEN 1 END")), 'pending'],
      ],
      where: whereClause,
      group: [
        require('sequelize').fn('DATE_TRUNC', 'month', require('sequelize').col('application_date')),
      ],
      order: [
        [require('sequelize').fn('DATE_TRUNC', 'month', require('sequelize').col('application_date')), 'ASC'],
      ],
    });

    // Status distribution
    const statusDistribution = await VisaCase.findAll({
      attributes: [
        'currentStatus',
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count'],
        [require('sequelize').fn('COUNT', require('sequelize').col('id')) * 100.0 / 
         require('sequelize').literal('(SELECT COUNT(*) FROM visa_cases WHERE is_active = true)'), 'percentage'],
      ],
      where: whereClause,
      group: ['currentStatus'],
      order: [
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'DESC'],
      ],
    });

    // Visa type distribution
    const visaTypeDistribution = await VisaCase.findAll({
      attributes: [
        'visaType',
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count'],
        [require('sequelize').fn('AVG', 
          require('sequelize').fn('EXTRACT', 
            require('sequelize').literal('EPOCH FROM (COALESCE(actual_decision_date, NOW()) - application_date)')
          )
        ), 'avgProcessingDays'],
      ],
      where: whereClause,
      group: ['visaType'],
      order: [
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'DESC'],
      ],
    });

    // Processing center performance
    const processingCenterStats = await VisaCase.findAll({
      attributes: [
        'processingCenter',
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'totalCases'],
        [require('sequelize').fn('AVG', 
          require('sequelize').fn('EXTRACT', 
            require('sequelize').literal('EPOCH FROM (actual_decision_date - application_date)')
          )
        ), 'avgProcessingDays'],
        [require('sequelize').fn('COUNT', require('sequelize').literal("CASE WHEN current_status = 'Case Approved' THEN 1 END")) * 100.0 /
         require('sequelize').fn('COUNT', require('sequelize').col('id')), 'approvalRate'],
      ],
      where: {
        ...whereClause,
        processingCenter: {
          [Op.ne]: null,
        },
      },
      group: ['processingCenter'],
      having: require('sequelize').literal('COUNT(id) >= 10'), // Only centers with significant volume
      order: [
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'DESC'],
      ],
    });

    // Format processing times data
    const formattedProcessingTimes = processingTimes.reduce((acc, item) => {
      const month = new Date(item.dataValues.month).toISOString().slice(0, 7);
      if (!acc[month]) {
        acc[month] = { month, standard: null, premium: null, applications: 0 };
      }
      
      const days = Math.round(item.dataValues.avgProcessingDays / 86400); // Convert seconds to days
      acc[month][item.priority] = days;
      acc[month].applications += parseInt(item.dataValues.caseCount);
      
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        processingTimes: Object.values(formattedProcessingTimes),
        applicationVolume: applicationVolume.map(item => ({
          month: new Date(item.dataValues.month).toISOString().slice(0, 7),
          totalApplications: parseInt(item.dataValues.totalApplications),
          approved: parseInt(item.dataValues.approved),
          denied: parseInt(item.dataValues.denied),
          pending: parseInt(item.dataValues.pending),
        })),
        statusDistribution: statusDistribution.map(item => ({
          status: item.currentStatus,
          count: parseInt(item.dataValues.count),
          percentage: parseFloat(item.dataValues.percentage),
        })),
        visaTypeDistribution: visaTypeDistribution.map(item => ({
          visaType: item.visaType,
          count: parseInt(item.dataValues.count),
          avgProcessingDays: item.dataValues.avgProcessingDays ? 
            Math.round(item.dataValues.avgProcessingDays / 86400) : null,
        })),
        processingCenterStats: processingCenterStats.map(item => ({
          processingCenter: item.processingCenter,
          totalCases: parseInt(item.dataValues.totalCases),
          avgProcessingDays: item.dataValues.avgProcessingDays ? 
            Math.round(item.dataValues.avgProcessingDays / 86400) : null,
          approvalRate: parseFloat(item.dataValues.approvalRate),
        })),
      },
    });
  } catch (error) {
    logger.error('Get visa analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch visa analytics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

router.get('/visa/cases', authenticateToken, validatePagination, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows: cases } = await VisaCase.findAndCountAll({
      where: { 
        userId: req.user.id,
        isActive: true,
      },
      include: [
        {
          model: VisaStatusUpdate,
          as: 'statusUpdates',
          limit: 5,
          order: [['updateDate', 'DESC']],
        },
      ],
      order: [['applicationDate', 'DESC']],
      limit: parseInt(limit),
      offset: offset,
    });

    res.json({
      success: true,
      data: {
        cases,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / limit),
          totalItems: count,
          itemsPerPage: parseInt(limit),
        },
      },
    });
  } catch (error) {
    logger.error('Get visa cases error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch visa cases',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

router.post('/visa/cases', authenticateToken, validateCreateVisaCase, async (req, res) => {
  try {
    const {
      caseNumber,
      visaType,
      currentStatus,
      priority = 'standard',
      applicationDate,
      expectedDecisionDate,
      processingCenter,
      attorney,
      employer,
      notes,
    } = req.body;

    // Check if case number already exists
    if (caseNumber) {
      const existingCase = await VisaCase.findOne({
        where: { caseNumber },
      });

      if (existingCase) {
        return res.status(400).json({
          success: false,
          message: 'Case number already exists',
        });
      }
    }

    const visaCase = await VisaCase.create({
      caseNumber,
      visaType,
      currentStatus,
      priority,
      applicationDate,
      expectedDecisionDate,
      processingCenter,
      attorney,
      employer,
      notes,
      userId: req.user.id,
    });

    // Create initial status update
    await VisaStatusUpdate.create({
      previousStatus: 'Not Started',
      newStatus: currentStatus,
      updateDate: applicationDate,
      notes: 'Initial case creation',
      isSystemGenerated: true,
      visaCaseId: visaCase.id,
      updatedBy: req.user.id,
    });

    logger.info(`New visa case created by ${req.user.email}: ${visaType}`);

    res.status(201).json({
      success: true,
      message: 'Visa case created successfully',
      data: { case: visaCase },
    });
  } catch (error) {
    logger.error('Create visa case error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create visa case',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

router.put('/visa/cases/:id', authenticateToken, validateUUID('id'), async (req, res) => {
  try {
    const visaCase = await VisaCase.findOne({
      where: { 
        id: req.params.id,
        userId: req.user.id,
        isActive: true,
      },
    });

    if (!visaCase) {
      return res.status(404).json({
        success: false,
        message: 'Visa case not found',
      });
    }

    const {
      currentStatus,
      expectedDecisionDate,
      actualDecisionDate,
      processingCenter,
      attorney,
      employer,
      notes,
    } = req.body;

    const updateData = {};
    let statusChanged = false;

    if (currentStatus && currentStatus !== visaCase.currentStatus) {
      updateData.currentStatus = currentStatus;
      statusChanged = true;
    }
    if (expectedDecisionDate !== undefined) updateData.expectedDecisionDate = expectedDecisionDate;
    if (actualDecisionDate !== undefined) updateData.actualDecisionDate = actualDecisionDate;
    if (processingCenter !== undefined) updateData.processingCenter = processingCenter;
    if (attorney !== undefined) updateData.attorney = attorney;
    if (employer !== undefined) updateData.employer = employer;
    if (notes !== undefined) updateData.notes = notes;

    await visaCase.update(updateData);

    // Create status update if status changed
    if (statusChanged) {
      await VisaStatusUpdate.create({
        previousStatus: visaCase.currentStatus,
        newStatus: currentStatus,
        updateDate: new Date(),
        notes: `Status updated by user`,
        isSystemGenerated: false,
        visaCaseId: visaCase.id,
        updatedBy: req.user.id,
      });
    }

    logger.info(`Visa case updated: ${visaCase.id} by ${req.user.email}`);

    res.json({
      success: true,
      message: 'Visa case updated successfully',
      data: { case: visaCase },
    });
  } catch (error) {
    logger.error('Update visa case error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update visa case',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

router.get('/visa/cases/:id/timeline', authenticateToken, validateUUID('id'), async (req, res) => {
  try {
    const visaCase = await VisaCase.findOne({
      where: { 
        id: req.params.id,
        userId: req.user.id,
        isActive: true,
      },
    });

    if (!visaCase) {
      return res.status(404).json({
        success: false,
        message: 'Visa case not found',
      });
    }

    const statusUpdates = await VisaStatusUpdate.findAll({
      where: { visaCaseId: visaCase.id },
      include: [
        {
          model: User,
          as: 'updater',
          attributes: ['id', 'displayName'],
        },
      ],
      order: [['updateDate', 'ASC']],
    });

    res.json({
      success: true,
      data: {
        case: visaCase,
        timeline: statusUpdates,
      },
    });
  } catch (error) {
    logger.error('Get visa case timeline error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch visa case timeline',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

router.delete('/visa/cases/:id', authenticateToken, validateUUID('id'), async (req, res) => {
  try {
    const visaCase = await VisaCase.findOne({
      where: { 
        id: req.params.id,
        userId: req.user.id,
        isActive: true,
      },
    });

    if (!visaCase) {
      return res.status(404).json({
        success: false,
        message: 'Visa case not found',
      });
    }

    await visaCase.update({ isActive: false });

    logger.info(`Visa case deleted: ${visaCase.id} by ${req.user.email}`);

    res.json({
      success: true,
      message: 'Visa case deleted successfully',
    });
  } catch (error) {
    logger.error('Delete visa case error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete visa case',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

module.exports = router;
