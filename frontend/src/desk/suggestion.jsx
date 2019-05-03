import React, { Component } from 'react'
import Autosuggest from 'react-autosuggest';
import If from '../common/operator/if'
import Grid from '../common/layout/grid'

const theme = {
  container: {
    position: 'relative'
  },
  input: {
    width: "100%",
    height: 34,
    padding: '6px 12px',
    fontFamily: ['Source Sans Pro', 'Helvetica Neue', 'Helvetica, Arial, sans-serif'],
    fontWeight: 400,
    fontSize: 14,
    border: '1px solid #d2d6de',
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    lineHeight: 1.42857143,
    color: '#333333'
  },
  inputDisabled: {
    backgroundColor: '#eeeeee !important'
  },
  inputFocused: {
    outline: 'none',
    border: '1px solid #3c8dbc'
  },
  inputOpen: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0
  },
  suggestionsContainer: {
    display: 'none'
  },
  suggestionsContainerOpen: {
    display: 'block',
    position: 'absolute',
    top: 41,
    width: '100%',
    border: '1px solid #d2d6de',
    backgroundColor: '#fff',
    fontFamily: 'Source Sans Pro',
    fontWeight: 400,
    fontSize: 14,
    borderRadius: 4,
    borderRadius: 4,
    zIndex: 2,
    padding: '2px 0px 0px 0px'
  },
  suggestionsList: {
    margin: 0,
    padding: 0,
    listStyleType: 'none',
  },
  suggestion: {
    cursor: 'pointer',
    padding: '6px 12px',
    height: 34
  },
  suggestionHighlighted: {
    backgroundColor: '#deebff'
  }
}

export default class Example extends Component {
  constructor() {
    super();

    this.state = { suggestions: [] }
  }

  getSuggestionValue = suggestion => suggestion[this.props.field];

  renderSuggestion = suggestion => (
    <div>
      {suggestion[this.props.field]}
    </div>
  )

  getSuggestions = value => {
    if (!value) {
      return []
    }
    
    const list = this.props.list || []
    const inputValue = `${value}`.trim().toLowerCase()

    const inputLength = inputValue.length

    let suggestions = inputLength === 0 ? [] :
    list.filter(element => `${element[this.props.field]}`.toLowerCase().slice(0, inputLength) === `${inputValue}`)

    suggestions = suggestions.sort((a, b) => {
      if(isNaN(a[this.props.field]))  {
        return a[this.props.field].length - b[this.props.field].length
      } else {
        return a[this.props.field] - b[this.props.field]
      }      
    })

    return suggestions
  }

  onChange = (event, { newValue }) => {
    const { input, onSelected } = this.props

    input.onChange(newValue)

    if (onSelected) {
      const list = this.props.list || []
      const inputValue = newValue && newValue.trim().toLowerCase();
      const selectedValue = inputValue.length === 0 ? [] :
        list.filter(element => element[this.props.field].toLowerCase() === inputValue)

      if (selectedValue.length > 0) {
        onSelected(selectedValue[0])
      } else {
        onSelected('')
      }
    }
  }

  onSuggestionSelected = (event, { suggestionValue }) => {
    const { onSelected } = this.props

    if (onSelected) {
      const selectedValue = this.getSelectedValue(suggestionValue)
      onSelected(selectedValue)
    }
  }

  onSuggestionHighlighted = ({ suggestion }) => {
    const { onSelected } = this.props

    if (onSelected && suggestion) {
      const selectedValue = this.getSelectedValue(suggestion[this.props.field])

      onSelected(selectedValue)
    }
  }

  getSelectedValue = value => {
    const suggestions = this.getSuggestions(value)
    return suggestions.length > 0 ? suggestions[0] : ''
  }

  onSuggestionsFetchRequested = ({ value }) => {
    const suggestions = this.getSuggestions(value)
    this.setState({ suggestions })

    const { onSelected } = this.props
    if (suggestions && suggestions.length === 0 && onSelected) {
      onSelected('')
    }
  }

  onSuggestionsClearRequested = () => {
    this.setState({ suggestions: [] })
  }

  render() {
    const { suggestions } = this.state;

    return (
      <Grid cols={this.props.cols || 12}>
        <div className="form-group">
          <If test={this.props.label}>
            <label>{this.props.label}</label>
          </If>
          <div className="input-group">
            <div className="input-group-addon">              
                <i className={this.props.icon || "fa fa-user"}></i>              
            </div>
            <Autosuggest
              suggestions={suggestions}
              onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
              onSuggestionsClearRequested={this.onSuggestionsClearRequested}
              getSuggestionValue={this.getSuggestionValue}
              renderSuggestion={this.renderSuggestion}
              inputProps={{ ...this.props.input, onChange: this.onChange, placeholder: this.props.placeholder, disabled: this.props.readOnly}}
              placeholder={this.props.placeholder}
              className="form-control"
              theme={theme}
              onSuggestionSelected={this.onSuggestionSelected}
              onSuggestionHighlighted={this.onSuggestionHighlighted} />
          </div>
        </div>
      </Grid>
    )
  }
}