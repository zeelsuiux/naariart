// WhatsApp Utility for Naari Art - Designer Studio
// Generates beautifully formatted messages and opens WhatsApp Web/Mobile

export const STUDIO_PHONE = '919825123456';
export const STUDIO_DISPLAY_PHONE = '+91 98251 23456';

export const cleanPhoneNumber = (phone) => {
  if (!phone) return '';
  let cleaned = phone.toString().replace(/[^0-9]/g, '');
  if (!cleaned) return '';
  
  // If 11 digits starting with 0 (e.g. 09825123456), replace 0 with 91
  if (cleaned.length === 11 && cleaned.startsWith('0')) {
    cleaned = '91' + cleaned.slice(1);
  }
  // If 10 digits without country code, add 91 (India)
  else if (cleaned.length === 10) {
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

  try {
    const win = window.open(url, '_blank');
    if (win && typeof win.focus === 'function') {
      win.focus();
    }
  } catch (e) {
    if (typeof window !== 'undefined' && window.location) {
      window.location.href = url;
    }
  }
};

export const getInvoicePublicUrl = (orderId) => {
  try {
    const origin = window.location.origin;
    const pathname = window.location.pathname.replace(/\/+$/, '');
    return `${origin}${pathname}/#/invoice-view?orderId=${encodeURIComponent(orderId || '')}`;
  } catch {
    return `https://zeelsuiux.github.io/naariart/#/invoice-view?orderId=${encodeURIComponent(orderId || '')}`;
  }
};

export const sendOrderInvoiceViaWhatsApp = (order, customPhone = '') => {
  if (!order) return;

  const customerObj = typeof order?.customerId === 'object' && order?.customerId !== null ? order.customerId : {};
  let customerName = customerObj?.fullName || customerObj?.name || order?.customerName || order?.clientName || 'Valued Client';
  let customerPhone = customPhone ||
    customerObj?.mobileNumber ||
    customerObj?.mobile ||
    customerObj?.phone ||
    order?.mobileNumber ||
    order?.mobile ||
    order?.phone ||
    order?.customerPhone ||
    order?.clientPhone ||
    '';

  // If phone not yet found and order.customerId is an ID, check local cached customer records
  if (!customerPhone && order?.customerId) {
    const custId = typeof order.customerId === 'string' ? order.customerId : (order.customerId?._id || order.customerId?.id);
    if (custId) {
      try {
        const stored = JSON.parse(localStorage.getItem('naari_customers') || localStorage.getItem('customers') || '[]');
        if (Array.isArray(stored)) {
          const found = stored.find((c) => String(c?._id || c?.id) === String(custId));
          if (found) {
            customerName = found.fullName || found.name || customerName;
            customerPhone = found.mobileNumber || found.mobile || found.phone || '';
          }
        }
      } catch (e) {
        console.warn('Customer storage lookup error:', e);
      }
    }
  }

  // If customerPhone is still missing or has fewer than 10 digits, prompt user gracefully
  const cleanedCheck = cleanPhoneNumber(customerPhone);
  if (!customerPhone || cleanedCheck.length < 10) {
    const promptNumber = window.prompt(
      `Enter WhatsApp phone number for client "${customerName}":`,
      customerPhone || ''
    );
    if (!promptNumber) {
      return; // User cancelled
    }
    customerPhone = promptNumber;
  }

  const total = Number(order?.sellingPrice || order?.totalPrice || 0);
  const advance = Number(order?.advancePayment || order?.advanceAmount || 0);
  const due = total - advance;
  const orderId = order?.orderId || order?._id || 'ORD-001';
  const outfitName =
    order?.productName ||
    order?.outfitTypeName ||
    order?.outfitTypeId?.name ||
    order?.outfitType ||
    'Bespoke Couture Outfit';
  const deliveryDate = order?.deliveryDate
    ? new Date(order.deliveryDate).toLocaleDateString('en-GB')
    : 'As scheduled';

  const invoiceUrl = getInvoicePublicUrl(orderId);

  const message = `🧾 *NAARI ART - OFFICIAL TAX INVOICE* 🧾

Dear *${customerName}*,

Greetings from *Naari Art - Designer Studio, Surat*! 🙏
Here is your official tax invoice receipt:

━━━━━━━━━━━━━━━━━━━
🧾 *Invoice / Order No:* ${orderId}
👗 *Outfit:* ${outfitName}
📅 *Invoice Date:* ${new Date(order?.createdAt || Date.now()).toLocaleDateString('en-GB')}
📦 *Estimated Delivery:* ${deliveryDate}
━━━━━━━━━━━━━━━━━━━

💰 *PAYMENT SUMMARY:*
• Total Order Value: *₹ ${total.toLocaleString('en-IN')}*
• Advance Received: *₹ ${advance.toLocaleString('en-IN')}*
• Net Balance Due: *₹ ${due > 0 ? due.toLocaleString('en-IN') : '0 (Fully Paid)'}*

📄 *VIEW & DOWNLOAD INVOICE PDF:*
👉 ${invoiceUrl}

━━━━━━━━━━━━━━━━━━━
📍 *Studio Address:*
24, Ugameshwar Bunglow, Nr Taapi Arcade, Opel Gold, Mota Varachha, Surat - 394101
📞 *Helpline / WhatsApp:* +91 98251 23456

Thank you for choosing *Naari Art - Designer Studio*. We are honored to craft your bespoke occasion couture! 🌸`;

  openWhatsApp(customerPhone, message);
};

export const sendInvoiceViaWhatsApp = (item) => {
  const order = item?.orderId || {};
  const customer = typeof order?.customerId === 'object' && order?.customerId !== null ? order.customerId : {};
  const customerName = customer?.fullName || customer?.name || order?.customerName || 'Valued Client';
  let customerPhone = customer?.mobileNumber || customer?.mobile || customer?.phone || order?.mobileNumber || order?.mobile || order?.phone || '';

  if (!customerPhone || cleanPhoneNumber(customerPhone).length < 10) {
    const promptNumber = window.prompt(`Enter WhatsApp number for client "${customerName}":`, customerPhone || '');
    if (!promptNumber) return;
    customerPhone = promptNumber;
  }

  const total = Number(item?.amount || order?.sellingPrice || 0);
  const advance = Number(order?.advanceAmount || 0);
  const due = total - advance;
  const legalId = item?.legalid || 'INV-001';
  const orderId = order?.orderId || order?._id || 'ORD-001';
  const deliveryDate = order?.deliveryDate
    ? new Date(order.deliveryDate).toLocaleDateString('en-GB')
    : 'As discussed';

  const invoiceUrl = getInvoicePublicUrl(orderId);

  const message = `✨ *NAARI ART - OFFICIAL TAX INVOICE* ✨

Dear *${customerName}*,

Greetings from *Naari Art - Designer Studio, Surat*! 🙏
Here is your official tax invoice details:

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

📄 *VIEW & DOWNLOAD INVOICE PDF:*
👉 ${invoiceUrl}

━━━━━━━━━━━━━━━━━━━
📍 *Studio Address:*
24, Ugameshwar Bunglow, Nr Taapi Arcade, Opel Gold, Mota Varachha, Surat - 394101
📞 *Helpline / WhatsApp:* +91 98251 23456

Thank you for choosing *Naari Art - Designer Studio*. We are honored to craft your sacred occasion couture! 🌸`;

  openWhatsApp(customerPhone, message);
};

export const sendOrderQuotationViaWhatsApp = (order) => {
  const customer = typeof order?.customerId === 'object' && order?.customerId !== null ? order.customerId : {};
  const customerName = customer?.fullName || customer?.name || order?.customerName || 'Valued Client';
  let customerPhone = customer?.mobileNumber || customer?.mobile || customer?.phone || order?.mobile || '';

  if (!customerPhone || cleanPhoneNumber(customerPhone).length < 10) {
    const promptNumber = window.prompt(`Enter WhatsApp number for client "${customerName}":`, customerPhone || '');
    if (!promptNumber) return;
    customerPhone = promptNumber;
  }

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

Thank you for trusting *Naari Art - Designer Studio* with your custom tailoring! ✨

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
📞 *Support:* +91 98251 23456

Feel free to reply to this message if you have any questions or customization requests. Have a wonderful day! 💖`;

  openWhatsApp(customerPhone, message);
};

export const sendCollaboratorWhatsApp = (collab) => {
  const name = collab?.fullName || collab?.name || 'Creator';
  const handle = collab?.instagramHandle || '';
  let phone = collab?.phone || collab?.mobileNumber || '';

  if (!phone || cleanPhoneNumber(phone).length < 10) {
    const promptNumber = window.prompt(`Enter WhatsApp number for creator "${name}":`, phone || '');
    if (!promptNumber) return;
    phone = promptNumber;
  }

  const message = `Namaste *${name}* (@${handle.replace('@', '')})! 🙏

This is the PR & Influencer Collaboration Team from *Naari Art - Designer Studio, Surat*.

We received your collaboration inquiry through our website. We loved your aesthetic and would like to discuss our upcoming couture collection collaboration with you! 👗✨

Could you please share your media kit or convenient time for a quick 5-minute call?

Warm regards,
*PR Team | Naari Art - Designer Studio*
📞 +91 98251 23456`;

  openWhatsApp(phone, message);
};
