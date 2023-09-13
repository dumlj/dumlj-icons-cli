import path from 'path'
import genSvgComponents from '../services/genSvgComponents'
import outPutSvg from '../services/outPutSvg'
import { logger } from '../utils'
import { IconConfigTypes } from 'src/types'

interface ConfigType {
  config: string
}

async function configAction(options: ConfigType) {
  const configFile = options.config
  const config: IconConfigTypes = require(path.join(process.cwd(), configFile))
  const svgMetaData = await outPutSvg(config)
  // 测试数据
  // const svgMetaData = {
  //   '105:2015': {
  //     name: 'icon-excel',
  //     image: 'https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/07b42562-efd4-419a-aafe-84494ffc77d5',
  //   },
  // }
  logger.success(`svg图标生成成功`)
  logger.info('开始生成react组件...')
  await genSvgComponents(svgMetaData, config)
}

export default configAction
