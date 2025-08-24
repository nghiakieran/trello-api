class ApiError extends Error {
  constructor(statusCode, message) {
    super(message)
    this.name = 'ApiError'
    this.statusCode = statusCode
    // Log Stack Trace => debug
    Error.captureStackTrace(this, this.constructor)
  }
}

export default ApiError
