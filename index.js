const fs = require('fs')
const path = require('path')
const EventEmitter = require('events')
const binding = require('./build/Release/spawn_as_admin.node')

function resolveCommand (command) {
  if (command[0] === '/') return command

  const paths = process.env.PATH.split(path.delimiter)
  for (const p of paths) {
    try {
      const filename = path.join(p, command)
      if (fs.statSync(filename).isFile()) return filename
    } catch (e) {}
  }

  return command
}

// This class definition is deferred because it references EventEmitter which is not
// available during V8 startup snapshot creation.
let adminProcessClass
function getAdminProcessClass () {
  if (!adminProcessClass) {
    adminProcessClass = class AdminProcessClass extends EventEmitter {
      constructor (pid, stdinFD, stdoutFD) {
        super()
        this.pid = pid
        this.stdin = stdinFD ? fs.createWriteStream(null, {fd: stdinFD}) : null
        this.stdout = stdoutFD ? fs.createReadStream(null, {fd: stdoutFD}) : null
        this.stderr = null
        this.stdio = [this.stdin, this.stdout, this.stderr]

        this.stdout.on('error', (error) => {
          if (error.code !== 'EBADF') throw error
        })
      }

      kill (signal) {
        process.kill(this.pid, signal)
      }
    }
  }

  return adminProcessClass
}

module.exports = function spawnAsAdmin (command, args = [], options = {}) {
  if (process.platform !== 'darwin' && process.platform !== 'win32') {
    throw new Error('This function only works on macOS and Windows')
  }

  command = resolveCommand(command)
  let result = null

  const spawnResult = binding.spawnAsAdmin(command, args, (exitCode) => {
    result.emit('exit', exitCode)
  }, options && options.testMode)

  if (!spawnResult) {
    throw new Error(`Failed to obtain root priveleges to run ${command}`)
  }

  const AdminProcess = getAdminProcessClass()
  result = new AdminProcess(spawnResult.pid, spawnResult.stdin, spawnResult.stdout)
  return result
}
