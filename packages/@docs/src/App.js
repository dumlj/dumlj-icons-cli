import React, { useState, useMemo } from 'react'
import { Tooltip, message, Radio, Slider, Row, Col, Input, Switch } from 'antd'
import * as icons from '@dumlj/icon'

const RadioOptions = [
  { label: '原图标', value: true },
  { label: '单色图标', value: false },
]

const App = () => {
  const [isOriginIcon, setIsOriginIcon] = useState(true)
  const [color, setColor] = useState('#35C08E')
  const [fontSize, setFontSize] = useState(24)
  const [spin, setSpin] = useState(false)
  const [searchWord, setSearchWord] = useState('')

  const copy = async (text) => {
    const com = !isOriginIcon ? ` <${text} />` : `<${text} origin />`
    const code = `import { ${text} } from '@dumlj/icon'
    ${com}
    `
    await navigator.clipboard.writeText(code)
    message.success(`复制成功：${code}`)
  }

  const iconList = useMemo(() => {
    return Object.keys(icons).filter((name) => {
      if (!searchWord) {
        return true
      }
      const searchLower = searchWord.toLocaleLowerCase()
      return name.toLocaleLowerCase().includes(searchLower)
    })
  }, [searchWord])

  return (
    <div>
      <div className="header">
        dumlj-icon
        <a
          target="_blank"
          href="https://www.figma.com/file/i9HQoS2yCOwkX8vR78qZ4a/%E5%9B%BE%E6%A0%87%E5%BA%93"
          rel="noreferrer"
          className="link"
        >
          【图标来源】
        </a>
      </div>
      <Row justify="start" gutter={10}>
        <Col>
          <Radio.Group
            options={RadioOptions}
            value={isOriginIcon}
            optionType="button"
            onChange={(e) => {
              setIsOriginIcon(e.target.value)
            }}
          />
        </Col>
        <Col>
          <Input
            style={{ width: 400 }}
            value={searchWord}
            placeholder="搜索"
            onChange={(e) => {
              setSearchWord(e.target.value)
            }}
          />
        </Col>
      </Row>

      <Row style={{ marginTop: 20 }}>
        {!isOriginIcon && (
          <Col span={4}>
            <Row>
              <span>颜色(color)：</span>
              <input
                type="color"
                value={color}
                onChange={(e) => {
                  setColor(e.target.value)
                }}
              />
            </Row>
          </Col>
        )}
        <Col span={6}>
          <Row>
            <span>大小(fontSize)：</span>
            <Col span={16}>
              <Slider
                label="图标大小"
                range
                value={fontSize}
                onChange={(e) => {
                  const [fontSize] = e
                  setFontSize(fontSize)
                }}
              />
            </Col>
          </Row>
        </Col>
        <Col span={6}>
          <Switch unCheckedChildren="开启旋转" checkedChildren="关闭旋转" onChange={setSpin} />
        </Col>
      </Row>

      <ul className="icon-list">
        {iconList.map((key, index) => {
          const Icon = icons[key]
          return (
            <li
              onClick={() => {
                copy(key)
              }}
              key={index}
            >
              <Tooltip title="复制" placement="topLeft">
                <span className="icon-item">
                  <Icon origin={isOriginIcon || false} spin={spin} style={{ color, fontSize }} />
                  <span className="icon-item_name">{`<${key} />`}</span>
                </span>
              </Tooltip>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default App
