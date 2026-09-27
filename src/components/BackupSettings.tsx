import { useRef, useState } from 'react'
import { type Backup, BackupError, exportBackup, readBackup, restoreBackup } from '../db/backup.ts'
import { formatLongDay } from '../lib/dates.ts'
import ConfirmDialog from './ConfirmDialog.tsx'
import './BackupSettings.css'

const count = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`

export default function BackupSettings() {
  const fileInput = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [pending, setPending] = useState<Backup | null>(null)

  const onExport = async () => {
    setBusy(true)
    setMessage('')
    try {
      const result = await exportBackup()
      if (result === 'saved') setMessage('Backup ready. Keep it somewhere safe.')
    } catch (err) {
      console.error('Export failed', err)
      setMessage('The backup couldn’t be made. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  const onFileChosen = async (file: File | undefined) => {
    if (!file) return
    setMessage('')
    try {
      setPending(await readBackup(file))
    } catch (err) {
      setMessage(err instanceof BackupError ? err.message : 'This file couldn’t be read.')
    } finally {
      // Let the same file be chosen again later.
      if (fileInput.current) fileInput.current.value = ''
    }
  }

  const onRestore = async () => {
    if (!pending) return
    setBusy(true)
    try {
      await restoreBackup(pending)
      setMessage(`Restored ${count(pending.sessions.length, 'session')}.`)
    } catch (err) {
      console.error('Restore failed', err)
      setMessage('The backup couldn’t be restored. Nothing was changed.')
    } finally {
      setPending(null)
      setBusy(false)
    }
  }

  return (
    <section className="backup" aria-labelledby="backup-heading">
      <h2 id="backup-heading">Backup</h2>
      <p className="backup-intro">
        Save a copy of your practice to a file, to keep it safe or move it to a new phone.
      </p>

      <div className="backup-actions">
        <button type="button" className="btn btn-outline" onClick={onExport} disabled={busy}>
          Export backup
        </button>
        <button
          type="button"
          className="btn btn-quiet"
          onClick={() => fileInput.current?.click()}
          disabled={busy}
        >
          Import backup
        </button>
        <input
          ref={fileInput}
          type="file"
          accept="application/json,.json"
          hidden
          onChange={(e) => onFileChosen(e.target.files?.[0])}
        />
      </div>

      {message && (
        <p className="backup-message" role="status">
          {message}
        </p>
      )}

      <ConfirmDialog
        open={pending !== null}
        title="Restore this backup?"
        onClose={() => setPending(null)}
        actions={
          <>
            <button type="button" className="btn btn-primary" onClick={onRestore} disabled={busy}>
              Restore
            </button>
            <button type="button" className="btn btn-quiet" onClick={() => setPending(null)}>
              Cancel
            </button>
          </>
        }
      >
        {pending && (
          <p className="dialog-text">
            It has {count(pending.sessions.length, 'session')}
            {pending.exportedAt ? `, saved ${formatLongDay(pending.exportedAt)}` : ''}. Restoring replaces
            everything on this device now.
          </p>
        )}
      </ConfirmDialog>
    </section>
  )
}
