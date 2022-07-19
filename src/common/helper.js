/**
 * This file defines helper methods
 */

const fs = require('fs')
const querystring = require('querystring')
const Confirm = require('prompt-confirm')
const config = require('config')
const _ = require('lodash')
const models = require('../models')

const m2mAuth = require('tc-core-library-js').auth.m2m

const m2m = m2mAuth(
  _.pick(config, [
    'AUTH0_URL',
    'AUTH0_AUDIENCE',
    'AUTH0_CLIENT_ID',
    'AUTH0_CLIENT_SECRET',
    'AUTH0_PROXY_SERVER_URL'
  ])
)

/**
 * Get the first parameter from cli arguments
 */
function getParamFromCliArgs() {
  const filteredArgs = process.argv.filter((arg) => !arg.includes('--'))

  if (filteredArgs.length > 2) {
    return filteredArgs[2]
  }

  return null
}

/**
 * Prompt the user with a y/n query and call a callback function based on the answer
 * @param {string} promptQuery the query to ask the user
 * @param {function} cb the callback function
 */
async function promptUser(promptQuery, cb) {
  if (process.argv.includes('--force')) {
    await cb()
    return
  }

  const prompt = new Confirm(promptQuery)
  prompt.ask(async (answer) => {
    if (answer) {
      await cb()
    }
  })
}

/**
 * Sleep for a given number of milliseconds.
 *
 * @param {Number} milliseconds the sleep time
 * @returns {undefined}
 */
async function sleep(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds))
}

/**
 * Import data from a json file into the database
 * @param {string} pathToFile the path to the json file
 * @param {Array} dataModels the data models to import
 * @param {Object} logger the logger object
 */
async function importData(pathToFile, dataModels, logger) {
  // check if file exists
  if (!fs.existsSync(pathToFile)) {
    throw new Error(`File with path ${pathToFile} does not exist`)
  }

  // clear database
  logger.info({ component: 'importData', message: 'Clearing database...' })
  await models.sequelize.sync({ force: true })

  let transaction = null
  let currentModelName = null
  try {
    // Start a transaction
    transaction = await models.sequelize.transaction()
    const jsonData = JSON.parse(fs.readFileSync(pathToFile).toString())

    for (let index = 0; index < dataModels.length; index += 1) {
      const modelOpts = dataModels[index]
      const modelName = _.isString(modelOpts) ? modelOpts : modelOpts.modelName
      const include = _.get(modelOpts, 'include', [])

      currentModelName = modelName
      const model = models[modelName]
      const modelRecords = jsonData[modelName]

      if (modelRecords && modelRecords.length > 0) {
        logger.info({
          component: 'importData',
          message: `Importing data for model: ${modelName}`
        })

        await model.bulkCreate(modelRecords, { include, transaction })
        logger.info({
          component: 'importData',
          message: `Records imported for model: ${modelName} = ${modelRecords.length}`
        })
      } else {
        logger.info({
          component: 'importData',
          message: `No records to import for model: ${modelName}`
        })
      }
    }
    // commit transaction only if all things went ok
    logger.info({
      component: 'importData',
      message: 'committing transaction to database...'
    })
    await transaction.commit()
  } catch (error) {
    logger.error({
      component: 'importData',
      message: `Error while writing data of model: ${currentModelName}`
    })
    // rollback all insert operations
    if (transaction) {
      logger.info({
        component: 'importData',
        message: 'rollback database transaction...'
      })
      transaction.rollback()
    }
    if (error.name && error.errors && error.fields) {
      // For sequelize validation errors, we throw only fields with data that helps in debugging error,
      // because the error object has many fields that contains very big sql query for the insert bulk operation
      throw new Error(
        JSON.stringify({
          modelName: currentModelName,
          name: error.name,
          errors: error.errors,
          fields: error.fields
        })
      )
    } else {
      throw error
    }
  }
}

/**
 * Export data from the database into a json file
 * @param {string} pathToFile the path to the json file
 * @param {Array} dataModels the data models to export
 * @param {Object} logger the logger object
 */
async function exportData(pathToFile, dataModels, logger) {
  logger.info({
    component: 'exportData',
    message: `Start Saving data to file with path ${pathToFile}....`
  })

  const allModelsRecords = {}
  for (let index = 0; index < dataModels.length; index += 1) {
    const modelOpts = dataModels[index]
    const modelName = _.isString(modelOpts) ? modelOpts : modelOpts.modelName
    const include = _.get(modelOpts, 'include', [])
    const modelRecords = await models[modelName].findAll({ include })
    const rawRecords = _.map(modelRecords, (r) => r.toJSON())
    allModelsRecords[modelName] = rawRecords
    logger.info({
      component: 'exportData',
      message: `Records loaded for model: ${modelName} = ${rawRecords.length}`
    })
  }

  fs.writeFileSync(pathToFile, JSON.stringify(allModelsRecords))
  logger.info({
    component: 'exportData',
    message: 'End Saving data to file....'
  })
}

/**
 * Check if exists.
 *
 * @param {Array} source the array in which to search for the term
 * @param {Array | String} term the term to search
 */
function checkIfExists(source, term) {
  let terms

  if (!_.isArray(source)) {
    throw new Error('Source argument should be an array')
  }

  source = source.map((s) => s.toLowerCase())

  if (_.isString(term)) {
    terms = term.toLowerCase().split(' ')
  } else if (_.isArray(term)) {
    terms = term.map((t) => t.toLowerCase())
  } else {
    throw new Error('Term argument should be either a string or an array')
  }

  for (let i = 0; i < terms.length; i++) {
    if (source.includes(terms[i])) {
      return true
    }
  }

  return false
}

/**
 * Wrap async function to standard express function
 * @param {Function} fn the async function
 * @returns {Function} the wrapped function
 */
function wrapExpress(fn) {
  return function (req, res, next) {
    fn(req, res, next).catch(next)
  }
}

/**
 * Wrap all functions from object
 * @param obj the object (controller exports)
 * @returns {Object|Array} the wrapped object
 */
function autoWrapExpress(obj) {
  if (_.isArray(obj)) {
    return obj.map(autoWrapExpress)
  }
  if (_.isFunction(obj)) {
    if (obj.constructor.name === 'AsyncFunction') {
      return wrapExpress(obj)
    }
    return obj
  }
  _.each(obj, (value, key) => {
    obj[key] = autoWrapExpress(value)
  })
  return obj
}

/**
 * Get link for a given page.
 * @param {Object} req the HTTP request
 * @param {Number} page the page number
 * @returns {String} link for the page
 */
function getPageLink(req, page) {
  const q = _.assignIn({}, req.query, { page })
  return `${req.protocol}://${req.get('Host')}${req.baseUrl}${req.path
    }?${querystring.stringify(q)}`
}

/**
 * Set HTTP response headers from result.
 * @param {Object} req the HTTP request
 * @param {Object} res the HTTP response
 * @param {Object} result the operation result
 */
function setResHeaders(req, res, result) {
  const totalPages = Math.ceil(result.total / result.perPage)
  if (result.page > 1) {
    res.set('X-Prev-Page', result.page - 1)
  }
  if (result.page < totalPages) {
    res.set('X-Next-Page', result.page + 1)
  }
  res.set('X-Page', result.page)
  res.set('X-Per-Page', result.perPage)
  res.set('X-Total', result.total)
  res.set('X-Total-Pages', totalPages)
  res.set('X-Data-Source', result.fromDb ? 'database' : 'elasticsearch')
  // set Link header
  if (totalPages > 0) {
    let link = `<${getPageLink(req, 1)}>; rel="first", <${getPageLink(
      req,
      totalPages
    )}>; rel="last"`
    if (result.page > 1) {
      link += `, <${getPageLink(req, result.page - 1)}>; rel="prev"`
    }
    if (result.page < totalPages) {
      link += `, <${getPageLink(req, result.page + 1)}>; rel="next"`
    }
    res.set('Link', link)
  }
}

/*
 * Function to get M2M token
 * @returns {Promise}
 */
const getM2MToken = async () => {
  return await m2m.getMachineToken(
    config.AUTH0_CLIENT_ID,
    config.AUTH0_CLIENT_SECRET
  )
}

/**
 * Function to encode query string
 * @param {Object} queryObj the query object
 * @param {String} nesting the nesting string
 * @returns {String} query string
 */
function encodeQueryString(queryObj, nesting = '') {
  const pairs = Object.entries(queryObj).map(([key, val]) => {
    // Handle the nested, recursive case, where the value to encode is an object itself
    if (typeof val === 'object') {
      return encodeQueryString(val, nesting + `${key}.`)
    } else {
      // Handle base case, where the value to encode is simply a string.
      return [nesting + key, val].map(querystring.escape).join('=')
    }
  })
  return pairs.join('&')
}

/**
 * Generate M2M auth user.
 *
 * @returns {Object} the M2M auth user
 */
function getAuditM2Muser() {
  return {
    isMachine: true,
    userId: config.m2m.M2M_AUDIT_USER_ID,
    handle: config.m2m.M2M_AUDIT_HANDLE
  }
}

module.exports = {
  encodeQueryString,
  getParamFromCliArgs,
  promptUser,
  sleep,
  importData,
  exportData,
  checkIfExists,
  autoWrapExpress,
  setResHeaders,
  getM2MToken,
  getAuditM2Muser
}
