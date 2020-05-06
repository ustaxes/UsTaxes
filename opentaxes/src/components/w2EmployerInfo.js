import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { TextField, Button, Box, Checkbox, FormControlLabel, MenuItem, Select } from "@material-ui/core"
import InputMask from 'react-input-mask'
import locationPostalCodes from './locationPostalCodes'

export function LabeledInput({ label, register, required, mask, pattern, patternDescription, name, errors }) {
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
                <p>{label}</p>
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
                        inputRef={register({ required: required, pattern: pattern || /.*?/ })}
                        name={name}
                        variant="filled"
                    />}
                </InputMask> :
                <TextField
                    error={errors[name]}
                    helperText={helperText}
                    fullWidth
                    inputRef={register({ required: required, pattern: pattern || /.*?/ })}
                    name={name}
                    variant="filled"
                />
                }
                
            </Box>
        </div>
    )
}
export default function W2EmployerInfo() {
    const { register, handleSubmit, errors, setValue } = useForm()
    const [foreignAddress, setforeignAddress] = useState(false)
    const onSubmit = data => { console.log("formData: ", data) }

    const changeSelectedState = (e) => setValue("selectedLocality", e.target.value)
    const setForeignAddressFalse = () => setforeignAddress(false)
    const setForeignAddressTrue = () => setforeignAddress(true)

    useEffect(() => {
        register({ name: "selectedLocality" }); // set form data for locality selector
    }, [register])

    console.log(errors)
    return (
        <Box display="flex" justifyContent="center">
            < form onSubmit={handleSubmit(onSubmit)} >
                <Box display="flex" justifyContent="flex-start">
                    <h2>Employer Information</h2>
                </Box>

                {/* <Box display="flex" justifyContent="flex-start">
                    <p><strong>Box A - </strong>Employee's Social Security Number</p>
                </Box>

                <Box display="flex" justifyContent="flex-start">
                    <InputMask
                        mask="999-99-9999"
                        alwaysShowMask={true}
                    >
                        {() => <TextField
                            name="SSID"
                            variant="filled"
                            inputRef={register({ pattern: /[0-9]{3}-[0-9]{2}-[0-9]{4}/ })}
                        />}
                    </InputMask>
                </Box> */}
                <LabeledInput
                    label="Employee's Social Security Number"
                    register={register}
                    required={true}
                    mask={"999-99-9999"}
                    pattern={/[0-9]{3}-[0-9]{2}-[0-9]{4}/}
                    patternDescription={"Input should be filled with 9 numbers"}
                    name={"employerName"}
                    errors={errors}
                />

                <Box display="flex" justifyContent="flex-start">
                    <p><strong>Box B - </strong>Employer Identification Number (EIN)</p>
                </Box>

                <Box display="flex" justifyContent="flex-start">
                    <InputMask
                        mask="99-9999999"
                        alwaysShowMask={true}
                    >
                        {() => <TextField
                            name="EIN"
                            variant="filled"
                            inputRef={register}
                        />}
                    </InputMask>
                </Box>

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
                        control={<Checkbox checked={!foreignAddress} onChange={setForeignAddressFalse} name="gilad" color="primary" />}
                        label="No"
                        ml={0}
                    />
                    <FormControlLabel
                        control={<Checkbox checked={foreignAddress} onChange={setForeignAddressTrue} name="gilad" color="primary" />}
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

                <Box display="flex" justifyContent="flex-start">
                    <p>Employer's State</p>
                </Box>

                <Box display="flex" justifyContent="flex-start">
                    <Select
                        fullWidth
                        labelId="demo-simple-select-label"
                        onChange={changeSelectedState}
                        name="employerState" 
                        variant="filled"
                    >
                        {locationPostalCodes.map(locality => 
                            <MenuItem value={locality[1]} key={locality[1]}>{locality[0]} - {locality[1]}</MenuItem>
                        )}
                        
                    </Select>
                </Box>

                <Box display="flex" justifyContent="flex-start">
                    <p>Employer's Zip Code</p>
                </Box>
                {/* ({ pattern: /^[1-9]+$/i }) */}
                <Box display="flex" justifyContent="flex-start">
                    <InputMask
                        mask="99999-9999"
                        alwaysShowMask={true}
                    >
                        {() => <TextField
                            name="zip"
                            variant="filled"
                            inputRef={register}
                        />}
                    </InputMask>
                </Box>

                <Box display="flex" justifyContent="flex-start" paddingTop={2} paddingBottom={2}>
                    <Button type="submit" variant="contained" color="primary">
                        Save and Continue
                    </Button>
                </Box>
            </form >
        </Box>
    )
}