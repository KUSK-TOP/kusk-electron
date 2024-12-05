import { connect } from 'react-redux'
import {DropdownButton, MenuItem} from 'react-bootstrap'
import componentClassNames from 'utility/componentClassNames'
import { PageContent, PageTitle, ConsoleSection } from 'features/shared/components'
import React from 'react'
import styles from './CoreIndex.scss'
import actions from 'actions'
import {withNamespaces} from 'react-i18next'

class CoreIndex extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      kuskAmountUnit: 'KUSK'
    }
    this.handleMiningState = this.handleMiningState.bind(this)
    this.handleAdvancedOptionChange = this.handleAdvancedOptionChange.bind(this)
    this.changeKUSKamount = this.changeKUSKamount.bind(this)
    this.consolePopup = this.consolePopup.bind(this)
  }

  componentDidMount() {
    if(window.ipcRenderer){
      window.ipcRenderer.on('kuskAmountUnitState', (event, arg) => {
        this.props.uptdateBtmAmountUnit(arg)
      })
    }
  }

  changeKUSKamount(value) {
    this.setState({ kuskAmountUnit: value })
    this.props.uptdateBtmAmountUnit(value)
  }

  handleAdvancedOptionChange(event) {
    const target = event.target
    if( target.checked ){
      this.props.showNavAdvanced()
    }else{
      this.props.hideNavAdvanced()
    }
  }

  handleMiningState(event){
    const target = event.target
    if( target.checked ){
      this.props.updateMiningState(true)
    }else{
      this.props.updateMiningState(false)
    }
  }

  consolePopup(e) {
    e.preventDefault()
    this.props.showModal(
      <ConsoleSection
        cmd={this.props.cmd}
      />
    )
  }

  render() {
    let navState = this.props.navAdvancedState === 'advance'
    let miningState = this.props.core.mingStatus
    let coreData = this.props.core.coreData

    const t = this.props.t

    let configBlock = (
      <div className={[styles.left, styles.col].join(' ')}>
        <div>
          <h4>{t('coreIndex.configuration')}</h4>
          <table className={styles.table}>
            <tbody>
            <tr className={styles.row}>
              <td className={styles.row_label}>{t('coreIndex.version')}:</td>
              <td><code>{coreData? coreData['versionInfo']['version']: null}</code></td>
            </tr>
            <tr className={styles.row}>
              <td className={styles.row_label}>{t('commonWords.language')}:</td>
              <td>{t('languageFull')}</td>
            </tr>
            <tr className={styles.row}>
              <td colSpan={2}><hr /></td>
            </tr>
            <tr className={styles.row}>
              <td className={styles.row_label}>{t('coreIndex.advanced')}: </td>
              <td>
                <label className={styles.switch}>
                  <input
                    type='checkbox'
                    onChange={this.handleAdvancedOptionChange}
                    checked={navState}
                  />
                  <span className={styles.slider}></span>
                </label>
              </td>
            </tr>
            <tr className={styles.row}>
              <td className={styles.row_label}>{t('coreIndex.mining')}: </td>
              <td>
                <label className={styles.switch}>
                  <input
                    type='checkbox'
                    onChange={this.handleMiningState}
                    checked={miningState}
                  />
                  <span className={styles.slider}></span>
                </label>
              </td>
            </tr>
            <tr className={styles.row}>
              <td className={styles.row_label} >{t('coreIndex.unit')} </td>
              <td>
                <DropdownButton
                  bsSize='xsmall'
                  id='input-dropdown-amount'
                  title={this.props.core.kuskAmountUnit || this.state.kuskAmountUnit}
                  onSelect={this.changeKUSKamount}
                >
                  <MenuItem eventKey='KUSK'>KUSK</MenuItem>
                  <MenuItem eventKey='mKUSK'>mKUSK</MenuItem>
                  <MenuItem eventKey='NEU'>NEU</MenuItem>
                </DropdownButton>
              </td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>
    )

    let requestStatusBlock


    if(!coreData){
      requestStatusBlock = (<div>loading...</div>)
    }else {
      requestStatusBlock = (
        <div>
          <h4>{t('coreIndex.networkStatus')}</h4>
          <table className={styles.table}>
            <tbody>
            <tr className={styles.row} key={'core-listening'}>
              <td className={styles.row_label}> {t('coreIndex.listening')}:</td>
              <td className={styles.row_value}><code>{(coreData['listening'])? t('coreIndex.connect'): t('coreIndex.disConnect')}</code></td>
            </tr>
            <tr className={styles.row} key={'core-syncing'}>
              <td className={styles.row_label}> {t('coreIndex.syncStatus')}:</td>
              <td className={styles.row_value}><code>{(coreData['syncing'])? t('coreIndex.synchronizing'): t('coreIndex.synced')}</code></td>
            </tr>
            <tr className={styles.row} key={'core-mining'}>
              <td className={styles.row_label}> {t('coreIndex.miningStatus')}:</td>
              <td className={styles.row_value}><code>{(coreData['mining'])? t('coreIndex.miningRuning'): t('coreIndex.miningStopped')}</code></td>
            </tr>
            <tr className={styles.row} key={'core-peerCount'}>
              <td className={styles.row_label}> {t('coreIndex.peer')}:</td>
              <td className={styles.row_value}><code>{String(coreData['peerCount'])}</code></td>
            </tr>
            <tr className={styles.row} key={'core-currentBlock'}>
              <td className={styles.row_label}> {t('coreIndex.currentBlock')}:</td>
              <td className={styles.row_value}><code>{String(coreData['currentBlock'])}</code></td>
            </tr>
            <tr className={styles.row} key={'core-highestBlock'}>
              <td className={styles.row_label}> {t('coreIndex.highestBlock')}:</td>
              <td className={styles.row_value}><code>{String(coreData['highestBlock'])}</code></td>
            </tr>
            <tr className={styles.row} key={'core-networkID'}>
              <td className={styles.row_label}> {t('coreIndex.networkId')}:</td>
              <td className={styles.row_value}><code>{String(coreData['networkId'])}</code></td>
            </tr>
            </tbody>
          </table>
        </div>
      )
    }

    let networkStatusBlock = (
      <div className={[styles.right, styles.col].join(' ')}>
        {/*<div ref='requestComponent'>*/}
          {requestStatusBlock}
        {/*</div>*/}
      </div>
    )

    return (
      <div className={componentClassNames(this, 'flex-container', styles.mainContainer)}>
        <PageTitle
          title={t('coreIndex.coreStatus')}
          actions={[
            <button className='btn btn-link' onClick={this.consolePopup}>
              <img src={require('images/console-window.svg')}/>
            </button>
          ]}
        />

        <PageContent>
          <div className={`${styles.flex}`}>
            {configBlock}
            {networkStatusBlock}
          </div>
        </PageContent>
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  core: state.core,
  navAdvancedState: state.app.navAdvancedState,
})

const mapDispatchToProps = (dispatch) => ({
  showNavAdvanced: () => dispatch(actions.app.showNavAdvanced),
  hideNavAdvanced: () => dispatch(actions.app.hideNavAdvanced),
  uptdateBtmAmountUnit: (param) => dispatch(actions.core.updateKUSKAmountUnit(param)),
  updateMiningState: (param) => dispatch(actions.core.updateMiningState(param)),
  showModal: (body) => dispatch(actions.app.showModal(
    body,
    actions.app.hideModal,
    null,
    {
      box: true,
      wide: true,
      noCloseBtn: true
    }
  )),
  cmd: (data) => dispatch(actions.app.cmd(data))
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)( withNamespaces('translations') (CoreIndex) )
