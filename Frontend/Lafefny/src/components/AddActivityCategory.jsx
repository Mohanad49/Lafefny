/* eslint-disable no-unused-vars */
import React from 'react';
import AddForm from './AddForm';
import { createActivityCategory } from '../services/activityCategoryService';

const AddActivityCategory = () => {
  const fields = [
    { label: 'Category Name', name: 'name', type: 'text', required: true },
    { label: 'Description', name: 'description', type: 'text', required: true },
  ];

  const handleCategorySubmit = async (formData) => {
    try {
      await createActivityCategory(formData);
      alert('Category added successfully');
    } catch (error) {
      console.error('Error adding category:', error);
      alert('Error adding category');
    }
  };

  return <AddForm title="Add New Activity Category" fields={fields} submitHandler={handleCategorySubmit} />;
};

export default AddActivityCategory;
