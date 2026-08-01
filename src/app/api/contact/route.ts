import { NotImplementedError } from "@/lib/errors";
import { withErrorHandler, withValidation } from "@/lib/middleware";
import { contactMessageSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

export const POST = withErrorHandler(
  withValidation(contactMessageSchema)(async (_request, _data) => {
    // TODO(Phase 4): persist contact message / send email via Resend.
    throw new NotImplementedError("Contact form handling is implemented in Phase 4");
  }),
);
