const nodemailer = require('nodemailer');
require('dotenv').config();
const express = require('express');
const crypto = require('crypto');


const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD
  }
});

const sendInappropriateContentEmail = async (recipientEmail, contentType, contentName) => {
  // Verify credentials exist
  if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
    throw new Error('Email credentials not configured');
  }

  try {
    const info = await transporter.sendMail({
      from: `Lafefny <${process.env.EMAIL_USER}>`,
      to: recipientEmail,
      subject: 'Content Flagged as Inappropriate',
      html: `
        <h2>Content Flagged Notice</h2>
        <p>Your ${contentType} "${contentName}" has been flagged as inappropriate by an administrator.</p>
        <p>Please review our content guidelines and make necessary adjustments.</p>
        <p>If you believe this was done in error, please contact support.</p>
      `
    });
    
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error; // Propagate error for handling in controller
  }
};

const sendOutOfStockEmail = async (recipientEmail, productName) => {
  try {
    await transporter.sendMail({
      from: `Lafefny <${process.env.EMAIL_USER}>`,
      to: recipientEmail,
      subject: 'Product Out of Stock Alert',
      html: `
        <h1>Product Out of Stock Alert</h1>
        <p>Your product "${productName}" is now out of stock.</p>
        <p>Please update the inventory as soon as possible.</p>
      `
    });
  } catch (error) {
    console.error('Error sending out of stock email:', error);
    throw error;
  }
};

// Add new function for event reminders
const sendEventReminderEmail = async (recipientEmail, eventType, eventName, date) => {
  try {
    const formattedDate = new Date(date).toLocaleString();
    await transporter.sendMail({
      from: `Lafefny <${process.env.EMAIL_USER}>`,
      to: recipientEmail,
      subject: 'Upcoming Event Reminder',
      html: `
        <h1>Event Reminder</h1>
        <p>This is a reminder about your upcoming ${eventType.toLowerCase()}:</p>
        <h2>${eventName}</h2>
        <p>Date: ${formattedDate}</p>
        <p>Don't forget to prepare for your ${eventType.toLowerCase()}!</p>
      `
    });
  } catch (error) {
    console.error('Error sending reminder email:', error);
    throw error;
  }
};

// Verify transport at startup
transporter.verify(function(error, success) {
  if (error) {
    console.error('Email transport verification failed:', error);
  } else {
    console.log('Email server is ready to send messages');
  }
});

const sendReceiptEmail = async (to, subject, text) => {
  const mailOptions = {
    from: `Lafefny <${process.env.EMAIL_USER}>`,
    to: to,
    subject: subject,
    text: text,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Receipt email sent successfully');
  } catch (error) {
    console.error('Error sending receipt email:', error);
  }
};

module.exports = { 
  sendInappropriateContentEmail,
  sendOutOfStockEmail,
  sendEventReminderEmail,
  sendReceiptEmail
};