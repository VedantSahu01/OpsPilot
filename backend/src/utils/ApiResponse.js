class ApiResponse {
  constructor(statusCode, data, message = null) {
    this.statusCode = statusCode;
    this.success = true;
    if (message) {
      this.message = message;
    }
    this.data = data;
  }

  static send(res, statusCode, data, message = null) {
    const payload = { success: true };
    if (message !== null) {
      payload.message = message;
    }
    if (data !== undefined) {
      payload.data = data;
    }
    return res.status(statusCode).json(payload);
  }

  static sendPaginated(res, statusCode, data, pagination) {
    return res.status(statusCode).json({
      success: true,
      pagination,
      data
    });
  }
}

export default ApiResponse;
