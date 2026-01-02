import { AuditLogEntry } from 'ustaxes/core/returnPacket/types'

export type SaveStatus = 'idle' | 'saving' | 'saved'

export type { AuditLogEntry }

export type UiState = {
  saveStatus: SaveStatus
}
