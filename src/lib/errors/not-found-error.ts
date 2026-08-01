import { ApiError } from "./api-error";

export class NotFoundError extends ApiError {
  constructor(message = "Resource not found", code = "NOT_FOUND") {
    super(404, message, code);
  }
}
