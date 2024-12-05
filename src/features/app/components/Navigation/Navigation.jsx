import React from 'react'
import {connect} from 'react-redux'
import {Link} from 'react-router'
import styles from './Navigation.scss'
import {navIcon} from '../../utils'
import Sync from '../Sync/Sync'
import appAction from '../../../app/actions'
import {docsRoot, releaseUrl} from '../../../../utility/environment'
import { capitalize } from 'utility/string'
import {withNamespaces} from 'react-i18next'

class Navigation extends React.Component {
  constructor(props) {
    super(props)

    this.openTutorial = this.openTutorial.bind(this)
  }

  componentDidMount() {
    if(window.ipcRenderer){
      window.ipcRenderer.on('toggleNavState', (event, arg) => {
        arg === 'advance'? this.props.showNavAdvanced() : this.props.hideNavAdvanced()
      })
    }
  }

  openTutorial(event) {
    event.preventDefault()
    this.props.openTutorial()
  }

  render() {
    const t = this.props.t
    return (
      <div className={styles.main}>
        {this.props.update && <div className={`${styles.updateWarning} ${styles.smallFont}`}>
          <a href={releaseUrl} target='_blank'>
            <img src={require('images/warning.svg')} className={styles.warningIcon} />
            {this.props.newVersionCode}{t('crumbName.update')}
          </a>
        </div>}
        <ul className={styles.navigation}>
          <li className={styles.navigationTitle}>{t('crumbName.coreData')}</li>
          <li>
            <Link to='/transactions' activeClassName={styles.active}>
              {navIcon('transaction', styles)}
              {capitalize(t('crumbName.transaction'))}
            </Link>
          </li>
          <li>
            <Link to='/accounts' activeClassName={styles.active}>
              {navIcon('account', styles)}
              {capitalize(t('crumbName.account'))}
            </Link>
          </li>
          <li>
            <Link to='/assets' activeClassName={styles.active}>
              {navIcon('asset', styles)}
              {capitalize((t('crumbName.asset')))}
            </Link>
          </li>
          <li>
            <Link to='/balances' activeClassName={styles.active}>
              {navIcon('balance', styles)}
              {capitalize((t('crumbName.balance')))}
            </Link>
          </li>
        </ul>

        <ul className={styles.navigation}>
          <li className={styles.navigationTitle}>{ t('crumbName.services') }</li>
          <li>
            <Link to='/keys' activeClassName={styles.active}>
              {navIcon('mockhsm', styles)}
              {capitalize((t('crumbName.key')))}
            </Link>
          </li>
        </ul>

        { this.props.showNavAdvance && <ul className={styles.navigation}>
          <li className={styles.navigationTitle}>{ t('crumbName.advanced') }</li>
          <li>
            <Link to='/unspents' activeClassName={styles.active}>
              {navIcon('unspent', styles)}
              {capitalize((t('crumbName.unspent')))}
            </Link>
          </li>
        </ul>}

        <ul className={styles.navigation}>
          <li className={styles.navigationTitle}>{t('crumbName.help') }</li>
          <li>
            <a href={docsRoot} target='_blank'>
              {navIcon('docs', styles)}
              {t('crumbName.doc')}
            </a>
          </li>
        </ul>

        <ul className={styles.navigation}>
          <li className={styles.navigationTitle}>{ t('crumbName.developer') }</li>
          <li>
            <a href='http://localhost:9888/equity' target='_blank'>
              {navIcon('transaction', styles)}
              { t('crumbName.equity')}
            </a>
          </li>
        </ul>

        <Sync/>

      </div>
    )
  }
}

export default connect(
  state => {
    return {
      newVersionCode: state.core.newVersionCode,
      update: state.core.update,
      coreData: state.core.coreData,
      routing: state.routing, // required for <Link>s to update active state on navigation
      showNavAdvance: state.app.navAdvancedState === 'advance'
    }
  },
  (dispatch) => ({
    showNavAdvanced: () => dispatch(appAction.showNavAdvanced),
    hideNavAdvanced: () => dispatch(appAction.hideNavAdvanced)
  })
)( withNamespaces('translations')(Navigation))
