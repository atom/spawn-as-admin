# spawn-as-admin

[![Build Status](https://travis-ci.org/atom/spawn-as-admin.svg?branch=master)](https://travis-ci.org/atom/spawn-as-admin)
[![Build status](https://ci.appveyor.com/api/projects/status/idlwdrnp54iowr2d/branch/master?svg=true)](https://ci.appveyor.com/project/Atom/spawn-as-admin/branch/master)

Run commands with administrator privileges

## Installing

```sh
npm install spawn-as-admin
```

## Docs

### spawnAsAdmin(command, arguments)

Launches a new process with the given `command`, and `arguments`.

Returns an `AdminProcess` object that implements a subset of node's `ChildProcess` API:

#### Properties:

* `pid` - The child process's process ID.
* `stdin` - A `WritableStream` representing the process's standard input.
* `stdout` - A `ReadableStream` representing the process's standard output.

#### Methods:

* `kill([signal])` - Sends the given `signal` to the child process. If no signal is specified, `SIGTERM` will be sent.

#### Events:

* `exit` - Emitted when the process exits, and passes the exit code of the process.

## Limitations

* The library only works on macOS and Windows.
* The `stdin` and `stdout` properties are only present on macOS.
