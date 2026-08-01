import { ApiError } from "./api-error";

export class ForbiddenError extends ApiError {
  constructor(message = "Insufficient permissions", code = "FORBIDDEN") {
    super(403, message, code);
  }
}
