const Job = require('../models/Job')
const { StatusCodes } = require('http-status-codes')
const { BadRequestError, NotFoundError } = require('../errors')
const getJobsActivePage = require('../utils/pagination/getJobsActivePage')
const mongoose = require('mongoose')
const moment = require('moment')

/* course solution */

const getAllJobs = async (req, res) => {

  let {status, jobType, sort, page, search, limit} = req.query

  const queryObject = {

    createdBy: req.user.userId,
  }

  if (search) {

    queryObject.position = {$regex: search, $options: 'i'}

  }

  if (status && status !== 'all') {

    queryObject.status = status

  }

  if (jobType && jobType !== 'all') {

    queryObject.jobType = jobType

  }

  let sortValue = ""

  if (sort === 'latest') {

    sortValue = '-createdAt'
  } else if (sort === 'oldest') {

    sortValue = 'createdAt'

  } else if (sort === 'a-z') {

    sortValue = 'position'
  } else if (sort === 'z-a') {

    sortValue = '-position'
  }

  let result = Job.find(queryObject).sort(sortValue)

  page = Number(page) || 1
  limit = Number (limit) || 10
  const skip = (page - 1) * limit;

  result = result.skip(skip).limit(limit)
  const jobs = await result

  const totalJobs = await Job.countDocuments(queryObject);
  const numOfPages = Math.ceil(totalJobs/limit)

  // first and last active page number functionality
  
  let firstActivePageResultNumber = skip + 1
  let lastActivePageResultNumber = skip + limit


  if (page === numOfPages) {

    lastActivePageResultNumber = skip + (totalJobs - skip)

  }

  res.status(StatusCodes.OK).json({ jobs, totalJobs, numOfPages, 
    
    pageresults : {firstActivePageResultNumber, lastActivePageResultNumber} 
  
  })

}


/* my solution */

// const getAllJobs = async (req, res) => {

//   const {status, jobType, sort, page, search, limit} = req.query

//   const queryObject = {

//     createdBy: req.user.userId,
//   }

//   if (search) {

//     queryObject.position = {$regex: search, $options: 'i'}

//   }

//   if (status && status !== 'all') {

//     queryObject.status = status

//   }

//   if (jobType && jobType !== 'all') {

//     queryObject.jobType = jobType

//   }

//   let sortValue = ""

//   if (sort === 'latest') {

//     sortValue = '-createdAt'
//   } else if (sort === 'oldest') {

//     sortValue = 'createdAt'

//   } else if (sort === 'a-z') {

//     sortValue = 'position'
//   } else if (sort === 'z-a') {

//     sortValue = '-position'
//   }

//   let result = Job.find(queryObject).sort(sortValue)

//   let jobs = await result

//   const totalJobs = jobs.length

//   /* we calculate the number of pages to show depending 
  
//   on number of model received results and results per page limit */

//   const numOfPages = Math.ceil (totalJobs/limit)

//   const skippedDocuments = (page - 1) * limit

//   const afterSkipJobs = await Job.find(queryObject).sort(sortValue).skip(skippedDocuments)
  
//   const filteredJobs = getJobsActivePage(limit, skippedDocuments,afterSkipJobs, numOfPages, totalJobs, page)

//   // first and last active page results limits
  
//   let firstActivePageResultNumber = skippedDocuments + 1
//   let lastActivePageResultNumber = skippedDocuments + parseInt(limit)

//   if (page == numOfPages) {

//     lastActivePageResultNumber = totalJobs

//   }

//   console.log(firstActivePageResultNumber,lastActivePageResultNumber);
//   res.status(StatusCodes.OK).json({ jobs: filteredJobs, totalJobs, numOfPages, pageresults : {firstActivePageResultNumber, lastActivePageResultNumber} })

// }

const getJob = async (req, res) => {
  const {
    user: { userId },
    params: { id: jobId },
  } = req

  const job = await Job.findOne({
    _id: jobId,
    createdBy: userId,
  })
  if (!job) {
    throw new NotFoundError(`No job with id ${jobId}`)
  }
  res.status(StatusCodes.OK).json({ job })
}

const createJob = async (req, res) => {
  req.body.createdBy = req.user.userId
  const job = await Job.create(req.body)
  res.status(StatusCodes.CREATED).json({ job })
}

const updateJob = async (req, res) => {
  const {
    body: { company, position },
    user: { userId },
    params: { id: jobId },
  } = req

  if (company === '' || position === '') {
    throw new BadRequestError('Company or Position fields cannot be empty')
  }
  const job = await Job.findByIdAndUpdate(
    { _id: jobId, createdBy: userId },
    req.body,
    { new: true, runValidators: true }
  )
  if (!job) {
    throw new NotFoundError(`No job with id ${jobId}`)
  }
  res.status(StatusCodes.OK).json({ job })
}

const deleteJob = async (req, res) => {
  const {
    user: { userId },
    params: { id: jobId },
  } = req

  const job = await Job.findByIdAndRemove({
    _id: jobId,
    createdBy: userId,
  })
  if (!job) {
    throw new NotFoundError(`No job with id ${jobId}`)
  }
  res.status(StatusCodes.OK).send()
}

// const deleteManyJobs = async (req, res) => {

//   const queryObject = {

//     createdBy: req.user.userId,
//   }
//   const deletedJobs = await Job.deleteMany(queryObject)

//   res.status(StatusCodes.OK).json(deletedJobs)

// }


const showStats = async (req, res) => {

  // let stats = await Job.aggregate([
  //   {$match: { createdBy: new mongoose.Types.ObjectId(req.user.userId) }},
  //   {$group: {_id:'$status', count: { $sum: 1 } } }
  // ])

  let stats = await Job.aggregate([

    {$match: {createdBy: new mongoose.Types.ObjectId(req.user.userId)}},
    {$group: {_id: '$status', totalJobs: {$sum: 1}}}
  ])

  stats = stats.reduce((acc,curr) => {

    const {_id: status, totalJobs} = curr;
    acc[status] = totalJobs;
    return acc;

  }, {})

  const defaultStats = {

    pending: stats.pending || 0,
    interview: stats.interview || 0,
    declined: stats.declined || 0,

  }

  // mongodb last 6 months aggreated data by year and month

  let monthlyApplications = await Job.aggregate([

    {$match: {createdBy: new mongoose.Types.ObjectId(req.user.userId)}},
    {$group: {
      _id :{year: {$year:'$createdAt'}, month: {$month: '$createdAt'}},
      count: {$sum: 1}
    }},
    {$sort: {'_id.year': -1, '_id.month': -1}},
    {$limit: 6}
  ])

  /* data array refactoring with moment date library to match the server response 
  to what the front end is expecting */
  monthlyApplications = monthlyApplications.map((item) => {

    const {_id: {year, month}, count} = item

    const date = moment().month(month - 1).year(year).format('MMM YY')

    return {date, count}

  })


  res.status(StatusCodes.OK).json({defaultStats, monthlyApplications})

}


module.exports = {
  createJob,
  deleteJob,
  getAllJobs,
  updateJob,
  getJob,
  showStats,
  // deleteManyJobs
}
