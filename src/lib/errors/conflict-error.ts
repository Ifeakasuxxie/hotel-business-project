import { ApiError } from "./api-error";

export class ConflictError extends ApiError {
  constructor(message = "Resource already exists", code = "CONFLICT") {
    super(409, message, code);
  }
}
