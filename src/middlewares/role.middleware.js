export function authorizeRoles(...allowedRoles) {
  const normalizedAllowedRoles = allowedRoles.map((role) => role.toUpperCase());

  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({ message: "No autenticado" });
    }

    const userRole = String(req.user.role).toUpperCase();

    if (!normalizedAllowedRoles.includes(userRole)) {
      return res.status(403).json({ message: "No tienes permisos para este recurso" });
    }

    return next();
  };
}
