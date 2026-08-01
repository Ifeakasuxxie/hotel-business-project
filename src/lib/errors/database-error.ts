import { ApiError } from "./api-error";

export class DatabaseError extends ApiError {
  constructor(message = "Database operation failed", details?: unknown) {
    super(500, message, "DATABASE_ERROR", details);
  }
}
