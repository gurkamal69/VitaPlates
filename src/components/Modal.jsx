import React from 'react'; // Added React import

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="meal-planner-modal">
      <div className="meal-planner-modal-content">
        <h3>{title}</h3>
        {children}
        <button className="meal-planner-button btn" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};

export default Modal;