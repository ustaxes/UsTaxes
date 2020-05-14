import React, { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { TextField, Button, Box, Checkbox, FormControlLabel, Grow } from "@material-ui/core"
import InputMask from 'react-input-mask'
import locationPostalCodes from './locationPostalCodes'
import countries from './countries'

export function LabeledInput({ strongLabel, label, register, required, mask, pattern, patternDescription, name, errors }) {
    let helperText = ""
    if (errors[name]?.type === "required"){
        helperText = "Input is required"
    } 
    else if (errors[name]?.type === "pattern"){
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

export function LabeledDropdown({label, dropDownData, valueMapping, keyMapping, textMapping, control, required, name, errors}) {
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

export default function W2EmployerInfo() {
    const { register, handleSubmit, errors, control } = useForm()
    const [foreignAddress, setforeignAddress] = useState(false)
    const onSubmit = data => { console.log("formData: ", data) }

    const setForeignAddressFalse = () => setforeignAddress(false)
    const setForeignAddressTrue = () => setforeignAddress(true)
    
    return (
        <Box display="flex" justifyContent="center">
            < form onSubmit={handleSubmit(onSubmit)} >
                <Box display="flex" justifyContent="flex-start">
                    <h2>Employer Information</h2>
                </Box>

                <LabeledInput
                    strongLabel="Box A - "
                    label="Employee's Social Security Number"
                    register={register}
                    required={true}
                    mask={"999-99-9999"}
                    pattern={/[0-9]{3}-[0-9]{2}-[0-9]{4}/}
                    patternDescription={"Input should be filled with 9 numbers"}
                    name="SSID"
                    errors={errors}
                />

                <LabeledInput
                    strongLabel="Box B - "
                    label="Employer Identification Number"
                    register={register}
                    required={true}
                    mask={"99-9999999"}
                    pattern={/[0-9]{2}-[0-9]{7}/}
                    patternDescription={"Input should be filled with 7 numbers"}
                    name="EIN"
                    errors={errors}
                />

                <Box display="flex" justifyContent="flex-start">
                    <p><strong>Box C - </strong>Employer's Name, Address, and Zip Code</p>
                </Box>

                <LabeledInput
                    label="Employer's Name" 
                    register={register} 
                    required={true} 
                    name={"employerName"} 
                    errors={errors}
                />

                <Box display="flex" justifyContent="flex-start" paddingTop={1}>
                    <FormControlLabel
                        control={<Checkbox checked={!foreignAddress} onChange={setForeignAddressFalse} color="primary" />}
                        label="No"
                        ml={0}
                    />
                    <FormControlLabel
                        control={<Checkbox checked={foreignAddress} onChange={setForeignAddressTrue} color="primary" />}
                        label="Yes"
                    />
                    <p>Do you have a foreign address?</p>
                </Box>
                
                <LabeledInput
                    label="Employer's Address" register={register} 
                    required={true} 
                    pattern={/^[A-Za-z0-9]+$/i} 
                    patternDescription={"Input should only include letters and numbers"} 
                    name="employerAddress"
                    errors={errors} 
                />

                <LabeledInput 
                    label="Employer's City" 
                    register={register} 
                    required={true} 
                    name="employerCity" 
                    errors={errors} 
                />
                <Grow in={!foreignAddress} style={{ display: !foreignAddress ? 'block' : 'none'  }}>
                        <div>
                            <LabeledDropdown
                                label="Employer's State"
                                dropDownData={locationPostalCodes}
                                valueMapping={locality => locality[1]} 
                                keyMapping={locality => locality[1]}
                                textMapping={locality => locality[0] + ' - ' + locality[1]}
                                control={control} 
                                required={true} 
                                name="employerState"
                                errors={errors}
                            />

                            <LabeledInput
                                label="Employer's Zip Code"
                                register={register}
                                required={true}
                                mask={"99999-9999"}
                                pattern={/[0-9]{5}-[0-9]{4}/}
                                patternDescription={"Input should be filled with 9 numbers"}
                                name="employerZip"
                                errors={errors}
                            /> 
                        </div>
                    </Grow>
                    
                <Grow in={foreignAddress} style={{ display: foreignAddress ? 'block' : 'none'}}>
                        <div>
                            <LabeledInput
                                label="Employer's Province or State"
                                register={register}
                                required={true}
                                pattern={/^[A-Za-z]+$/i}
                                patternDescription={"Input should only include letters"}
                                name={"employerProvidence"}
                                errors={errors}
                            />
                            <LabeledDropdown
                                label="Employer's Country"
                                dropDownData={countries}
                                control={control}
                                required={true}
                                name="employerCountry"
                                errors={errors}
                            />
                            <LabeledInput
                                label="Employer's Postal Code"
                                register={register}
                                required={true}
                                name={"employerPostalCode"}
                                errors={errors}
                            />
                        </div>
                    </Grow>

                <Box display="flex" justifyContent="flex-start" paddingTop={2} paddingBottom={1}>
                    <Button type="submit" variant="contained" color="primary">
                        Save and Continue
                    </Button>
                </Box>
            </form >
        </Box>
    )
}