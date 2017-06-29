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
