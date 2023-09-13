import got from 'got'
import * as Figma from 'figma-js'
import { join, resolve } from 'path'
import { ensureDir, writeFile, emptyDirSync, ensureFileSync, readFileSync } from 'fs-extra'
import { logger, queueTasks, parseName, buildDataJson } from '../utils'
import { IconConfigTypes, SvgMetaMapType } from 'src/types'

const ignoreNames = []

const outPutSvg = async ({
  figmaToken,
  figmaFileUrl,
  figmaNodes,
  componentNamePrefix,
  outputDir = './src',
}: IconConfigTypes) => {
  const options: Partial<Figma.FileImageParams> = {
    format: 'svg',
    scale: 1,
  }

  const client = Figma.Client({
    personalAccessToken: figmaToken,
  })

  const fileId = figmaFileUrl.match(/file\/([a-z0-9]+)\//i)[1]
  const fileParams = figmaNodes
    ? {
        ids: figmaNodes.map((item) => item.nodeId),
      }
    : undefined

  const { data } = await client.file(fileId, fileParams)

  logger.info('正在获取figma信息...')
  const components: SvgMetaMapType = {}
  const nameList = [] // 图标名字集合

  function check(c: Figma.Node, nodeInfo?: IconConfigTypes['figmaNodes'][number]) {
    if (c.type === 'COMPONENT' || c.type === 'INSTANCE') {
      const { id } = c

      // 当指定nodeId，icon不在指定nodeId中时跳过
      if (figmaNodes && !nodeInfo) return

      // 兼容name为 “Property 1=Easystore” 这种情况，有=就取后面的作为name
      const [beforeName, afterName] = c.name.split('=')
      const originName = afterName || beforeName
      const name = originName.replace(/\s+/g, '-')

      // 合规范的名字
      const nameReg = /^[A-Za-z-_]+$/g

      // 如果不规范，跳过
      if (!nameReg.test(name)) {
        logger.error(`${name} 图标命名不符合规范，跳过`)
        return
      }

      // 保证名字唯一 发现有重复名就跳过
      if (nameList.includes(name)) {
        logger.error(`${name} 图标命名重复，跳过`)
        return
      }
      nameList.push(name)

      // 忽略的图标名
      if (ignoreNames.includes(name) || name.startsWith('ignore-')) {
        return
      }

      components[id] = {
        name,
        image: '',
        componentName: parseName(name, componentNamePrefix).componentName,
        ...nodeInfo,
      }
    } else if ((c as any).children) {
      ;(c as any).children.forEach((item) =>
        check(item, nodeInfo || figmaNodes?.find((node) => node.nodeId === item.id))
      )
    }
  }
  data.document.children.forEach((item) => check(item))
  if (Object.values(components).length === 0) {
    throw Error('No components found!')
  }
  logger.info(`发现${Object.values(components).length}个图标, 开始拉取图标...`)
  const { data: imagesData } = await client.fileImages(fileId, {
    format: options.format,
    ids: Object.keys(components),
    scale: options.scale,
  })

  for (const id of Object.keys(imagesData.images)) {
    components[id].image = imagesData.images[id]
  }

  // 清空svg下有更新的子目录
  if (figmaNodes) {
    figmaNodes.forEach((item) => {
      emptyDirSync(join(outputDir, options.format, item.folderName || ''))
    })
  } else {
    emptyDirSync(join(outputDir, options.format))
  }

  await queueTasks(
    Object.values(components)
      .filter((c) => !!c.image)
      .map((component) => async () => {
        const imgRes = await got.get(component.image, {
          headers: {
            'Content-Type': 'image/svg+xml',
          },
          encoding: 'utf8',
        })

        // svg文件名字
        const { name, folderName = '' } = component

        // 当svg文件没有内容时
        if (!imgRes.body) {
          component.image = undefined
          return
        }

        ensureDir(join(outputDir, options.format, folderName)).then(() =>
          // 输出图标到svg目录
          writeFile(
            join(outputDir, options.format, folderName, `${name}.${options.format}`),
            imgRes.body,
            options.format === 'svg' ? 'utf8' : 'binary'
          )
        )
      })
  )

  logger.info('开始生成data.json')
  let curData = components

  if (figmaNodes) {
    const changeData = buildDataJson(components)
    curData = changeData
    const jsonUrl = join(outputDir, 'data.json')
    ensureFileSync(jsonUrl)
    let oldData = readFileSync(jsonUrl, {
      encoding: 'utf8',
    })
    if (oldData) {
      oldData = JSON.parse(oldData)
      // 当原来生成的数据是按照分组生成时
      if (Array.isArray(Object.values(oldData)[0])) {
        curData = oldData
        Object.keys(changeData).forEach((key) => {
          curData[key] = changeData[key]
        })
      }
    }

    // 过滤掉没有image的数据
    Object.keys(curData).forEach((key) => {
      curData[key] = (curData[key] as any).filter((item) => item.image)
    })
  }
  await ensureDir(join(outputDir))
  writeFile(resolve(outputDir, 'data.json'), JSON.stringify(curData), 'utf8')

  return components
}

export default outPutSvg
