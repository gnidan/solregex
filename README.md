solregex
========

Tool to generate a Solidity smart contract for a given regular expression.


Install
-------

```
npm install -g solregex
```

Usage
-----

```
$ solregex --name BasicRegex 'a+(ab)*b+' > ./contracts/BasicRegex.sol
```

Status / Motivation
-------------------

**Proof-of-concept** currently.

This project is probably not currently useful for most regexes you'd want.
Some limitations:

- Extremely limited syntax. Does not support `.` or `[]` currently, let alone
  backreferences, etc.
- Very bad performance for everything but the most simple regular expressions.

**Why?**

Hopefully to inspire additional work on the problem. It'd be nice to have
performant regexes on the EVM, with the usual modern regex bells and whistles.

This project currently uses [Automata.js](https://github.com/hokein/Automata.js)
for regex parsing and state machine descriptions.

Currently, this takes a very naïve approach with basically everything, so as to
quickly achieve minimal matching functionality. My hope is that it should be
fairly straightforward to apply some simple, known techniques in order to
produce a more robust / gas-efficient implementation.


Supported Syntax
----------------

From Automata.js:

> * `+`: One or more
> * `*`: Zero
> * `?`: Zero or one
> * `()`: Capture everything enclosed
> * `|`:  Or
> * `\n`: Newline
> * `\r`: Carriage return
> * `\t`: Tab
> * `\w`: [a-zA-Z0-9\_]
> * `\d`: [0-9]

