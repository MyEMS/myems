import React from 'react';
import orderBy from 'lodash/orderBy';
import { toast } from 'react-toastify';

export const arrayReducer = (state, action) => {
  const { type, id, payload, sortBy, order, isAddToStart, isUpdatedStart } = action;
  switch (type) {
    case 'ADD':
      if (!payload) {
        console.error('payload is required!');
        return state;
      }
      if (state.find(item => item.id === payload.id)) {
        toast(<span className="text-warning">Item already exists in the list!</span>);
        return state;
      }
      if (isAddToStart) {
        return [payload, ...state];
      }
      return [...state, payload];
    case 'REMOVE':
      if (id !== 0 && !id) {
        console.error('id is required!');
        return state;
      }
      return state.filter(item => item.id !== id);
    case 'EDIT':
      if (id !== 0 && !id) {
        console.error('id is required!');
        return state;
      }
      if (isUpdatedStart) {
        const filteredState = state.filter(item => item.id !== id);
        return [payload, ...filteredState];
      }
      return state.map(item => (item.id === id ? payload : item));
    case 'SORT':
      if (!sortBy || !order) {
        console.error('sortBy and order, both are required!');
        return state;
      }
      return orderBy(state, sortBy, order);
    default:
      return state;
  }
};
