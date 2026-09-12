import ac from '../roles/accessControl.js';

export const requirePermission = (action, resource) => {
    return (req, res, next) => {
        try {
            const role = req.user?.role;

            if (!role) {
                return res.status(401).json({
                    message: 'Unauthorized access'
                });
            }

            const permission = ac.can(role)[action](resource);

            if (!permission.granted) {
                return res.status(403).json({
                    message: 'Forbidden: Insufficient privileges'
                });
            }

            next();
        } catch (error) {
            next(error);
        }
    };
};

export const customerOnly = (req, res, next) => {
    if (req.user?.role !== 'customer') {
        return res.status(403).json({
            message: 'Customer access only'
        });
    }

    next();
};