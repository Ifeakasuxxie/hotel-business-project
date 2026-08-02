import { withErrorHandler, withValidation } from "@/lib/middleware";
import { profileService } from "@/lib/services";
import { jsonOk } from "@/lib/utils";
import { updateProfileSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

export const GET = withErrorHandler(async () => {
  const result = await profileService.getProfile();
  return jsonOk(result);
});

export const PUT = withErrorHandler(
  withValidation(updateProfileSchema)(async (_request, data) => {
    const result = await profileService.updateProfile(data);
    return jsonOk(result, "Profile updated");
  }),
);
