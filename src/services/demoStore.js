// Client-side persistent demo store for Naari Art
// Ensures complete functionality, offline capability, and 0% "Unauthorized Request!" errors

const todayISO = new Date().toISOString();
const todayDateStr = todayISO.split('T')[0];

const dayMs = 86400000;
const dateOffset = (days) => new Date(Date.now() + days * dayMs).toISOString();

export const INITIAL_CUSTOMERS = [
  {
    _id: 'cust-101',
    fullName: 'Ananya Sharma',
    mobile: '9825123456',
    email: 'ananya.sharma@gmail.com',
    dob: '1996-05-14',
    reference: 'Instagram Bridal Inquiry',
    address: 'B-402, Riverfront Heights, Adajan, Surat',
    notes: 'Bespoke bridal lehenga for wedding in December. Prefers rich raw silk with royal zardozi.',
    createdAt: dateOffset(-12),
  },
  {
    _id: 'cust-102',
    fullName: 'Pooja Patel',
    mobile: '9712345678',
    email: 'pooja.patel@outlook.com',
    dob: '1998-11-20',
    reference: 'Direct Walk-in',
    address: '12, Shanti Niketan, Bodakdev, Ahmedabad',
    notes: 'Pastel organza drape saree for sangeet. Measurements completed.',
    createdAt: dateOffset(-8),
  },
  {
    _id: 'cust-103',
    fullName: 'Rhea Singhania',
    mobile: '9898765432',
    email: 'rhea.styling@singhania.com',
    dob: '1994-08-03',
    reference: 'Celebrity Stylist Agency',
    address: '701, Sea Breeze Apartments, Bandra West, Mumbai',
    notes: 'Royal velvet couture outfit for red carpet event.',
    createdAt: dateOffset(-20),
  },
  {
    _id: 'cust-104',
    fullName: 'Meera Desai',
    mobile: '9904123890',
    email: 'meera.usa@gmail.com',
    dob: '1995-02-18',
    reference: 'NRI Bride Referral',
    address: 'Flat 5B, Skyline Palace, Mota Varachha, Surat',
    notes: 'Complete wedding trousseau package with 3 outfits.',
    createdAt: dateOffset(-25),
  },
  {
    _id: 'cust-105',
    fullName: 'Kavita Joshi',
    mobile: '9876501234',
    email: 'kavita.j@yahoo.com',
    dob: '1992-09-29',
    reference: 'Exhibition 2026',
    address: '34, Green Acres, Alkapuri, Vadodara',
    notes: 'Handwoven pure silk Anarkali suit with antique zari.',
    createdAt: dateOffset(-5),
  },
  {
    _id: 'cust-106',
    fullName: 'Divya Mehta',
    mobile: '9824056789',
    email: 'divya.mehta@gmail.com',
    dob: '1997-07-11',
    reference: 'Website Inquiry',
    address: '204, Royal Palms, Race Course Road, Rajkot',
    notes: 'Contemporary Indo-Western mirror-work cape set.',
    createdAt: dateOffset(-2),
  },
];

export const INITIAL_ORDERS = [
  {
    _id: 'ord-101',
    orderId: 'ORD-2026-101',
    customerId: {
      _id: 'cust-101',
      fullName: 'Ananya Sharma',
      mobile: '9825123456',
      address: 'B-402, Riverfront Heights, Adajan, Surat',
    },
    productName: 'Royal Heritage Bridal Lehenga',
    outfitTypeName: 'Lehenga',
    totalPrice: 85000,
    sellingPrice: 85000,
    advancePayment: 50000,
    fabricPurchasePrice: 25000,
    dyeingPrice: 6000,
    embroideryPrice: 32000,
    stitichingPrice: 15000,
    otherWorkPrice: 4000,
    packingPrice: 1500,
    fusingPrice: 1500,
    status: 'In Progress',
    orderStatus: 'In Progress',
    createdAt: todayISO, // Today's order!
    deliveryDate: dateOffset(5), // Upcoming delivery
  },
  {
    _id: 'ord-102',
    orderId: 'ORD-2026-102',
    customerId: {
      _id: 'cust-102',
      fullName: 'Pooja Patel',
      mobile: '9712345678',
      address: '12, Shanti Niketan, Bodakdev, Ahmedabad',
    },
    productName: 'Pastel Organza Hand-Draped Saree',
    outfitTypeName: 'Saree',
    totalPrice: 38000,
    sellingPrice: 38000,
    advancePayment: 38000,
    fabricPurchasePrice: 12000,
    dyeingPrice: 3000,
    embroideryPrice: 14000,
    stitichingPrice: 7000,
    otherWorkPrice: 1000,
    packingPrice: 1000,
    fusingPrice: 0,
    status: 'Ready',
    orderStatus: 'Ready',
    createdAt: dateOffset(-3),
    deliveryDate: todayDateStr, // Delivery pending today!
  },
  {
    _id: 'ord-103',
    orderId: 'ORD-2026-103',
    customerId: {
      _id: 'cust-104',
      fullName: 'Meera Desai',
      mobile: '9904123890',
      address: 'Flat 5B, Skyline Palace, Mota Varachha, Surat',
    },
    productName: 'Handcrafted Pure Silk Anarkali Suit',
    outfitTypeName: 'Anarkali',
    totalPrice: 45000,
    sellingPrice: 45000,
    advancePayment: 25000,
    fabricPurchasePrice: 15000,
    dyeingPrice: 4000,
    embroideryPrice: 16000,
    stitichingPrice: 8000,
    otherWorkPrice: 1000,
    packingPrice: 1000,
    fusingPrice: 0,
    status: 'In Progress',
    orderStatus: 'In Progress',
    createdAt: dateOffset(-14),
    deliveryDate: dateOffset(-1), // Overdue delivery!
  },
  {
    _id: 'ord-104',
    orderId: 'ORD-2026-104',
    customerId: {
      _id: 'cust-103',
      fullName: 'Rhea Singhania',
      mobile: '9898765432',
      address: '701, Sea Breeze Apartments, Bandra West, Mumbai',
    },
    productName: 'Royal Velvet Couture Sherwani & Dupatta',
    outfitTypeName: 'Couture',
    totalPrice: 62000,
    sellingPrice: 62000,
    advancePayment: 62000,
    fabricPurchasePrice: 20000,
    dyeingPrice: 5000,
    embroideryPrice: 24000,
    stitichingPrice: 10000,
    otherWorkPrice: 2000,
    packingPrice: 1000,
    fusingPrice: 0,
    status: 'Delivered',
    orderStatus: 'Delivered',
    createdAt: dateOffset(-18),
    deliveryDate: dateOffset(-2),
  },
  {
    _id: 'ord-105',
    orderId: 'ORD-2026-105',
    customerId: {
      _id: 'cust-106',
      fullName: 'Divya Mehta',
      mobile: '9824056789',
      address: '204, Royal Palms, Race Course Road, Rajkot',
    },
    productName: 'Contemporary Mirror-Work Cape Set',
    outfitTypeName: 'Indo-Western',
    totalPrice: 28000,
    sellingPrice: 28000,
    advancePayment: 15000,
    fabricPurchasePrice: 8000,
    dyeingPrice: 2500,
    embroideryPrice: 11000,
    stitichingPrice: 5500,
    otherWorkPrice: 500,
    packingPrice: 500,
    fusingPrice: 0,
    status: 'New',
    orderStatus: 'New',
    createdAt: todayISO, // Today's order!
    deliveryDate: dateOffset(10),
  },
  {
    _id: 'ord-106',
    orderId: 'ORD-2026-106',
    customerId: {
      _id: 'cust-105',
      fullName: 'Kavita Joshi',
      mobile: '9876501234',
      address: '34, Green Acres, Alkapuri, Vadodara',
    },
    productName: 'Banarasi Brocade Traditional Blouse & Skirt',
    outfitTypeName: 'Blouse',
    totalPrice: 32000,
    sellingPrice: 32000,
    advancePayment: 32000,
    fabricPurchasePrice: 10000,
    dyeingPrice: 2000,
    embroideryPrice: 12000,
    stitichingPrice: 6500,
    otherWorkPrice: 500,
    packingPrice: 1000,
    fusingPrice: 0,
    status: 'Completed',
    orderStatus: 'Completed',
    createdAt: dateOffset(-10),
    deliveryDate: dateOffset(-1),
  },
];

export const INITIAL_PRODUCTS = [
  {
    _id: 'prod-101',
    name: 'Royal Heritage Bridal Lehenga',
    productName: 'Royal Heritage Bridal Lehenga',
    sku: 'NA-BL-001',
    category: 'Bridal Couture',
    price: 85000,
    sellingPrice: 85000,
    description: 'Heavy zardozi and dabka hand embroidery on pure raw silk with dual dupatta.',
    stock: 5,
    status: 'Active',
    images: ['https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&auto=format&fit=crop&q=80'],
    createdAt: dateOffset(-30),
  },
  {
    _id: 'prod-102',
    name: 'Pastel Organza Hand-Draped Saree',
    productName: 'Pastel Organza Hand-Draped Saree',
    sku: 'NA-SR-002',
    category: 'Sarees',
    price: 38000,
    sellingPrice: 38000,
    description: 'Italian organza drape saree with scalloped crystal and cut-dana border.',
    stock: 8,
    status: 'Active',
    images: ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80'],
    createdAt: dateOffset(-25),
  },
  {
    _id: 'prod-103',
    name: 'Royal Velvet Embroidered Sherwani',
    productName: 'Royal Velvet Embroidered Sherwani',
    sku: 'NA-SH-003',
    category: 'Couture',
    price: 62000,
    sellingPrice: 62000,
    description: 'Micro-velvet sherwani adorned with antique gold marodi and zari work.',
    stock: 4,
    status: 'Active',
    images: ['https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?w=600&auto=format&fit=crop&q=80'],
    createdAt: dateOffset(-20),
  },
  {
    _id: 'prod-104',
    name: 'Handcrafted Pure Silk Anarkali Suit',
    productName: 'Handcrafted Pure Silk Anarkali Suit',
    sku: 'NA-AK-004',
    category: 'Anarkali & Suits',
    price: 45000,
    sellingPrice: 45000,
    description: 'Floor-length flared raw silk anarkali with gotta patti and banarasi border.',
    stock: 6,
    status: 'Active',
    images: ['https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=600&auto=format&fit=crop&q=80'],
    createdAt: dateOffset(-15),
  },
  {
    _id: 'prod-105',
    name: 'Contemporary Mirror-Work Cape Set',
    productName: 'Contemporary Mirror-Work Cape Set',
    sku: 'NA-IW-005',
    category: 'Indo-Western',
    price: 28000,
    sellingPrice: 28000,
    description: 'Crepe bustier and flared sharara styled with sheer embroidered cape.',
    stock: 10,
    status: 'Active',
    images: ['https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600&auto=format&fit=crop&q=80'],
    createdAt: dateOffset(-10),
  },
];

export const INITIAL_STAFF = [
  {
    _id: 'staff-101',
    fullName: 'Ramesh Patel',
    phone: '9825001122',
    email: 'ramesh.karigar@naariart.com',
    role: 'Master Karigar',
    skills: ['Zardozi Embroidery', 'Aari Work', 'Antique Marodi'],
    salary: 35000,
    status: 'Active',
    dateOfJoining: '2023-01-15',
  },
  {
    _id: 'staff-102',
    fullName: 'Sunita Varma',
    phone: '9825003344',
    email: 'sunita.master@naariart.com',
    role: 'Master Pattern Cutter',
    skills: ['Pattern Making', 'Boutique Cutting', 'Fit Correction'],
    salary: 38000,
    status: 'Active',
    dateOfJoining: '2023-03-01',
  },
  {
    _id: 'staff-103',
    fullName: 'Dilip Bhai',
    phone: '9825005566',
    email: 'dilip.dyer@naariart.com',
    role: 'Dyeing & Fabric Master',
    skills: ['Ombre Dyeing', 'Shibori', 'Color Matching'],
    salary: 30000,
    status: 'Active',
    dateOfJoining: '2023-06-10',
  },
  {
    _id: 'staff-104',
    fullName: 'Geeta Ben',
    phone: '9825007788',
    email: 'geeta.handwork@naariart.com',
    role: 'Finishing & Hand Artisan',
    skills: ['Latkan Making', 'Piping & Fusing', 'Quality Finishing'],
    salary: 26000,
    status: 'Active',
    dateOfJoining: '2023-09-01',
  },
];

export const INITIAL_TASKS = [
  {
    _id: 'task-101',
    taskName: 'Zardozi Embroidery for ORD-2026-101',
    orderId: 'ord-101',
    customerId: { fullName: 'Ananya Sharma' },
    productName: 'Royal Heritage Bridal Lehenga',
    outfitTypeName: 'Lehenga',
    assignWorker: { _id: 'staff-101', fullName: 'Ramesh Patel' },
    status: 'In Progress',
    priority: 'High',
    startDate: dateOffset(-1),
    dueDate: dateOffset(3),
    totalTimeSpent: 14400, // in seconds (4 hours)
  },
  {
    _id: 'task-102',
    taskName: 'Border Machine Stitching for ORD-2026-102',
    orderId: 'ord-102',
    customerId: { fullName: 'Pooja Patel' },
    productName: 'Pastel Organza Hand-Draped Saree',
    outfitTypeName: 'Saree',
    assignWorker: { _id: 'staff-102', fullName: 'Sunita Varma' },
    status: 'Completed',
    priority: 'Medium',
    startDate: dateOffset(-3),
    dueDate: todayDateStr,
    totalTimeSpent: 10800,
  },
  {
    _id: 'task-103',
    taskName: 'Hand Finishing & Latkan for ORD-2026-103',
    orderId: 'ord-103',
    customerId: { fullName: 'Meera Desai' },
    productName: 'Handcrafted Pure Silk Anarkali Suit',
    outfitTypeName: 'Anarkali',
    assignWorker: { _id: 'staff-104', fullName: 'Geeta Ben' },
    status: 'In Progress',
    priority: 'Urgent',
    startDate: dateOffset(-2),
    dueDate: dateOffset(1),
    totalTimeSpent: 7200,
  },
  {
    _id: 'task-104',
    taskName: 'Fabric Dyeing & Color Matching for ORD-2026-105',
    orderId: 'ord-105',
    customerId: { fullName: 'Divya Mehta' },
    productName: 'Contemporary Mirror-Work Cape Set',
    outfitTypeName: 'Indo-Western',
    assignWorker: { _id: 'staff-103', fullName: 'Dilip Bhai' },
    status: 'Pending',
    priority: 'Medium',
    startDate: todayISO,
    dueDate: dateOffset(4),
    totalTimeSpent: 0,
  },
];

export const INITIAL_BANK_DETAILS = [
  {
    _id: 'bank-101',
    bankName: 'HDFC Bank Ltd',
    accountHolderName: 'Naari Art Couture Studio',
    accountNumber: '50200012345678',
    ifscCode: 'HDFC0001234',
    branchName: 'Mota Varachha, Surat',
    accountType: 'Current Account',
    isDefault: true,
  },
  {
    _id: 'bank-102',
    bankName: 'ICICI Bank',
    accountHolderName: 'Naari Art',
    accountNumber: '002405009876',
    ifscCode: 'ICIC0000024',
    branchName: 'Ring Road Textile Market, Surat',
    accountType: 'Current Account',
    isDefault: false,
  },
];

export const INITIAL_ROLES = [
  {
    _id: 'role-101',
    name: 'Master Admin',
    ismaster: true,
    permissions: [
      { collectionName: 'customer', view: true, insertUpdate: true, delete: true },
      { collectionName: 'customers', view: true, insertUpdate: true, delete: true },
      { collectionName: 'order', view: true, insertUpdate: true, delete: true },
      { collectionName: 'orders', view: true, insertUpdate: true, delete: true },
      { collectionName: 'lead', view: true, insertUpdate: true, delete: true },
      { collectionName: 'leads', view: true, insertUpdate: true, delete: true },
      { collectionName: 'product', view: true, insertUpdate: true, delete: true },
      { collectionName: 'products', view: true, insertUpdate: true, delete: true },
      { collectionName: 'task', view: true, insertUpdate: true, delete: true },
      { collectionName: 'tasks', view: true, insertUpdate: true, delete: true },
      { collectionName: 'settings', view: true, insertUpdate: true, delete: true },
      { collectionName: 'reports', view: true, insertUpdate: true, delete: true },
    ],
  },
  {
    _id: 'role-102',
    name: 'Designer',
    ismaster: false,
    permissions: [
      { collectionName: 'customer', view: true, insertUpdate: true, delete: false },
      { collectionName: 'order', view: true, insertUpdate: true, delete: false },
      { collectionName: 'product', view: true, insertUpdate: true, delete: false },
      { collectionName: 'task', view: true, insertUpdate: false, delete: false },
    ],
  },
  {
    _id: 'role-103',
    name: 'Workshop Manager',
    ismaster: false,
    permissions: [
      { collectionName: 'task', view: true, insertUpdate: true, delete: true },
      { collectionName: 'order', view: true, insertUpdate: false, delete: false },
    ],
  },
];

export const INITIAL_OUTFIT_TYPES = [
  { _id: 'ot-101', name: 'Lehenga', fields: ['Waist', 'Length', 'Flair', 'Hip'] },
  { _id: 'ot-102', name: 'Saree', fields: ['Length', 'Blouse Chest', 'Waist', 'Sleeve'] },
  { _id: 'ot-103', name: 'Blouse', fields: ['Chest', 'Waist', 'Shoulder', 'Armhole', 'Front Neck', 'Back Neck'] },
  { _id: 'ot-104', name: 'Anarkali', fields: ['Chest', 'Waist', 'Length', 'Shoulder', 'Flair'] },
  { _id: 'ot-105', name: 'Gown', fields: ['Chest', 'Waist', 'Hip', 'Length', 'Shoulder'] },
  { _id: 'ot-106', name: 'Kurti', fields: ['Chest', 'Waist', 'Hip', 'Length', 'Sleeve'] },
];

export const INITIAL_WORK_TYPES = [
  { _id: 'wt-101', name: 'Embroidery' },
  { _id: 'wt-102', name: 'Stitching' },
  { _id: 'wt-103', name: 'Handwork' },
  { _id: 'wt-104', name: 'Dyeing' },
  { _id: 'wt-105', name: 'Fusing & Piping' },
  { _id: 'wt-106', name: 'Khakha & Art' },
];

export const INITIAL_SKILLS = [
  { _id: 'sk-101', name: 'Zardozi Embroidery' },
  { _id: 'sk-102', name: 'Pattern Cutting' },
  { _id: 'sk-103', name: 'Aari Work' },
  { _id: 'sk-104', name: 'Machine Embroidery' },
  { _id: 'sk-105', name: 'Hand Draping' },
];

export const INITIAL_ADDONS = [
  { _id: 'ad-101', name: 'Handmade Tassels (Latkan)', price: 1200 },
  { _id: 'ad-102', name: 'Heavy Can-Can Layering', price: 2500 },
  { _id: 'ad-103', name: 'Double Net Dupatta', price: 4500 },
  { _id: 'ad-104', name: 'Designer Belt with Mirror Work', price: 1800 },
];

export const INITIAL_EXPENSE_ALERTS = [
  {
    _id: 'exp-101',
    title: 'Pure Silk Fabric Procurement Due',
    amount: 35000,
    dueDate: dateOffset(2),
    category: 'Material',
    status: 'Pending',
    notes: 'Payment to Surat Silk Mills for Raw Silk batch #402',
  },
  {
    _id: 'exp-102',
    title: 'Metallic Gold Zari Threads Reorder',
    amount: 12500,
    dueDate: dateOffset(5),
    category: 'Threads & Accessories',
    status: 'Pending',
    notes: 'Order for French bullion wire and pure zari spools',
  },
  {
    _id: 'exp-103',
    title: 'Studio Workshop Power & Maintenance',
    amount: 8200,
    dueDate: dateOffset(8),
    category: 'Utilities',
    status: 'Pending',
    notes: 'Monthly workshop electricity and lighting maintenance',
  },
];

export const INITIAL_ACCOUNTING = [
  {
    _id: 'acc-101',
    date: todayDateStr,
    type: 'Income',
    amount: 50000,
    reference: 'Advance for ORD-2026-101',
    paymentMode: 'HDFC Bank Transfer',
    partyName: 'Ananya Sharma',
  },
  {
    _id: 'acc-102',
    date: dateOffset(-2).split('T')[0],
    type: 'Income',
    amount: 38000,
    reference: 'Full Payment for ORD-2026-102',
    paymentMode: 'UPI',
    partyName: 'Pooja Patel',
  },
  {
    _id: 'acc-103',
    date: dateOffset(-3).split('T')[0],
    type: 'Expense',
    amount: 25000,
    reference: 'Raw Silk Fabric Batch',
    paymentMode: 'Bank Transfer',
    partyName: 'Surat Silk Mills',
  },
];

// Helper to get from local store with seed fallback
export const getLocalStore = (key, seedData) => {
  try {
    const raw = localStorage.getItem(`naari_demo_${key}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) ? parsed.length > 0 : parsed && typeof parsed === 'object') {
        return parsed;
      }
    }
  } catch (e) {
    console.warn(`Error reading demo store ${key}:`, e);
  }
  setLocalStore(key, seedData);
  return seedData;
};

export const setLocalStore = (key, data) => {
  try {
    localStorage.setItem(`naari_demo_${key}`, JSON.stringify(data));
  } catch (e) {
    console.error(`Error saving demo store ${key}:`, e);
  }
};

// Main Mock Request Dispatcher
export const handleMockRequest = (config) => {
  const url = (config.url || '').toLowerCase();

  let body = {};
  if (config.data) {
    try {
      body = typeof config.data === 'string' ? JSON.parse(config.data) : config.data;
    } catch {
      body = config.data;
    }
  }

  // --- Customers ---
  if (url.includes('/user/customers/save')) {
    const customers = getLocalStore('customers', INITIAL_CUSTOMERS);
    let saved = null;
    if (body._id || body.customerId) {
      const targetId = body._id || body.customerId;
      saved = { ...body, _id: targetId, updatedAt: new Date().toISOString() };
      const updated = customers.map((c) => (c._id === targetId ? saved : c));
      setLocalStore('customers', updated);
    } else {
      saved = {
        ...body,
        _id: 'cust-' + Date.now(),
        createdAt: new Date().toISOString(),
      };
      customers.unshift(saved);
      setLocalStore('customers', customers);
    }
    return { IsSuccess: true, Status: 200, Message: 'Customer saved successfully', Data: saved };
  }

  if (url.includes('/user/customers/getone')) {
    const customers = getLocalStore('customers', INITIAL_CUSTOMERS);
    const targetId = body.customerId || body._id;
    const found = customers.find((c) => c._id === targetId) || customers[0];
    return { IsSuccess: true, Status: 200, Message: 'Customer fetched', Data: found };
  }

  if (url.includes('/user/customers/order')) {
    const orders = getLocalStore('orders', INITIAL_ORDERS);
    const targetId = body.customerId;
    const customerOrders = orders.filter((o) => {
      const cid = typeof o.customerId === 'object' ? o.customerId?._id : o.customerId;
      return cid === targetId;
    });
    return { IsSuccess: true, Status: 200, Message: 'Customer orders fetched', Data: customerOrders };
  }

  if (url.includes('/user/customers')) {
    let list = getLocalStore('customers', INITIAL_CUSTOMERS);
    const search = (body.search || '').trim().toLowerCase();
    if (search) {
      list = list.filter(
        (c) =>
          (c.fullName && c.fullName.toLowerCase().includes(search)) ||
          (c.mobile && String(c.mobile).includes(search)) ||
          (c.email && c.email.toLowerCase().includes(search))
      );
    }
    return { IsSuccess: true, Status: 200, Message: 'Customers list', Data: list };
  }

  // --- Orders ---
  if (url.includes('/user/orders/add') || url.includes('/user/orders/save')) {
    const orders = getLocalStore('orders', INITIAL_ORDERS);
    const newOrder = {
      ...body,
      _id: 'ord-' + Date.now(),
      orderId: 'ORD-2026-' + (orders.length + 101),
      status: body.status || 'New',
      orderStatus: body.orderStatus || body.status || 'New',
      createdAt: new Date().toISOString(),
      totalPrice: Number(body.totalPrice || body.sellingPrice || 0),
    };
    orders.unshift(newOrder);
    setLocalStore('orders', orders);
    return { IsSuccess: true, Status: 200, Message: 'Order created successfully', Data: newOrder };
  }

  if (url.includes('/user/orders/update')) {
    const orders = getLocalStore('orders', INITIAL_ORDERS);
    const targetId = body._id || body.orderId;
    const updated = orders.map((o) => (o._id === targetId || o.orderId === targetId ? { ...o, ...body } : o));
    setLocalStore('orders', updated);
    return { IsSuccess: true, Status: 200, Message: 'Order updated successfully', Data: body };
  }

  if (url.includes('/user/orders/getone')) {
    const orders = getLocalStore('orders', INITIAL_ORDERS);
    const targetId = body.orderId || body._id;
    const found = orders.find((o) => o._id === targetId || o.orderId === targetId) || orders[0];
    return { IsSuccess: true, Status: 200, Message: 'Order fetched', Data: found };
  }

  if (url.includes('/user/orders/delete') || url.includes('/user/orders/cancel')) {
    const orders = getLocalStore('orders', INITIAL_ORDERS);
    const targetId = body.orderId || body._id;
    const updated = orders.filter((o) => o._id !== targetId && o.orderId !== targetId);
    setLocalStore('orders', updated);
    return { IsSuccess: true, Status: 200, Message: 'Order removed', Data: targetId };
  }

  if (url.includes('/user/orders') || url.includes('/user/order')) {
    let list = getLocalStore('orders', INITIAL_ORDERS);
    const search = (body.search || '').trim().toLowerCase();
    if (search) {
      list = list.filter((o) => {
        const custName = typeof o.customerId === 'object' ? o.customerId?.fullName : '';
        const phone = typeof o.customerId === 'object' ? o.customerId?.mobile : '';
        return (
          (o.orderId && o.orderId.toLowerCase().includes(search)) ||
          (custName && custName.toLowerCase().includes(search)) ||
          (phone && String(phone).includes(search)) ||
          (o.productName && o.productName.toLowerCase().includes(search)) ||
          (o.status && o.status.toLowerCase().includes(search))
        );
      });
    }
    return { IsSuccess: true, Status: 200, Message: 'Orders list', Data: list };
  }

  // --- Products ---
  if (url.includes('/user/product/save')) {
    const products = getLocalStore('products', INITIAL_PRODUCTS);
    let saved = null;
    if (body._id || body.productId) {
      const targetId = body._id || body.productId;
      saved = { ...body, _id: targetId };
      const updated = products.map((p) => (p._id === targetId ? saved : p));
      setLocalStore('products', updated);
    } else {
      saved = { ...body, _id: 'prod-' + Date.now(), createdAt: new Date().toISOString() };
      products.unshift(saved);
      setLocalStore('products', products);
    }
    return { IsSuccess: true, Status: 200, Message: 'Product saved', Data: saved };
  }

  if (url.includes('/user/product/getone')) {
    const products = getLocalStore('products', INITIAL_PRODUCTS);
    const targetId = body.productId || body._id;
    const found = products.find((p) => p._id === targetId) || products[0];
    return { IsSuccess: true, Status: 200, Message: 'Product fetched', Data: found };
  }

  if (url.includes('/user/product/delete')) {
    const products = getLocalStore('products', INITIAL_PRODUCTS);
    const targetId = body.productId || body._id;
    const updated = products.filter((p) => p._id !== targetId);
    setLocalStore('products', updated);
    return { IsSuccess: true, Status: 200, Message: 'Product deleted', Data: targetId };
  }

  if (url.includes('/user/product')) {
    let list = getLocalStore('products', INITIAL_PRODUCTS);
    const search = (body.search || '').trim().toLowerCase();
    if (search) {
      list = list.filter(
        (p) =>
          (p.name && p.name.toLowerCase().includes(search)) ||
          (p.productName && p.productName.toLowerCase().includes(search)) ||
          (p.category && p.category.toLowerCase().includes(search)) ||
          (p.sku && p.sku.toLowerCase().includes(search))
      );
    }
    return { IsSuccess: true, Status: 200, Message: 'Products list', Data: list };
  }

  // --- Tasks ---
  if (url.includes('/user/task/start')) {
    return { IsSuccess: true, Status: 200, Message: 'Task started successfully', Data: { status: 'In Progress' } };
  }
  if (url.includes('/user/task/pause')) {
    return { IsSuccess: true, Status: 200, Message: 'Task paused successfully', Data: { status: 'Paused' } };
  }
  if (url.includes('/user/task/end')) {
    return { IsSuccess: true, Status: 200, Message: 'Task ended successfully', Data: { status: 'Completed' } };
  }
  if (url.includes('/user/task/getone')) {
    const tasks = getLocalStore('tasks', INITIAL_TASKS);
    const targetId = body.orderId || body._id;
    const found = tasks.find((t) => t._id === targetId || t.orderId === targetId) || tasks[0];
    return { IsSuccess: true, Status: 200, Message: 'Task details', Data: found };
  }
  if (url.includes('/user/task')) {
    let list = getLocalStore('tasks', INITIAL_TASKS);
    const search = (body.search || '').trim().toLowerCase();
    if (search) {
      list = list.filter(
        (t) =>
          (t.taskName && t.taskName.toLowerCase().includes(search)) ||
          (t.productName && t.productName.toLowerCase().includes(search)) ||
          (t.status && t.status.toLowerCase().includes(search))
      );
    }
    return { IsSuccess: true, Status: 200, Message: 'Tasks list', Data: list };
  }

  // --- Staff ---
  if (url.includes('/user/staff/save')) {
    const staff = getLocalStore('staff', INITIAL_STAFF);
    const newStaff = { ...body, _id: body._id || 'staff-' + Date.now() };
    staff.unshift(newStaff);
    setLocalStore('staff', staff);
    return { IsSuccess: true, Status: 200, Message: 'Staff saved', Data: newStaff };
  }
  if (url.includes('/user/staff/getone')) {
    const staff = getLocalStore('staff', INITIAL_STAFF);
    const found = staff.find((s) => s._id === (body.staffId || body._id)) || staff[0];
    return { IsSuccess: true, Status: 200, Message: 'Staff details', Data: found };
  }
  if (url.includes('/user/staff')) {
    let list = getLocalStore('staff', INITIAL_STAFF);
    return { IsSuccess: true, Status: 200, Message: 'Staff list', Data: list };
  }

  // --- Roles & Permissions ---
  if (url.includes('/user/role/getpermission')) {
    const permissions = INITIAL_ROLES[0].permissions;
    return { IsSuccess: true, Status: 200, Message: 'Permissions list', Data: permissions };
  }
  if (url.includes('/user/role/save')) {
    return { IsSuccess: true, Status: 200, Message: 'Role saved', Data: body };
  }
  if (url.includes('/user/role')) {
    const roles = getLocalStore('roles', INITIAL_ROLES);
    return { IsSuccess: true, Status: 200, Message: 'Roles list', Data: roles };
  }

  // --- Outfit Types, Work Types, Skills, Addons ---
  if (url.includes('/user/outfittype/save')) {
    const types = getLocalStore('outfittypes', INITIAL_OUTFIT_TYPES);
    types.push({ ...body, _id: 'ot-' + Date.now() });
    setLocalStore('outfittypes', types);
    return { IsSuccess: true, Status: 200, Message: 'Outfit type saved', Data: body };
  }
  if (url.includes('/user/outfittype')) {
    const list = getLocalStore('outfittypes', INITIAL_OUTFIT_TYPES);
    return { IsSuccess: true, Status: 200, Message: 'Outfit types list', Data: list };
  }

  if (url.includes('/user/worktype')) {
    const list = getLocalStore('worktypes', INITIAL_WORK_TYPES);
    return { IsSuccess: true, Status: 200, Message: 'Work types list', Data: list };
  }

  if (url.includes('/user/skills')) {
    const list = getLocalStore('skills', INITIAL_SKILLS);
    return { IsSuccess: true, Status: 200, Message: 'Skills list', Data: { skills: list } };
  }

  if (url.includes('/user/addons/save')) {
    const addons = getLocalStore('addons', INITIAL_ADDONS);
    addons.push({ ...body, _id: 'ad-' + Date.now() });
    setLocalStore('addons', addons);
    return { IsSuccess: true, Status: 200, Message: 'Addon saved', Data: body };
  }
  if (url.includes('/user/addons')) {
    const list = getLocalStore('addons', INITIAL_ADDONS);
    return { IsSuccess: true, Status: 200, Message: 'Addons list', Data: list };
  }

  // --- Bank Details ---
  if (url.includes('/user/bankdetails/save')) {
    const banks = getLocalStore('banks', INITIAL_BANK_DETAILS);
    const newBank = { ...body, _id: body._id || 'bank-' + Date.now() };
    banks.push(newBank);
    setLocalStore('banks', banks);
    return { IsSuccess: true, Status: 200, Message: 'Bank details saved', Data: newBank };
  }
  if (url.includes('/user/bankdetails/delete')) {
    const banks = getLocalStore('banks', INITIAL_BANK_DETAILS);
    const targetId = body.bankDetailsId || body._id;
    const updated = banks.filter((b) => b._id !== targetId);
    setLocalStore('banks', updated);
    return { IsSuccess: true, Status: 200, Message: 'Bank details deleted', Data: targetId };
  }
  if (url.includes('/user/bankdetails')) {
    const list = getLocalStore('banks', INITIAL_BANK_DETAILS);
    return { IsSuccess: true, Status: 200, Message: 'Bank details list', Data: list };
  }

  // --- Expense Alerts ---
  if (url.includes('/user/expensealert/save')) {
    const alerts = getLocalStore('expensealerts', INITIAL_EXPENSE_ALERTS);
    const newAlert = { ...body, _id: body._id || 'exp-' + Date.now() };
    alerts.unshift(newAlert);
    setLocalStore('expensealerts', alerts);
    return { IsSuccess: true, Status: 200, Message: 'Alert saved', Data: newAlert };
  }
  if (url.includes('/user/expensealert')) {
    const list = getLocalStore('expensealerts', INITIAL_EXPENSE_ALERTS);
    return { IsSuccess: true, Status: 200, Message: 'Expense alerts list', Data: list };
  }

  // --- Legal / Invoice / Quotation ---
  if (url.includes('/user/legal/save')) {
    return { IsSuccess: true, Status: 200, Message: 'Invoice created successfully', Data: body };
  }
  if (url.includes('/user/legal')) {
    return { IsSuccess: true, Status: 200, Message: 'Legal entries', Data: [] };
  }

  // --- Reports Analytics ---
  if (url.includes('/user/fabric-analytics')) {
    const fabricReports = [
      { fabricName: 'Raw Silk', totalOrders: 18, totalRevenue: 980000, totalCustomers: 15, avgRevenue: 54444 },
      { fabricName: 'Pure Italian Organza', totalOrders: 14, totalRevenue: 560000, totalCustomers: 12, avgRevenue: 40000 },
      { fabricName: 'Micro Velvet', totalOrders: 9, totalRevenue: 540000, totalCustomers: 8, avgRevenue: 60000 },
      { fabricName: 'Banarasi Georgette', totalOrders: 11, totalRevenue: 420000, totalCustomers: 9, avgRevenue: 38181 },
      { fabricName: 'Tissue Chanderi', totalOrders: 7, totalRevenue: 245000, totalCustomers: 7, avgRevenue: 35000 },
    ];
    return { IsSuccess: true, Status: 200, Message: 'Fabric analytics', Data: fabricReports };
  }

  if (url.includes('/user/outfit-analytics')) {
    const outfitReports = [
      { outfitName: 'Bridal Lehenga', totalOrders: 22, totalRevenue: 1870000, totalCustomers: 19, avgRevenue: 85000 },
      { outfitName: 'Drape Saree', totalOrders: 19, totalRevenue: 722000, totalCustomers: 17, avgRevenue: 38000 },
      { outfitName: 'Couture Sherwani', totalOrders: 10, totalRevenue: 620000, totalCustomers: 10, avgRevenue: 62000 },
      { outfitName: 'Pure Silk Anarkali', totalOrders: 15, totalRevenue: 675000, totalCustomers: 14, avgRevenue: 45000 },
      { outfitName: 'Indo-Western Cape Set', totalOrders: 12, totalRevenue: 336000, totalCustomers: 11, avgRevenue: 28000 },
    ];
    return { IsSuccess: true, Status: 200, Message: 'Outfit analytics', Data: outfitReports };
  }

  if (url.includes('/user/worktype-analytics')) {
    const workReports = [
      { workTypeName: 'Zardozi Embroidery', totalOrders: 28, totalRevenue: 896000 },
      { workTypeName: 'Master Stitching & Tailoring', totalOrders: 35, totalRevenue: 420000 },
      { workTypeName: 'Artisan Handwork & Latkan', totalOrders: 32, totalRevenue: 128000 },
      { workTypeName: 'Ombre & Silk Dyeing', totalOrders: 24, totalRevenue: 96000 },
    ];
    return { IsSuccess: true, Status: 200, Message: 'Worktype analytics', Data: workReports };
  }

  if (url.includes('/user/worker-analytics')) {
    const workerReports = [
      { workerName: 'Ramesh Patel', totalTasks: 24, completedTasks: 21 },
      { workerName: 'Sunita Varma', totalTasks: 29, completedTasks: 27 },
      { workerName: 'Dilip Bhai', totalTasks: 18, completedTasks: 17 },
      { workerName: 'Geeta Ben', totalTasks: 22, completedTasks: 20 },
    ];
    return { IsSuccess: true, Status: 200, Message: 'Worker analytics', Data: workerReports };
  }

  if (url.includes('/user/customer-analytics')) {
    const customerReports = [
      { customerName: 'Ananya Sharma', totalOrders: 3, totalSpend: 165000 },
      { customerName: 'Meera Desai', totalOrders: 3, totalSpend: 135000 },
      { customerName: 'Rhea Singhania', totalOrders: 2, totalSpend: 124000 },
      { customerName: 'Pooja Patel', totalOrders: 2, totalSpend: 76000 },
      { customerName: 'Kavita Joshi', totalOrders: 1, totalSpend: 45000 },
    ];
    return { IsSuccess: true, Status: 200, Message: 'Customer analytics', Data: customerReports };
  }

  if (url.includes('/user/delivery-analytics')) {
    return {
      IsSuccess: true,
      Status: 200,
      Message: 'Delivery analytics',
      Data: { onTime: 24, delayed: 2, pending: 5 },
    };
  }

  // --- Accounting ---
  if (url.includes('/user/accounting')) {
    const list = getLocalStore('accounting', INITIAL_ACCOUNTING);
    return { IsSuccess: true, Status: 200, Message: 'Accounting list', Data: list };
  }

  // --- Chat ---
  if (url.includes('/user/chat')) {
    return { IsSuccess: true, Status: 200, Message: 'Chat list', Data: [] };
  }

  // Default fallback safe response
  return { IsSuccess: true, Status: 200, Message: 'Success', Data: [] };
};
