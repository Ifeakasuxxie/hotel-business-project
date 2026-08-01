import { ApiError } from "./api-error";

export class NotImplementedError extends ApiError {
  constructor(message = "This endpoint is not implemented yet") {
    super(501, message, "NOT_IMPLEMENTED");
  }
}
