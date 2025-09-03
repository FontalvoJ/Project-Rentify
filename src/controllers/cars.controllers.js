import Car from "../models/Cars";

export const createCar = async (req, res) => {};
export const updateCar = async (req, res) => {};
export const deleteCar = async (req, res) => {};
export const getCarsByAdmin = async (req, res) => {};
export const getAllCarsForEveryone = async (req, res) => {};
export const getCarsForAuthenticatedUsers = async (req, res) => {};

export default {
  createCar,
  updateCar,
  deleteCar,
  getCarsByAdmin,
  getAllCarsForEveryone,
  getCarsForAuthenticatedUsers,
};
