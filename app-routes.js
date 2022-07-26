/**
 * Configure all routes for express app
 */

const _ = require('lodash')
const config = require('config')
const { StatusCodes } = require('http-status-codes')
const helper = require('./src/common/helper')
const errors = require('./src/common/errors')
const routes = require('./src/routes')
const constants = require('./app-constants')
const authenticator = require('tc-core-library-js').middleware.jwtAuthenticator

/**
 * Configure all routes for express app
 * @param app the express app
 */
module.exports = (app) => {
  // Load all routes
  _.each(routes, (verbs, path) => {
    _.each(verbs, (def, verb) => {
      const controllerPath = `./src/controllers/${def.controller}`
      const method = require(controllerPath)[def.method]
      if (!method) {
        throw new Error(`${def.method} is undefined`)
      }

      const actions = []
      actions.push((req, _res, next) => {
        req.signature = `${def.controller}#${def.method}`
        next()
      })

      // add Authenticator check if route has auth
      if (def.auth) {
        actions.push((req, res, next) => {
          authenticator(_.pick(config, ['AUTH_SECRET', 'VALID_ISSUERS']))(req, res, next)
        })

        actions.push((req, _res, next) => {
          if (req.authUser.isMachine) {
            // M2M
            if (!req.authUser.scopes || !helper.checkIfExists(def.scopes, req.authUser.scopes)) {
              next(new errors.ForbiddenError('You are not allowed to perform this action!'))
            } else {
              req.authUser.userId = config.m2m.M2M_AUDIT_USER_ID
              req.authUser.handle = config.m2m.M2M_AUDIT_HANDLE
              next()
            }
          } else {
            req.authUser.jwtToken = req.headers.authorization
            // check if user is Admin
            if (_.includes(req.authUser.roles, constants.UserRoles.Administrator)) {
              req.authUser.isAdmin = true
            }
            next()
          }
        })
      }
      actions.push(method)
      const fullPath = config.get('BASE_PATH') + path
      app[verb](fullPath, helper.autoWrapExpress(actions))
    })
  })

  // Check if the route is not found or HTTP method is not supported
  app.use('*', (req, res) => {
    let url = req.baseUrl
    if (url.indexOf(config.get('BASE_PATH')) === 0) {
      url = url.substring(config.get('BASE_PATH').length)
    }
    const route = routes[url]
    if (route) {
      res.status(StatusCodes.METHOD_NOT_ALLOWED).json({ message: 'The requested HTTP method is not supported.' })
    } else {
      res.status(StatusCodes.NOT_FOUND).json({ message: 'The requested resource cannot be found.' })
    }
  })
}
