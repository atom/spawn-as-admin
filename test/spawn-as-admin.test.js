const assert = require('assert')
const fs = require('fs')
const os = require('os')
const path = require('path')
const spawnAsAdmin = require('..')

const options = {}

// Comment out to test w/ actual admin privileges. This will require typing a username
// and password during the tests.
options.testMode = true

suite('spawnAsAdmin', function () {
  this.timeout(10000) // allow time to type password at the prompt

  if (process.platform === 'darwin' || process.platform === 'win32') {

    test('runs the given command with the given arguments', async () => {
      const filePath = path.join(os.tmpdir(), 'spawn-as-admin-test-' + Date.now())

      const child = spawnAsAdmin(process.execPath, [
        '-e',
        'require("fs").writeFileSync(process.argv[1], "hello")',
        filePath
      ], options)

      await new Promise(resolve => {
        child.on('exit', (code) => {
          assert.equal(code, 0)
          assert.equal(fs.readFileSync(filePath, 'utf8'), 'hello');
          resolve()
        })
      })
    })

    test('allows the child process to be killed', async () => {
      const child = spawnAsAdmin(process.execPath, [], options)

      await new Promise(resolve => {
        child.on('exit', (code) => resolve())
        child.kill()
      })
    })

  }

  if (process.platform === 'darwin') {

    test('returns a child process with a readable stdout and a writable stdin', async () => {
      const child = spawnAsAdmin('/bin/cat', [], options)

      let stdout = ''
      child.stdout.on('data', (data) => stdout += data.toString('utf8'))

      fs.createReadStream(__filename).pipe(child.stdin)

      await new Promise(resolve => {
        child.on('exit', (code) => {
          assert.equal(code, 0)
          assert.equal(stdout, fs.readFileSync(__filename, 'utf8'))
          resolve()
        })
      })
    })

    test('runs the child process as the root user', async () => {
      const child = spawnAsAdmin('whoami', [], options)

      let stdout = ''
      child.stdout.on('data', (data) => stdout += data.toString('utf8'))

      await new Promise(resolve => {
        child.on('exit', (code) => {
          assert.equal(code, 0)

          if (options.testMode) {
            assert.equal(stdout, process.env.USER + '\n')
          } else {
            assert.equal(stdout, 'root\n')
          }

          resolve()
        })
      })
    })

  }
})
