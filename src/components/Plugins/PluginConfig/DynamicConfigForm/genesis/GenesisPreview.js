import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import debounce from 'lodash/debounce'
import PropTypes from 'prop-types'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import FormGroup from '@material-ui/core/FormGroup'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Checkbox from '@material-ui/core/Checkbox'
import Grid from '@material-ui/core/Grid'
import {
  dismissFlagWarning,
  restoreDefaultSettings,
  setCustomFlags
} from '../../../../../store/plugin/actions'
import { getDefaultFlags } from '../../../../../lib/utils'

class GenesisPreview extends Component {
  static propTypes = {
    config: PropTypes.object,
    plugin: PropTypes.object,
    pluginName: PropTypes.string,
    isPluginRunning: PropTypes.bool,
    flags: PropTypes.array,
    isEditingFlags: PropTypes.bool,
    toggleEditGeneratedFlags: PropTypes.func,
    dispatch: PropTypes.func,
    showWarning: PropTypes.bool,
    enqueueSnackbar: PropTypes.func,
    closeSnackbar: PropTypes.func
  }

  constructor(props) {
    super(props)
    this.state = {
      flags: props.flags.join(' ')
    }
  }

  componentDidUpdate() {
    const { flags: localFlags } = this.state
    const { flags, isEditingFlags, showWarning } = this.props

    // If props update from outside of this component,
    // e.g. restore defaults, update local state
    const newFlags = flags.join(' ')
    if (localFlags !== newFlags && !isEditingFlags) {
      this.updateFlags(newFlags)
    }
  }

  updateFlags = flags => {
    this.setState({ flags })
  }

  componentWillUnmount() {}

  render() {
    const { isEditingFlags, isPluginRunning } = this.props
    const { flags } = this.state

    return (
      <React.Fragment>
        <FormGroup row>
          <TextField
            label="Genesis preview"
            variant="outlined"
            multiline
            value={flags}
            onChange={this.handleChange}
            disabled={isPluginRunning || !isEditingFlags}
            fullWidth
            style={{ marginBottom: 20 }}
          />
        </FormGroup>
      </React.Fragment>
    )
  }
}

function mapStateToProps(state) {
  return {
    pluginName: state.plugin.selected,
    showWarning: state.plugin.showCustomFlagWarning
  }
}

export default connect(mapStateToProps)(GenesisPreview)
