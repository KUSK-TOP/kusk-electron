import {
  BaseNew,
  TextField,
  Autocomplete,
  ObjectSelectorField,
  AmountField,
  GasField
} from 'features/shared/components'
import {chainClient} from 'utility/environment'
import {reduxForm} from 'redux-form'
import React from 'react'
import styles from './New.scss'
import  TxContainer  from './NewTransactionsContainer/TxContainer'
import { kuskID } from 'utility/environment'
import actions from 'actions'
import ConfirmModal from './ConfirmModal/ConfirmModal'
import { balance , getAssetDecimal, normalTxActionBuilder, normalChainTxActionBuilder} from '../../transactions'
import {withNamespaces} from 'react-i18next'

class NormalTxForm extends React.Component {
  constructor(props) {
    super(props)
    this.connection = chainClient().connection
    this.state = {
      estimateGas:null,
      chainGas: 0,
      counter: 1
    }

    this.submitWithValidation = this.submitWithValidation.bind(this)
    this.disableSubmit = this.disableSubmit.bind(this)
    this.addReceiverItem = this.addReceiverItem.bind(this)
  }

  disableSubmit() {
    return !(this.state.estimateGas)
  }

  submitWithValidation(data) {
    return new Promise((resolve, reject) => {
      this.props.submitForm(Object.assign({}, data, {state: this.state, form: 'normalTx'}))
        .then(() => {
          this.props.closeModal()
          this.props.destroyForm()
        })
        .catch((err) => {
          if(err.message !== 'PasswordWrong'){
            this.props.closeModal()
          }
          reject({_error: err})
        })
    })
  }

  confirmedTransaction(e, assetDecimal){
    e.preventDefault()
    this.props.showModal(
      <ConfirmModal
        cancel={this.props.closeModal}
        onSubmit={this.submitWithValidation}
        gas={this.state.estimateGas}
        chainGas={this.state.chainGas}
        kuskAmountUnit={this.props.kuskAmountUnit}
        assetDecimal={assetDecimal}
        asset={this.props.asset}
      />
    )
  }

  addReceiverItem() {
    const counter = this.state.counter
    this.props.fields.receivers.addField({
      id: counter
    })
    this.setState({
      counter: counter+1,
      estimateGas: null,
      chainGas:0
    })
  }

  removeReceiverItem(index) {
    const receiver = this.props.fields.receivers
    const promise = new Promise(function(resolve, reject) {
      try {
        receiver.removeField(index)
      } catch (err) {
        reject(err)
      }
      resolve()
    })

    promise.then(() =>  this.estimateNormalTransactionGas())
  }

  estimateNormalTransactionGas(type) {
    const transaction = this.props.values
    const accountAlias = transaction.accountAlias
    const accountId = transaction.accountId
    const assetAlias = transaction.assetAlias
    const assetId = transaction.assetId
    const receivers = transaction.receivers
    const addresses = receivers.map(x => x.address)
    const amounts = receivers.map(x => Number(x.amount))

    const isChainTx = type==='check'? !transaction.isChainTx: transaction.isChainTx

    const {t, i18n} = this.props

    const noAccount = !accountAlias && !accountId
    const noAsset = !assetAlias && !assetId

    if ( addresses.includes('') || amounts.includes(NaN)|| amounts.includes(0)|| noAccount || noAsset) {
      this.setState({estimateGas: null, chainGas:0})
      return
    }

    const isKUSK = (assetAlias==='KUSK') || (assetId === kuskID)

    if(isKUSK && isChainTx){
      const actions = normalChainTxActionBuilder(transaction, 'amount' )
      const body = {actions, ttl: 1}

      this.connection.request('/build-chain-transactions', body).then(resp => {
        return this.connection.request('/estimate-chain-transaction-gas', {
          transactionTemplates: resp.data
        }).then(resp => {
          this.setState({
            estimateGas: Math.ceil(resp.data.totalNeu/100000)*100000,
            chainGas: Math.ceil(resp.data.chainTxNeu/100000)*100000
          })
        }).catch(err =>{
          throw err
        })
      }).catch(err=>{
        this.setState({estimateGas: null, chainGas:0, address: null})
        const errorMsg =  err.code && i18n.exists(`kuskError.${err.code}`) && t(`kuskError.${err.code}`) || err.msg
        this.props.showError(new Error(errorMsg))
      })
    }else{
      const actions = normalTxActionBuilder(transaction, Math.pow(10, 7), 'amount' )
      const body = {actions, ttl: 1}

      this.connection.request('/build-transaction', body).then(resp => {
        return this.connection.request('/estimate-transaction-gas', {
          transactionTemplate: resp.data
        }).then(resp => {
          this.setState({
            estimateGas: Math.ceil(resp.data.totalNeu/100000)*100000,
            chainGas:0
          })
        }).catch(err =>{
          throw err
        })
      }).catch(err=>{
        this.setState({estimateGas: null,chainGas:0, address: null})
        const errorMsg =  err.code && i18n.exists(`kuskError.${err.code}`) && t(`kuskError.${err.code}`) || err.msg
        this.props.showError(new Error(errorMsg))
      })
    }
  }

  render() {
    const {
      fields: {accountId, accountAlias, assetId, assetAlias, receivers, isChainTx ,gasLevel},
      error,
      submitting
    } = this.props
    const t = this.props.t;
    [accountAlias, accountId, assetAlias, assetId].forEach(key => {
      key.onBlur = this.estimateNormalTransactionGas.bind(this)
    });
    (receivers.map(receiver => receiver.amount)).forEach(amount =>{
      amount.onBlur = this.estimateNormalTransactionGas.bind(this)
    })

    let submitLabel = t('transaction.new.submit')

    const assetDecimal = getAssetDecimal(this.props.fields, this.props.asset) || 0

    const showAvailableBalance = (accountAlias.value || accountId.value) &&
      (assetAlias.value || assetId.value)

    const availableBalance = balance(this.props.values, assetDecimal, this.props.balances, this.props.kuskAmountUnit)

    const showBtmAmountUnit = (assetAlias.value === 'KUSK' || assetId.value === kuskID)

    return <TxContainer
      error={error}
      onSubmit={e => this.confirmedTransaction(e, assetDecimal)}
      submitting={submitting}
      submitLabel={submitLabel}
      disabled={this.disableSubmit()}
      className={styles.container}
    >
      <div className={styles.borderBottom}>
        <label className={styles.title}>{t('transaction.normal.from')}</label>
        <div className={`${styles.mainBox} `}>
          <ObjectSelectorField
            key='account-selector-field'
            keyIndex='normaltx-account'
            title={t('form.account')}
            aliasField={Autocomplete.AccountAlias}
            fieldProps={{
              id: accountId,
              alias: accountAlias
            }}
          />
          <div>
            <ObjectSelectorField
              key='asset-selector-field'
              keyIndex='normaltx-asset'
              title={t('form.asset')}
              aliasField={Autocomplete.AssetAlias}
              fieldProps={{
                id: assetId,
                alias: assetAlias
              }}
            />
            {showAvailableBalance && availableBalance &&
            <small className={styles.balanceHint}>{t('transaction.normal.availableBalance')} {availableBalance}</small>}
          </div>
        </div>

        <label className={styles.title}>{t('transaction.normal.to')}</label>

        <div className={styles.mainBox}>
          {receivers.map((receiver, index) =>
            <div
              className={this.props.tutorialVisible ? styles.tutorialItem : styles.subjectField}
              key={receiver.id.value}>
              <TextField title={t('form.address')} fieldProps={{
                ...receiver.address,
                onBlur: (e) => {
                  receiver.address.onBlur(e)
                  this.estimateNormalTransactionGas()
                },
              }}/>

              <AmountField
                isKUSK={showBtmAmountUnit}
                title={t('form.amount')}
                fieldProps={receiver.amount}
                decimal={assetDecimal}
              />

              <button
                className={`btn btn-danger btn-xs ${styles.deleteButton}`}
                tabIndex='-1'
                type='button'
                onClick={() => this.removeReceiverItem(index)}
              >
                {t('commonWords.remove')}
              </button>
            </div>
          )}
          <button
            type='button'
            className='btn btn-default'
            onClick={this.addReceiverItem}
          >
            {t('commonWords.addField')}
          </button>
        </div>

        {showBtmAmountUnit && [<label className={styles.title}>{t('transaction.normal.submitType')}</label>,
          <div className={styles.submitSwitchSet}>
            <div className={styles.submitSwitch}>
              <div className={styles.label}>{t('transaction.normal.chainTx')}</div>
              <label className={styles.switch}>
                <input
                  type='checkbox'
                  {...isChainTx}
                  onChange={(e) => {
                    this.estimateNormalTransactionGas('check')
                    isChainTx.onChange(e)
                  }}
                />
                <span className={styles.slider}></span>
              </label>
            </div>
            <div>{t('transaction.normal.chainTxNote')}</div>
          </div>]}

        <label className={styles.title}>{t('transaction.normal.selectFee')}</label>
        <div className={styles.txFeeBox}>
          <GasField
            gas={this.state.estimateGas}
            chainGas={this.state.chainGas}
            fieldProps={gasLevel}
            kuskAmountUnit={this.props.kuskAmountUnit}
          />
          <span className={styles.feeDescription}> {t('transaction.normal.feeDescription')}</span>
        </div>
      </div>
    </TxContainer>
  }
}

const validate = (values, props) => {
  const errors = {gas: {}}
  const t = props.t

  // Numerical
  if (values.amount && !/^\d+(\.\d+)?$/i.test(values.amount)) {
    errors.amount = ( t('errorMessage.amountError') )
  }
  return errors
}

const asyncValidate = (values, dispatch, props) => {
  const errors = []
  const promises = []

  values.receivers.forEach((receiver, idx) => {
    const address = values.receivers[idx].address
    if ( !address || address.length === 0)
      promises.push(Promise.resolve())
    else{
      promises.push(
        chainClient().accounts.validateAddresses(address)
          .then(
            (resp) => {
              if (!resp.data.valid) {
                errors[idx] = {address: props.t('errorMessage.addressError')}
              }
              return {}
            }
          ))
    }
  })

  return Promise.all(promises).then(() => {
    if (errors.length > 0) throw {
      receivers: errors
    }
    return {}
  })
}

const mapDispatchToProps = (dispatch) => ({
  showError: err => dispatch({type: 'ERROR', payload: err}),
  closeModal: () => dispatch(actions.app.hideModal),
  showModal: (body) => dispatch(actions.app.showModal(
    body,
    actions.app.hideModal,
    null,
    {
      dialog: true,
      noCloseBtn: true
    }
  )),
  ...BaseNew.mapDispatchToProps('transaction')(dispatch)
})

export default withNamespaces('translations') (BaseNew.connect(
  BaseNew.mapStateToProps('transaction'),
  mapDispatchToProps,
  reduxForm({
    form: 'NormalTransactionForm',
    fields: [
      'accountAlias',
      'accountId',
      'assetAlias',
      'assetId',
      'receivers[].id',
      'receivers[].amount',
      'receivers[].address',
      'gasLevel',
      'isChainTx'
    ],
    asyncValidate,
    asyncBlurFields: ['receivers[].address'],
    validate,
    touchOnChange: true,
    initialValues: {
      gasLevel: '1',
      isChainTx:false,
      receivers:[{
        id: 0,
        amount:'',
        address:''
      }]
    },
  })(NormalTxForm)
))
