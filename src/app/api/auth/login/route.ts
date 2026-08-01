import { withErrorHandler, withValidation } from "@/lib/middleware";
import { authService } from "@/lib/services";
import { jsonOk } from "@/lib/utils";
import { loginSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

export const POST = withErrorHandler(
  withValidation(loginSchema)(async (_request, data) => {
    const result = await authService.login(data);
    return jsonOk(result, "Signed in");
  }),
);
