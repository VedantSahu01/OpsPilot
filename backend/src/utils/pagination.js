export const getPaginationData = (totalRecords, page, limit) => {
  const totalPages = Math.ceil(totalRecords / limit);
  return {
    page,
    limit,
    totalRecords,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1
  };
};
