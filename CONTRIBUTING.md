If you'd like to help, the best place to start are issues with the following labels:

* [`E-easy`](https://github.com/freebroccolo/ocaml-language-server/issues?q=is%3Aissue+is%3Aopen+label%3AE-easy)
* [`E-help-wanted`](https://github.com/freebroccolo/ocaml-language-server/issues?q=is%3Aissue+is%3Aopen+label%3AE-help-wanted)

We follow the issue labels used by Rust which are described in detail
[here](https://github.com/rust-lang/rust/blob/master/CONTRIBUTING.md#issue-triage).

If you find something you want to work on, please leave a comment so that others
can coordinate their efforts with you. Also, please don't hesitate to open a new
issue if you have feedback of any kind.

### Discussion

There is an `#editorsupport` channel on the Reason [discord
server](https://discord.gg/reasonml). If you would like to discuss an idea or
need help or have other feedback you can usually find the developers there.

### Prerequisites

| prerequisite |      | version                                                        | how to install                  |
| ------------ | ---- | :------------------------------------------------------------- | ------------------------------- |
| Node         | `>=` | [`9.5.0`](https://github.com/nodejs/node/releases/tag/v9.5.0)  | manually or via package manager |
| Yarn         | `>=` | [`1.3.2`](https://github.com/yarnpkg/yarn/releases/tag/v1.3.2) | `npm install -g yarn`           |

### Building

```sh
git clone https://github.com/freebroccolo/ocaml-language-server   # clone the repository
cd ocaml-language-server
yarn install                                                      # install dependencies
node ./bin/server --stdio                                         # start the server (optional)
```

### Debugging the language server with VSCode

It is possible to debug the language server with VSCode, leveraging the debugging tools it provides.

In order to do so:

1. Clone https://github.com/reasonml-editor/vscode-reasonml and run `yarn install`
1. Clone https://github.com/freebroccolo/ocaml-language-server and run `yarn install`
1. In the terminal, go to the `ocaml-lang-server` folder and type `npm link`
1. In the terminal, go to the `vscode-reasonml` folder and type `npm link ocaml-language-server`. This should make the version of `ocaml-language-server` in  `vscode-reasonml/node_modules` point to your local version
1. Open both `vscode-reasonml` and `ocaml-language-server` folders in VSCode (you can open a new VSCode window using cmd+shift+n on MacOS or ctrl-shift-n in Windows and Linux)
1. In `vscode-reasonml` window, go to "Debug->Start Debugging". This will open a new VSCode window where the vscode-reasonml extension has been replaced with the development one.
1. In `ocaml-language-server` window, go to the Debug panel (cmd-shift-d / ctrl-shift-d) and press the Play button at the top: "Attach to process"

At this point, if you want to test for changes, you can run `npm run watch` in the "Terminal" panel of the `ocaml-language-server` window, and restart the debugging process in the `vscode-reasonml` window to test them.
