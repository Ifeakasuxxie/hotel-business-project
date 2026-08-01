import { withErrorHandler, withValidation } from "@/lib/middleware";
import { userService } from "@/lib/services";
import { jsonCreated, jsonOk } from "@/lib/utils";
import { registerUserSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

export const GET = withErrorHandler(async () => {
  const result = await userService.list({});
  return jsonOk(result);
});

export const POST = withErrorHandler(
  withValidation(registerUserSchema)(async (_request, data) => {
    const result = await userService.create(data);
    return jsonCreated(result, "User created");
  }),
);
