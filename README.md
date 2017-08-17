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

Returns an object with the following properties:

* `pid` - The child process's process ID.
* `stdin` - A `WritableStream` representing the process's standard input.
* `stdout` - A `ReadableStream` representing the process's standard output.

The returned object emits the following events:

* `exit` - Emitted when the process exits, and passes the exit code of the process.

## Limitations

* The library only works on macOS and Windows.
* The `stdin` and `stdout` properties are only present on macOS.
