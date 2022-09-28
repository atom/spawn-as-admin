##### Atom and all repositories under Atom will be archived on December 15, 2022. Learn more in our [official announcement](https://github.blog/2022-06-08-sunsetting-atom/)
 # spawn-as-admin

[![CI](https://github.com/atom/spawn-as-admin/actions/workflows/ci.yml/badge.svg)](https://github.com/atom/spawn-as-admin/actions/workflows/ci.yml)

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
