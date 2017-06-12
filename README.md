Regexes in Solidity
===================

Simple regular expression matcher contract generation for Solidity.

Generates Solidity smart contract source file matching a particular regular
expression.

Uses [Automata.js](https://github.com/hokein/Automata.js), limited by
Automata's support for regex components:

> Currently, Automata.js supports minimal regular expressions:

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

Usage
-----

```
$ solregex --name BasicRegex 'a+(ab)*b+' > ./contracts/BasicRegex.sol
```
