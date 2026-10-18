// WhatsApp Utility for Naari Art
// Generates beautifully formatted messages and opens WhatsApp Web/Mobile

export const cleanPhoneNumber = (phone) => {
  if (!phone) return '';
  let cleaned = phone.toString().replace(/[^0-9]/g, '');
  // If 10 digits without country code, add 91 (India)
  if (cleaned.length === 10) {
    cleaned = '91' + cleaned;
  }
  return cleaned;
};

export const openWhatsApp = (phone, text) => {
  const cleanPhone = cleanPhoneNumber(phone);
  const encoded = encodeURIComponent(text);
  const url = cleanPhone
    ? `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encoded}`
    : `https://api.whatsapp.com/send?text=${encoded}`;
  window.open(url, '_blank');
};

export const sendInvoiceViaWhatsApp = (item) => {
  const order = item?.orderId || {};
  const customer = order?.customerId || {};
  const customerName = customer?.fullName || customer?.name || 'Valued Client';
  const customerPhone = customer?.mobileNumber || customer?.mobile || customer?.phone || '';

  const total = Number(item?.amount || order?.sellingPrice || 0);
  const advance = Number(order?.advanceAmount || 0);
  const due = total - advance;
  const legalId = item?.legalid || 'INV-001';
  const orderId = order?.orderId || 'ORD-001';
  const deliveryDate = order?.deliveryDate
    ? new Date(order.deliveryDate).toLocaleDateString('en-GB')
    : 'As discussed';

  const message = `✨ *NAARI ART - INVOICE & ORDER CONFIRMATION* ✨

Dear *${customerName}*,

Greetings from *Naari Art Couture Atelier, Surat*! 🙏
Here is your official invoice summary:

━━━━━━━━━━━━━━━━━━━
🧾 *Invoice No:* ${legalId}
🆔 *Order ID:* ${orderId}
📅 *Invoice Date:* ${new Date(item?.createdAt || Date.now()).toLocaleDateString('en-GB')}
👗 *Delivery Date:* ${deliveryDate}
━━━━━━━━━━━━━━━━━━━

💰 *PAYMENT SUMMARY:*
• Total Amount: *₹ ${total.toLocaleString('en-IN')}*
• Advance Received: *₹ ${advance.toLocaleString('en-IN')}*
• Net Due / Balance: *₹ ${due > 0 ? due.toLocaleString('en-IN') : '0 (Fully Paid)'}*

━━━━━━━━━━━━━━━━━━━
📍 *Studio Address:*
24, Ugameshwar Bunglow, Nr Taapi Arcade, Opel Gold, Mota Varachha, Surat - 394101
📞 *Helpline / WhatsApp:* +91 98250 00000

Thank you for choosing *Naari Art*. We are honored to craft your sacred occasion couture! 🌸`;

  openWhatsApp(customerPhone, message);
};

export const sendOrderQuotationViaWhatsApp = (order) => {
  const customer = order?.customerId || {};
  const customerName = customer?.fullName || customer?.name || 'Valued Client';
  const customerPhone = customer?.mobileNumber || customer?.mobile || customer?.phone || '';

  const sellingPrice = Number(order?.sellingPrice || order?.totalPrice || 0);
  const advance = Number(order?.advanceAmount || 0);
  const netDue = sellingPrice - advance;
  const orderId = order?.orderId || 'ORD-001';
  const outfitName = order?.outfitTypeId?.name || order?.outfitType || 'Bespoke Couture';
  const deliveryDate = order?.deliveryDate
    ? new Date(order.deliveryDate).toLocaleDateString('en-GB')
    : 'To be scheduled';

  const message = `🌸 *NAARI ART - BESPOKE ORDER QUOTATION* 🌸

Dear *${customerName}*,

Thank you for trusting *Naari Art Atelier* with your custom tailoring! ✨

━━━━━━━━━━━━━━━━━━━
🆔 *Order / Quotation No:* ${orderId}
👗 *Outfit Type:* ${outfitName}
📅 *Estimated Delivery:* ${deliveryDate}
━━━━━━━━━━━━━━━━━━━

💰 *ESTIMATE BREAKUP:*
• Total Order Value: *₹ ${sellingPrice.toLocaleString('en-IN')}*
• Advance Paid: *₹ ${advance.toLocaleString('en-IN')}*
• Balance on Delivery: *₹ ${netDue > 0 ? netDue.toLocaleString('en-IN') : '0 (Paid)'}*

━━━━━━━━━━━━━━━━━━━
📍 *Studio Location:*
24, Ugameshwar Bunglow, Nr Taapi Arcade, Opel Gold, Mota Varachha, Surat - 394101
📞 *Support:* +91 98250 00000

Feel free to reply to this message if you have any questions or customization requests. Have a wonderful day! 💖`;

  openWhatsApp(customerPhone, message);
};

export const sendCollaboratorWhatsApp = (collab) => {
  const name = collab?.fullName || collab?.name || 'Creator';
  const handle = collab?.instagramHandle || '';
  const phone = collab?.phone || collab?.mobileNumber || '';

  const message = `Namaste *${name}* (@${handle.replace('@', '')})! 🙏

This is the PR & Influencer Collaboration Team from *Naari Art Atelier, Surat*.

We received your collaboration inquiry through our website. We loved your aesthetic and would like to discuss our upcoming couture collection collaboration with you! 👗✨

Could you please share your media kit or convenient time for a quick 5-minute call?

Warm regards,
*PR Team | Naari Art Couture*
📞 +91 98250 00000`;

  openWhatsApp(phone, message);
};
