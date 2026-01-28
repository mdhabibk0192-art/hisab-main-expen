
import React from 'react';

export const INITIAL_CARRY_FORWARD = 0;
export const DAYS_TO_TRACK = 365;

export const CATEGORIES = {
  income: ['Salary', 'Bonus', 'Freelance', 'Gift', 'Other'],
  expense: ['Food', 'Water', 'Tea', 'Rice', 'Rent', 'Travel', 'Health', 'Other'],
  bill: ['Electricity', 'Internet', 'Shop', 'Credit Card', 'Other']
};

export const Icons = {
  Income: <i className="fas fa-arrow-trend-up text-green-500"></i>,
  Expense: <i className="fas fa-arrow-trend-down text-red-500"></i>,
  Bill: <i className="fas fa-file-invoice-dollar text-orange-500"></i>,
  Extra: <i className="fas fa-star text-blue-500"></i>,
  Notes: <i className="fas fa-note-sticky text-slate-400"></i>,
  Balance: <i className="fas fa-wallet text-indigo-500"></i>,
  AI: <i className="fas fa-wand-magic-sparkles"></i>,
};
