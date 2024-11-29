import React, { useState } from 'react';

const CreatePromoCode = () => {
  const [formData, setFormData] = useState({
    code: '',
    discountPercentage: '',
    validFrom: '',
    validUntil: '',
    maxUses: '',
  });
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8000/admin/promo-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (response.ok) {
        setMessage('Promo code created successfully!');
        setFormData({
          code: '',
          discountPercentage: '',
          validFrom: '',
          validUntil: '',
          maxUses: '',
        });
      } else {
        setMessage(data.message || 'Failed to create promo code.');
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.');
    }
  };

  return (
    <div>
      <h1>Create Promo Code</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Code:</label>
          <input
            type="text"
            name="code"
            value={formData.code}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Discount Percentage:</label>
          <input
            type="number"
            name="discountPercentage"
            value={formData.discountPercentage}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Valid From:</label>
          <input
            type="date"
            name="validFrom"
            value={formData.validFrom}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Valid Until:</label>
          <input
            type="date"
            name="validUntil"
            value={formData.validUntil}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Max Uses:</label>
          <input
            type="number"
            name="maxUses"
            value={formData.maxUses}
            onChange={handleChange}
          />
        </div>
        <button type="submit">Create Promo Code</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default CreatePromoCode;
