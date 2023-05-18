import React, { Component } from 'react'
import { withStyles } from '@material-ui/core/styles'
import PropTypes, { bool } from 'prop-types'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import TextField from '@material-ui/core/TextField'
import Modal from '@material-ui/core/Modal'
import Grid from '@material-ui/core/Grid'
import MenuItem from '@material-ui/core/MenuItem'
import AddBoxIcon from '@material-ui/icons/AddBox'
import RemoveIcon from '@material-ui/icons/Remove'
import IconButton from '@material-ui/core/IconButton'
import InputAdornment from '@material-ui/core/InputAdornment'

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
  genesisModalStyle: {
    overflow: 'scroll',
    position: 'absolute',
    width: theme.spacing(80),
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    padding: theme.spacing(4),
    outline: 'none',
    maxHeight: 700,
    display: 'block'
  }
})

class Genesis extends Component {
  static propTypes = {
    plugin: PropTypes.object.isRequired,
    classes: PropTypes.object
  }

  constructor(props) {
    super(props)
    this.state = {
      consensuses: [
        { name: 'Proof-of-Work', value: 'ethash' },
        { name: 'Proof-of-Authoriry', value: 'clique' },
        { name: 'iBFT', value: 'ibft' },
        { name: 'QBFT', value: 'qbft' },
        { name: 'Raft', value: 'raft' }
      ],
      selectedConsensus: { name: 'Proof-of-Work', value: 'ethash' },
      chainId: 777,
      coinbase: '0x0000000000000000000000000000000000000000',
      cliqueSigner: '',
      cliqueSigners: [],
      homesteadBlock: 0,
      eip150Block: 0,
      eip150Hash:
        '0x0000000000000000000000000000000000000000000000000000000000000000',
      eip155Block: 0,
      eip158Block: 0,
      byzantiumBlock: 0,
      constantinopleBlock: 0,
      nonce: '0x0',
      timestamp: '0x5cd1f462',
      extraData:
        '0x0000000000000000000000000000000000000000000000000000000000000000',
      gasLimit: '0x3B9ACA00',
      difficulty: '0x1',
      mixHash:
        '0x0000000000000000000000000000000000000000000000000000000000000000',
      parentHash:
        '0x0000000000000000000000000000000000000000000000000000000000000000',

      // quorum config
      txnSizeLimit: 128,
      maxCodeSizeConfig: 128,
      // ibft
      epochlength: 30000,
      blockperiodseconds: 2,
      emptyblockperiodseconds: 0,
      requesttimeoutseconds: 4,
      policy: 0,
      ceil2Nby3Block: 0,
      validatorcontractaddress: '0x0000000000000000000000000000000000007777',
      //qbft
      blockReward: 0,
      beneficiaryMode: '',
      beneficiaryAcc: '',
      beneficiaryList: [],
      miningBeneficiary: '0x0000000000000000000000000000000000000007',
      validatorselectionmode: '',
      validator: '',
      validators: [],
      cliquePeriod: 0,
      cliqueEpoch: 0
    }
  }

  componentDidMount = async () => {}

  componentWillReceiveProps({ plugin: nextPlugin }) {}

  componentDidUpdate = () => {}

  componentWillUnmount() {}

  handleChange = name => event => {
    this.setState({ [name]: event.target.value })
  }

  addCliqueSigner = () => {
    this.setState(prevState => ({
      cliqueSigners: [...prevState.cliqueSigners, this.state.cliqueSigner]
    }))
  }

  removeCliqueSigner = () => {
    var array = [...this.state.cliqueSigners]
    var index = array.indexOf(this.state.cliqueSigner)
    if (index !== -1) {
      array.splice(index, 1)
      this.setState({ cliqueSigners: array })
    }
  }

  addBeneficiaryAcc = () => {
    this.setState(prevState => ({
      beneficiaryList: [...prevState.beneficiaryList, this.state.beneficiaryAcc]
    }))
  }

  removeBeneficiaryAcc = () => {
    var array = [...this.state.beneficiaryList]
    var index = array.indexOf(this.state.beneficiaryAcc)
    if (index !== -1) {
      array.splice(index, 1)
      this.setState({ beneficiaryList: array })
    }
  }

  addValidator = () => {
    this.setState(prevState => ({
      validators: [...prevState.validators, this.state.validator]
    }))
  }

  removeValidator = () => {
    var array = [...this.state.validators]
    var index = array.indexOf(this.state.validator)
    if (index !== -1) {
      array.splice(index, 1)
      this.setState({ validators: array })
    }
  }

  saveGenesis = () => {
    var FileSaver = require('file-saver')
    // build a full genesis object
    var genesis = {
      config: {
        chainId: this.state.chainId,
        homesteadBlock: this.state.homesteadBlock,
        byzantiumBlock: this.state.byzantiumBlock,
        constantinopleBlock: this.state.constantinopleBlock,
        eip150Block: this.state.eip150Block,
        eip150Hash: this.state.eip150Hash,
        eip155Block: this.state.eip155Block,
        eip158Block: this.state.eip158Block
      }
    }

    if (this.state.selectedConsensus.value === 'raft') {
      genesis.config.isQuorum = true
      genesis.config.txnSizeLimit = this.state.txnSizeLimit
      genesis.config.maxCodeSizeConfig = this.state.maxCodeSizeConfig
    }

    if (this.state.selectedConsensus.value === 'clique') {
      genesis.config.clique = {
        period: parseInt(this.state.cliquePeriod, 10),
        epoch: parseInt(this.state.cliqueEpoch, 10)
      }
    }

    if (this.state.selectedConsensus.value === 'ethash') {
      genesis.config.ethash = {}
    }

    if (this.state.selectedConsensus.value === 'ibft') {
      genesis.config.isQuorum = true
      genesis.config.txnSizeLimit = this.state.txnSizeLimit
      genesis.config.maxCodeSizeConfig = this.state.maxCodeSizeConfig

      genesis.config.ibft.epochlength = this.state.epochlength
      genesis.config.ibft.blockperiodseconds = this.state.blockperiodseconds
      genesis.config.ibft.emptyblockperiodseconds = this.state.emptyblockperiodseconds
      genesis.config.ibft.requesttimeoutseconds = this.state.requesttimeoutseconds
      genesis.config.ibft.policy = this.state.policy
      genesis.config.ibft.ceil2Nby3Block = this.state.ceil2Nby3Block
      genesis.config.ibft.validatorcontractaddress = this.state.validatorcontractaddress
    }

    if (this.state.selectedConsensus.value === 'qbft') {
      genesis.config.isQuorum = true
      genesis.config.txnSizeLimit = this.state.txnSizeLimit
      genesis.config.maxCodeSizeConfig = this.state.maxCodeSizeConfig
      genesis.config.qbft.epochlength = this.state.epochlength
      genesis.config.qbft.blockperiodseconds = this.state.blockperiodseconds
      genesis.config.qbft.emptyblockperiodseconds = this.state.emptyblockperiodseconds
      genesis.config.qbft.requesttimeoutseconds = this.state.requesttimeoutseconds
      genesis.config.qbft.policy = this.state.policy
      genesis.config.qbft.ceil2Nby3Block = this.state.ceil2Nby3Block
      genesis.config.qbft.validatorcontractaddress = this.state.validatorcontractaddress
      genesis.config.qbft.blockReward = this.state.blockReward
      genesis.config.qbft.beneficiaryList = this.state.beneficiaryList
      genesis.config.qbft.miningBeneficiary = this.state.miningBeneficiary
      genesis.config.qbft.validatorselectionmode = this.state.validatorselectionmode
      genesis.config.qbft.validators = this.state.validators
    }

    genesis.nonce = this.state.nonce
    genesis.timestamp = this.state.timestamp
    genesis.extraData = this.state.extraData
    genesis.gasLimit = this.state.gasLimit
    genesis.difficulty = this.state.difficulty
    genesis.mixHash = this.state.mixHash
    genesis.parentHash = this.state.parentHash
    genesis.coinbase = this.state.coinbase
    genesis.alloc = {}

    const json = JSON.stringify(genesis, null, 2)

    var blob = new Blob([json], {
      type: 'text/plain;charset=utf-8'
    })
    FileSaver.saveAs(blob, 'genesis.json')
  }

  render() {
    const { classes, close } = this.props
    const {
      consensuses,
      selectedConsensus,
      cliqueSigners,
      cliqueSigner,
      beneficiaryList,
      validators
    } = this.state

    const opts = consensuses.map(cons => (
      <MenuItem key={cons.name} value={cons}>
        {cons.name}
      </MenuItem>
    ))

    const signers = cliqueSigners.map((s, idx) => (
      <Typography key={idx} value={s}>
        {idx}. {s}
      </Typography>
    ))

    const benList = beneficiaryList.map((s, idx) => (
      <Typography key={idx} value={s}>
        {idx}. {s}
      </Typography>
    ))

    const validatorList = validators.map((s, idx) => (
      <Typography key={idx} value={s}>
        {idx}. {s}
      </Typography>
    ))

    const cliqueConfig = (
      <Grid container spacing={2} style={{ paddingTop: 10, paddingBottom: 10 }}>
        <Grid
          item
          xs={6}
          style={{
            paddingTop: 5,
            paddingBottom: 5,
            paddingLeft: 5,
            paddingRight: 5
          }}
          key={'cliquePeriod'}
        >
          <TextField
            variant="outlined"
            label="Period"
            value={this.state.cliquePeriod}
            onChange={this.handleChange('cliquePeriod')}
            placeholder={20}
            helperText="Period in seconds of block mining"
            fullWidth
          />
        </Grid>
        <Grid
          item
          xs={6}
          style={{
            paddingTop: 5,
            paddingBottom: 5,
            paddingLeft: 5,
            paddingRight: 5
          }}
          key={'cliqueEpoch'}
        >
          <TextField
            variant="outlined"
            label="Epoch"
            value={this.state.cliqueEpoch}
            onChange={this.handleChange('cliqueEpoch')}
            placeholder={30000}
            helperText="Default number of blocks after which to checkpoint and reset the pending votes"
            fullWidth
          />
        </Grid>
        <Grid
          item
          xs={12}
          style={{
            paddingTop: 5,
            paddingBottom: 5,
            paddingLeft: 5,
            paddingRight: 5
          }}
          key={'cliqueSigners'}
        >
          <TextField
            variant="outlined"
            label="Signers"
            value={cliqueSigner}
            onChange={this.handleChange('cliqueSigner')}
            placeholder="0x0000000000000000000000000000000000000000"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    edge="end"
                    color="primary"
                    onClick={this.addCliqueSigner}
                  >
                    <AddBoxIcon />
                  </IconButton>
                  <IconButton
                    edge="end"
                    color="primary"
                    onClick={this.removeCliqueSigner}
                  >
                    <RemoveIcon />
                  </IconButton>
                </InputAdornment>
              )
            }}
            fullWidth
          />
          {signers}
        </Grid>
      </Grid>
    )

    const raftConfig = (
      <Grid container spacing={2} style={{ paddingTop: 10, paddingBottom: 10 }}>
        <Grid
          item
          xs={6}
          style={{
            paddingTop: 5,
            paddingBottom: 5,
            paddingLeft: 5,
            paddingRight: 5
          }}
        >
          <TextField
            variant="outlined"
            label="txnSizeLimit"
            value={this.state.txnSizeLimit}
            onChange={this.handleChange('txnSizeLimit')}
            placeholder={this.state.txnSizeLimit}
            helperText="Maximum transaction size in kb 32kb<x<128kb"
          />
        </Grid>
        <Grid
          item
          xs={6}
          style={{
            paddingTop: 5,
            paddingBottom: 5,
            paddingLeft: 5,
            paddingRight: 5
          }}
        >
          <TextField
            variant="outlined"
            label="maxCodeSizeConfig"
            value={this.state.maxCodeSizeConfig}
            onChange={this.handleChange('maxCodeSizeConfig')}
            placeholder={this.state.maxCodeSizeConfig}
            helperText="Maximum smart contract code size in kb 32kb<x<128kb"
          />
        </Grid>
      </Grid>
    )

    const ibftConfig = (
      <Grid container spacing={2} style={{ paddingTop: 10, paddingBottom: 10 }}>
        <Grid
          item
          xs={6}
          style={{
            paddingTop: 5,
            paddingBottom: 5,
            paddingLeft: 5,
            paddingRight: 5
          }}
        >
          <TextField
            variant="outlined"
            label="epochlength"
            value={this.state.epochlength}
            onChange={this.handleChange('epochlength')}
            placeholder={this.state.epochlength}
            helperText="Number of blocks that should pass before pending validator votes are reset"
          />
        </Grid>
        <Grid
          item
          xs={6}
          style={{
            paddingTop: 5,
            paddingBottom: 5,
            paddingLeft: 5,
            paddingRight: 5
          }}
        >
          <TextField
            variant="outlined"
            label="blockperiodseconds"
            value={this.state.blockperiodseconds}
            onChange={this.handleChange('blockperiodseconds')}
            placeholder={this.state.blockperiodseconds}
            helperText="Minimum time between two consecutive IBFT or QBFT blocks’ timestamps in seconds"
          />
        </Grid>
        <Grid
          item
          xs={6}
          style={{
            paddingTop: 5,
            paddingBottom: 5,
            paddingLeft: 5,
            paddingRight: 5
          }}
        >
          <TextField
            variant="outlined"
            label="emptyblockperiodseconds"
            value={this.state.emptyblockperiodseconds}
            onChange={this.handleChange('emptyblockperiodseconds')}
            placeholder={this.state.emptyblockperiodseconds}
            helperText="Minimum time between two consecutive IBFT or QBFT a block and empty block’ timestamps in seconds"
          />
        </Grid>
        <Grid
          item
          xs={6}
          style={{
            paddingTop: 5,
            paddingBottom: 5,
            paddingLeft: 5,
            paddingRight: 5
          }}
        >
          <TextField
            variant="outlined"
            label="requesttimeoutseconds"
            value={this.state.requesttimeoutseconds}
            onChange={this.handleChange('requesttimeoutseconds')}
            placeholder={this.state.blockperirequesttimeoutsecondsodseconds}
            helperText="Minimum request timeout for each IBFT or QBFT round in milliseconds"
          />
        </Grid>
        <Grid
          item
          xs={6}
          style={{
            paddingTop: 5,
            paddingBottom: 5,
            paddingLeft: 5,
            paddingRight: 5
          }}
        >
          <TextField
            variant="outlined"
            label="policy"
            value={this.state.policy}
            onChange={this.handleChange('policy')}
            placeholder={this.state.policy}
            helperText="The policy for proposer selection"
            fullWidth
          />
        </Grid>
        <Grid
          item
          xs={6}
          style={{
            paddingTop: 5,
            paddingBottom: 5,
            paddingLeft: 5,
            paddingRight: 5
          }}
        >
          <TextField
            variant="outlined"
            label="ceil2Nby3Block"
            value={this.state.ceil2Nby3Block}
            onChange={this.handleChange('ceil2Nby3Block')}
            placeholder={this.state.ceil2Nby3Block}
            helperText="Number of confirmations required to move from one state to next [2F + 1 to Ceil(2N/3)]"
            fullWidth
          />
        </Grid>
        <Grid
          item
          xs={12}
          style={{
            paddingTop: 5,
            paddingBottom: 5,
            paddingLeft: 5,
            paddingRight: 5
          }}
        >
          <TextField
            variant="outlined"
            label="validatorcontractaddress"
            value={this.state.validatorcontractaddress}
            onChange={this.handleChange('validatorcontractaddress')}
            placeholder={this.state.validatorcontractaddress}
            helperText="Smart contract address for list of validators"
            fullWidth
          />
        </Grid>
      </Grid>
    )

    const qbftConfig = (
      <Grid container spacing={2} style={{ paddingTop: 10, paddingBottom: 10 }}>
        <Grid
          item
          xs={6}
          style={{
            paddingTop: 5,
            paddingBottom: 5,
            paddingLeft: 5,
            paddingRight: 5
          }}
        >
          <TextField
            variant="outlined"
            label="blockReward"
            value={this.state.blockReward}
            onChange={this.handleChange('blockReward')}
            placeholder={this.state.blockReward}
            helperText="Reward from start, works only on QBFT consensus protocol"
          />
        </Grid>
        <Grid
          item
          xs={6}
          style={{
            paddingTop: 5,
            paddingBottom: 5,
            paddingLeft: 5,
            paddingRight: 5
          }}
        >
          <TextField
            variant="outlined"
            label="beneficiaryMode"
            select
            value={this.state.beneficiaryMode || ''}
            onChange={this.handleChange('beneficiaryMode')}
            defaultValue={''}
            helperText="Mode for setting the beneficiary, either: list, besu, validators (beneficiary list is the list of validators)"
          >
            <MenuItem value={'fixed'}>{'fixed'}</MenuItem>
            <MenuItem value={'list'}>{'list'}</MenuItem>
            <MenuItem value={'validators'}>{'validators'}</MenuItem>
          </TextField>
        </Grid>
        <Grid
          item
          xs={12}
          style={{
            paddingTop: 5,
            paddingBottom: 5,
            paddingLeft: 5,
            paddingRight: 5
          }}
          key={'qbftBenefList'}
        >
          <TextField
            variant="outlined"
            label="Beneficiary"
            value={this.state.beneficiaryAcc}
            onChange={this.handleChange('beneficiaryAcc')}
            placeholder="0x0000000000000000000000000000000000000000"
            helperText="List of wallet addresses that have benefit at every new block (list mode)"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    edge="end"
                    color="primary"
                    onClick={this.addBeneficiaryAcc}
                  >
                    <AddBoxIcon />
                  </IconButton>
                  <IconButton
                    edge="end"
                    color="primary"
                    onClick={this.removeBeneficiaryAcc}
                  >
                    <RemoveIcon />
                  </IconButton>
                </InputAdornment>
              )
            }}
            fullWidth
          />
          {benList}
        </Grid>
        <Grid
          item
          xs={12}
          style={{
            paddingTop: 5,
            paddingBottom: 5,
            paddingLeft: 5,
            paddingRight: 5
          }}
        >
          <TextField
            variant="outlined"
            label="miningBeneficiary"
            value={this.state.miningBeneficiary}
            onChange={this.handleChange('miningBeneficiary')}
            placeholder={this.state.miningBeneficiary}
            helperText="Wallet address that benefits at every new block (besu mode)"
            fullWidth
          />
        </Grid>
        <Grid
          item
          xs={6}
          style={{
            paddingTop: 5,
            paddingBottom: 5,
            paddingLeft: 5,
            paddingRight: 5
          }}
        >
          <TextField
            variant="outlined"
            label="validatorselectionmode"
            select
            value={this.state.validatorselectionmode || ''}
            onChange={this.handleChange('validatorselectionmode')}
            defaultValue={''}
            helperText="Validator selection mode to switch to"
          >
            <MenuItem value={'blockheader'}>{'blockheader'}</MenuItem>
            <MenuItem value={'contract'}>{'contract'}</MenuItem>
          </TextField>
        </Grid>
        <Grid
          item
          xs={12}
          style={{
            paddingTop: 5,
            paddingBottom: 5,
            paddingLeft: 5,
            paddingRight: 5
          }}
          key={'qbftValidators'}
        >
          <TextField
            variant="outlined"
            label="Validators"
            value={this.state.validator}
            onChange={this.handleChange('validator')}
            placeholder="0x0000000000000000000000000000000000000000"
            helperText="List of validators"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    edge="end"
                    color="primary"
                    onClick={this.addValidator}
                  >
                    <AddBoxIcon />
                  </IconButton>
                  <IconButton
                    edge="end"
                    color="primary"
                    onClick={this.removeValidator}
                  >
                    <RemoveIcon />
                  </IconButton>
                </InputAdornment>
              )
            }}
            fullWidth
          />
          {validatorList}
        </Grid>
      </Grid>
    )

    return (
      <Modal open={this.props.modalState} onClose={close}>
        <div style={getModalStyle()} className={classes.genesisModalStyle}>
          <Grid
            container
            style={{ paddingTop: 10, paddingBottom: 10 }}
            spacing={2}
          >
            <Grid
              item
              xs={12}
              style={{
                paddingTop: 5,
                paddingBottom: 5,
                paddingLeft: 5,
                paddingRight: 5
              }}
            >
              <TextField
                id="consensus-select"
                select
                required
                label="Consensus"
                variant="outlined"
                value={this.state.selectedConsensus || ''}
                helperText="Please select a consensus type"
                onChange={this.handleChange('selectedConsensus')}
                fullWidth
                defaultValue={''}
              >
                {opts}
              </TextField>
            </Grid>
            {selectedConsensus.value === 'raft' && raftConfig}

            {selectedConsensus.value === 'ibft' && raftConfig}
            {selectedConsensus.value === 'ibft' && ibftConfig}

            {selectedConsensus.value === 'qbft' && raftConfig}
            {selectedConsensus.value === 'qbft' && ibftConfig}
            {selectedConsensus.value === 'qbft' && qbftConfig}

            {selectedConsensus.value === 'clique' && cliqueConfig}

            <Grid
              item
              xs={12}
              style={{
                paddingTop: 5,
                paddingBottom: 5,
                paddingLeft: 5,
                paddingRight: 5
              }}
            >
              <TextField
                variant="outlined"
                label="Chain ID"
                value={this.state.chainId}
                onChange={this.handleChange('chainId')}
                placeholder="1"
                fullWidth
              />
            </Grid>
            {selectedConsensus.value && selectedConsensus.value === 'ethash' && (
              <Grid
                item
                xs={12}
                style={{
                  paddingTop: 5,
                  paddingBottom: 5,
                  paddingLeft: 5,
                  paddingRight: 5
                }}
              >
                <TextField
                  variant="outlined"
                  label="Coinbase"
                  value={this.state.coinbase}
                  onChange={this.handleChange('coinbase')}
                  placeholder={this.state.coinbase}
                  style={{
                    paddingTop: 5,
                    paddingBottom: 5,
                    paddingLeft: 5,
                    paddingRight: 5
                  }}
                  fullWidth
                />
                <TextField
                  variant="outlined"
                  label="Difficulty"
                  value={this.state.difficulty}
                  onChange={this.handleChange('difficulty')}
                  placeholder={this.state.difficulty}
                  style={{
                    paddingTop: 5,
                    paddingBottom: 5,
                    paddingLeft: 5,
                    paddingRight: 5
                  }}
                  fullWidth
                />
              </Grid>
            )}
            <Grid
              item
              xs={12}
              style={{
                paddingTop: 5,
                paddingBottom: 5,
                paddingLeft: 5,
                paddingRight: 5
              }}
            >
              <TextField
                variant="outlined"
                label="extraData"
                value={this.state.extraData}
                onChange={this.handleChange('extraData')}
                placeholder={this.state.extraData}
                fullWidth
              />
            </Grid>
            <Grid
              item
              xs={12}
              style={{
                paddingTop: 5,
                paddingBottom: 5,
                paddingLeft: 5,
                paddingRight: 5
              }}
            >
              <TextField
                variant="outlined"
                label="mixHash"
                value={this.state.mixHash}
                onChange={this.handleChange('mixHash')}
                placeholder={this.state.mixHash}
                fullWidth
              />
            </Grid>
            <Grid
              item
              xs={6}
              style={{
                paddingTop: 5,
                paddingBottom: 5,
                paddingLeft: 5,
                paddingRight: 5
              }}
            >
              <TextField
                variant="outlined"
                label="gasLimit"
                value={this.state.gasLimit}
                onChange={this.handleChange('mixHagasLimitsh')}
                placeholder={this.state.gasLimit}
                fullWidth
              />
            </Grid>
            <Grid
              item
              xs={6}
              style={{
                paddingTop: 5,
                paddingBottom: 5,
                paddingLeft: 5,
                paddingRight: 5
              }}
            >
              <TextField
                variant="outlined"
                label="timestamp"
                value={this.state.timestamp}
                onChange={this.handleChange('timestamp')}
                placeholder={this.state.timestamp}
                fullWidth
              />
            </Grid>
            <Grid
              item
              xs={12}
              style={{
                paddingTop: 5,
                paddingBottom: 5,
                paddingLeft: 5,
                paddingRight: 5
              }}
            >
              <TextField
                variant="outlined"
                label="parentHash"
                value={this.state.parentHash}
                onChange={this.handleChange('parentHash')}
                placeholder={this.state.parentHash}
                fullWidth
              />
            </Grid>
            <Grid
              item
              xs={6}
              style={{
                paddingTop: 5,
                paddingBottom: 5,
                paddingLeft: 5,
                paddingRight: 5
              }}
            >
              <TextField
                variant="outlined"
                label="nonce"
                value={this.state.nonce}
                onChange={this.handleChange('nonce')}
                placeholder={this.state.nonce}
                fullWidth
              />
            </Grid>
            <Grid
              item
              xs={6}
              style={{
                paddingTop: 5,
                paddingBottom: 5,
                paddingLeft: 5,
                paddingRight: 5
              }}
            >
              <TextField
                variant="outlined"
                label="homesteadBlock"
                value={this.state.homesteadBlock}
                onChange={this.handleChange('homesteadBlock')}
                placeholder={this.state.homesteadBlock}
                fullWidth
              />
            </Grid>
            <Grid
              item
              xs={12}
              style={{
                paddingTop: 5,
                paddingBottom: 5,
                paddingLeft: 5,
                paddingRight: 5
              }}
            >
              <TextField
                variant="outlined"
                label="eip150Hash"
                value={this.state.eip150Hash}
                onChange={this.handleChange('eip150Hash')}
                placeholder={this.state.eip150Hash}
                fullWidth
              />
            </Grid>
            <Grid
              item
              xs={6}
              style={{
                paddingTop: 5,
                paddingBottom: 5,
                paddingLeft: 5,
                paddingRight: 5
              }}
            >
              <TextField
                variant="outlined"
                label="eip155Block"
                value={this.state.eip155Block}
                onChange={this.handleChange('eip155Block')}
                placeholder={this.state.eip155Block}
                fullWidth
              />
            </Grid>
            <Grid
              item
              xs={6}
              style={{
                paddingTop: 5,
                paddingBottom: 5,
                paddingLeft: 5,
                paddingRight: 5
              }}
            >
              <TextField
                variant="outlined"
                label="eip158Block"
                value={this.state.eip158Block}
                onChange={this.handleChange('eip158Block')}
                placeholder={this.state.eip158Block}
                fullWidth
              />
            </Grid>
            <Grid
              item
              xs={6}
              style={{
                paddingTop: 5,
                paddingBottom: 5,
                paddingLeft: 5,
                paddingRight: 5
              }}
            >
              <TextField
                variant="outlined"
                label="byzantiumBlock"
                value={this.state.byzantiumBlock}
                onChange={this.handleChange('byzantiumBlock')}
                placeholder={this.state.byzantiumBlock}
                fullWidth
              />
            </Grid>
            <Grid
              item
              xs={6}
              style={{
                paddingTop: 5,
                paddingBottom: 5,
                paddingLeft: 5,
                paddingRight: 5
              }}
            >
              <TextField
                variant="outlined"
                label="constantinopleBlock"
                value={this.state.constantinopleBlock}
                onChange={this.handleChange('constantinopleBlock')}
                placeholder={this.state.constantinopleBlock}
                fullWidth
              />
            </Grid>
          </Grid>

          <Button
            style={{ marginTop: 5 }}
            color="primary"
            onClick={this.saveGenesis}
            variant="outlined"
          >
            Save
          </Button>
          <Button
            style={{ marginTop: 5 }}
            color="primary"
            onClick={close}
            variant="outlined"
          >
            Close
          </Button>
        </div>
      </Modal>
    )
  }
}

export default withStyles(styles)(Genesis)
