import {
  FilingStatus,
  Income1099Type,
  Information,
  StateQuestionTagName,
  ValueTag
} from '.'

export interface StateQuestion {
  text: string
  description: string
  required?: (state: Information) => boolean
  tag: StateQuestionTagName
  // This is repeated effort, as it has to mirror value type from QuestionTag:
  readonly valueTag: ValueTag
}

function q(
  tag: StateQuestionTagName,
  text: string,
  description: string,
  valueTag: ValueTag,
  required: (s: Information) => boolean
): StateQuestion {
  return { text, description, tag, required, valueTag }
}

function qr(
  tag: StateQuestionTagName,
  text: string,
  description: string,
  valueTag: ValueTag = 'boolean'
): StateQuestion {
  return { text, description, tag, valueTag }
}

function escapeHtmlTags(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

export const stateQuestions: StateQuestion[] = [
  q(
    'OR_6A_TAXPAYER_SEVERELY_DISABLED',
    'Are you severely disabled?',
    escapeHtmlTags(
      '<p><strong><u>6a & 6b.</u> Severely disabled.</strong> Did you or your spouse have a severe disability at the end of 2021? If so, you can claim an additional exemption. This is different from the disabled child exemption. You may qualify for and claim the severely disabled exemption even if someone else can claim you as a dependent. You’re considered to have a severe disability if any of the following apply:</p><ul><li>You permanently lost the use of one or both feet.</li><li>You permanently lost the use of both hands.</li><li>You’re permanently blind.</li><li>You have a permanent condition that, without special equipment or outside help, limits your ability to earn a living, maintain a household, or transport yourself.</li><li>You’re unable to earn a living due to a permanent condition or an impairment of indefinite duration.</li></ul><p>If you have a severe disability, your physician must write a letter describing it. Keep the letter with your records in case we request a copy.</p>'
    ),
    'boolean',
    (s: Information) => s.stateResidencies[0].state == 'OR'
  ),
  q(
    'OR_6B_SPOUSE_SEVERELY_DISABLED',
    'Is your spouse severely disabled?',
    '',
    'boolean',
    (s: Information) => s.stateResidencies[0].state == 'OR'
  ),
  q(
    'OR_32_OREGON_INCOME_TAX_WITHHELD',
    'Enter amount here',
    escapeHtmlTags(
      '<p><strong><u>32.</u> Oregon income tax withheld.</strong> Enter the total <strong>Oregon</strong> tax withheld from your wages and other income. State tax withheld from wages is shown in box 17 of Form W-2 and in the State area of various 1099 forms. <strong>Don’t</strong> include FICA (Social Security) tax withheld or tax withheld from your wages by other states. <strong>You must include a legible, unaltered copy</strong> of your Form W-2 from each job and any Form 1099 showing Oregon income tax withheld with your Oregon return.</p><p>If you don’t have a Form W-2 or 1099, you must provide other proof of Oregon tax withheld. Proof may include a copy of a final paycheck stub or a letter from your employer. If you file before February 1, 2022, we can only accept a Form W-2 or 1099 as proof.</p><p>If you have tax to pay, you may want to increase the amount your employer or other payer withholds from your wages. For withholding information, go to <a href="https://www.oregon.gov/dor/personal">www.oregon.gov/dor/personal.</a></p>'
    ),
    'string',
    (s: Information) => s.stateResidencies[0].state == 'OR'
  ),
  q(
    'OR_33_AMOUNT_APPLIED_FROM_PRIOR_YEAR_REFUND',
    'Enter amount here',
    escapeHtmlTags(
      '<p><strong><u>33.</u> Amount applied from your prior year’s tax refund.</strong> Enter the amount of any prior-year refund you applied as a payment of 2021 estimated tax. If we adjusted your applied refund, be sure to use the adjusted amount. If you need to verify your applied refund amount, log into or create your Revenue Online account at <a href="https://www.oregon.gov/dor">www.oregon.gov/dor</a> or contact us.</p>'
    ),
    'string',
    (s: Information) => s.stateResidencies[0].state == 'OR'
  ),
  q(
    'OR_34_ESTIMATED_TAX_PAYMENTS',
    'Enter amount here',
    escapeHtmlTags(
      '<p><strong><u>34.</u> Estimated tax payments for 2021.</strong> Enter the total estimated tax payments you made before filing your 2021 Oregon return. For calendar-year filers, these payments were due April 15, 2021; June 15, 2021; September 15, 2021; and January 18, 2022. <strong>Include all</strong> payments you made up to the date you filed your original or amended return. <strong>Don’t include</strong> the amount reported on line 33. If you need to verify your estimated payments, log into or create your Revenue Online account at <a href="https://www.oregon.gov/dor">www.oregon.gov/dor</a> or contact us.</p>'
    ),
    'string',
    (s: Information) => s.stateResidencies[0].state == 'OR'
  ),
  q(
    'OR_36_53_KICKER_OREGON_SURPLUS_CREDIT',
    'Enter amount here',
    escapeHtmlTags(
      '<p><strong><u>36 / 53.</u> Kicker (Oregon surplus) credit.</strong> See instructions.</p>'
    ),
    'string',
    (s: Information) => s.stateResidencies[0].state == 'OR'
  ),
  q(
    'OR_53_DONATE_TO_STATE_SCHOOL_FUND',
    'If you elect to donate your kicker to the State School Fund, check this box.',
    '',
    'boolean',
    (s: Information) => s.stateResidencies[0].state == 'OR'
  ),
  q(
    'OR_37_TOTAL_REFUNDABLE_CREDITS_FROM_OR_ASC',
    'Enter amount here',
    escapeHtmlTags(
      '<p><strong><u>37.</u> Total refundable credits from Schedule OR-ASC.</strong> Enter your total refundable credits from Schedule OR-ASC, Section F. <strong>Include Schedule OR-ASC with your return.</strong></p>'
    ),
    'string',
    (s: Information) => s.stateResidencies[0].state == 'OR'
  ),
  q(
    'OR_41_PENALTY_FOR_FILING_LATE',
    'Enter amount here',
    escapeHtmlTags(
      '<p><strong><u>41.</u> Penalty and interest for filing or paying late.</strong> See instructions.</p>'
    ),
    'string',
    (s: Information) => s.stateResidencies[0].state == 'OR'
  ),
  q(
    'OR_42_INTEREST_ON_UNDERPAYMENT_OF_EST_TAX',
    'Enter amount here',
    escapeHtmlTags(
      '<p><strong><u>42.</u> Interest on underpayment of estimated tax.</strong> Underpayment interest is charged if:</p>'
    ),
    'string',
    (s: Information) => s.stateResidencies[0].state == 'OR'
  ),
  q(
    'OR_42a_EXCEPTION_NUMBER',
    'Exception number from Form OR-10, line 1',
    '',
    'combobox',
    (s: Information) => s.stateResidencies[0].state == 'OR'
  ),
  q(
    'OR_42b_ANNUALIZED',
    'Check box if you annualized',
    '',
    'boolean',
    (s: Information) => s.stateResidencies[0].state == 'OR'
  ),
  q(
    'OR_46_ESTIMATED_TAX',
    'Enter amount here',
    escapeHtmlTags(
      '<p><strong><u>46.</u> Estimated Tax.</strong> Fill in the portion of line 45 you want applied to your open estimated tax account.</p>'
    ),
    'string',
    (s: Information) => s.stateResidencies[0].state == 'OR'
  ),
  q(
    'OR_47_CHARITABLE_CHECKOFF_DONATIONS',
    'Enter amount here',
    escapeHtmlTags(
      '<p><strong><u>47.</u> Charitable checkoff.</strong> Enter the amount from line 30 of Schedule OR-DONATE. For more information, see the schedule instructions. You can download Schedule OR-DONATE and instructions from our website or you can contact us to order it.</p><p><strong>Note:</strong> If your refund—after any application to an open estimated tax account—is less than your total donation amount, your donations will be prorated.</p>'
    ),
    'string',
    (s: Information) => s.stateResidencies[0].state == 'OR'
  ),
  q(
    'OR_48_POLITICAL_PARTY_3DOLLAR_CHECKOFF',
    'Enter amount here',
    escapeHtmlTags(
      '<p><strong><u>48.</u> Political party checkoff.</strong> You may use your refund to contribute $3 to the Oregon political party of your choice. If you’re filing a joint return, you and your spouse may each contribute $3. <strong>Note:</strong> Your contribution will <strong>reduce</strong> your refund and <strong>does not</strong> qualify for the political contribution credit.</p><p>To make a contribution:</p><ol><li>Designate the political party of your choice using the party’s code from the alphabetized list below.<ul><li>If <strong>you</strong> contribute, enter <strong>one</strong> code in box 48a.</li><li>If <strong>your spouse</strong> contributes on a joint return, enter <strong>one</strong> code in box 48b.</li></ul></li></ol><p>Enter only one code per taxpayer. Spouses filing a joint return don’t have to enter the same code.</p><ol><li>Enter your total contribution amount.<ul><li>If you <strong>or</strong> your spouse contribute, enter $3.</li><li>If both you <strong>and</strong> your spouse contribute on a joint return, enter $6.</li></ul></li></ol><p><strong>Note:</strong> Your political party contribution <strong>won’t</strong> be made if:</p><ul><li>Your refund—after any application to an open estimated tax account or charitable checkoff donation— is less than your total contribution amount.</li><li>You enter an amount but don’t designate a party (or parties).</li><li>You designate a party (or parties) but don’t enter an amount.</li><li>You enter more than one party code per taxpayer.</li></ul><p><strong>Instructions for amended returns.</strong> Enter the amount, if any, from a refund on your original return that you applied as a political party contribution. If line 5 of the <strong>Amended worksheet</strong> shows a refund and you didn’t make the maximum political party contribution on your original return, you may use the refund to make a contribution on your amended return.</p>'
    ),
    'string',
    (s: Information) => s.stateResidencies[0].state == 'OR'
  ),
  q(
    'OR_48a_TAXPAYER_POLITICAL_PARTY_CODE',
    'Select Taxpayer Party',
    '',
    'combobox',
    (s: Information) => s.stateResidencies[0].state == 'OR'
  ),
  q(
    'OR_48b_SPOUSE_POLITICAL_PARTY_CODE',
    'Select Spouse Party',
    '',
    'combobox',
    (s: Information) =>
      s.stateResidencies[0].state == 'OR' &&
      (s.taxPayer.filingStatus === FilingStatus.MFJ ||
        s.taxPayer.filingStatus === FilingStatus.MFS)
  ),
  q(
    'OR_49_529_COLLEGE_SAVINGS_PLAN_DEPOSITS',
    'Enter amount here',
    escapeHtmlTags(
      '<p><strong><u>49.</u> Oregon college or MFS 529 savings plan.</strong> Enter the total from Schedule OR-529. For minimum deposit amounts and other information, see the schedule instructions. You can download Schedule OR-529 from our website or you can contact us to order it.</p><p><strong>Note:</strong> If the amount of your refund—after any application to an open estimated tax account, charitable checkoff donation, or political party contribution—is less than the total amount you want to deposit, no deposit will be made.</p><p><strong>Instructions for amended returns.</strong> Enter the amount, if any, from a refund on your original return that you applied as an Oregon college or MFS 529 savings plan deposit. If line 5 of the <strong>Amended worksheet</strong> shows a refund, add the amount you want to apply as a deposit and include an amended Schedule OR-529 with your amended return. The refund will be applied for the year in which you’re filing the amended return.</p>'
    ),
    'string',
    (s: Information) => s.stateResidencies[0].state == 'OR'
  )
]

export const getRequiredStateQuestions = (
  state: Information
): StateQuestion[] =>
  stateQuestions.filter((q) => q.required === undefined || q.required(state))
