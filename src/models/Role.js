const { Sequelize, Model } = require('sequelize')
const errors = require('../common/errors')

module.exports = (sequelize) => {
  class Role extends Model {
    /**
     * Create association between models
     * @param {Object} models the database models
     */
    static associate(models) {
      Role._models = models
    }

    /**
     * Get role by id
     * @param {String} id the role id
     * @returns {Role} the role instance
     */
    static async findById(id) {
      const role = await Role.findOne({
        where: {
          id
        }
      })
      if (!role) {
        throw new errors.NotFoundError(`id: ${id} "Role" doesn't exists.`)
      }
      return role
    }
  }
  Role.init(
    {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      name: {
        type: Sequelize.STRING(45),
        allowNull: false
      },
      description: {
        type: Sequelize.STRING(500)
      },
      createdBy: {
        field: 'createdBy',
        type: Sequelize.INTEGER,
        allowNull: false
      },
      updatedBy: {
        field: 'modifiedBy',
        type: Sequelize.INTEGER
      },
      createdAt: {
        field: 'createdAt',
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      updatedAt: {
        field: 'modifiedAt',
        type: Sequelize.DATE
      }
    },
    {
      sequelize,
      tableName: 'role',
      paranoid: false,
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ['name']
        }
      ]
    }
  )

  return Role
}
