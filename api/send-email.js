import nodemailer from "nodemailer";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { name, email, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ error: "Missing fields" });
    }

    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.MY_GMAIL,
                pass: process.env.MY_GMAIL_APP_PASSWORD
            }
        });

        await transporter.sendMail({
            from: `"${name}" <${email}>`,
            to: process.env.MY_GMAIL,
            subject: "Pesan Baru dari Form Contact di protofolio devaadzany.vercel.app/",
            html: `
                <h3>Nama: ${name}</h3>
                <h4>Email: ${email}</h4>
                <p>${message}</p>
            `
        });

        return res.status(200).json({ success: true });

    } catch (err) {
        console.error("EMAIL ERROR:", err);
        return res.status(500).json({ error: "Email failed" });
    }
}
