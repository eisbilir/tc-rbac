
/*
 * Add description field to the Role model.
 */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction()
    try {
      await queryInterface.addColumn({ tableName: 'role' }, 'description',
        { type: Sequelize.STRING(500) },
        { transaction })
      await transaction.commit()
    } catch (err) {
      await transaction.rollback()
      throw err
    }
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn({ tableName: 'role' }, 'description')
  }
}
