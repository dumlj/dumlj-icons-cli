import { describe, expect } from '@jest/globals'
import { SpawnOptions, spawn } from 'child_process'
import path from 'path'
import renderer from 'react-test-renderer'
import fs from 'fs'
import React from 'react'

/** 执行命令, 兼容 spawn 无法捕获错误 */
export const spawnCommand = (command: string, args?: readonly string[], options?: SpawnOptions) => {
  return new Promise((resolve, reject) => {
    const content = []
    const errors = []
    const cp = spawn(command, args, options)
    const { stdout, stderr } = cp

    stderr.on('data', (chunk) => errors.push(chunk.toString()))
    stdout.on('data', (chunk) => content.push(chunk.toString()))

    cp.on('error', (err) => {
      console.log(err)
      reject(err)
    })

    cp.on('close', () => {
      if (errors.length > 0) {
        reject(new Error(errors.join('')))
        return
      }

      resolve(content.join(''))
    })
  })
}

describe('test icon-cli', () => {
  const project = path.join(__dirname, './icons-lib')

  const genIcon = () => {
    return spawnCommand('dumlj-icons', ['-c', './icons.config.js'], {
      cwd: project,
    })
  }

  const buildIcon = () => {
    return spawnCommand('babel', ['./src', '--out-dir', 'dist', '--extensions', '.js'], {
      cwd: project,
    })
  }

  beforeAll(async () => {
    await genIcon()

    await buildIcon()
  }, 120 * 1000)

  afterAll(() => {
    spawnCommand('rm', ['-rf', 'src'], {
      cwd: project,
    })
  })

  it('icons renders correctly', async () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    const { default: Bell } = await import('./icons-lib/dist/icons/Bell')
    const tree = renderer.create(<Bell />).toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('generate icons folders correctly', () => {
    const checkFolderNames = () => {
      const iconsFolder = fs.existsSync(path.join(project, 'src/icons'))
      const styleFolder = fs.existsSync(path.join(project, 'src/style'))
      const svgFolder = fs.existsSync(path.join(project, 'src/svg'))
      const utilsFolder = fs.existsSync(path.join(project, 'src/utils'))

      return iconsFolder && styleFolder && svgFolder && utilsFolder
    }

    expect(checkFolderNames()).toBeTruthy()
  })
})
