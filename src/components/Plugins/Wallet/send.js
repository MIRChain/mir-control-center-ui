import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Button from '@material-ui/core/Button'
import { BigNumber } from 'bignumber.js'
import Typography from '@material-ui/core/Typography'
import TextField from '@material-ui/core/TextField'
import Modal from '@material-ui/core/Modal'

// Utils
const isHex = str => typeof str === 'string' && str.startsWith('0x')
const hexToNumberString = str => new BigNumber(str).toString(10)
const toNumberString = str => (isHex(str) ? hexToNumberString(str) : str)
const hexToNumber = str => Number(hexToNumberString(str))

var Web3 = require('web3')
var web3 = new Web3(Web3.givenProvider)

function getModalStyle() {
  const top = 50
  const left = 50

  return {
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(-${top}%, -${left}%)`
  }
}

class Send extends Component {
  static propTypes = {
    plugin: PropTypes.object.isRequired
  }

  constructor(props) {
    super(props)
    this.state = {
      accountTo: '',
      amount: 0,
      password: '',
      passModal: false
    }
  }
  componentDidMount = async () => {}

  componentDidUpdate = () => {}

  componentWillUnmount = () => {}

  send = () => {
    console.log('Sending...')
    if (!this.state.amount > 0 || !this.state.accountTo) {
      alert('Amount is 0 or empty To')
    }
    const { plugin, accountFrom } = this.props
    const transaction = {
      from: accountFrom,
      to: this.state.accountTo,
      value: web3.utils.numberToHex(
        web3.utils.toWei(this.state.amount.toString(), 'ether')
      ),
      gas: web3.utils.numberToHex(30000),
      data: ''
    }
    console.log(transaction)
    plugin
      .rpc('personal_sendTransaction', [transaction, this.state.password])
      .then(response => {
        alert(`${JSON.stringify(response, null, '  ')}`)
      })
    this.handlePassClose()
  }

  handleChange = name => event => {
    this.setState({ [name]: event.target.value })
  }

  handlePassOpen = () => {
    this.setState({ passModal: true })
  }
  handlePassClose = () => {
    this.setState({ passModal: false })
  }

  render() {
    const { classes, close, accountFrom } = this.props
    const { password } = this.state
    return (
      <div>
        <Modal open={this.props.modalState} onClose={close}>
          <div style={getModalStyle()} className={classes.sendForm}>
            <TextField
              variant="outlined"
              label="From"
              value={accountFrom}
              margin="dense"
              disabled
              fullWidth
            />
            <TextField
              variant="outlined"
              label="To"
              value={this.state.accountTo || ''}
              onChange={this.handleChange('accountTo')}
              margin="dense"
              placeholder="Account to transfer"
              fullWidth
            />
            <div className={classes.amontToSendBox}>
              <Typography variant="h5">Amount: </Typography>
              <TextField
                variant="outlined"
                value={this.state.amount || ''}
                onChange={this.handleChange('amount')}
                placeholder="MIR"
                fullWidth
              />
            </div>
            <div className={classes.buttonsSendBox}>
              <Button
                style={{ marginTop: 5 }}
                color="primary"
                onClick={this.handlePassOpen}
              >
                Send
              </Button>
              <Button style={{ marginTop: 5 }} color="primary" onClick={close}>
                Close
              </Button>
            </div>
          </div>
        </Modal>

        <Modal open={this.state.passModal} onClose={this.handlePassClose}>
          <div style={getModalStyle()} className={classes.paper}>
            <TextField
              variant="outlined"
              label="Password"
              value={password || ''}
              onChange={this.handleChange('password')}
              type="password"
              autoComplete="current-password"
              placeholder="Password to unlock"
              fullWidth
            />
            <Button
              style={{ marginTop: 5 }}
              color="primary"
              onClick={this.send}
            >
              Ok
            </Button>
          </div>
        </Modal>
      </div>
    )
  }
}

export default Send
