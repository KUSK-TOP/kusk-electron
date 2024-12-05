import React from 'react'
import styles from './Pagination.scss'
import {withNamespaces} from 'react-i18next'

class Pagination extends React.Component {
  render() {
    const t = this.props.t
    const prevClass = `${styles.button} ${this.props.currentPage > 1 ? '' : styles.disabled}`
    const nextClass = `${styles.button} ${this.props.isLastPage ? styles.disabled : ''}`
    const nextPage = () => this.props.pushList(this.props.currentFilter, this.props.currentPage + 1)
    const prevPage = () => this.props.pushList(this.props.currentFilter, this.props.currentPage - 1)

    return (
      <ul className={styles.main}>
        <li>
          <a className={prevClass} onClick={prevPage}>
            &larr;
          </a>
        </li>
        <li className={styles.label}>{t('commonWords.page')} {this.props.currentPage}</li>
        <li>
          <a className={nextClass} onClick={nextPage}>
            &rarr;
          </a>
        </li>
      </ul>
    )
  }
}

Pagination.propTypes = {
  currentPage: React.PropTypes.number,
  isLastPage: React.PropTypes.bool,
  pushList: React.PropTypes.func,
  currentFilter: React.PropTypes.object,
}

export default withNamespaces('translations') (Pagination)
