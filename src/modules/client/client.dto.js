export const toClientUpdateDto = (body) => {
  const { identification, address, contact } = body;

  return {
    ...(identification && { identification }),
    ...(address && { address }),
    ...(contact && { contact }),
  };
};
