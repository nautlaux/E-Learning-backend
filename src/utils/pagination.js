const paginate = async (
  model,
  { filter = {}, projection = null, sort = { createdAt: -1 }, page = 1, limit = 10, populate = [] }
) => {
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
  const skip = (pageNum - 1) * limitNum;

  let query = model.find(filter, projection).sort(sort).skip(skip).limit(limitNum);
  if (populate && populate.length) {
    populate.forEach((p) => {
      query = query.populate(p);
    });
  }

  const [data, total] = await Promise.all([query.exec(), model.countDocuments(filter)]);
  const totalPages = Math.max(1, Math.ceil(total / limitNum));

  return {
    data,
    meta: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages,
    },
  };
};

module.exports = paginate;

