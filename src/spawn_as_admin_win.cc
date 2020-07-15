#include "spawn_as_admin.h"
#include <windows.h>

namespace spawn_as_admin {

std::string QuoteCmdArg(const std::string& arg) {
  if (arg.size() == 0)
    return arg;

  // No quotation needed.
  if (arg.find_first_of(" \t\"") == std::string::npos)
    return arg;

  // No embedded double quotes or backlashes, just wrap quote marks around
  // the whole thing.
  if (arg.find_first_of("\"\\") == std::string::npos)
    return std::string("\"") + arg + '"';

  // Expected input/output:
  //   input : hello"world
  //   output: "hello\"world"
  //   input : hello""world
  //   output: "hello\"\"world"
  //   input : hello\world
  //   output: hello\world
  //   input : hello\\world
  //   output: hello\\world
  //   input : hello\"world
  //   output: "hello\\\"world"
  //   input : hello\\"world
  //   output: "hello\\\\\"world"
  //   input : hello world\
  //   output: "hello world\"
  std::string quoted;
  bool quote_hit = true;
  for (size_t i = arg.size(); i > 0; --i) {
    quoted.push_back(arg[i - 1]);

    if (quote_hit && arg[i - 1] == '\\') {
      quoted.push_back('\\');
    } else if (arg[i - 1] == '"') {
      quote_hit = true;
      quoted.push_back('\\');
    } else {
      quote_hit = false;
    }
  }

  return std::string("\"") + std::string(quoted.rbegin(), quoted.rend()) + '"';
}

ChildProcess StartChildProcess(const std::string& command, const std::vector<std::string>& args, bool test_mode) {
  CoInitializeEx(NULL, COINIT_APARTMENTTHREADED | COINIT_DISABLE_OLE1DDE);

  std::string parameters;
  for (size_t i = 0; i < args.size(); ++i)
    parameters += QuoteCmdArg(args[i]) + ' ';

  SHELLEXECUTEINFO shell_execute_info = {};
  shell_execute_info.cbSize = sizeof(shell_execute_info);
  shell_execute_info.fMask = SEE_MASK_NOASYNC | SEE_MASK_NOCLOSEPROCESS;
  shell_execute_info.lpVerb = test_mode ? "open" : "runas";
  shell_execute_info.lpFile = command.c_str();
  shell_execute_info.lpParameters = parameters.c_str();
  shell_execute_info.nShow = SW_NORMAL;

  if (::ShellExecuteEx(&shell_execute_info) == FALSE || shell_execute_info.hProcess == NULL) {
    return {nullptr, -1, -1, -1};
  }

  int pid = GetProcessId(shell_execute_info.hProcess);

  return {shell_execute_info.hProcess, pid, -1, -1};
}

int WaitForChildProcessToExit(ChildProcess *child_process, bool test_mode) {
  // Wait for the process to complete.
  auto process = static_cast<HANDLE>(child_process->payload);
  if (!process) {
    return -1;
  }

  ::WaitForSingleObject(process, INFINITE);

  DWORD code;
  const bool failed = ::GetExitCodeProcess(process, &code) == 0;
  CloseHandle(process);
  return failed ? -1 : code;
}

}  // namespace spawn_as_admin
