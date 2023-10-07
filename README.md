# Speedscope VS Code Extension

Open [🔬Speedscope](https://www.speedscope.app/) profiles in VS Code and jump to the source code of the profiled functions.

## Features

### Open a speedscope profiles from VS Code Explorer

![Open a speedscope profile](https://github.com/evg656e/vscode-speedscope/assets/28028005/f9fe083f-b497-4e42-8f47-217b195ab347)

Menu item available for `.json`, `.txt`, `.log`, `.prof`, `.cpuprofile` and `.heapprofile` extensions.

### Jump to the source code of the profiled functions

![Jump to the source code](https://github.com/evg656e/vscode-speedscope/assets/28028005/e4475bd2-8e1c-4c81-97c9-0c529488ba4c)

Use `Crtl+Click` on the function name in the flamegraph to jump to the source code.

### Show speedscope app in side view with ability to open local files

![Show speedscope in side view](https://github.com/evg656e/vscode-speedscope/assets/28028005/2eb0cac0-33c8-411a-8835-cf34e475a66f)

Use `Ctrl+Shift+P` and type `Show Speedscope` to open speedscope in side view.

## Usage examples

### Profiling with py-spy

Here is example of profiling automation with [py-spy](https://github.com/benfred/py-spy). Add following lines to your `tasks.json` file:

```json
{
    // See https://go.microsoft.com/fwlink/?LinkId=733558
    // for the documentation about the tasks.json format
    "version": "2.0.0",
    "tasks": [
        {
            "label": "Profile isort",
            "type": "process",
            "command": "${env:LOCALAPPDATA}/Programs/Python/Python311/Scripts/py-spy.exe", // correct path for your system
            "args": [
                // py-spy arguments
                "record",
                "--output", "${workspaceFolder}/profile.json",
                "--format", "speedscope",
                // profiled app arguments (isort)
                "--",
                "${workspaceFolder}/.venv/Scripts/python.exe", // venv for profiled app (setup needed)
                "${workspaceFolder}/isort",
                "--diff",
                "--check",
                "--verbose",
                "C:/Projects/django/django", // running isort on django repo to collect profile samples
            ],
            "problemMatcher": []
        },
    ]
}
```

Now you can run this task and open the profile in VS Code speedscope view with ability to jump to the source code of the profiled functions.
