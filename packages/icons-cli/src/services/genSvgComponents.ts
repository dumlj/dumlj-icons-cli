import path from 'path'
import fs from 'fs'
import { emptyDirSync, ensureDirSync, writeFileSync, copy } from 'fs-extra'
import { logger } from '../utils'
import { svgToReactComponentCode, svgToJsxCode } from '../utils/svgTransform'
import { IconConfigTypes, SvgMetaType, SvgMetaMapType } from 'src/types'

const genSvgComponents = async (icons: SvgMetaMapType, config: IconConfigTypes) => {
  const { outputDir = './src', defaultOriginIcon = false, figmaNodes, componentNameSuffix = 'js' } = config
  const iconsDir = path.join(outputDir, 'icons')
  const svgDir = path.join(outputDir, 'svg')
  const templatesDir = path.join(__dirname, '../../templates')

  // 生成入口文件 index.js 和 index.d.ts
  const generateIconsIndex = () => {
    if (figmaNodes) {
      // 清空文件夹
      figmaNodes.forEach(({ folderName = '' }) => {
        ensureDirSync(path.join(iconsDir, folderName))
        emptyDirSync(path.join(iconsDir, folderName))
      })
    } else {
      ensureDirSync(iconsDir)
      emptyDirSync(iconsDir)
    }
    writeFileSync(path.join(outputDir, 'index.js'), '', 'utf-8')
    writeFileSync(path.join(outputDir, 'index.d.ts'), '', 'utf-8')
  }

  // 生成react组件
  const generateIconCode = async ({ name, componentName, folderName = '' }) => {
    const location = path.join(svgDir, folderName, `${name}.svg`)

    const destination = path.join(iconsDir, folderName, `${componentName}.${componentNameSuffix}`)
    // 获取svg源文件
    const svgCode = fs.readFileSync(location).toString()

    const jsxCode = await svgToJsxCode(svgCode, componentName)

    const component = await svgToReactComponentCode({
      svgCode,
      componentName,
      jsxCode,
      defaultOriginIcon,
      figmaNodes,
    })

    fs.writeFileSync(destination, component, 'utf-8')
    if (!folderName) {
      appendToIconsIndex({ componentName, folderName })
    }

    logger.success(`${componentName}.${componentNameSuffix} 生成成功`)
  }

  // 添加 export 代码到入口文件 和 声明文件
  const appendToIconsIndex = ({ componentName, folderName = '' }) => {
    const exportString = `export { default as ${componentName} } from './icons${
      folderName && `/${folderName}`
    }/${componentName}';\r\n`
    fs.appendFileSync(path.join(outputDir, 'index.js'), exportString, 'utf-8')

    const exportTypeString = `export const ${componentName}: Icon;\n`
    fs.appendFileSync(path.join(outputDir, 'index.d.ts'), exportTypeString, 'utf-8')
  }

  // 生成svg组件
  const runGenerate = async () => {
    generateIconsIndex()

    await copy(templatesDir, outputDir)

    Object.values(icons).forEach(({ name, componentName, folderName, image }) => {
      if (!image) {
        console.log(name + ' is missing the image url, failed to generate.')
        return
      }
      generateIconCode({ name, componentName, folderName })
    })

    if (figmaNodes) {
      // 添加 export 代码到入口文件 和 声明文件
      const componentJson = fs.readFileSync(path.join(outputDir, 'data.json'), {
        encoding: 'utf8',
      })
      const componentMap: Record<string, SvgMetaType[]> = JSON.parse(componentJson)
      Object.values(componentMap)
        .reduce((pre, val) => [...pre, ...val], [])
        .forEach(({ componentName, image, folderName }) => {
          if (image) {
            appendToIconsIndex({ componentName, folderName })
          }
        })
    }
  }

  await runGenerate()
}

export default genSvgComponents
