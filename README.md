# my-office
> 

[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
<a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-blue.svg"></a>

## About

My office can be used to create a map of office rooms to control key equipment information.

## In Action!

![officeMap](https://user-images.githubusercontent.com/43149895/54958762-a2850b80-4f35-11e9-82e0-2bbe63df566b.gif)

>

## Install

```
# Download the repository
01. git clone https://github.com/thiagoferrax/my-office.git

# Installing node, npm and knex
02. sudo apt-get install nodejs npm
03. sudo npm i npm@latest -g
04. sudo npm install knex -g

# Installing and configuring postgres
05. sudo apt-get install postgresql postgresql-contrib
06. sudo -u postgres psql
07. \password 123456
08. create database my_office;

# Backend configuration
09. cd my-office/backend && npm i
10. cp env_file .env && nano .env
11. Add a authSecret in the .env file
12. npm start

# Frontend configuration
13. In a new console: cd my-office/frontend && npm i
14. npm start
15. Use a browser to open http://localhost:3000
```
## License

MIT © [thiagoferrax](https://github.com/thiagoferrax)
