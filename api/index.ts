import { Hono } from 'hono'
import { handle } from 'hono/vercel'
import { cors } from "hono/cors";


export const config = {
  runtime: 'edge'
}

const app = new Hono().basePath('/api')
app.use("*", cors()); 

app.post("/send-email", async (c) => {
  try {
    const { to, subject, htmlContent } = await c.req.json();

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key":  process.env.BREVO_API_KEY || "",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sender: { name: "Produckai", email: "produckai@mail.00004000.xyz" },
        to: [{ email: to }],
        subject,
        htmlContent,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error from Brevo:", errorData);
      return c.json({ success: false, error: errorData }, 500);
    }

    const data = await response.json();
    return c.json({ success: true, messageId: data.messageId }, 200);
  } catch (error: any) {
    console.error("Email error:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

export default handle(app)
