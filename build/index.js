'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _connect = require('./connect');

var _connect2 = _interopRequireDefault(_connect);

var _cahce = require('./cahce');

var _cahce2 = _interopRequireDefault(_cahce);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Created by evio on 2017/5/12.
 */
// import './version';
_connect2.default.static = _cahce2.default;
exports.default = _connect2.default;
module.exports = exports['default'];