import React from 'react'
import { TextField, Box } from "@material-ui/core"
import { Controller } from 'react-hook-form'
import InputMask from 'react-input-mask'

export function LabeledInput({ strongLabel, label, register, required, mask, pattern, patternDescription, name, errors }) {
    let helperText = ""
    // fix error where pattern wouldn't match if input wasn't filled out even if required was set to false
    if (required === false){
        pattern = null
    }
    if (errors[name]?.type === "required") {
        helperText = "Input is required"
    }
    else if (errors[name]?.type === "pattern") {
        // Must have a regex pattern description so users can see what's going wrong *
        helperText = patternDescription
    }
    return (
        <div>
            <Box display="flex" justifyContent="flex-start">
                <p><strong>{strongLabel}</strong>{label}</p>
            </Box>
            {/* default regex pattern is to accept any input. Otherwise, use input pattern */}
            <Box display="flex" justifyContent="flex-start">
                {/* if there is a mask prop, create masked textfield rather than standard */}
                {mask ?
                    <InputMask
                        mask={mask}
                        alwaysShowMask={true}
                    >
                        {() => <TextField
                            error={errors[name] ? true : false}
                            helperText={helperText}
                            inputRef={register({ submitFocusError: true, required: required, pattern: pattern || /.*?/ })}
                            name={name}
                            variant="filled"
                        />}
                    </InputMask> :
                    <TextField
                        error={errors[name] ? true : false}
                        helperText={helperText}
                        fullWidth
                        inputRef={register({ submitFocusError: true, required: required, pattern: pattern || /.*?/ })}
                        name={name}
                        variant="filled"
                    />
                }

            </Box>
        </div>
    )
}

export function LabeledDropdown({ label, dropDownData, valueMapping, keyMapping, textMapping, control, required, name, errors }) {
    let helperText = ""
    if (errors[name]?.type === "required") {
        helperText = "Input is required"
    }
    return (
        <div>
            <Box display="flex" justifyContent="flex-start">
                <p>{label}</p>
            </Box>

            <Box display="flex" justifyContent="flex-start">
                <Controller
                    as={
                        <TextField
                            select
                            helperText={helperText}
                            defaultValue=""
                        >
                            {dropDownData.map(dropDownItem =>
                                <option
                                    value={valueMapping ? valueMapping(dropDownItem) : dropDownItem}
                                    key={keyMapping ? keyMapping(dropDownItem) : dropDownItem}>
                                    {textMapping ? textMapping(dropDownItem) : dropDownItem}
                                </option>
                            )}
                        </TextField>
                    }
                    error={errors[name] ? true : false}
                    fullWidth
                    name={name}
                    rules={{ required: required }}
                    control={control}
                    variant="filled"
                />
            </Box>
        </div>
    )
}