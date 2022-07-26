const fs = require('fs')
const Joi = require('joi')
const path = require('path')
const logger = require('./common/logger')

Joi.page = () => Joi.number().integer().min(1).default(1)
Joi.perPage = () => Joi.number().integer().min(1).default(20)
Joi.stringAllowEmpty = () => Joi.string().allow('')

const buildServices = (dir) => {
  const files = fs.readdirSync(dir)

  files.forEach((file) => {
    const curPath = path.join(dir, file)
    fs.stat(curPath, (err, stats) => {
      if (err) return
      if (stats.isDirectory()) {
        buildServices(curPath)
      } else if (path.extname(file) === '.js') {
        const serviceName = path.basename(file, '.js')
        logger.buildService(require(curPath), serviceName)
      }
    })
  })
}

buildServices(path.join(__dirname, 'services'))
