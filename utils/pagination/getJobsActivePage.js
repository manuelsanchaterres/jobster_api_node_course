const getJobsActivePage = (limit, skippedDocuments,afterSkipJobs, numOfPages, totalJobs, page) => {

    let jobsActivePage = []
    let lastPageNumberItems = 0

    if (page == numOfPages ) {

      lastPageNumberItems = totalJobs - skippedDocuments

      for (let i = 0; i < lastPageNumberItems; i++) {

        jobsActivePage = [...jobsActivePage, afterSkipJobs[i]]
      }
      
      return jobsActivePage

    } else {
      
      for (let i = 0; i < limit; i++) {

        jobsActivePage = [...jobsActivePage, afterSkipJobs[i]]

      }

      return jobsActivePage

    }

}

module.exports = getJobsActivePage
