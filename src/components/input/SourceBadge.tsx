import { ReactElement } from 'react'
import { DataSource } from 'ustaxes/core/data'

const sourceConfig: Record<DataSource, { label: string; color: string }> = {
  transcript: { label: 'T', color: '#2f6fed' },
  return: { label: 'R', color: '#2f9a50' },
  user: { label: 'U', color: '#6b7280' }
}

export const SourceBadge = ({
  source
}: {
  source: DataSource
}): ReactElement => {
  const config = sourceConfig[source]
  return (
    <span
      title={source}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 6,
        width: 16,
        height: 16,
        borderRadius: '50%',
        fontSize: 10,
        fontWeight: 700,
        color: '#fff',
        backgroundColor: config.color,
        lineHeight: 1
      }}
    >
      {config.label}
    </span>
  )
}

export const labelWithSource = (
  label: string | ReactElement,
  source: DataSource | undefined
): ReactElement | string =>
  source === undefined ? (
    label
  ) : (
    <span style={{ display: 'inline-flex', alignItems: 'center' }}>
      {label}
      <SourceBadge source={source} />
    </span>
  )
