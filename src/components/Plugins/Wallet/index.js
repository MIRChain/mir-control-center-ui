import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import IconButton from '@material-ui/core/IconButton'
import { BigNumber } from 'bignumber.js'
import Typography from '@material-ui/core/Typography'
import TextField from '@material-ui/core/TextField'
import Modal from '@material-ui/core/Modal'
import Select from '@material-ui/core/Select'
import MenuItem from '@material-ui/core/MenuItem'
import FormControl from '@material-ui/core/FormControl'
import InputLabel from '@material-ui/core/InputLabel'
import AddBoxIcon from '@material-ui/icons/AddBox'
import LockOpenIcon from '@material-ui/icons/LockOpen'
import SendIcon from '@material-ui/icons/Send'
import CopyIcon from '@material-ui/icons/FileCopy'
import SendForm from './send'

// Utils
const isHex = str => typeof str === 'string' && str.startsWith('0x')
const hexToNumberString = str => new BigNumber(str).toString(10)
const toNumberString = str => (isHex(str) ? hexToNumberString(str) : str)
const hexToNumber = str => Number(hexToNumberString(str))

var Web3 = require('web3')

function getModalStyle() {
  const top = 50
  const left = 50

  return {
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(-${top}%, -${left}%)`
  }
}

const styles = theme => ({
  paper: {
    position: 'absolute',
    width: theme.spacing(50),
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    padding: theme.spacing(4),
    outline: 'none'
  },
  formControl: {
    margin: theme.spacing(),
    minWidth: 400,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center'
  },
  control: {
    padding: theme.spacing(2)
  },
  container: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center'
  },
  accounts: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center'
  },
  iconButtonLabel: {
    display: 'flex',
    flexDirection: 'column'
  },
  buttonGroupAccounts: {
    display: 'flex',
    flexDirection: 'row'
  },
  amontToSendBox: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  buttonsSendBox: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'flex-start'
  },
  sendForm: {
    position: 'absolute',
    width: theme.spacing(60),
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    padding: theme.spacing(4),
    outline: 'none'
  }
})

class Wallet extends Component {
  static propTypes = {
    plugin: PropTypes.object.isRequired,
    classes: PropTypes.object,
    ipcPath: PropTypes.string,
    accounts: PropTypes.array
  }

  constructor(props) {
    super(props)
    this.state = {
      password: '',
      openCreatePassModal: false,
      openUnlockPassModal: false,
      sendModalState: false,
      selectedAccount: this.props.accounts[0] ? this.props.accounts[0] : 'None',
      balances: [],
      selectedAccountBalance: 0
    }
  }

  componentDidMount = async () => {
    this.getBalanace = setInterval(() => this.getBalances(), 1000)
  }

  getBalances = () => {
    const { plugin, accounts } = this.props
    var web3 = new Web3(Web3.givenProvider)
    if (typeof accounts !== 'undefined' && accounts.length > 0) {
      var accBalances = []
      accounts.forEach(async acc => {
        const balance = await plugin.rpc('eth_getBalance', [acc, 'latest'])
        accBalances.push({ acc, balance: hexToNumber(balance) })
        if (acc === this.state.selectedAccount) {
          this.setState({
            selectedAccountBalance: web3.utils.fromWei(balance, 'ether')
          })
        }
      })
      this.setState({ balances: accBalances })
    }
  }

  componentDidUpdate = () => {}

  componentWillUnmount = () => {
    clearInterval(this.getBalanace)
  }

  createAccount = () => {
    const { plugin } = this.props
    if (this.state.password) {
      plugin
        .rpc('personal_newAccount', [this.state.password])
        .then(newAccount => {
          console.log(newAccount)
        })
    }
    this.handleCreateClose()
  }

  unlockAccount = () => {
    const { plugin } = this.props
    if (this.state.password) {
      plugin
        .rpc('personal_unlockAccount', [
          this.state.selectedAccount,
          this.state.password,
          0
        ])
        .then(unlocked => {
          alert(`${JSON.stringify(unlocked, null, '  ')}`)
        })
    }
    this.handleUnlockClose()
  }

  handleChange = name => event => {
    this.setState({ [name]: event.target.value })
  }

  handleCreateOpen = () => {
    this.setState({ openCreatePassModal: true })
  }

  handleCreateClose = () => {
    this.setState({ openCreatePassModal: false })
    this.setState({ password: '' })
  }

  handleUnlockOpen = () => {
    if (this.state.selectedAccount === 'None') {
      alert('Account should be selected')
      return
    }
    this.setState({ openUnlockPassModal: true })
  }

  handleUnlockClose = () => {
    this.setState({ openUnlockPassModal: false })
    this.setState({ password: '' })
  }

  handleSendOpen = () => {
    if (this.state.selectedAccount === 'None') {
      alert('Account should be selected')
      return
    }
    this.setState({ sendModalState: true })
  }
  handleSendClose = () => {
    this.setState({ sendModalState: false })
  }
  render() {
    const { plugin, classes, accounts } = this.props
    const { password, selectedAccountBalance } = this.state
    const isPluginRunning = ['CONNECTED'].includes(plugin.state)

    const opts = accounts.map(acc => (
      <MenuItem key={acc} value={acc}>
        {acc}
      </MenuItem>
    ))

    return (
      <div key="walletContainer">
        <div className={classes.container}>
          <div className={classes.accounts}>
            <Typography variant="h2">
              {isPluginRunning ? selectedAccountBalance : 0}
            </Typography>
            <FormControl
              disabled={!isPluginRunning}
              className={classes.formControl}
            >
              <InputLabel shrink htmlFor="account-label-placeholder">
                Accounts
              </InputLabel>
              <Select
                value={this.state.selectedAccount}
                onChange={this.handleChange('selectedAccount')}
                name="Accounts"
                fullWidth
              >
                {opts}
              </Select>
              <IconButton
                classes={{ label: classes.iconButtonLabel }}
                color="primary"
                onClick={() => {
                  navigator.clipboard.writeText(this.state.selectedAccount)
                }}
                size="small"
                disabled={!isPluginRunning}
              >
                <CopyIcon />
              </IconButton>
            </FormControl>
            <div className={classes.buttonGroupAccounts}>
              <IconButton
                classes={{ label: classes.iconButtonLabel }}
                color="primary"
                onClick={this.handleCreateOpen}
                size="large"
                disabled={!isPluginRunning}
              >
                <AddBoxIcon />
                <Typography variant="body2">Create</Typography>
              </IconButton>

              <IconButton
                classes={{ label: classes.iconButtonLabel }}
                color="primary"
                onClick={this.handleUnlockOpen}
                size="large"
                disabled={!isPluginRunning}
              >
                <LockOpenIcon />
                <Typography variant="body2">Unlock</Typography>
              </IconButton>

              <IconButton
                classes={{ label: classes.iconButtonLabel }}
                color="primary"
                onClick={this.handleSendOpen}
                size="large"
                disabled={!isPluginRunning}
              >
                <SendIcon />
                <Typography variant="body2">Send</Typography>
              </IconButton>
            </div>
          </div>
          <Modal
            open={this.state.openCreatePassModal}
            onClose={this.handleCreateClose}
          >
            <div style={getModalStyle()} className={classes.paper}>
              <TextField
                variant="outlined"
                label="Password"
                value={password || ''}
                onChange={this.handleChange('password')}
                type="password"
                autoComplete="current-password"
                placeholder="Password for a new account"
                fullWidth
              />
              <Button
                style={{ marginTop: 5 }}
                color="primary"
                onClick={this.createAccount}
              >
                Create
              </Button>
            </div>
          </Modal>

          <Modal
            open={this.state.openUnlockPassModal}
            onClose={this.handleUnlockClose}
          >
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
                onClick={this.unlockAccount}
              >
                Unlock
              </Button>
            </div>
          </Modal>
        </div>
        <SendForm
          plugin={plugin}
          modalState={this.state.sendModalState}
          close={this.handleSendClose}
          classes={classes}
          accountFrom={this.state.selectedAccount}
        />
      </div>
    )
  }
}

export default withStyles(styles)(Wallet)
