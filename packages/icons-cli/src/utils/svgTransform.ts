import { Config, transform } from '@svgr/core'
import { IconConfigTypes } from 'src/types'

export const getSvgoConfig = (componentName: string, clearFill = true): Config => ({
  plugins: ['@svgr/plugin-svgo', '@svgr/plugin-jsx', '@svgr/plugin-prettier'],
  // 字体图标
  svgProps: clearFill
    ? {
        width: '1em',
        height: '1em',
        fill: 'currentColor',
        'data-icon': componentName,
      }
    : {
        width: '1em',
        height: '1em',
        'data-icon': componentName,
      },
  svgo: true,
  svgoConfig: {
    plugins: [
      {
        name: 'preset-default',
        params: {
          overrides: {
            removeTitle: false,
            removeViewBox: false,
          },
        },
      },
      {
        name: 'cleanupIDs',
        params: {
          prefix: `id-${componentName}-`, // 生成唯一id，避免一个页面引用多个图标id冲突
        },
      },
      // 去掉填充，使用css当前的color
      clearFill && {
        name: 'removeAttrs',
        params: {
          attrs: '(fill|stroke)',
        },
      },
    ].filter(Boolean),
  },
  prettierConfig: {
    semi: true, // 避免在svg开头添加分号
  },
})

/**
 * svg代码生成原始图标（不清除fill属性）
 * @param {*} svgCode
 * @param {*} componentName
 * @returns
 */
export const svgToJsxCode = async (svgCode: string, componentName: string) => {
  const jsxCode = await transform(svgCode, {
    ...getSvgoConfig(componentName, false),
    template: (variables, { tpl }) => {
      return tpl`${variables.jsx}`
    },
  })
  return jsxCode
}

interface TransformType {
  /** svg源码 */
  svgCode: string
  /** React组件名 */
  componentName: string
  /** 原图标JSX */
  jsxCode: string
  /** 组件是否默认展示原图标 */
  defaultOriginIcon: boolean
  /** 指定加载figma文件的页面 */
  figmaNodes?: IconConfigTypes['figmaNodes']
}

/**
 * svg代码生成react组件
 * https://react-svgr.com/docs/options/
 */
export const svgToReactComponentCode = async ({
  svgCode,
  componentName,
  jsxCode,
  defaultOriginIcon,
  figmaNodes,
}: TransformType) => {
  const reactCode = await transform(
    svgCode,
    {
      ...getSvgoConfig(componentName),
      template: (variables, { tpl }) => {
        const { imports, jsx, componentName } = variables
        return tpl`
${imports};
${
  figmaNodes // 分组输出的情况，图标层级不同
    ? "import withStyle from '../../utils/withStyle';"
    : "import withStyle from '../utils/withStyle';"
}

const ${componentName} = ({origin = ${JSON.stringify(defaultOriginIcon)}, ...props}) => {
  if(origin) {
    return ${jsxCode}
  }

  return ${jsx}

};
 
export default withStyle(${componentName});
`
      },
    },
    { componentName }
  )

  return reactCode
}
