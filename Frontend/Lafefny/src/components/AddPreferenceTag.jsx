/* eslint-disable no-unused-vars */
import React from 'react';
import AddForm from './AddForm';
import { createPreferenceTag } from '../services/PreferenceTagService';

const AddPreferenceTag = () => {
  const fields = [
    { label: 'Tag Name', name: 'name', type: 'text', required: true },
    { label: 'Description', name: 'description', type: 'text', required: true },
  ];

  const handleTagSubmit = async (formData) => {
    try {
      await createPreferenceTag(formData);
      alert('Tag added successfully');
    } catch (error) {
      console.error('Error adding tag:', error);
      alert('Error adding tag');
    }
  };

  return <AddForm title="Add New Preference Tag" fields={fields} submitHandler={handleTagSubmit} />;
};

export default AddPreferenceTag;
