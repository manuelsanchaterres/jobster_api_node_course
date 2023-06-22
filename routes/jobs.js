const express = require('express')

const router = express.Router()
const {
  createJob,
  deleteJob,
  // deleteManyJobs,
  getAllJobs,
  updateJob,
  getJob,
  showStats,
} = require('../controllers/jobs')
const testuser = require('../middleware/testuser')

router.route('/').post(testuser, createJob).get(getAllJobs)
router.route('/stats').get(showStats)

router.route('/:id').get(getJob).delete(testuser, deleteJob).patch(testuser, updateJob)

// router.route('/delete-many').delete(testuser, deleteManyJobs)

module.exports = router
