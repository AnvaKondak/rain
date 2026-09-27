import { useEffect, useId, useRef, type ReactNode } from 'react'
import './ConfirmDialog.css'

interface ConfirmDialogProps {
  open: boolean
  title: string
  children?: ReactNode
  /** Buttons, rendered in order. */
  actions: ReactNode
  onClose: () => void
}

/** A gentle modal built on <dialog>, so focus and Escape work natively. */
export default function ConfirmDialog({ open, title, children, actions, onClose }: ConfirmDialogProps) {
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      className="confirm-dialog"
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(e) => {
        // Tapping the backdrop closes the dialog.
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="confirm-dialog-body">
        <h2 id={titleId}>{title}</h2>
        {children}
        <div className="confirm-dialog-actions">{actions}</div>
      </div>
    </dialog>
  )
}
