import { requireAdmin, requireSelfOrAdmin } from "@/lib/auth";
import { withErrorHandler, withValidation } from "@/lib/middleware";
import { userService } from "@/lib/services";
import { jsonOk } from "@/lib/utils";
import { updateUserSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

export const GET = withErrorHandler(
  async (_request: Request, context: { params: Promise<{ id: string }> }) => {
    const { id } = await context.params;
    await requireSelfOrAdmin(id);
    const result = await userService.getById(id);
    return jsonOk(result);
  },
);

export const PATCH = withErrorHandler(
  withValidation(updateUserSchema)(
    async (
      _request: Request,
      data,
      context: { params: Promise<{ id: string }> },
    ) => {
      const { id } = await context.params;
      await requireSelfOrAdmin(id);
      const result = await userService.update(id, data);
      return jsonOk(result, "User updated");
    },
  ),
);

export const DELETE = withErrorHandler(
  async (_request: Request, context: { params: Promise<{ id: string }> }) => {
    const { id } = await context.params;
    await requireAdmin();
    await userService.deactivate(id);
    return jsonOk({ id }, "User deactivated");
  },
);
