import { signIn } from "@/lib/auth";
import { withErrorHandler, withValidation } from "@/lib/middleware";
import { authService } from "@/lib/services";
import { jsonOk } from "@/lib/utils";
import { loginSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

export const POST = withErrorHandler(
  withValidation(loginSchema)(async (_request, data) => {
    const user = await authService.login(data);
    await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });
    return jsonOk(user, "Signed in");
  }),
);
