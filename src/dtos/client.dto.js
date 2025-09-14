export const toClientUpdateDto = (body) => {
  const { identification, address, contact, phone, } = body;

  return {
    ...(identification && { identification }),
    ...(address && { address }),
    ...(contact && { contact }),
    ...(phone && { phone }),
  };
};
