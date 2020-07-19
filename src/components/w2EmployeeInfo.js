import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button, Box, Checkbox, FormControlLabel, Grow } from "@material-ui/core"
import { Link, useHistory } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux';

import locationPostalCodes from './locationPostalCodes'
import countries from './countries'

import { LabeledInput, LabeledDropdown } from './labeledInput'
import { saveFormData } from '../redux/actions';
import { getFormData } from '../redux/selectors'

export default function W2EmployeeInfo() {
    const { register, handleSubmit, errors, control } = useForm()
    const [foreignAddress, setforeignAddress] = useState(false)
    const history = useHistory()
    // const variable dispatch to allow use inside function
    const dispatch = useDispatch()

    const prevFormData = useSelector(getFormData)
    console.log(prevFormData)

    // component functions
    const onSubmit = formData => {
        console.log("formData: ", formData)
        dispatch(saveFormData(formData))
        history.push("/")
    }
    const setForeignAddressFalse = () => setforeignAddress(false)
    const setForeignAddressTrue = () => setforeignAddress(true)

    return (
        <Box display="flex" justifyContent="center">
            <form onSubmit={handleSubmit(onSubmit)}>
                <Box display="flex" justifyContent="flex-start">
                    <h2>Employee Information</h2>
                </Box>

                <LabeledInput
                    strongLabel="Box E - "
                    label="Employee's First Name and Initial"
                    register={register}
                    required={true}
                    pattern={/^[A-Za-z ]+$/i}
                    patternDescription={"Input should only include letters and spaces"}
                    name={"employeeFirstName"}
                    defaultValue={prevFormData["employeeFirstName"]}
                    errors={errors}
                />
                <LabeledInput
                    label="Employee's Last Name and Suffix"
                    register={register}
                    required={true}
                    pattern={/^[A-Za-z ]+$/i}
                    patternDescription={"Input should only include letters and spaces"}
                    name={"employeeLastName"}
                    defaultValue={prevFormData["employeeLastName"]}
                    errors={errors}
                />
                
                <Box display="flex" justifyContent="flex-start">
                    <p><strong>Box F - </strong>Employee's Address and Zip Code</p>
                </Box>

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
                    label="Employee's Address" register={register}
                    required={true}
                    pattern={/^[A-Za-z0-9]+$/i}
                    patternDescription={"Input should only include letters and numbers"}
                    name="employeeAddress"
                    defaultValue={prevFormData["employeeAddress"]}
                    errors={errors}
                />

                <LabeledInput
                    label="Employee's City"
                    register={register}
                    required={true}
                    name="employeeCity"
                    defaultValue={prevFormData["employeeCity"]}
                    errors={errors}
                />
                <Grow in={!foreignAddress} style={{ display: !foreignAddress ? 'block' : 'none' }}>
                    <div>
                        <LabeledDropdown
                            label="Employee's State"
                            dropDownData={locationPostalCodes}
                            valueMapping={locality => locality[1]}
                            keyMapping={locality => locality[1]}
                            textMapping={locality => locality[0] + ' - ' + locality[1]}
                            control={control}
                            required={!foreignAddress}
                            name="employeeState"
                            defaultValue={prevFormData["employeeState"]}
                            errors={errors}
                        />

                        <LabeledInput
                            label="Employee's Zip Code"
                            register={register}
                            required={!foreignAddress}
                            mask={"99999-9999"}
                            pattern={/[0-9]{5}-[0-9]{4}/}
                            patternDescription={"Input should be filled with 9 numbers"}
                            name="employeeZip"
                            defaultValue={prevFormData["employeeZip"]}
                            errors={errors}
                        />
                    </div>
                </Grow>

                <Grow in={foreignAddress} style={{ display: foreignAddress ? 'block' : 'none' }}>
                    <div>
                        <LabeledInput
                            label="Employee's Province or State"
                            register={register}
                            required={foreignAddress}
                            pattern={/^[A-Za-z]+$/i}
                            patternDescription={"Input should only include letters"}
                            name={"employeeProvidence"}
                            defaultValue={prevFormData["employeeProvidence"]}
                            errors={errors}
                        />
                        <LabeledDropdown
                            label="Employee's Country"
                            dropDownData={countries}
                            control={control}
                            required={foreignAddress}
                            name="employeeCountry"
                            defaultValue={prevFormData["employeeCountry"]}
                            errors={errors}
                        />
                        <LabeledInput
                            label="Employee's Postal Code"
                            register={register}
                            required={foreignAddress}
                            name={"employeePostalCode"}
                            defaultValue={prevFormData["employeePostalCode"]}
                            errors={errors}
                        />
                    </div>
                </Grow>

                <Box display="flex" justifyContent="flex-start" paddingTop={2} paddingBottom={1}>
                    <Box display="flex" justifyContent="flex-start" paddingRight={2}>
                        <Button component={Link} to={"w2employerinfo"} variant="contained" color="secondary" >
                            Back
                        </Button>
                    </Box>

                    <Button type="submit" variant="contained" color="primary">
                        Save and Continue
                    </Button>
                </Box>
            </form>
        </Box>
    )
}