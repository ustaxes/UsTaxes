const federalBrackets = {
    "tax_withholding_percentage_method_tables": {
        "annual": {
            "single": {
                "income_tax_brackets": [
                    {
                        "bracket": 0,
                        "marginal_rate": 10,
                        "marginal_capital_gain_rate": 0,
                        "amount": 0
                    },
                    {
                        "bracket": 9875.0,
                        "marginal_rate": 12,
                        "marginal_capital_gain_rate": 0,
                        "amount": 987.5
                    },
                    {
                        "bracket": 40125,
                        "marginal_rate": 22,
                        "marginal_capital_gain_rate": 15,
                        "amount": 4617.5
                    },
                    {
                        "bracket": 85525,
                        "marginal_rate": 24,
                        "marginal_capital_gain_rate": 15,
                        "amount": 14605.5
                    },
                    {
                        "bracket": 163300,
                        "marginal_rate": 32,
                        "marginal_capital_gain_rate": 15,
                        "amount": 33271.5
                    },
                    {
                        "bracket": 207350.0,
                        "marginal_rate": 35,
                        "marginal_capital_gain_rate": 15,
                        "amount": 47367.5
                    },
                    {
                        "bracket": 510300.0,
                        "marginal_rate": 37,
                        "marginal_capital_gain_rate": 20,
                        "amount": 518400
                    }
                ],
                "deductions": [
                    {
                        "deduction_name": "Standard Deduction (Single)",
                        "deduction_amount": 12400
                    }
                ],
                "exemptions": [
                    {
                        "exemption_name": "Standard Exemption (Single)",
                        "exemption_amount": 0
                    }
                ]
            },
            "married": {
                "income_tax_brackets": [
                    {
                        "bracket": 0,
                        "marginal_rate": 10,
                        "marginal_capital_gain_rate": 0,
                        "amount": 0
                    },
                    {
                        "bracket": 19750,
                        "marginal_rate": 12,
                        "marginal_capital_gain_rate": 0,
                        "amount": 1975
                    },
                    {
                        "bracket": 80250,
                        "marginal_rate": 22,
                        "marginal_capital_gain_rate": 15,
                        "amount": 9235
                    },
                    {
                        "bracket": 171050,
                        "marginal_rate": 24,
                        "marginal_capital_gain_rate": 15,
                        "amount": 29211
                    },
                    {
                        "bracket": 326600,
                        "marginal_rate": 32,
                        "marginal_capital_gain_rate": 15,
                        "amount": 66543
                    },
                    {
                        "bracket": 414700,
                        "marginal_rate": 35,
                        "marginal_capital_gain_rate": 15,
                        "amount": 94735
                    },
                    {
                        "bracket": 622050,
                        "marginal_rate": 37,
                        "marginal_capital_gain_rate": 20,
                        "amount": 167307.5
                    }
                ],
                "deductions": [
                    {
                        "deduction_name": "Standard Deduction (Married)",
                        "deduction_amount": 24800
                    }
                ],
                "exemptions": [
                    {
                        "exemption_name": "Standard Exemption (Single)",
                        "exemption_amount": 0
                    }
                ]
            },
            "married_separately": {
                "income_tax_brackets": [
                    {
                        "bracket": 0,
                        "marginal_rate": 10,
                        "marginal_capital_gain_rate": 0,
                        "amount": 0
                    },
                    {
                        "bracket": 9875.0,
                        "marginal_rate": 12,
                        "marginal_capital_gain_rate": 0,
                        "amount": 987.5
                    },
                    {
                        "bracket": 40125,
                        "marginal_rate": 22,
                        "marginal_capital_gain_rate": 15,
                        "amount": 4617.5
                    },
                    {
                        "bracket": 85525,
                        "marginal_rate": 24,
                        "marginal_capital_gain_rate": 15,
                        "amount": 14605.5
                    },
                    {
                        "bracket": 163300,
                        "marginal_rate": 32,
                        "marginal_capital_gain_rate": 15,
                        "amount": 33271.5
                    },
                    {
                        "bracket": 207350.0,
                        "marginal_rate": 35,
                        "marginal_capital_gain_rate": 15,
                        "amount": 47367.5
                    },
                    {
                        "bracket": 510300.0,
                        "marginal_rate": 37,
                        "marginal_capital_gain_rate": 20,
                        "amount": 518400
                    }
                ],
                "deductions": [
                    {
                        "deduction_name": "Standard Deduction (Married Filing Separately)",
                        "deduction_amount": 12400
                    }
                ],
                "exemptions": [
                    {
                        "exemption_name": "Standard Exemption (Single)",
                        "exemption_amount": 0
                    }
                ]
            },
            "head_of_household": {
                "income_tax_brackets": [
                    {
                        "bracket": 0,
                        "marginal_rate": 10,
                        "marginal_capital_gain_rate": 0,
                        "amount": 0
                    },
                    {
                        "bracket": 19750,
                        "marginal_rate": 12,
                        "marginal_capital_gain_rate": 0,
                        "amount": 1975
                    },
                    {
                        "bracket": 80250,
                        "marginal_rate": 22,
                        "marginal_capital_gain_rate": 15,
                        "amount": 9235
                    },
                    {
                        "bracket": 171050,
                        "marginal_rate": 24,
                        "marginal_capital_gain_rate": 15,
                        "amount": 29211
                    },
                    {
                        "bracket": 326600,
                        "marginal_rate": 32,
                        "marginal_capital_gain_rate": 15,
                        "amount": 66543
                    },
                    {
                        "bracket": 414700,
                        "marginal_rate": 35,
                        "marginal_capital_gain_rate": 15,
                        "amount": 94735
                    },
                    {
                        "bracket": 622050,
                        "marginal_rate": 37,
                        "marginal_capital_gain_rate": 20,
                        "amount": 167307.5
                    }
                ],
                "deductions": [
                    {
                        "deduction_name": "Standard Deduction (Head of Household)",
                        "deduction_amount": 18650
                    }
                ],
                "exemptions": [
                    {
                        "exemption_name": "Standard Exemption (Single)",
                        "exemption_amount": 0
                    }
                ]
            }
        }
    }
}
export default federalBrackets;