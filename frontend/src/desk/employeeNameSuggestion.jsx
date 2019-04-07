import React, { Component } from 'react'
import Autosuggest from 'react-autosuggest';
import If from '../common/operator/if'
import Grid from '../common/layout/grid'

// Imagine you have a list of list that you'd like to autosuggest.

// When suggestion is clicked, Autosuggest needs to populate the input
// based on the clicked suggestion. Teach Autosuggest how to calculate the
// input value for every given suggestion.
const getSuggestionValue = suggestion => suggestion.description;

// Use your imagination to render suggestions.
const renderSuggestion = suggestion => (
  <div>
    {suggestion.description}
  </div>
);

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

    // Autosuggest is a controlled component.
    // This means that you need to provide an input value
    // and an onChange handler that updates this value (see below).
    // Suggestions also need to be provided to the Autosuggest,
    // and they are initially empty because the Autosuggest is closed.
    this.state = {
      value: '',
      suggestions: []
    };
  }

  // Teach Autosuggest how to calculate suggestions for any given input value.
  getSuggestions = value => {
    const inputValue = value.trim().toLowerCase();
    const inputLength = inputValue.length;
  
    const list = this.props.list || []

    return inputLength === 0 ? [] : list.filter(element =>
      element.description.toLowerCase().slice(0, inputLength) === inputValue
    );
  };

  onChange = (event, { newValue }) => {
    this.setState({
      value: newValue
    });
  };

  // Autosuggest will call this function every time you need to update suggestions.
  // You already implemented this logic above, so just use it.
  onSuggestionsFetchRequested = ({ value }) => {
    this.setState({
      suggestions: this.getSuggestions(value)
    });
  };

  // Autosuggest will call this function every time you need to clear suggestions.
  onSuggestionsClearRequested = () => {
    this.setState({
      suggestions: []
    });
  };

  render() {
    const { value, suggestions } = this.state;

    // Autosuggest will pass through all these props to the input.
    const inputProps = {
      placeholder: this.props.placeholder,
      value,
      onChange: this.onChange
    };

    // Finally, render it!
    return (
      <Grid cols={this.props.cols || 12}>
        <div class="form-group">
          <If test={this.props.label}>
            <label>{this.props.label}</label>
          </If>
          <div class="input-group">
            <div class="input-group-addon">
              <i class="fa fa-user"></i>
            </div>
            <Autosuggest
              suggestions={suggestions}
              onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
              onSuggestionsClearRequested={this.onSuggestionsClearRequested}
              getSuggestionValue={getSuggestionValue}
              renderSuggestion={renderSuggestion}
              inputProps={inputProps}
              {...this.props.input}
              placeholder={this.props.placeholder}
              readOnly={this.props.readOnly}
              class="form-control"
              theme={theme} />
          </div>
        </div>
      </Grid>
    )
  }
}
