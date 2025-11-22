export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { name, email, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ error: "Missing fields" });
    }

    const nodemailer = require("nodemailer");

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.MY_GMAIL,
            pass: process.env.MY_GMAIL_APP_PASSWORD
        }
    });

    try {
        await transporter.sendMail({
            from: process.env.MY_GMAIL,
            to: process.env.MY_GMAIL,
            subject: `Pesan Baru dari ${name}`,
            html: `
                <h3>Nama: ${name}</h3>
                <h4>Email: ${email}</h4>
                <p>${message}</p>
            `
        });

        res.status(200).json({ success: true, message: "Email terkirim!" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Gagal mengirim email" });
    }
}
