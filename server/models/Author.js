const Author = ({ id, handle }) =>
  Object.freeze({
    id,
    handle,
  });

const getAuthors =
  (authorRepo) =>
  async (filterCriteria = undefined) => {
    const filter = { ...filterCriteria };

    const authors = await authorRepo.getByFilter(filter);
    return {
      authors: authors.map((row) => {
        return Author({ ...row });
      }),
    };
  };

module.exports = {
  getAuthors,
};
