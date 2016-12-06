'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.showLoading = showLoading;
exports.forceHideLoading = forceHideLoading;
exports.hideLoading = hideLoading;
exports.loadingBarReducer = loadingBarReducer;
var SHOW = exports.SHOW = 'loading-bar/SHOW';
var HIDE = exports.HIDE = 'loading-bar/HIDE';
var FORCE_HIDE = exports.FORCE_HIDE = 'loading-bar/FORCE_HIDE';
function showLoading() {
  return {
    type: SHOW
  };
}

function forceHideLoading() {
  return {
    type: FORCE_HIDE
  };
}

function hideLoading() {
  return {
    type: HIDE
  };
}

function loadingBarReducer() {
  var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
  var action = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  var newState = void 0;

  switch (action.type) {
    case SHOW:
      newState = state + 1;
      break;
    case HIDE:
      newState = state > 0 ? state - 1 : 0;
      break;
    case FORCE_HIDE:
      newState = 0;
      break;
    default:
      return state;
  }

  return newState;
}