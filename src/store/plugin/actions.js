import PluginService from './pluginService'
import {
  getPersistedPluginSettings,
  getPersistedFlags,
  getDefaultSetting,
  getPluginSettingsConfig,
  getSettingsIds
} from '../../lib/utils'
import { generateFlags } from '../../lib/flags'

export const onConnectionUpdate = (pluginName, status) => {
  return { type: 'PLUGIN:STATUS_UPDATE', payload: { pluginName, status } }
}

const buildPluginSettings = (plugin, restoreDefaults = false) => {
  const pluginDefaults = {}

  if (!restoreDefaults) {
    const settingsIds = getSettingsIds(plugin)
    // Handle rehydration: if config.json has settings already, use them.
    const persistedSettings = getPersistedPluginSettings(plugin.name)
    if (settingsIds.length && persistedSettings) {
      if (Object.keys(persistedSettings).length) {
        settingsIds.forEach(id => {
          pluginDefaults[id] =
            persistedSettings[id] || getDefaultSetting(plugin, id)
        })
        return pluginDefaults
      }
    }
  }

  const pluginSettings = getPluginSettingsConfig(plugin)
  pluginSettings.forEach(setting => {
    if ('default' in setting) {
      pluginDefaults[setting.id] = setting.default
    }
  })

  return pluginDefaults
}

export const getGeneratedFlags = (plugin, config) => {
  const settings = getPluginSettingsConfig(plugin)
  return generateFlags(config, settings)
}

export const initPlugin = plugin => {
  return dispatch => {
    const config = buildPluginSettings(plugin)
    const pluginData = plugin.plugin.config
    const flags =
      getPersistedFlags(plugin.name) || getGeneratedFlags(plugin, config)
    const release = plugin.plugin.getSelectedRelease()

    dispatch({
      type: 'PLUGIN:INIT',
      payload: {
        pluginName: pluginData.name,
        type: plugin.type,
        pluginData,
        config,
        flags,
        release
      }
    })

    PluginService.createNewStateListener(plugin, dispatch)

    if (plugin.isRunning) {
      console.log('Resuming ', plugin.name)
      PluginService.resume(plugin, dispatch)
    }
  }
}

export const dismissFlagWarning = () => {
  return { type: 'PLUGIN:DISMISS_FLAG_WARNING' }
}

export const newBlock = (pluginName, blockNumber, timestamp) => {
  return {
    type: 'PLUGIN:UPDATE_NEW_BLOCK',
    payload: { pluginName, blockNumber, timestamp }
  }
}

export const updateSyncing = (
  pluginName,
  { startingBlock, currentBlock, highestBlock, knownStates, pulledStates }
) => {
  return {
    type: 'PLUGIN:UPDATE_SYNCING',
    payload: {
      pluginName,
      startingBlock,
      currentBlock,
      highestBlock,
      knownStates,
      pulledStates
    }
  }
}

export const clearSyncing = pluginName => {
  return {
    type: 'PLUGIN:CLEAR_SYNCING',
    payload: {
      pluginName
    }
  }
}

export const updatePeerCount = (pluginName, peerCount) => {
  return (dispatch, getState) => {
    if (peerCount !== getState().plugin[pluginName].active.peerCount) {
      dispatch({
        type: 'PLUGIN:UPDATE_PEER_COUNT',
        payload: { pluginName, peerCount }
      })
    }
  }
}

export const updatePeerCountError = (pluginName, message) => {
  return {
    type: 'PLUGIN:UPDATE_PEER_COUNT:ERROR',
    error: true,
    payload: { pluginName, message }
  }
}

export const updateAccounts = (pluginName, accounts) => {
  return (dispatch, getState) => {
    if (accounts !== getState().plugin[pluginName].active.accounts) {
      dispatch({
        type: 'PLUGIN:UPDATE_ACCOUNTS',
        payload: { pluginName, accounts }
      })
    }
  }
}

export const updateAccountsError = (pluginName, message) => {
  return {
    type: 'PLUGIN:UPDATE_ACCOUNTS:ERROR',
    error: true,
    payload: { pluginName, message }
  }
}

export const addPluginError = (pluginName, error) => {
  return (dispatch, getState) => {
    const state = getState()
    if (state.plugin[pluginName].errors.find(e => e.key === error.key)) {
      return
    }
    dispatch({ type: 'PLUGIN:ERROR:ADD', error, payload: { pluginName } })
  }
}

export const getPluginErrors = plugin => {
  return dispatch => {
    plugin.getErrors().forEach(error => {
      dispatch(addPluginError(plugin.name, error))
    })
  }
}

export const clearError = (plugin, key) => {
  plugin.plugin.dismissError(key)
  return {
    type: 'PLUGIN:ERROR:CLEAR',
    payload: { pluginName: plugin.name, key }
  }
}

export const clearPluginErrors = pluginName => {
  return { type: 'PLUGIN:ERROR:CLEAR_ALL', payload: { pluginName } }
}

export const selectPlugin = (pluginName, tab) => {
  return { type: 'PLUGIN:SELECT', payload: { pluginName, tab } }
}

export const selectTab = tab => {
  return { type: 'PLUGIN:SELECT_TAB', payload: { tab } }
}

export const setRelease = (plugin, release) => {
  plugin.plugin.setSelectedRelease(release)
  return {
    type: 'PLUGIN:SET_RELEASE',
    payload: { pluginName: plugin.name, release }
  }
}

export const setFlags = (plugin, config) => {
  const pluginName = plugin.name
  const flags = getGeneratedFlags(plugin, config)
  return { type: 'PLUGIN:SET_FLAGS', payload: { pluginName, flags } }
}

export const setCustomFlags = (pluginName, flags) => {
  return { type: 'PLUGIN:SET_FLAGS', payload: { pluginName, flags } }
}

export const setConfig = (plugin, config) => {
  return dispatch => {
    const pluginName = plugin.name
    dispatch({
      type: 'PLUGIN:SET_CONFIG',
      payload: { pluginName, config }
    })
    dispatch(setFlags(plugin, config))
  }
}

export const setIpcPath = (plugin, ipcPath) => {
  return dispatch => {
    const pluginName = plugin.name
    dispatch({
      type: 'PLUGIN:SET_IPC_PATH',
      payload: { pluginName, ipcPath }
    })
  }
}

export const restoreDefaultSettings = plugin => {
  return dispatch => {
    const config = buildPluginSettings(plugin, true)
    dispatch(setConfig(plugin, config))
  }
}

export const startPlugin = (plugin, release) => {
  return (dispatch, getState) => {
    try {
      const { config, flags } = getState().plugin[plugin.name]
      PluginService.start(plugin, release, flags, config, dispatch)
      return dispatch({
        type: 'PLUGIN:START',
        payload: { pluginName: plugin.name, version: release.version, config }
      })
    } catch (error) {
      return dispatch({ type: 'PLUGIN:START:ERROR', error: error.toString() })
    }
  }
}

export const stopPlugin = plugin => {
  return dispatch => {
    try {
      PluginService.stop(plugin)
      dispatch({ type: 'PLUGIN:STOP', payload: { pluginName: plugin.name } })
    } catch (e) {
      dispatch({ type: 'PLUGIN:STOP:ERROR', error: e.toString() })
    }
  }
}

export const togglePlugin = (plugin, release) => {
  return async dispatch => {
    try {
      if (plugin.isRunning) {
        return dispatch(stopPlugin(plugin))
      }
      return dispatch(startPlugin(plugin, release))
    } catch (e) {
      return { type: 'PLUGIN:TOGGLE:ERROR', error: e.toString() }
    }
  }
}

export const setAppBadges = (plugin, appBadges = {}) => {
  return {
    type: 'PLUGIN:SET_APP_BADGES',
    payload: { pluginName: plugin.name, appBadges }
  }
}
