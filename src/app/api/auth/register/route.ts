import { withErrorHandler, withValidation } from "@/lib/middleware";
import { authService } from "@/lib/services";
import { jsonOk } from "@/lib/utils";
import { registerUserSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

export const POST = withErrorHandler(
  withValidation(registerUserSchema)(async (_request, data) => {
    const result = await authService.register(data);
    return jsonOk(result, "Account created", { status: 201 });
  }),
);
