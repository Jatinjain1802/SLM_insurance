// components/Modal.jsx
// LEARNING NOTE:
// This modal closes when the user clicks outside (the dark overlay).
// We pass children (any JSX content) into the modal body.
// The parent controls open/close via the `isOpen` prop and `onClose` callback.

function Modal({ isOpen, onClose, title, children, size = '' }) {
  // If not open, render nothing (return null)
  if (!isOpen) return null

  return (
    // Overlay: clicking it calls onClose
    <div className="modal-overlay" onClick={onClose}>
      {/* Stop clicks INSIDE the modal from bubbling up and closing it */}
      <div
        className={`modal ${size ? `modal-${size}` : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          <button
            className="btn-icon"
            onClick={onClose}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Body — receives any JSX passed between <Modal>...</Modal> tags */}
        {children}
      </div>
    </div>
  )
}

export default Modal
