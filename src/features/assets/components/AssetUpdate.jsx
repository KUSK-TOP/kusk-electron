import React from 'react'
import { BaseUpdate, FormContainer, FormSection, NotFound, TextField } from 'features/shared/components'
import { reduxForm } from 'redux-form'
import {withNamespaces} from 'react-i18next'

class Form extends React.Component {
  constructor(props) {
    super(props)

    this.submitWithValidations = this.submitWithValidations.bind(this)

    this.state = {}
  }

  submitWithValidations(data) {
    return this.props.submitForm(data, this.props.item.id).catch(err => {
      throw {_error: err}
    })
  }

  componentDidMount() {
    this.props.fetchItem(this.props.params.id).then(resp => {
      if (resp.status == 'fail') {
        this.setState({notFound: true})
      }
    })
  }

  render() {
    if (this.state.notFound) {
      return <NotFound />
    }
    const item = this.props.item

    if (!item) {
      return <div>Loading...</div>
    }

    const {
      fields: { alias },
      error,
      handleSubmit,
      submitting,
      t
    } = this.props

    const title = <span>
      {t('asset.editAlias')}
      <code>{item.alias ? item.alias :item.id}</code>
    </span>

    return <FormContainer
      error={error}
      label={title}
      onSubmit={handleSubmit(this.submitWithValidations)}
      submitting={submitting}
      >

      <FormSection title={t('asset.alias') }>
        <TextField
          placeholder={ t('asset.aliasPlaceholder')}
          fieldProps={alias}
          type= 'text'
        />
      </FormSection>
    </FormContainer>
  }
}

const mapStateToProps = (state, ownProps) => ({
  item: state.asset.items[ownProps.params.id],
})

const initialValues = (state, ownProps) => {
  const item = state.asset.items[ownProps.params.id]
  if (item) {
    return {
      initialValues: {
        alias: item.alias
      }
    }
  }
  return {}
}

const updateForm = reduxForm({
  form: 'updateAssetForm',
  fields: ['alias'],
}, initialValues)(Form)

export default withNamespaces('translations') (BaseUpdate.connect(
  mapStateToProps,
  BaseUpdate.mapDispatchToProps('asset'),
  updateForm
))
