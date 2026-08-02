import { requireAdmin } from "@/lib/auth/roles";
import { withErrorHandler, withValidation } from "@/lib/middleware";
import { userService } from "@/lib/services";
import { jsonCreated, jsonOk } from "@/lib/utils";
import { createUserSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

export const GET = withErrorHandler(async () => {
  await requireAdmin();
  const result = await userService.list({});
  return jsonOk(result);
});

export const POST = withErrorHandler(
  withValidation(createUserSchema)(async (_request, data) => {
    await requireAdmin();
    const result = await userService.create(data);
    return jsonCreated(result, "User created");
  }),
);
