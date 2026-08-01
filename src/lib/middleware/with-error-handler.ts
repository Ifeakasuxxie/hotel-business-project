import { NextResponse } from "next/server";

import { isApiError } from "@/lib/errors";
import type { ApiResponse } from "@/lib/types";

export function withErrorHandler<
  A extends unknown[],
>(handler: (...args: A) => NextResponse | Promise<NextResponse>) {
  return async (...args: A): Promise<NextResponse> => {
    try {
      return await handler(...args);
    } catch (error) {
      const status = isApiError(error) ? error.statusCode : 500;
      const body: ApiResponse<never> = {
        success: false,
        error:
          error instanceof Error ? error.message : "Internal server error",
        code: isApiError(error) ? error.code : "INTERNAL_ERROR",
      };
      return NextResponse.json(body, { status });
    }
  };
}
