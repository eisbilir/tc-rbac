/**
 * App constants
 */

const UserRoles = {
  Administrator: 'administrator',
  TopcoderUser: 'Topcoder User'
}

const Scopes = {
  // role
  READ_ROLE: 'read:roles',
  CREATE_ROLE: '',
  UPDATE_ROLE: '',
  DELETE_ROLE: '',
  ALL_ROLE: 'all:roles'
}

module.exports = {
  UserRoles,
  Scopes
}
