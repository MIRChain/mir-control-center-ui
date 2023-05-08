import ClientService from './clientService'
import {
  addPluginError,
  onConnectionUpdate,
  setAppBadges,
  clearPluginErrors,
  setIpcPath
} from './actions'

class PluginService {
  async start(plugin, release, flags, config) {
    if (!release.location) {
      release = null // eslint-disable-line
    }
    await plugin.start(flags, release, config)
  }

  resume(plugin, dispatch) {
    dispatch(onConnectionUpdate(plugin.name, plugin.state))

    // `resume` is called for 'STARTED', 'STARTING', and 'CONNECTED' states.
    // If plugin starts as 'CONNECTED', manually trigger `createListeners` and `onConnect`.
    if (plugin.state === 'CONNECTED') {
      this.createListeners(plugin, dispatch)
      this.onConnect(plugin, dispatch)
    }
  }

  stop(plugin) {
    plugin.stop()
  }

  onConnect(plugin, dispatch) {
    if (plugin.type === 'client') {
      ClientService.watchForPeers(plugin, dispatch)
      ClientService.startBlockSubscriptions(plugin, dispatch)
      ClientService.watchForAccounts(plugin, dispatch)
    }
  }

  // Called in `initPlugin`
  createNewStateListener(plugin, dispatch) {
    this.newStateListener = newState => {
      dispatch(onConnectionUpdate(plugin.name, newState.toUpperCase()))
      switch (newState) {
        case 'starting':
          this.createListeners(plugin, dispatch)
          break
        case 'connected':
          this.onConnect(plugin, dispatch)
          break
        case 'stopping':
          this.removeListeners(plugin)
          break
        default:
          break
      }
    }
    plugin.on('newState', this.newStateListener)
  }

  createListeners(plugin, dispatch) {
    this.pluginErrorListener = error => {
      dispatch(addPluginError(plugin.name, error))
    }
    this.clearPluginErrorsListener = () => {
      dispatch(clearPluginErrors(plugin.name))
    }
    this.setAppBadgeListener = ({ appId, count }) => {
      dispatch(setAppBadges(plugin, { [appId]: count }))
    }
    this.setIpcPathListener = ipcPath => {
      dispatch(setIpcPath(plugin, ipcPath))
    }
    plugin.on('pluginError', this.pluginErrorListener)
    plugin.on('clearPluginErrors', this.clearPluginErrorsListener)
    plugin.on('setAppBadge', this.setAppBadgeListener)
    plugin.on('ipcPath', this.setIpcPathListener)
  }

  removeListeners(plugin) {
    plugin.removeListener('pluginError', this.pluginErrorListener)
    plugin.removeListener('clearPluginErrors', this.clearPluginErrorsListener)
    plugin.removeListener('setAppBadge', this.setAppBadgeListener)
    plugin.removeListener('ipcPath', this.setIpcPathListener)
    if (plugin.type === 'client') {
      ClientService.clearPeerCountInterval()
      ClientService.clearUpdateAccountsInterval()
      ClientService.clearSyncingInterval(plugin)
      ClientService.unsubscribeNewHeadsSubscription(plugin)
    }
  }
}

export default new PluginService()
