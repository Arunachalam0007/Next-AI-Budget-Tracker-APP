import { Resend } from "resend";

export async function sendEmail({ to, subject, react }) {
  console.log("API Key :", process.env.RESEND_API_KEY);

  console.log("API Key exists:", !!process.env.RESEND_API_KEY);
  const resend = new Resend(process.env.RESEND_API_KEY || "");

  console.log("DEBUG: sendEmail: To Email Address: ", to);
  console.log("DEBUG: sendEmail: subject: ", subject);
  console.log("DEBUG: sendEmail: subject: ", react);

  try {
    const { data, error } = await resend.emails.send({
      from: "AI Budget Tracking App <onboarding@resend.dev>",
      to: to,
      subject: subject,
      react: react,
    });
    return { success: true, data };
  } catch (error) {
    console.log("Failed to send email: ", error);
    return { success: false, error };
  }
}
