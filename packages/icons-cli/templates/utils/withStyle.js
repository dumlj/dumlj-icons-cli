import * as React from 'react'

export default function withStyle(Component) {
  return (props) => {
    const { className, spin, rotate, style = {}, ...restProps } = props

    let finalClassName = className

    if (spin) {
      finalClassName = !className ? 'dumlj-icon-spin' : `${className} dumlj-icon-spin`
    }

    if (rotate) {
      style.transform = `rotate(${rotate}deg)`
    }

    return <Component className={finalClassName} style={style} {...restProps} />
  }
}
