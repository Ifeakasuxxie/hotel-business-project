import { withErrorHandler } from "@/lib/middleware";
import { userService } from "@/lib/services";
import { jsonOk } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const GET = withErrorHandler(
  async (_request: Request, context: { params: Promise<{ id: string }> }) => {
    const { id } = await context.params;
    const result = await userService.getById(id);
    return jsonOk(result);
  },
);

export const PATCH = withErrorHandler(
  async (_request: Request, context: { params: Promise<{ id: string }> }) => {
    const { id } = await context.params;
    const result = await userService.update(id, {});
    return jsonOk(result);
  },
);

export const DELETE = withErrorHandler(
  async (_request: Request, context: { params: Promise<{ id: string }> }) => {
    const { id } = await context.params;
    await userService.deactivate(id);
    return jsonOk({ id }, "User deactivated");
  },
);
