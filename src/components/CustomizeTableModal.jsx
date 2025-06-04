import React, { useState } from 'react'; // Added React import
import Modal from './Modal';

const CustomizeTableModal = ({ isOpen, onClose, onSubmit }) => {
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(7);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Customize Table">
      <div className="meal-planner-form-group">
        <label>Number of Meals</label>
        <input
          type="number"
          min="1"
          value={rows}
          onChange={(e) => setRows(parseInt(e.target.value))}
        />
      </div>
      <div className="meal-planner-form-group">
        <label>Number of Days</label>
        <input
          type="number"
          min="1"
          value={cols}
          onChange={(e) => setCols(parseInt(e.target.value))}
        />
      </div>
      <button
        className="meal-planner-button btn"
        onClick={() => {
          onSubmit(rows, cols);
          onClose();
        }}
      >
        Submit
      </button>
    </Modal>
  );
};

export default CustomizeTableModal;