const { CompanyMode, User } = require('../models');
const { successResponse, errorResponse } = require('../utils/helpers');

async function getOptions(req, res, next) {
  try {
    const modes = await CompanyMode.findAll();
    return res.json(successResponse(modes));
  } catch (error) {
    next(error);
  }
}

async function selectMode(req, res, next) {
  try {
    const { mode_name } = req.body;
    const mode = await CompanyMode.findOne({ where: { mode_name } });
    
    if (!mode) {
      return res.status(404).json(errorResponse('Company mode not found'));
    }

    const user = await User.findByPk(req.user.id);
    user.company_mode = mode_name;
    await user.save();

    return res.json(successResponse(mode, 'Company mode updated'));
  } catch (error) {
    next(error);
  }
}

async function getModeRoadmap(req, res, next) {
  // Logic to filter tasks based on mode weights would go here
  return res.json(successResponse({ message: 'Roadmap adjusted for your mode' }));
}

module.exports = {
  getOptions,
  selectMode,
  getModeRoadmap
};
