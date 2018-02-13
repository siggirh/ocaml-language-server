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
