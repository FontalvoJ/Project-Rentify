import Client from "../models/Client.js";

export const findClientByUserId = (userId) => Client.findOne({ userId });

export const updateClient = async (client, updates) => {
  if (updates.identification) client.identification = updates.identification;
  if (updates.address) client.address = updates.address;
  if (updates.contact) client.contact = updates.contact;
  return await client.save();
};

export const deleteClientByUserId = (userId) => Client.deleteOne({ userId });
