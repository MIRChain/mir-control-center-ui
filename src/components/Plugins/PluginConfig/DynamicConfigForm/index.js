import React, { Component } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import Grid from '@material-ui/core/Grid'
import FormItem from './FormItem'
import FlagPreview from './FlagPreview'
import { getGeneratedFlags, setFlags } from '../../../../store/plugin/actions'
import { enqueueSnackbar, closeSnackbar } from 'notistack'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import Genesis from './genesis/Genesis'
import { Grid as GridAPI } from '../../../../API'
import TextField from '@material-ui/core/TextField'
import InputAdornment from '@material-ui/core/InputAdornment'
import IconButton from '@material-ui/core/IconButton'
import FolderOpenIcon from '@material-ui/icons/FolderOpenOutlined'
import AddBoxIcon from '@material-ui/icons/AddBox'
import { withStyles } from '@material-ui/core/styles'
import GenesisPreview from './genesis/GenesisPreview'

const styles = theme => ({
  iconButtonLabel: {
    display: 'flex',
    flexDirection: 'column'
  }
})

class DynamicConfigForm extends Component {
  static propTypes = {
    settings: PropTypes.array,
    pluginState: PropTypes.object,
    plugin: PropTypes.object,
    isPluginRunning: PropTypes.bool,
    handlePluginConfigChanged: PropTypes.func,
    dispatch: PropTypes.func
  }

  constructor(props) {
    super(props)
    this.inputOpenFileRef = React.createRef()

    const { pluginState } = props
    const preloadPlugin = window.Grid.PluginHost.getPluginByName(
      pluginState.selected
    )
    const { config, flags } = pluginState[pluginState.selected]
    const generatedFlags = getGeneratedFlags(preloadPlugin, config)
    const isEditingFlags = !flags.every(f => generatedFlags.includes(f))
    this.state = {
      isEditingFlags,
      genesisModal: false,
      fieldValue: ''
    }
  }

  handleOpen = name => {
    this.setState({ [name]: true })
  }
  handleClose = name => {
    this.setState({ [name]: false })
  }

  handleChange = (name, value) => {
    console.log(name, value)
    this.setState({ [name]: value })
  }

  showOpenDialog = key => async event => {
    const { showOpenDialog } = GridAPI
    if (!showOpenDialog) return true
    event.preventDefault()
    const path = await showOpenDialog()
    this.handleChange('fieldValue', path)
    return null
  }

  toggleEditGeneratedFlags = checked => {
    const { pluginState, dispatch } = this.props
    const { config } = pluginState[pluginState.selected]
    const preloadPlugin = window.Grid.PluginHost.getPluginByName(
      pluginState.selected
    )
    this.setState({ isEditingFlags: checked })
    if (!checked) {
      dispatch(setFlags(preloadPlugin, config))
    }
  }

  wrapGridItem = (el, index) => {
    return (
      <Grid
        item
        xs={6}
        key={index}
        style={{
          paddingTop: 5,
          paddingBottom: 5,
          paddingLeft: 5,
          paddingRight: 5
        }}
      >
        {el}
      </Grid>
    )
  }

  wrapFormItem = item => {
    const {
      plugin,
      pluginState,
      isPluginRunning,
      handlePluginConfigChanged
    } = this.props
    const { isEditingFlags } = this.state
    const { config } = pluginState[pluginState.selected]

    if (item.id === 'cryptoType' && config.network !== 'custom') {
      return (
        <FormItem
          key={item.id}
          itemKey={item.id}
          item={item}
          pluginName={plugin.name}
          isPluginRunning={isPluginRunning}
          handlePluginConfigChanged={handlePluginConfigChanged}
          isEditingFlags={isEditingFlags}
          off={true}
        />
      )
    }
    if (item.id === 'networkId' && config.network !== 'custom') {
      return (
        <FormItem
          key={item.id}
          itemKey={item.id}
          item={item}
          pluginName={plugin.name}
          isPluginRunning={isPluginRunning}
          handlePluginConfigChanged={handlePluginConfigChanged}
          isEditingFlags={isEditingFlags}
          off={true}
        />
      )
    } else {
      return (
        <FormItem
          key={item.id}
          itemKey={item.id}
          item={item}
          pluginName={plugin.name}
          isPluginRunning={isPluginRunning}
          handlePluginConfigChanged={handlePluginConfigChanged}
          isEditingFlags={isEditingFlags}
          off={false}
        />
      )
    }
  }

  wrapCustomNetwork = item => {
    const { plugin, pluginState, classes, isPluginRunning } = this.props
    const { genesisModal, fieldValue, isEditingFlags } = this.state
    const { config, flags } = pluginState[pluginState.selected]
    if (item.id === 'network' && config.network === 'custom') {
      return (
        <div>
          <hr style={{ opacity: 0.7 }} />
          <Grid container style={{ marginTop: 5, marginBottom: 15 }}>
            <Grid item xs={12}>
              <Typography variant="body1">
                Configure a custom network
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <div>
                <TextField
                  data-test-id={`input-path-genesis`}
                  variant="outlined"
                  label={'Genesis path'}
                  value={fieldValue || ''}
                  onChange={event =>
                    this.handleChange('fieldValue', event.target.value)
                  }
                  placeholder="Choose a genesis file"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          style={{ marginTop: 5 }}
                          color="primary"
                          onClick={() => this.handleOpen('genesisModal')}
                          variant="outlined"
                          classes={{ label: classes.iconButtonLabel }}
                        >
                          <AddBoxIcon />
                          <Typography variant="body2">New</Typography>
                        </IconButton>
                        <IconButton
                          aria-label="Show Open Dialog"
                          onClick={() => {
                            if (
                              this.inputOpenFileRef &&
                              this.inputOpenFileRef.current
                            ) {
                              this.inputOpenFileRef.current.click()
                            }
                          }}
                          classes={{ label: classes.iconButtonLabel }}
                        >
                          <FolderOpenIcon />
                          <Typography variant="body2">Open</Typography>
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                  fullWidth
                />
                <input
                  type="file"
                  id="show-open-dialog"
                  onChange={event =>
                    this.handleChange('fieldValue', event.target.files[0].path)
                  }
                  onClick={this.showOpenDialog}
                  ref={this.inputOpenFileRef}
                  style={{ display: 'none' }}
                  webkitdirectory={true}
                  directory={true}
                  multiple={true}
                />
              </div>
            </Grid>
            <Grid item xs={6} style={{ textAlign: 'right' }}>
              <Button
                style={{ marginTop: 5 }}
                color="primary"
                onClick={() => this.handleOpen('genesisModal')}
                variant="outlined"
              >
                Initialize
              </Button>
            </Grid>
            <Genesis
              plugin={plugin}
              modalState={genesisModal}
              close={() => this.handleClose('genesisModal')}
              classes={classes}
            />
          </Grid>
          <div style={{ marginTop: 30 }}>
            <GenesisPreview
              flags={flags}
              config={config}
              plugin={plugin}
              isEditingFlags={isEditingFlags}
              toggleEditGeneratedFlags={this.toggleEditGeneratedFlags}
              isPluginRunning={isPluginRunning}
              enqueueSnackbar={enqueueSnackbar}
              closeSnackbar={closeSnackbar}
            />
          </div>
        </div>
      )
    }
  }

  render() {
    const { settings, plugin, pluginState, isPluginRunning } = this.props
    const { isEditingFlags } = this.state
    const { config, flags } = pluginState[pluginState.selected]

    if (!settings) return <h4>No configuration settings found</h4>

    const formItems = settings
      .filter(setting => !setting.required) // Omit required flags from UI
      .map(this.wrapFormItem)
      .map(this.wrapGridItem)

    const customNetwork = settings
      .filter(setting => !setting.required)
      .map(this.wrapCustomNetwork)

    return (
      <div>
        <Grid
          container
          style={{ paddingTop: 30, paddingBottom: 30 }}
          spacing={24}
        >
          {formItems}
        </Grid>
        {customNetwork}
        <hr style={{ opacity: 0.7 }} />
        <div style={{ marginTop: 30 }}>
          <FlagPreview
            flags={flags}
            config={config}
            plugin={plugin}
            isEditingFlags={isEditingFlags}
            toggleEditGeneratedFlags={this.toggleEditGeneratedFlags}
            isPluginRunning={isPluginRunning}
            enqueueSnackbar={enqueueSnackbar}
            closeSnackbar={closeSnackbar}
          />
        </div>
      </div>
    )
  }
}

function mapStateToProps(state) {
  return {
    pluginState: state.plugin
  }
}

export default connect(mapStateToProps)(withStyles(styles)(DynamicConfigForm))
