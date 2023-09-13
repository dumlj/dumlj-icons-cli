export interface IconConfigTypes {
  /** figma文件url */
  figmaFileUrl: string
  /** 用户figma Token */
  figmaToken: string
  /** 图标输出目录 */
  outputDir?: string
  /** 是否默认展示原图标 true => 是 */
  defaultOriginIcon?: boolean
  componentNamePrefix?: string
  componentNameSuffix?: string
  /** 指定加载figma文件的页面 */
  figmaNodes?: {
    /** figma文件的nodeId  */
    nodeId: string
    /*** 文件夹名称，该node下的icon会生成在该文件夹下  */
    folderName: string
    /** 文件夹描述 */
    folderDesc?: string
    /** 额外的描述信息，会生成在data.json */
    extInfo?: any
  }[]
}

export interface SvgMetaType extends Partial<IconConfigTypes['figmaNodes'][number]> {
  name: string
  image: string
  componentName: string
}

export type SvgMetaMapType = Record<string, SvgMetaType>
