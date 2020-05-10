import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { TextField, Button, Box, Checkbox, FormControlLabel, Select } from "@material-ui/core"
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
                        error={errors[name]}
                        helperText={helperText}
                        inputRef={register({ submitFocusError: true, required: required, pattern: pattern || /.*?/ })}
                        name={name}
                        variant="filled"
                    />}
                </InputMask> :
                <TextField
                    error={errors[name]}
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
export default function W2EmployerInfo() {
    const { register, handleSubmit, errors } = useForm({
        defaultValues: {
            selectedState: "bill",

        }
    })
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
                    name={"employerAddress"} 
                    errors={errors} 
                />

                <LabeledInput 
                    label="Employer's City" 
                    register={register} 
                    required={true} 
                    name={"employerCity"} 
                    errors={errors} 
                />
                {foreignAddress===false ?
                    <div>
                        <Box display="flex" justifyContent="flex-start">
                            <p>Employer's State</p>
                        </Box>

                        <Box display="flex" justifyContent="flex-start">
                            <Select
                                fullWidth
                                inputRef={register({ required: true, name: "selectedState", pattern: /Oregon/ })}
                                name="employerState"
                                variant="filled"
                            >
                                {locationPostalCodes.map(locality =>
                                    <option value={locality[1]} key={locality[1]}>{locality[0]} - {locality[1]}</option>
                                )}
                            </Select>
                        </Box>

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
                    : 
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
                        <Box display="flex" justifyContent="flex-start">
                            <p>Employer's Country</p>
                        </Box>

                        <Box display="flex" justifyContent="flex-start">
                            <Select
                                fullWidth
                                inputRef={register({ required: true, name: "selectedCountry" })}
                                name="employerState"
                                variant="filled"
                            >
                                {countries.map(country =>
                                    <option value={country} key={country}>{country}</option>
                                )}
                            </Select>
                        </Box>
                        <LabeledInput
                            label="Employer's Postal Code"
                            register={register}
                            required={true}
                            name={"employerPostalCode"}
                            errors={errors}
                        />
                    </div>
                }
                

                <Box display="flex" justifyContent="flex-start" paddingTop={2} paddingBottom={1}>
                    <Button type="submit" variant="contained" color="primary">
                        Save and Continue
                    </Button>
                </Box>
            </form >
        </Box>
    )
}