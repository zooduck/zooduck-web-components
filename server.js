// const dotenv = require('dotenv');
const express = require('express');
const server = express();
server.use(express.static('dist'));
server.listen(4444, () => console.log('Listening on port: 4444'));
