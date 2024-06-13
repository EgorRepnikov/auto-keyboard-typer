const fs = require('fs')
const robot = require("robotjs")

const { sleep, log } = require('./utils')

const ShiftChars = {
  '{': '[',
  '}': ']',
  '>': '.',
  '<': ',',
  ':': ';',
  '+': '=',
  '$': '4',
  '@': '2',
  '_': '-',
  '*': '8',
  '"': '\'',
}

exports.runner = async () => {
  const clipboardy = (await import('clipboardy')).default

  const fileFlagIndex = process.argv.indexOf('-f')
  const isClipboard = process.argv.indexOf('-c') !== -1
  if (fileFlagIndex === -1 && !isClipboard) {
    throw new Error('There is no "-f" or "-c" flag with file path or clickboard')
  }
  const filePath = isClipboard || process.argv[fileFlagIndex + 1]

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
${isClipboard ? 'Clipboard is used: true' : `File path (-f): '${filePath}'`}
Input Delay Ms (-d): ${inputDelayMs}
Input Offset Ms (-o): ${inputOffsetMs}
Replace Tab With Key (-r): '${replaceTabWithKey}'
`)

  const content = isClipboard ? clipboardy.readSync() : fs.readFileSync(filePath).toString()

  robot.setKeyboardDelay(0)

  log(`Sleep before input for ${inputDelayMs} ms`)
  await sleep(inputDelayMs)

  const lines = content.split('\n')
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i]
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
    log(`Tab key count: ${tabCount}; Line: \`${line}\``)
    for (let i = 0; i < tabCount; i++) {
      robot.keyTap('tab')
    }
    for (const char of line) {
      if (ShiftChars[char] !== undefined) {
        robot.keyTap(ShiftChars[char], 'shift')
      } else {
        robot.typeString(char)
      }
      await sleep(inputOffsetMs)
    }
    if (i !== lines.length - 1) {
      robot.keyTap('enter')
    }
    await sleep(inputOffsetMs)
  }

  log('Done')
}
