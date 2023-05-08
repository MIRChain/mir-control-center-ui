import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'

const styles = () => ({})

class PrivateNet extends Component {
  static propTypes = {
    plugin: PropTypes.object.isRequired,
    classes: PropTypes.object
  }

  constructor(props) {
    super(props)
    this.state = {}
  }

  componentDidMount = async () => {}

  componentWillReceiveProps({ plugin: nextPlugin }) {}

  componentDidUpdate = () => {}

  componentWillUnmount() {}

  render() {
    return (
      <div key="walletContainer">
        <Typography variant="h7">
          Module to configure a private Mir network
        </Typography>
        <Button
          style={{ marginTop: 5 }}
          color="primary"
          onClick={this.handleRestoreDefaultSettings}
        >
          New Genesis
        </Button>
      </div>
    )
  }
}

export default withStyles(styles)(PrivateNet)
