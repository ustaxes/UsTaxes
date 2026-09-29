import { render } from '@testing-library/react'
import { labelWithSource } from 'ustaxes/components/input/SourceBadge'

describe('SourceBadge', () => {
  it('renders a source badge when a source is provided', () => {
    const { getByText, getByTitle } = render(
      <span>{labelWithSource('First name', 'transcript')}</span>
    )

    expect(getByText('First name')).toBeInTheDocument()
    expect(getByTitle('transcript')).toBeInTheDocument()
    expect(getByText('T')).toBeInTheDocument()
  })

  it('renders plain label when no source is provided', () => {
    const { getByText, queryByTitle } = render(
      <span>{labelWithSource('First name', undefined)}</span>
    )

    expect(getByText('First name')).toBeInTheDocument()
    expect(queryByTitle('transcript')).toBeNull()
  })
})
