import React, { Component } from "react"
import { GMMap } from "../midi/GM"

import "./InstrumentBrowser.css"

function InstrumentBrowserContent({
  categories,
  instruments,
  onChangeCategory,
  selectedCategoryId,
  onChangeInstrument,
  selectedInstrumentId,
  onClickOK,
  onClickCancel
}) {
  const categoryOptions = categories.map((name, i) => {
    return <option key={i}>{name}</option>
  })

  const instrumentOptions = instruments.map((name, i) => {
    return <option key={i}>{name}</option>
  })

  return <div className="InstrumentBrowser">
    <div className="container">
      <div className="left">
        <label>Categories</label>
        <select size="12" onChange={onChangeCategory} value={selectedCategoryId}>
          {categoryOptions}
        </select>
      </div>
      <div className="right">
        <label>Instruments</label>
        <select size="12" onChange={onChangeInstrument} value={selectedInstrumentId}>
          {instrumentOptions}
        </select>
      </div>
      <div className="footer">
        <button className="ok" onClick={onClickOK}>OK</button>
        <button className="cancel" onClick={onClickCancel}>Cancel</button>
      </div>
    </div>
  </div>
}

export default class InstrumentBrowser extends Component {
  constructor(props) {
    super(props)

    this.state = {
      selectedCategoryId: props.selectedCategoryId || 0,
      selectedInstrumentId: props.selectedInstrumentId || 0
    }
  }

  render() {
    const onClickOK = () => {
      this.props.onClickOK({
        categoryId: this.state.selectedCategoryId,
        instrumentId: this.state.selectedInstrumentId
      })
    }

    const onChangeCategory = e => {
      this.setState({
        selectedCategoryId: e.target.selectedIndex
      })
    }

    const onChangeInstrument = e => {
      this.setState({
        selectedInstrumentId: e.target.selectedIndex
      })
    }

    const categories = Object.keys(GMMap)
    const instruments = GMMap[Object.keys(GMMap)[this.state.selectedCategoryId]]

    return <InstrumentBrowserContent
      categories={categories}
      instruments={instruments}
      onClickOK={onClickOK}
      onClickCancel={this.props.onClickCancel}
      onChangeCategory={onChangeCategory}
      onChangeInstrument={onChangeInstrument}
    />
  }
}
