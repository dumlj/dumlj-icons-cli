figma.showUI(__html__, { width: 320, height: 436 })

function getLocalData(key) {
  return figma.clientStorage.getAsync(key)
}

function setLocalData(key, data) {
  figma.clientStorage.setAsync(key, data)
}

function init() {
  getLocalData('settingData').then((settingData) => {
    figma.ui.postMessage({ type: 'settingDataGot', settingData })
  })
}

figma.ui.onmessage = (msg) => {
  switch (msg.type) {
    case 'setSettingData':
      setLocalData('settingData', msg.data)
      break
    case 'cancel':
      figma.closePlugin()
      break
  }
}

init()
