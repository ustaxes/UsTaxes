import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { TextField, Button, Box, Checkbox, FormControlLabel, MenuItem, Select } from "@material-ui/core"
import InputMask from 'react-input-mask'
import locationPostalCodes from './locationPostalCodes'

export function localAddress() {
    return (
        <div>
            
        </div>
    )
}

export default function W2EmployerInfo() {
    const { register, handleSubmit, errors, setValue } = useForm()
    const [foreignAddress, setforeignAddress] = useState(false)
    const onSubmit = data => { console.log("formData: ",data) }

    const changeSelectedState = (e) => setValue("selectedLocality", e.target.value)
    const setForeignAddressFalse = () => setforeignAddress(false)
    const setForeignAddressTrue = () => setforeignAddress(true)

    useEffect(() => {
        register({ name: "selectedLocality", required: true }); // set form data for locality selector
    }, [register])

    return (
        <Box display="flex" justifyContent="center">
            < form onSubmit={handleSubmit(onSubmit)} >
                <Box display="flex" justifyContent="flex-start">
                    <h2>Employer Information</h2>
                </Box>

                <Box display="flex" justifyContent="flex-start">
                    <p><strong>Box A - </strong>Employee's Social Security Number</p>
                </Box>

                {/* {!errors.SSID && */}
                    <Box display="flex" justifyContent="flex-start">
                        <InputMask
                            mask="999-99-9999"
                        >
                            {() => <TextField
                                name="SSID"
                                variant="filled"
                                inputRef={register({ required: true })}
                            />}
                        </InputMask>
                    </Box>
                {/* // }
                // {errors.SSID &&
                //     <div>
                //         <Box display="flex" justifyContent="flex-start">
                //             <InputMask
                //                 mask="999-99-9999"
                //             >
                //                 {() => <TextField
                //                     error
                //                     label="Error"
                //                     name="SSID"
                //                     variant="filled"
                //                     inputRef={register({ required: true })}
                //                 />}
                //             </InputMask>

                //         </Box>
                //         <Box display="flex" justifyContent="flex-start">
                //             <p>Social Security Number is required</p>
                //         </Box>
                //     </div>
                // } */}

                <Box display="flex" justifyContent="flex-start">
                    <p><strong>Box B - </strong>Employer Identification Number (EIN)</p>
                </Box>

                <Box display="flex" justifyContent="flex-start">
                    <InputMask
                        mask="99-9999999"
                    >
                        {() => <TextField
                            name="EIN"
                            variant="filled"
                            inputRef={register({ required: true })}
                        />}
                    </InputMask>
                </Box>

                <Box display="flex" justifyContent="flex-start">
                    <p><strong>Box C - </strong>Employer's Name, Address, and Zip Code</p>
                </Box>

                <Box display="flex" justifyContent="flex-start">
                    <p>Employer's Name</p>
                </Box>

                <Box display="flex" justifyContent="flex-start">
                    <TextField fullWidth inputRef={register({ required: true })} name="employerName" variant="filled" />
                </Box>

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

                <Box display="flex" justifyContent="flex-start">
                    <p>Employer's Address</p>
                </Box>

                <Box display="flex" justifyContent="flex-start">
                    <TextField fullWidth inputRef={register({ pattern: /^[A-Za-z1-9]+$/i, required: true })} name="employerAddress" variant="filled" />
                </Box>

                <Box display="flex" justifyContent="flex-start">
                    <p>Employer's City</p>
                </Box>

                <Box display="flex" justifyContent="flex-start">
                    <TextField fullWidth inputRef={register({ pattern: /^[A-Za-z]+$/i, required: true  })} name="employerCity" variant="filled" />
                </Box>

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

                <Box display="flex" justifyContent="flex-start">
                    <InputMask
                        mask="99999-9999"
                    >
                        {() => <TextField
                            name="zip"
                            variant="filled"
                            inputRef={register({ pattern: /^[1-9]+$/i, required: true })}
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