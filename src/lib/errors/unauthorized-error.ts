import { ApiError } from "./api-error";

export class UnauthorizedError extends ApiError {
  constructor(message = "Authentication required", code = "UNAUTHORIZED") {
    super(401, message, code);
  }
}
