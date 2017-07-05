solregex
========

[![Travis](https://img.shields.io/travis/gnidan/solregex.svg)](https://travis-ci.org/gnidan/solregex)
[![npm](https://img.shields.io/npm/v/solregex.svg)](https://www.npmjs.com/package/solregex)


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

Examples
-------

A contract to match email addresses is deployed at
`0x537837D00047C874D19B68E94ADbA107674C21b8`
([Etherscan](https://etherscan.io/address/0x537837D00047C874D19B68E94ADbA107674C21b8#readContract))

A contract to match Ethereum addresses is deployed at
`0x62C8b4aC2aEF3Ed13B929cA9FB20caCB222E3fA6`
([Etherscan](https://etherscan.io/address/0x62C8b4aC2aEF3Ed13B929cA9FB20caCB222E3fA6#readContract))


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
