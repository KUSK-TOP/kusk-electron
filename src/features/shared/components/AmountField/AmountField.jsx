import React from 'react'
import {AmountInputMask, AmountUnitField } from '../'

class AmountField extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    const isKUSK = this.props.isKUSK

    return(isKUSK ?
          <AmountUnitField
            title={this.props.title}
            fieldProps={this.props.fieldProps}
          />
          :
          <AmountInputMask
            title={this.props.title}
            fieldProps={this.props.fieldProps}
            decimal={this.props.decimal}
          />
    )
  }
}

export default AmountField