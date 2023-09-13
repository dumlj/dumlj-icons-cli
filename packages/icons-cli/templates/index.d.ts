import type { FunctionComponent, SVGAttributes } from 'react'

interface Props extends Omit<SVGAttributes<SVGElement>, 'origin'> {
  /** 是否有旋转动画 */
  spin?: boolean
  /** 图标旋转角度 */
  rotate?: number
  /**
   * 显示为原图标（不去掉fill属性）
   */
  origin?: boolean
}

type Icon = FunctionComponent<Props>
