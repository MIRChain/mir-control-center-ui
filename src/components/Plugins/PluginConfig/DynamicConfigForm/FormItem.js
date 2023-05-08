import React, { Component } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import debounce from 'lodash/debounce'
import TextField from '@material-ui/core/TextField'
import InputAdornment from '@material-ui/core/InputAdornment'
import IconButton from '@material-ui/core/IconButton'
import FolderOpenIcon from '@material-ui/icons/FolderOpen'
import Select from '../../../shared/Select'
import { Grid as GridAPI } from '../../../../API'

class DynamicConfigFormItem extends Component {
  static propTypes = {
    itemKey: PropTypes.string,
    itemValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    item: PropTypes.object,
    pluginState: PropTypes.object,
    pluginName: PropTypes.string,
    isPluginRunning: PropTypes.bool,
    handlePluginConfigChanged: PropTypes.func,
    isEditingFlags: PropTypes.bool
  }

  constructor(props) {
    super(props)
    this.inputOpenFileRef = React.createRef()

    // NOTE: for performance, form fields are populated by local state.
    // Redux state doesn't need to update on every keystroke.
    this.updateRedux = debounce(this.updateRedux, 500)
    this.state = {
      fieldValue: (props.itemValue || '').toString()
    }
  }

  componentDidUpdate(prevProps) {
    const { itemValue } = this.props
    if (prevProps.itemValue !== itemValue) {
      this.updateField(itemValue)
    }
  }

  componentWillUnmount() {
    this.updateRedux.cancel()
  }

  updateField = fieldValue => {
    this.setState({ fieldValue })
  }

  showOpenDialog = key => async event => {
    const { showOpenDialog } = GridAPI
    // If we don't have showOpenDialog from Grid,
    // return true to continue with native file dialog
    if (!showOpenDialog) return true
    // Continue with Grid.showOpenDialog()
    event.preventDefault()
    const { pluginState, pluginName, item } = this.props
    const { type } = item
    const defaultPath = pluginState[pluginName].config[key]
    const pathType = type.replace('_multiple', '')
    const selectMultiple = type.includes('multiple')
    const path = await showOpenDialog(pathType, selectMultiple, defaultPath)
    this.handleChange(key, path)
    return null
  }

  handleChange = (key, value) => {
    this.setState({ fieldValue: value })
    this.updateRedux(key, value)
  }

  updateRedux = (key, value) => {
    const { handlePluginConfigChanged } = this.props
    handlePluginConfigChanged(key, value)
  }

  render() {
    const { fieldValue } = this.state
    const { itemKey, item, isPluginRunning, isEditingFlags } = this.props
    const label = item.label || itemKey
    const disabled = isPluginRunning || isEditingFlags
    let { type } = item
    if (!type) type = item.options ? 'select' : 'text'
    let options

    switch (type) {
      case 'select':
        options = item.options.map(el => {
          let optionLabel
          let optionValue

          if (typeof el === 'string') {
            // eg: ['light', 'full', 'fast']
            optionLabel = el
            optionValue = el
          } else if (typeof el === 'object') {
            // eg: [{ label: 'Ropsten (testnet)', value: 'Ropsten', flag: '--testnet' }]
            optionLabel = el.label
            optionValue = el.value
          } else {
            throw Error(`el was not properly set: ${el}`)
          }

          return { label: optionLabel, value: optionValue }
        })

        return (
          <div data-test-id={`input-select-${item.id}`}>
            <Select
              name={label}
              value={fieldValue}
              options={options}
              disabled={disabled}
              onChange={value => this.handleChange(itemKey, value)}
            />
          </div>
        )
      case 'file':
      case 'textinput':
        return (
          <div data-test-id={`input-text-${item.id}`}>
            <TextField
              data-test-id={`input-text-${item.id}`}
              variant="outlined"
              label={item.label}
              value={fieldValue || ''}
              onChange={event => this.handleChange(itemKey, event.target.value)}
              placeholder={
                item.ignoreIfEmpty ? '(Leave empty to use default)' : ''
              }
              disabled={disabled}
              fullWidth
            />
          </div>
        )
      case 'file_multiple':
      case 'directory':
      case 'directory_multiple':
        return (
          <div>
            <TextField
              data-test-id={`input-path-${item.id}`}
              variant="outlined"
              label={item.label}
              value={fieldValue || ''}
              onChange={event => this.handleChange(itemKey, event.target.value)}
              placeholder={
                item.ignoreIfEmpty ? '(Leave empty to use default)' : ''
              }
              disabled={disabled}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      disabled={disabled}
                      aria-label="Show Open Dialog"
                      onClick={() => {
                        if (
                          this.inputOpenFileRef &&
                          this.inputOpenFileRef.current
                        ) {
                          this.inputOpenFileRef.current.click()
                        }
                      }}
                    >
                      <FolderOpenIcon />
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
                this.handleChange(itemKey, event.target.files[0].path)
              }
              onClick={this.showOpenDialog(itemKey)}
              ref={this.inputOpenFileRef}
              style={{ display: 'none' }}
              webkitdirectory={type.includes('directory') ? 1 : 0}
              directory={type.includes('directory') ? 1 : 0}
              multiple={type.includes('multiple') ? 1 : 0}
            />
          </div>
        )
      default:
        return (
          <TextField
            data-test-id={`input-text-${item.id}`}
            variant="outlined"
            label={label}
            value={fieldValue}
            disabled={disabled}
            onChange={event => this.handleChange(itemKey, event.target.value)}
            fullWidth
          />
        )
    }
  }
}

function mapStateToProps(state, ownProps) {
  const selectedPlugin = state.plugin.selected

  return {
    pluginState: state.plugin,
    itemValue: state.plugin[selectedPlugin].config[ownProps.itemKey]
  }
}

export default connect(mapStateToProps)(DynamicConfigFormItem)
