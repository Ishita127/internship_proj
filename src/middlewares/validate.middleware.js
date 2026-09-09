import { ApiError } from '../utils/apiError.js';

export const validate = (schema) => (req, res, next) => {
  const { error } = schema(req.body);
  if (error) {
    return next(new ApiError(400, error));
  }
  next();
};