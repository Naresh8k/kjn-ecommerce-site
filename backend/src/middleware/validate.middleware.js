const { z } = require('zod');

// Validation schemas
const schemas = {
  signupSendOTP: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(50),
    email: z.string().email('Invalid email address'),
    phone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid Indian phone number'),
  }),

  signupVerifyOTP: z.object({
    email: z.string().email(),
    otp: z.string().length(6, 'OTP must be 6 digits'),
  }),

  loginSendOTP: z.object({
    phone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid Indian phone number'),
  }),

  loginVerifyOTP: z.object({
    phone: z.string().regex(/^[6-9]\d{9}$/),
    otp: z.string().length(6),
  }),

  loginPassword: z.object({
    email: z.string().email('Valid email is required'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
  }),

  addAddress: z.object({
    name: z.string().min(2).max(100),
    phone: z.string().regex(/^[6-9]\d{9}$/),
    line1: z.string().min(5).max(200),
    city: z.string().min(2).max(100),
    state: z.string().min(2).max(100),
    pincode: z.string().regex(/^\d{6}$/, 'Invalid pincode'),
  }),

  addToCart: z.object({
    productId: z.string().uuid(),
    quantity: z.number().int().min(1).max(10),
    variantId: z.string().uuid().optional(),
  }),

  placeOrder: z.object({
    shippingAddressId: z.string().uuid(),
    paymentMethod: z.enum(['COD', 'ONLINE', 'UPI']),
    notes: z.string().max(200).optional(),
  }),

  addReview: z.object({
    productId: z.string().uuid(),
    rating: z.number().int().min(1).max(5),
    title: z.string().max(100).optional(),
    body: z.string().max(1000).optional(),
  }),
};

// Middleware factory
const validate = (schemaName) => (req, res, next) => {
  const schema = schemas[schemaName];
  if (!schema) return next();

  const result = schema.safeParse(req.body);
  if (!result.success) {
    const errors = result.error.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    return res.status(400).json({ success: false, message: 'Validation failed', errors });
  }

  req.body = result.data;
  next();
};

module.exports = validate;