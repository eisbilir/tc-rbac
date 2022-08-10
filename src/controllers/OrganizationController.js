/**
 * Controller for Organization endpoints
 */
const { StatusCodes } = require('http-status-codes')
const service = require('../services/OrganizationService')
// const helper = require('../common/helper')

async function getOrganization(req, res) {
    res.send(await service.getOrganization(req.authUser, req.params.id))
  }
  
  /**
   * Create organization
   * @param req the request
   * @param res the response
   */
  async function createOrganization(req, res) {
    res.send(await service.createOrganization(req.authUser, req.body))
  }
  
  /**
   * update organization by id
   * @param req the request
   * @param res the response
   */
  async function updateOrganization(req, res) {
    res.send(await service.updateOrganization(req.authUser, req.params.id, req.body))
  }
  
  /**
   * Delete organization by id
   * @param req the request
   * @param res the response
   */
  async function deleteOrganization(req, res) {
    await service.deleteOrganization(req.authUser, req.params.id)
    res.status(StatusCodes.NO_CONTENT).end()
  }
  
  /**
   * Search organization
   * @param req the request
   * @param res the response
   */
  async function searchOrganizations(req, res) {
    // need for pagination
    // const result = await service.searchOrganizations(req.authUser, req.query)
    // helper.setResHeaders(req, res, result)
    // res.send(result.result)
    res.send(await service.searchOrganizations(req.authUser, req.query))
  }

  module.exports = {
    getOrganization,
    createOrganization,
    updateOrganization,
    deleteOrganization,
    searchOrganizations
  }
