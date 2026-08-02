import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { type z, type ZodTypeAny } from "zod";

import { ValidationError } from "@/lib/errors";

type BodyHandler<D, A extends unknown[]> = (
  request: NextRequest,
  data: D,
  ...rest: A
) => NextResponse | Promise<NextResponse>;

export function withValidation<S extends ZodTypeAny>(schema: S) {
  return <D extends z.infer<S>, A extends unknown[] = []>(
    handler: BodyHandler<D, A>,
  ): ((request: NextRequest, ...rest: A) => Promise<NextResponse>) => {
    return async (request, ...rest) => {
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

      return handler(request, result.data as D, ...rest);
    };
  };
}
