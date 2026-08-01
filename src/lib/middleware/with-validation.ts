import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { type z, type ZodTypeAny } from "zod";

import { ValidationError } from "@/lib/errors";

type BodyHandler<D> = (
  request: NextRequest,
  data: D,
) => NextResponse | Promise<NextResponse>;

export function withValidation<S extends ZodTypeAny>(schema: S) {
  return <D extends z.infer<S>>(
    handler: BodyHandler<D>,
  ): ((request: NextRequest) => Promise<NextResponse>) => {
    return async (request) => {
      let raw: unknown;
      try {
        raw = await request.json();
      } catch {
        throw new ValidationError("Request body must be valid JSON");
      }

      const result = schema.safeParse(raw);
      if (!result.success) {
        throw new ValidationError("Validation failed", result.error.flatten());
      }

      return handler(request, result.data as D);
    };
  };
}
