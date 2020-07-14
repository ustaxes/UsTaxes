import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button, Box, Checkbox, FormControlLabel, Grow } from "@material-ui/core"
import { Link } from "react-router-dom";
import locationPostalCodes from './locationPostalCodes'
import countries from './countries'
import { LabeledInput, LabeledDropdown} from './labeledInput'

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
                    <Box display="flex" justifyContent="flex-start" paddingRight={2}>
                        <Button component={Link} to={""} variant="contained" color="secondary" >
                            Back
                        </Button>
                    </Box>

                    <Button type="submit" variant="contained" color="primary">
                        Save and Continue
                    </Button>
                </Box>
            </form >
        </Box>
    )
}