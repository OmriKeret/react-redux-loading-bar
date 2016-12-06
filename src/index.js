import LoadingBarContainer, { LoadingBar } from './loading_bar'
import loadingBarMiddleware from './loading_bar_middleware'
import {
  loadingBarReducer,
  showLoading,
  hideLoading,
  forceHideLoading,
} from './loading_bar_ducks'
import ImmutableLoadingBar from './immutable'

export {
  loadingBarMiddleware,
  loadingBarReducer,
  showLoading,
  hideLoading,
  forceHideLoading,
  LoadingBar,
  ImmutableLoadingBar,
}
export default LoadingBarContainer
