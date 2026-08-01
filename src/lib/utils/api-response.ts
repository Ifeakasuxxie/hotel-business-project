import { NextResponse } from "next/server";

import type { ApiResponse } from "@/lib/types";

export function jsonOk<T>(data: T, message?: string, init?: ResponseInit) {
  const body: ApiResponse<T> = message
    ? { success: true, data, message }
    : { success: true, data };
  return NextResponse.json(body, init);
}

export function jsonCreated<T>(data: T, message?: string) {
  return jsonOk(data, message, { status: 201 });
}

export function jsonNoContent() {
  return new NextResponse(null, { status: 204 });
}

export function jsonError(error: unknown, status = 500, code?: string) {
  const message = error instanceof Error ? error.message : "Something went wrong";
  const body: ApiResponse<never> = { success: false, error: message, code };
  return NextResponse.json(body, { status });
}
