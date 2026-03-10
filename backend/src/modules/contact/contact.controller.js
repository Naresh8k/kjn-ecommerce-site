const prisma = require('../../config/db');
const { sendEmail } = require('../../config/mailer');

const BRAND_COLOR = '#1B5E20';
const LOGO_URL = 'https://image.cdn.shpy.in/386933/KJNLogo-1767688579320.jpeg';
const WA_NUMBER = '919440658294';
const SITE_URL = process.env.FRONTEND_URL || 'https://www.shopatkjn.com';

function buildReplyEmail(contactMsg, replyText) {
  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:32px 0;">
    <tr><td align="center">
      <table width="100%" style="max-width:580px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:${BRAND_COLOR};padding:24px 32px;text-align:center;">
            <img src="${LOGO_URL}" alt="KJN Shop" style="height:48px;display:block;margin:0 auto 10px;" />
            <p style="margin:0;color:#ffffff;font-size:13px;opacity:0.85;">KJN Shop - Quality Agricultural Products</p>
          </td>
        </tr>
        <tr>
          <td style="padding:28px 32px;">
            <h2 style="margin:0 0 6px;font-size:20px;color:#111827;">Hi ${contactMsg.name},</h2>
            <p style="margin:0 0 20px;font-size:14px;color:#6B7280;">Thank you for contacting us. Here is our response to your enquiry:</p>

            <div style="background:#F0FDF4;border-left:4px solid ${BRAND_COLOR};border-radius:8px;padding:16px 20px;margin-bottom:20px;">
              <p style="margin:0;font-size:13px;font-weight:700;color:#6B7280;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;">Your Message</p>
              <p style="margin:0;font-size:14px;color:#374151;line-height:1.7;">${contactMsg.message.replace(/\n/g, '<br/>')}</p>
            </div>

            <div style="background:#E8F5E9;border-radius:10px;padding:20px;margin-bottom:24px;">
              <p style="margin:0 0 10px;font-size:13px;font-weight:700;color:#1B5E20;text-transform:uppercase;letter-spacing:0.5px;">Our Reply</p>
              <p style="margin:0;font-size:15px;color:#1F2937;line-height:1.8;">${replyText.replace(/\n/g, '<br/>')}</p>
            </div>

            <p style="font-size:13px;color:#6B7280;margin-bottom:20px;">If you have any more questions, feel free to reach out to us directly:</p>

            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding-right:12px;">
                  <a href="https://wa.me/${WA_NUMBER}" style="display:inline-block;background:#25D366;color:#ffffff;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:700;font-size:13px;">WhatsApp Us</a>
                </td>
                <td>
                  <a href="tel:9804599804" style="display:inline-block;background:#f3f4f6;color:#374151;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:700;font-size:13px;border:1px solid #e5e7eb;">Call: 9804599804</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="background:#f9fafb;padding:18px 32px;text-align:center;border-top:1px solid #e5e7eb;">
            <p style="margin:0;font-size:11px;color:#9CA3AF;">KJN Trading Company - Mulakalacheruvu, Andhra Pradesh 517390</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
  return { subject: 'Re: Your enquiry to KJN Shop', html };
}


/* ?? POST /api/contact  (public) ??????????????????????????? */
const submitContact = async (req, res) => {
  try {
    const { name, phone, email, message } = req.body;

    if (!name?.trim() || !phone?.trim() || !message?.trim()) {
      return res.status(400).json({ success: false, message: 'Name, phone and message are required' });
    }
    if (phone.replace(/\D/g, '').length !== 10) {
      return res.status(400).json({ success: false, message: 'Enter a valid 10-digit phone number' });
    }

    const contact = await prisma.contactMessage.create({
      data: {
        name: name.trim(),
        phone: phone.replace(/\D/g, ''),
        email: email?.trim() || null,
        message: message.trim(),
      },
    });

    return res.status(201).json({ success: true, message: 'Message received! We will get back to you within 24 hours.', data: { id: contact.id } });
  } catch (error) {
    console.error('submitContact error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

/* ?? GET /api/admin/contact-messages  (admin) ??????????????? */
const getContactMessages = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = status ? { status } : {};

    const [messages, total, unreadCount] = await Promise.all([
      prisma.contactMessage.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.contactMessage.count({ where }),
      prisma.contactMessage.count({ where: { status: 'UNREAD' } }),
    ]);

    return res.status(200).json({
      success: true,
      data: messages,
      unreadCount,
      pagination: { total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (error) {
    console.error('getContactMessages error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

/* ?? PATCH /api/admin/contact-messages/:id  (admin) ??????????? */
const updateContactMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNote, adminReply } = req.body;

    const existing = await prisma.contactMessage.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ success: false, message: 'Not found' });

    const isNewReply = adminReply && adminReply.trim() && adminReply.trim() !== existing.adminReply;

    const updated = await prisma.contactMessage.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(adminNote !== undefined && { adminNote }),
        ...(adminReply !== undefined && { adminReply }),
        ...(isNewReply && { repliedAt: new Date(), status: 'REPLIED' }),
      },
    });

    // Send reply email if a new reply text was provided and the customer has an email
    if (isNewReply && existing.email) {
      const { subject, html } = buildReplyEmail(existing, adminReply.trim());
      sendEmail({ to: existing.email, subject, html }).catch(err =>
        console.error('[ContactReply Email error]', err.message)
      );
    }

    return res.status(200).json({
      success: true,
      data: updated,
      emailSent: isNewReply && !!existing.email,
    });
  } catch (error) {
    console.error('updateContactMessage error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

/* ?? DELETE /api/admin/contact-messages/:id  (admin) ??????????? */
const deleteContactMessage = async (req, res) => {
  try {
    await prisma.contactMessage.delete({ where: { id: req.params.id } });
    return res.status(200).json({ success: true, message: 'Deleted' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { submitContact, getContactMessages, updateContactMessage, deleteContactMessage };
