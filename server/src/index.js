require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 3001;
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json());

// Health check / seed verification
app.get('/api/health', async (req, res) => {
  const [users, pilots, aircraft, fbos, purchases, responses, answers, questions] = await Promise.all([
    prisma.user.count(),
    prisma.pilot.count(),
    prisma.aircraft.count(),
    prisma.fbo.count(),
    prisma.fuelPurchase.count(),
    prisma.feedbackResponse.count(),
    prisma.surveyAnswer.count(),
    prisma.surveyQuestion.count(),
  ]);

  const flagged = await prisma.feedbackResponse.count({ where: { flagged: true } });
  const resolved = await prisma.feedbackResponse.count({ where: { flagged: true, resolvedAt: { not: null } } });

  res.json({
    status: 'ok',
    database: {
      users,
      pilots,
      aircraft,
      fbos,
      fuelPurchases: purchases,
      feedbackResponses: responses,
      surveyAnswers: answers,
      surveyQuestions: questions,
      flaggedResponses: flagged,
      resolvedFlags: resolved,
    },
  });
});

// Receipt OCR via Taggun
app.post('/api/receipt/scan', upload.single('file'), async (req, res) => {
  const apiKey = process.env.TAGGUN_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'TAGGUN_API_KEY not configured' });
  }
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    const FormData = (await import('form-data')).default;
    const form = new FormData();
    form.append('file', req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });

    const response = await fetch('https://api.taggun.io/api/receipt/v1/verbose/file', {
      method: 'POST',
      headers: {
        apikey: apiKey,
        ...form.getHeaders(),
      },
      body: form,
    });

    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).json({ error: `Taggun error: ${text}` });
    }

    const taggunData = await response.json();

    // Map Taggun response to our receipt format
    const receipt = {
      fbo_name: taggunData.merchantName?.data || '',
      airport_name: taggunData.merchantAddress?.data || '',
      airport_icao: '',
      date: taggunData.date?.data || new Date().toISOString().slice(0, 10),
      time: taggunData.date?.data ? new Date(taggunData.date.data).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) : '',
      tail_number: '',
      fuel_type: 'Jet-A',
      gallons: 0,
      price_per_gallon: 0,
      total_amount: taggunData.totalAmount?.data || 0,
      invoice_number: taggunData.invoiceNumber?.data || '',
    };

    // Try to extract fuel-specific data from line items
    if (taggunData.amounts) {
      for (const item of taggunData.amounts) {
        const desc = (item.text || '').toLowerCase();
        if (desc.includes('gal') || desc.includes('fuel') || desc.includes('jet')) {
          if (item.data) {
            // Try to parse gallons and price from line items
            const galMatch = desc.match(/([\d,.]+)\s*gal/i);
            if (galMatch) receipt.gallons = parseFloat(galMatch[1].replace(',', ''));
            const priceMatch = desc.match(/\$\s*([\d,.]+)\s*\/?\s*gal/i);
            if (priceMatch) receipt.price_per_gallon = parseFloat(priceMatch[1].replace(',', ''));
          }
        }
      }
    }

    // Calculate price_per_gallon if we have total and gallons but not price
    if (receipt.gallons > 0 && receipt.total_amount > 0 && receipt.price_per_gallon === 0) {
      receipt.price_per_gallon = +(receipt.total_amount / receipt.gallons).toFixed(2);
    }

    // Try to extract tail number from text
    if (taggunData.text?.text) {
      const tailMatch = taggunData.text.text.match(/\b(N\d{1,5}[A-Z]{0,2})\b/i);
      if (tailMatch) receipt.tail_number = tailMatch[1].toUpperCase();
    }

    res.json({ receipt, raw: taggunData });
  } catch (err) {
    console.error('Receipt scan error:', err);
    res.status(500).json({ error: 'Failed to process receipt' });
  }
});

app.listen(PORT, () => {
  console.log(`Flightsheet server running on port ${PORT}`);
});
