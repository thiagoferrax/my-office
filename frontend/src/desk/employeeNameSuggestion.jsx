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
    height: 34,
    border: '1px solid #aaa',
    backgroundColor: '#fff',
    fontFamily: 'Helvetica, sans-serif',
    fontWeight: 400,
    fontSize: 14,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    zIndex: 2
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
    backgroundColor: '#ddd'
  }
}

export default class Example extends React.Component {
  constructor() {
    super();

    this.state = {
      suggestions: []
    };

    this.onChange =  this.onChange.bind(this)
  }

  getSuggestionValue = suggestion => suggestion[this.props.field];

  renderSuggestion = suggestion => (
    <div>
      {suggestion[this.props.field]}
    </div>
  );

  getSuggestions = value => {
    const inputValue = value && value.trim().toLowerCase();
    const inputLength = inputValue.length;

    const list = this.props.list || []

    return inputLength === 0 ? [] : list.filter(element =>
      element[this.props.field].toLowerCase().slice(0, inputLength) === inputValue
    );
  };

  onChange = (event, { newValue }) => {
    this.props.input.onChange(newValue)
  }

  onSuggestionsFetchRequested = ({ value }) => {
    this.setState({
      suggestions: this.getSuggestions(value)
    });
  };

  onSuggestionsClearRequested = () => {
    this.setState({
      suggestions: []
    });
  };

  render() {
    const { value, suggestions } = this.state;

    const inputProps = {
      placeholder: this.props.placeholder,
      value,
      onChange: this.onChange
    };

    return (
      <Grid cols={this.props.cols || 12}>
        <div className="form-group">
          <If test={this.props.label}>
            <label>{this.props.label}</label>
          </If>
          <div className="input-group">
            <div className="input-group-addon">
              <i className="fa fa-user"></i>
            </div>
            <Autosuggest
              suggestions={suggestions}
              onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
              onSuggestionsClearRequested={this.onSuggestionsClearRequested}
              getSuggestionValue={this.getSuggestionValue}
              renderSuggestion={this.renderSuggestion}
              inputProps={{...this.props.input, onChange: this.onChange}}
              placeholder={this.props.placeholder}
              readOnly={this.props.readOnly}
              className="form-control"
              theme={theme} />
          </div>
        </div>
      </Grid>
    )
  }
}
