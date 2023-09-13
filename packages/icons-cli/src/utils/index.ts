import uppercamelcase from 'uppercamelcase'
import chalk from 'chalk'
import PQueue from 'p-queue'
import { SvgMetaMapType } from 'src/types'

export const parseName = (name: string, componentNamePrefix = '') => {
  const componentName = `${componentNamePrefix}${uppercamelcase(name)}`
  return {
    originName: name,
    componentName,
  }
}

export const logger = {
  success(text: string) {
    console.log(chalk.green(text))
  },
  error(text: string) {
    console.log(chalk.red(text))
  },
  info(text: string) {
    console.log(chalk.blue(text))
  },
}

export function queueTasks(tasks) {
  const queue = new PQueue(Object.assign({ concurrency: 3 }))
  for (const task of tasks) {
    queue.add(task)
  }
  queue.start()
  return queue.onIdle()
}

/**
 * 将平铺的数据按分组返回
 * @param {*} data
 * @returns
 */
export function buildDataJson(data: SvgMetaMapType) {
  const nodeJson = {}
  Object.values(data).forEach((item) => {
    if (!nodeJson[item.folderName]) {
      nodeJson[item.folderName] = [item]
    } else {
      nodeJson[item.folderName].push(item)
    }
  })
  return nodeJson
}
