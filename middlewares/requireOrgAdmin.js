const requireOrgAdmin = (req, res, next) => {
  const role = req.user?.role;
  if (role !== 'ORG_ADMIN' && role !== 'SUPER_ADMIN') {
    return res.status(403).json({ message: 'Forbidden' });
  }
  return next();
};

module.exports = requireOrgAdmin;

