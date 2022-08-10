const {Sequelize, Model} = require('sequelize');
const errors = require('../common/errors')

module.exports = (sequelize) => {
    class Organization extends Model {
        static associate(models){
            Organization._models = models
        }

        static async findById(id){
            const organization = await Organization.findOne({
                where: {
                    id
                }
            })
            if(!organization){
                throw new errors.NotFoundError(`id: ${id} 'Role' doesn't exists.`)
            }
            return organization
        }
    }

    Organization.init(
        {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false
            },

            organizationName: {
                type: Sequelize.STRING(45),
                allowNull: false
            },
            adminEmail: {
                type: Sequelize.STRING(45)
            },
            organizationDisplayName: {
                type: Sequelize.STRING(45)
            },
            organizationLogoImage: {
                type: Sequelize.STRING(45)
            },
            createdBy: {
                type: Sequelize.INTEGER,
                field: 'createdBy'
            },
            createdAt: {
                type: Sequelize.DATE,
                field: 'createdAt'
            },
            updatedBy: {
                type: Sequelize.INTEGER,
                field: 'updatedBy'
            },
            updatedAt: {
                type: Sequelize.DATE,
                field: 'updatedAt'
            }
        },
        {
            sequelize,
            tableName: 'organization',
            paranoid: false,
            createdAt: 'createdAt',
            updatedAt: 'updatedAt',
            timestamps: true,
            indexes: [
                {
                    unique:true,
                    fields: ['organizationName']
                }
            ]
        }
    )

    return Organization
}