import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { TextField, Button, Box, Checkbox, FormControlLabel } from "@material-ui/core"
import InputMask from 'react-input-mask'

export default function W2EmployerInfo() {
    const { register, handleSubmit, errors } = useForm()
    const onSubmit = data => { console.log("blah: ",data) }


    const [foreignAddress, setforeignAddress] = useState(false);

    const setForeignAddressFalse = () => setforeignAddress(false)
    const setForeignAddressTrue = () => setforeignAddress(true)

    console.log(foreignAddress)
    return (
        <Box display="flex" justifyContent="center">
            {/* "handleSubmit" will validate your inputs before invoking "onSubmit" */}
            < form onSubmit={handleSubmit(onSubmit)} >
                <Box display="flex" justifyContent="flex-start">
                    <h2>Employer Information</h2>
                </Box>

                {/* register your input into the hook by invoking the "register" function */}
                {/* <input name="example" defaultValue="test" ref={register} /> */}

                <Box display="flex" justifyContent="flex-start">
                    <p><strong>Box A - </strong>Employee's Social Security Number</p>
                </Box>

                {!errors.SSID &&
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
                }
                {errors.SSID &&
                    <div>
                        <Box display="flex" justifyContent="flex-start">
                            <InputMask
                                mask="999-99-9999"
                            >
                                {() => <TextField
                                    error
                                    label="Error"
                                    name="SSID"
                                    variant="filled"
                                    inputRef={register({ required: true })}
                                />}
                            </InputMask>

                        </Box>
                        <Box display="flex" justifyContent="flex-start">
                            <p>Social Security Number is required</p>
                        </Box>
                    </div>
                }

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
                            inputRef={register}
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
                    <TextField fullWidth inputRef={register({ pattern: /^[A-Za-z]+$/i })} name="employerName" variant="filled" />
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
                    <TextField fullWidth inputRef={register({ pattern: /^[A-Za-z]+$/i })} name="employerAddress" variant="filled" />
                </Box>


                <Box display="flex" justifyContent="flex-start">
                    <p>Employer's City</p>
                </Box>

                <Box display="flex" justifyContent="flex-start">
                    <TextField fullWidth inputRef={register({ pattern: /^[A-Za-z]+$/i })} name="employerCity" variant="filled" />
                </Box>

                <Box display="flex" justifyContent="flex-start">
                    <p>Employer's State</p>
                </Box>

                <Box display="flex" justifyContent="flex-start">
                    <TextField fullWidth inputRef={register({ pattern: /^[A-Za-z]+$/i })} name="employerState" variant="filled" />
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