/**
 * Contains role routes
 */
const constants = require('../../app-constants')

module.exports = {
  '/organizations': {
    post: {
      controller: 'OrganizationController',
      method: 'createOrganization',
      auth: 'jwt',
      scopes: [constants.Scopes.CREATE_ROLE, constants.Scopes.ALL_ROLE]
    },
    get: {
      controller: 'OrganizationController',
      method: 'searchOrganizations',
      auth: 'jwt',
      scopes: [constants.Scopes.READ_ROLE, constants.Scopes.ALL_ROLE]
    }
  },
  '/organizations/:id': {
    get: {
      controller: 'OrganizationController',
      method: 'getOrganization',
      auth: 'jwt',
      scopes: [constants.Scopes.READ_ROLE, constants.Scopes.ALL_ROLE]
    },
    patch: {
      controller: 'OrganizationController',
      method: 'updateOrganization',
      auth: 'jwt',
      scopes: [constants.Scopes.UPDATE_ROLE, constants.Scopes.ALL_ROLE]
    },
    delete: {
      controller: 'OrganizationController',
      method: 'deleteOrganization',
      auth: 'jwt',
      scopes: [constants.Scopes.DELETE_ROLE, constants.Scopes.ALL_ROLE]
    }
  }
}
