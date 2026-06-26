const { JobApplication } = require('../models');
const { successResponse, errorResponse } = require('../utils/helpers');

async function getJobs(req, res, next) {
  try {
    const userId = req.user.id;
    const jobs = await JobApplication.findAll({
      where: { user_id: userId },
      order: [['created_at', 'DESC']],
    });
    return res.json(successResponse(jobs));
  } catch (error) {
    next(error);
  }
}

async function addJob(req, res, next) {
  try {
    const userId = req.user.id;
    const { company_name, role, status, date_applied, notes } = req.body;

    if (!company_name || !role) {
      return res.status(400).json(errorResponse('Company name and role are required.'));
    }

    const job = await JobApplication.create({
      user_id: userId,
      company_name,
      role,
      status: status || 'Wishlist',
      date_applied: date_applied || null,
      notes: notes || '',
    });

    return res.status(201).json(successResponse(job, 'Job application added successfully.'));
  } catch (error) {
    next(error);
  }
}

async function updateJobStatus(req, res, next) {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { status, notes, date_applied } = req.body;

    const job = await JobApplication.findOne({ where: { id, user_id: userId } });
    if (!job) {
      return res.status(404).json(errorResponse('Job application not found.'));
    }

    if (status) job.status = status;
    if (notes !== undefined) job.notes = notes;
    if (date_applied !== undefined) job.date_applied = date_applied;

    await job.save();

    return res.json(successResponse(job, 'Job updated successfully.'));
  } catch (error) {
    next(error);
  }
}

async function deleteJob(req, res, next) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const job = await JobApplication.findOne({ where: { id, user_id: userId } });
    if (!job) {
      return res.status(404).json(errorResponse('Job application not found.'));
    }

    await job.destroy();

    return res.json(successResponse(null, 'Job deleted successfully.'));
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getJobs,
  addJob,
  updateJobStatus,
  deleteJob
};
