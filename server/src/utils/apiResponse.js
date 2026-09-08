export class ApiResponse {
  static success(res, data = null, message = 'Success', statusCode = 200, meta = null) {
    const payload = {
      success: true,
      message,
      data,
    }
    if (meta) {
      payload.meta = meta
    }
    return res.status(statusCode).json(payload)
  }

  static error(res, message = 'Internal Server Error', statusCode = 500, errors = null) {
    const payload = {
      success: false,
      message,
    }
    if (errors) {
      payload.errors = errors
    }
    return res.status(statusCode).json(payload)
  }
}
