import { NextResponse } from "next/server";
import { site } from "@/data/site";

interface ContactPayload {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  let body: ContactPayload;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const name = body.name?.trim() ?? "";
  const email = body.email?.trim() ?? "";
  const subject = body.subject?.trim() ?? "";
  const message = body.message?.trim() ?? "";

  const errors: Record<string, string> = {};
  if (name.length < 2) errors.name = "Please enter your name.";
  if (!EMAIL_RE.test(email)) errors.email = "Please enter a valid email address.";
  if (subject.length < 2) errors.subject = "Please enter a subject.";
  if (message.length < 10) errors.message = "Message should be at least 10 characters.";

  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ errors }, { status: 422 });
  }

  const resendApiKey = process.env.RESEND_API_KEY;
  const contactRecipient = process.env.CONTACT_EMAIL || site.email;

  if (resendApiKey) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: process.env.CONTACT_FROM_EMAIL || "portfolio@resend.dev",
          to: contactRecipient,
          reply_to: email,
          subject: `[Portfolio] ${subject}`,
          text: `From: ${name} <${email}>\n\n${message}`,
        }),
      });

      if (!res.ok) {
        console.error("Resend API error:", await res.text());
        return NextResponse.json(
          { error: "Message could not be sent right now. Please try again later." },
          { status: 502 }
        );
      }
    } catch (err) {
      console.error("Contact form send failed:", err);
      return NextResponse.json(
        { error: "Message could not be sent right now. Please try again later." },
        { status: 502 }
      );
    }
  } else {
    // No email provider configured — log server-side so the submission isn't silently lost.
    console.info("[contact] RESEND_API_KEY not set; message logged only:", {
      name,
      email,
      subject,
      message,
    });
  }

  return NextResponse.json({ ok: true });
}
