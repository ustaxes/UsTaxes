import { screen, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import ItemizedDeductionsInfo from 'ustaxes/components/deductions/ItemizedDeductions'
import { PagerButtons, PagerContext } from 'ustaxes/components/pager'
import { Information, PersonRole } from 'ustaxes/core/data'
import { blankState } from 'ustaxes/redux/reducer'
import { createStoreUnpersisted } from 'ustaxes/redux/store'
import { renderWithProviders } from 'ustaxes/testUtil'
import { setupUserEvent } from 'ustaxes/tests/userEventSetup'

describe('ItemizedDeductions', () => {
  it('keeps stored itemized mortgage values exclusive of Form 1098 totals', async () => {
    const onAdvance = jest.fn()
    const info: Information = {
      ...blankState,
      taxPayer: {
        ...blankState.taxPayer,
        primaryPerson: {
          ...blankState.taxPayer.primaryPerson,
          firstName: 'Taylor',
          lastName: 'Taxpayer',
          ssid: '123456789',
          role: PersonRole.PRIMARY,
          isBlind: false,
          isTaxpayerDependent: false,
          dateOfBirth: new Date('1990-01-01'),
          address: {
            address: '123 Main St',
            city: 'Austin',
            state: 'TX',
            zip: '78701'
          }
        }
      },
      f1098s: [
        {
          lender: 'Sample Lender',
          interest: 1000,
          points: 100,
          mortgageInsurancePremiums: 200
        }
      ],
      itemizedDeductions: {
        medicalAndDental: 50,
        stateAndLocalTaxes: 0,
        isSalesTax: false,
        stateAndLocalRealEstateTaxes: 0,
        stateAndLocalPropertyTaxes: 0,
        interest8a: 999,
        interest8b: 75,
        interest8c: 25,
        interest8d: 999,
        investmentInterest: 0,
        charityCashCheck: 0,
        charityOther: 0
      }
    }
    const store = createStoreUnpersisted(info)
    const user = setupUserEvent()

    renderWithProviders(
      <Provider store={store}>
        <PagerContext.Provider
          value={{
            onAdvance,
            navButtons: <PagerButtons submitText="Save and Continue" />
          }}
        >
          <ItemizedDeductionsInfo />
        </PagerContext.Provider>
      </Provider>
    )

    expect(
      screen.getByRole('textbox', {
        name: /Home mortgage interest and points reported to you on Form 1098/i
      })
    ).toBeDisabled()
    expect(
      screen.getByRole('textbox', {
        name: /Mortgage insurance premiums/i
      })
    ).toBeDisabled()

    await user.click(screen.getByRole('button', { name: 'Save and Continue' }))

    await waitFor(() => {
      expect(onAdvance).toHaveBeenCalledTimes(1)
      const state = store.getState()
      expect(state[state.activeYear].itemizedDeductions).toMatchObject({
        medicalAndDental: 50,
        interest8a: 0,
        interest8b: 75,
        interest8c: 25,
        interest8d: 0
      })
    })
  })
})
