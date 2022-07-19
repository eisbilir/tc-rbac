/**
 * Controller for Role endpoints
 */
const { StatusCodes } = require('http-status-codes')
const service = require('../services/RoleService')
// const helper = require('../common/helper')

/**
 * Get role by id
 * @param req the request
 * @param res the response
 */
async function getRole(req, res) {
  res.send(await service.getRole(req.authUser, req.params.id))
}

/**
 * Create role
 * @param req the request
 * @param res the response
 */
async function createRole(req, res) {
  res.send(await service.createRole(req.authUser, req.body))
}

/**
 * update role by id
 * @param req the request
 * @param res the response
 */
async function updateRole(req, res) {
  res.send(await service.updateRole(req.authUser, req.params.id, req.body))
}

/**
 * Delete role by id
 * @param req the request
 * @param res the response
 */
async function deleteRole(req, res) {
  await service.deleteRole(req.authUser, req.params.id)
  res.status(StatusCodes.NO_CONTENT).end()
}

/**
 * Search roles
 * @param req the request
 * @param res the response
 */
async function searchRoles(req, res) {
  // need for pagination
  // const result = await service.searchRoles(req.authUser, req.query)
  // helper.setResHeaders(req, res, result)
  // res.send(result.result)
  res.send(await service.searchRoles(req.authUser, req.query))
}

module.exports = {
  getRole,
  createRole,
  updateRole,
  deleteRole,
  searchRoles
}
