import api from './axios';

/**
 * Create a new list.
 * @param {{ title: string, description: string }} payload
 */
export const createList = (payload) =>
  api.post('/list/create', payload);

/**
 * Fetch all lists belonging to the authenticated user.
 */
export const getAllLists = () =>
  api.get('/list/get-all/');

/**
 * Fetch a single list with its populated problem documents.
 * @param {string} listId
 */
export const getList = (listId) =>
  api.get(`/list/get-list/${listId}`);

/**
 * Add a single problem to a list.
 * @param {string} listId
 * @param {string} problemId
 */
export const addProblemToList = (listId, problemId) =>
  api.patch(`/list/add-single/${listId}/${problemId}`);

/**
 * Remove a single problem from a list.
 * @param {string} listId
 * @param {string} problemId
 */
export const removeProblemFromList = (listId, problemId) =>
  api.patch(`/list/remove-single/${listId}/${problemId}`);

/**
 * Delete an entire list.
 * @param {string} listId
 */
export const deleteList = (listId) =>
  api.delete(`/list/delete/${listId}`);

/**
 * Update a list's title and/or description.
 * @param {string} listId
 * @param {{ title?: string, description?: string }} payload
 */
export const updateList = (listId, payload) =>
  api.patch(`/list/update/${listId}`, payload);
