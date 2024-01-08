const fs = require('fs')
const { keyboard, Key } = require('@nut-tree/nut-js')

const { sleep, log } = require('./utils')

exports.runner = async () => {
  const fileFlagIndex = process.argv.indexOf('-f')
  if (fileFlagIndex === -1) {
    throw new Error('There is no "-f" flag with file path')
  }
  const filePath = process.argv[fileFlagIndex + 1]

  const inputDelayMsIndex = process.argv.indexOf('-d')
  let inputDelayMs = 3000
  if (inputDelayMsIndex !== -1) {
    inputDelayMs = +process.argv[inputDelayMsIndex + 1]
  }

  const inputOffsetMsIndex = process.argv.indexOf('-o')
  let inputOffsetMs = 500
  if (inputOffsetMsIndex !== -1) {
    inputOffsetMs = +process.argv[inputOffsetMsIndex + 1]
  }

  const replaceTabWithKeyIndex = process.argv.indexOf('-r')
  let replaceTabWithKey = ""
  if (replaceTabWithKeyIndex !== -1) {
    replaceTabWithKey = process.argv[replaceTabWithKeyIndex + 1]
  }

  log(`
PWD: ${process.env.PWD}
File path (-f): '${filePath}'
Input Delay Ms (-d): ${inputDelayMs}
Input Offset Ms (-o): ${inputOffsetMs}
Replace Tab With Key (-r): '${replaceTabWithKey}'
`)

  const file = fs.readFileSync(filePath).toString()

  keyboard.config.autoDelayMs = 0

  log(`Sleep before input for ${inputDelayMs} ms`)
  await sleep(inputDelayMs)

  for (let line of file.split('\n')) {
    let tabCount = 0
    if (replaceTabWithKey.length !== 0) {
      while (true) {
        if (line.startsWith(replaceTabWithKey)) {
          line = line.replace(replaceTabWithKey, "")
          tabCount++
        } else {
          break
        }
      }
    }
    log(`Tab key count: ${tabCount}; Line: '${line}'`)
    for (let i = 0; i < tabCount; i++) {
      await keyboard.type(Key.Tab)
    }
    for (const char of line) {
      if (['{', '}', '<', '>', ':', '"'].includes(char)) {
        await keyboard.pressKey(Key.LeftShift)
        await keyboard.type(char)
        await keyboard.releaseKey(Key.LeftShift)
      } else {
        await keyboard.type(char)
      }
      await sleep(inputOffsetMs)
    }
    await keyboard.type(Key.Enter)
  }

  log('Done')
}
