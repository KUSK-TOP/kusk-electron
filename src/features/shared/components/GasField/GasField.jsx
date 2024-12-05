import React from 'react'
import pick from 'lodash/pick'
import { normalizeKUSKAmountUnit } from 'utility/buildInOutDisplay'
import { kuskID } from 'utility/environment'
import styles from './GasField.scss'

const TEXT_FIELD_PROPS = [
  'value',
  'onBlur',
  'onChange',
  'onFocus',
  'name'
]

class GasField extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    const fieldProps = pick(this.props.fieldProps, TEXT_FIELD_PROPS)
    const {touched, error} = this.props.fieldProps
    const chainGas = this.props.chainGas || 0

    return <div className={`form-group ${styles.slider}`}>
      <span>{normalizeKUSKAmountUnit(kuskID, ( chainGas + fieldProps.value * this.props.gas ), this.props.kuskAmountUnit)}</span>
      <input
        type='range'
        min={0}
        max={3}
        step='1'
        {...fieldProps} />

      {touched && error && <span className='text-danger'><strong>{error}</strong></span>}
      {this.props.hint && <span className='help-block'>{this.props.hint}</span>}
    </div>
  }
}

export default GasField
