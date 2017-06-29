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

Example
-------

A contract to match email addresses is deployed at
`0xeD1c69227e2BCcC22E2D0A3E61b45bE032c70fB9`.
([Try it on Etherscan.io!](https://etherscan.io/address/0xed1c69227e2bccc22e2d0a3e61b45be032c70fb9#readContract))

Status
------

*Proof of concept*

This tool attempts to generate gas-efficient contracts in Solidity for a given
regular expression. It uses [regjsparser](http://www.julianviereck.de/regjsparser/)
to parse regexes and generates corresponding DFAs by hand.

It uses character class set operations to minimize the number of state
transitions (`[a-z]` becomes a single *if* statement).


Supported Syntax
----------------

 * `+`: One or more
 * `*`: Zero
 * `?`: Zero or one
 * `()`: Capture everything enclosed
 * `|`:  Or
 * `[]`: Character classes
 * `.`: Match any single character
 * `{}`: Range quantifier expressions
