import React, { Component } from 'react'
import Grid from '../layout/grid'
import ReactSelect from 'react-select';
import If from '../operator/if'

export default class Select extends Component {

    handleChange(selectedOption) {
        const { input, optionValue, inputOnChange } = this.props

        if (Array.isArray(selectedOption)) {
            let values = []
            selectedOption.forEach(option => values.push(option[optionValue || 'value']))

            input.onChange(values)
            if (inputOnChange) {
                inputOnChange(values)
            }
        } else {
            input.onChange(selectedOption[optionValue || 'value'])
            if (inputOnChange) {
                inputOnChange(selectedOption[optionValue || 'value'])
            }
        }
    }

    getCustomStyles() {
        const { input } = this.props

        let customStyles = {
            'min-height': 34,
            height: 34,
            'border-radius': 0,
            '&:link': { border: '1px solid #3c8dbc', lineHeight: 1.42857143 },
            '&:visited': { border: '1px solid #3c8dbc', lineHeight: 1.42857143 },
            '&:hover': { border: '1px solid #3c8dbc', lineHeight: 1.42857143 },
            '&:active': { border: '1px solid #3c8dbc', lineHeight: 1.42857143 },
            '&:focus    ': { border: '1px solid #3c8dbc', lineHeight: 1.42857143 },
            '&:focus-visible': { border: '1px solid #3c8dbc', lineHeight: 1.42857143 },
            '&:focus-within ': { border: '1px solid #3c8dbc', lineHeight: 1.42857143 },
            '&:enabled ': { border: '1px solid #3c8dbc', lineHeight: 1.42857143 },
        }

        if (Array.isArray(input.value) && input.value.length > 1) {
            delete customStyles.height
        }

        return {
            option: provided => ({
                ...provided,
            }),
            control: provided => ({
                ...provided, ...customStyles
            }),
            singleValue: provided => ({
                ...provided,
            })
        }
    }

    getValue() {
        const { options, optionValue, input } = this.props

        if (Array.isArray(input.value)) {
            return options && options.filter(opt => {
                for (let i = 0; i < input.value.length; i++) {
                    if (input.value[i] == opt[optionValue || 'value']) {
                        return true
                    }
                }
                return false
            })
        } else {
            return options && options.filter(opt => opt[optionValue || 'value'] == input.value)
        }
    }

    render() {
        const { cols, name, label, optionValue, optionLabel, autoFocus, readOnly, onlyCombo } = this.props
        return (
            <React.Fragment>
                <If test={onlyCombo}>
                    <ReactSelect {...this.props}
                        styles={this.getCustomStyles()}
                        onChange={e => this.handleChange(e)}
                        getOptionValue={opt => opt[optionValue || 'value']}
                        getOptionLabel={opt => opt[optionLabel || 'label']}
                        value={this.getValue()} autoFocus={autoFocus} isDisabled={readOnly} />
                </If>
                <If test={!onlyCombo}>
                    <Grid cols={cols}>
                        <div className='form-group'>
                            <If test={label}><label htmlFor={name}>{label}</label></If>
                            <ReactSelect {...this.props}
                                styles={this.getCustomStyles()}
                                onChange={e => this.handleChange(e)}
                                getOptionValue={opt => opt[optionValue || 'value']}
                                getOptionLabel={opt => opt[optionLabel || 'label']}
                                value={this.getValue()} autoFocus={autoFocus} isDisabled={readOnly} />
                        </div>
                    </Grid>
                </If>
            </React.Fragment>
        )
    }
}