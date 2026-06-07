import ApiError from '../utils/ApiError.js';

export const validate = (schema) => (req, res, next) => {
  try {
    const parsed = schema.parse({
      body: req.body,
      query: req.query,
      params: req.params
    });

    // Replace request properties with validated/coerced schema structures
    if (parsed.body !== undefined) req.body = parsed.body;
    if (parsed.query !== undefined) req.query = parsed.query;
    if (parsed.params !== undefined) req.params = parsed.params;

    next();
  } catch (error) {
    const errors = error.errors.map((err) => ({
      field: err.path.join('.').replace(/^(body|query|params)\./, ''),
      message: err.message
    }));

    next(new ApiError(400, 'Validation failed', errors));
  }
};
