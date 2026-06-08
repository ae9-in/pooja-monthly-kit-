import { NextResponse } from "next/server";

/**
 * POST /api/admin/login
 *
 * Verifies admin credentials server-side so they never appear in the
 * client-side JavaScript bundle. Credentials are read from environment
 * variables (or fall back to defaults for local dev).
 */
export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password are required." },
        { status: 400 }
      );
    }

    const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "admin@gmail.com";
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "admin123";

    const normalizedEmail = email.trim().toLowerCase();
    
    // Accept standard default email, the seeded database admin email, and the common typo email from the screenshots
    const allowedEmails = [
      ADMIN_EMAIL.toLowerCase(),
      "admin@gmil.com",
      "admin@sacredsamskara.com"
    ];

    const isValid = allowedEmails.includes(normalizedEmail) && password === ADMIN_PASSWORD;

    console.log(`[Admin Login] Attempt for: "${normalizedEmail}". Matches allowed: ${isValid}`);

    if (isValid) {
      return NextResponse.json({ success: true });
    }

    // Use a generic message to avoid leaking which field was wrong
    return NextResponse.json(
      { success: false, message: "Invalid credentials. Please try again." },
      { status: 401 }
    );
  } catch {
    return NextResponse.json(
      { success: false, message: "Server error. Please try again." },
      { status: 500 }
    );
  }
}
