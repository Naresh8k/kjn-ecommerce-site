const prisma = require('../../config/db');

// For now static logic — later integrate Shipmozo API
const checkPincode = async (req, res) => {
  try {
    const { pincode } = req.params;

    if (!/^\d{6}$/.test(pincode)) {
      return res.status(400).json({ success: false, message: 'Invalid pincode' });
    }

    // Pincodes not serviceable (example blocked list)
    const blockedPincodes = ['999999', '000000'];
    if (blockedPincodes.includes(pincode)) {
      return res.status(200).json({
        success: true,
        serviceable: false,
        message: 'Sorry, delivery is not available at this pincode',
      });
    }

    // Estimated delivery days based on state (basic logic)
    const firstDigit = pincode[0];
    const deliveryDays = {
      '5': 2, // Andhra Pradesh, Telangana (local)
      '6': 3, // Tamil Nadu, Kerala
      '4': 4, // Maharashtra, Gujarat
      '1': 5, // Delhi, Haryana
      '2': 5, // UP, Uttarakhand
      '3': 5, // Rajasthan
      '7': 5, // West Bengal
      '8': 6, // Odisha, Bihar
    };

    const days = deliveryDays[firstDigit] || 5;

    return res.status(200).json({
      success: true,
      serviceable: true,
      pincode,
      estimatedDays: days,
      message: `Delivery in ${days}-${days + 1} business days`,
      freeShippingAbove: 500,
      codAvailable: true,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

const calculateShipping = async (req, res) => {
  try {
    const { pincode, weight } = req.body;
    let charge = 0;

    // Free shipping above ₹500
    if (req.body.orderAmount >= 500) {
      return res.status(200).json({ success: true, charge: 0, message: 'Free shipping!' });
    }

    // Weight based (grams)
    if (weight <= 500) charge = 49;
    else if (weight <= 1000) charge = 79;
    else if (weight <= 2000) charge = 99;
    else charge = 99 + Math.ceil((weight - 2000) / 500) * 20;

    return res.status(200).json({ success: true, charge, pincode });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { checkPincode, calculateShipping };