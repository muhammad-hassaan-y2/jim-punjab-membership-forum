import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { imageBase64, mimeType = 'image/jpeg' } = await req.json();

    if (!imageBase64) {
      return NextResponse.json(
        { success: false, error: 'No image data provided' },
        { status: 400 }
      );
    }

    // Extract raw base64 data (strip data URL prefix if included)
    const cleanBase64 = imageBase64.replace(/^data:[^;]+;base64,/, '');

    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'Gemini API key is not configured in .env' },
        { status: 500 }
      );
    }

    const systemPrompt = `You are an expert AI accountant and document analyst specialized in institutional financial receipts, handwritten donation slips (چندہ پرچی), vouchers, Islamic charity receipts (Zakat, Fitrana, Sadaqat, Madrasa, Welfare), bank deposit slips, invoices, and payment receipts in English and Urdu.

Analyze the image carefully and extract all transaction details into a strict JSON format with these exact keys:
- "receiptNo": string or null (e.g. "1", "105", "REC-045" if explicitly written, otherwise null)
- "date": string in YYYY-MM-DD format (if only DD/MM/YYYY or Urdu date like 24 ستمبر 2026, convert to YYYY-MM-DD; null if missing)
- "donorName": string (name of the person/organization making the payment or donation, in English or Urdu)
- "donorNameUrdu": string or null (Urdu transliteration/original name if visible)
- "address": string (street, mohalla, or area; empty string if none)
- "city": string (city name, e.g. Karachi, Lahore, Rawalpindi, Islamabad, Multan, Hyderabad, Kandiaro, Sukkur, Faisalabad, Peshawar, Quetta, etc.; empty string if not found)
- "preferredPeriod": string or null (Must be one of "Monthly", "Quarterly", "Half Yearly", "Annually", or null)
- "monthlyAmount": number or null (monthly donation amount if stated, else null)
- "quarterlyAmount": number or null (quarterly amount if stated, else null)
- "halfYearlyAmount": number or null (half-yearly amount if stated, else null)
- "annuallyAmount": number or null (annual amount if stated, else null)
- "amount": number (Total amount paid/received in numbers. If amount is in words e.g. "پندرہ ہزار", convert to 15000. Must be a positive number)
- "amountInWords": string or null (amount in words if written)
- "paymentMode": string (Must be one of: "Cash", "Cheque", "Online", "DD")
- "bankName": string (e.g. "Meezan Bank", "Allied Bank", "HBL", "MCB", "UBL", or empty string if Cash)
- "phone": string (mobile number or phone if written, else empty string)
- "categoryId": string (institutional fund classification: "zakat" for زکوٰۃ, "fitrat" for فطرانہ, "sadqat" for صدقات, "khirat" for خیرات, "charam_qurbani" for چرم قربانی, "membership" for ممبر شپ, "madrassah" for مدرسہ, or "general" for general donation)
- "notes": string (brief summary of purpose or any notes written on the receipt)
- "rawSummary": string (1-2 sentence concise executive explanation of what was detected in the image)
- "confidence": number (from 0 to 1, e.g. 0.95)

Return ONLY valid JSON. No conversational preamble, markdown backticks, or extra text.`;

    const candidateModels = [
      'gemini-3.5-flash',
      'gemini-flash-lite-latest',
      'gemini-3-flash-preview',
    ];

    let lastError: any = null;
    let extractedData: any = null;

    for (const model of candidateModels) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: systemPrompt },
                  {
                    inlineData: {
                      mimeType: mimeType || 'image/jpeg',
                      data: cleanBase64,
                    },
                  },
                ],
              },
            ],
            generationConfig: {
              responseMimeType: 'application/json',
              temperature: 0.1,
            },
          }),
        });

        if (!response.ok) {
          const errText = await response.text();
          lastError = new Error(`Model ${model} returned HTTP ${response.status}: ${errText}`);
          continue;
        }

        const resJson = await response.json();
        const textOutput = resJson?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (textOutput) {
          try {
            extractedData = JSON.parse(textOutput);
            break;
          } catch (parseErr) {
            // Try cleaning markdown ticks if present
            const cleaned = textOutput.replace(/```json/gi, '').replace(/```/g, '').trim();
            extractedData = JSON.parse(cleaned);
            break;
          }
        }
      } catch (err: any) {
        lastError = err;
      }
    }

    if (!extractedData) {
      throw lastError || new Error('Failed to extract data from image with Gemini');
    }

    return NextResponse.json({
      success: true,
      data: extractedData,
    });
  } catch (error: any) {
    console.error('Gemini receipt scan error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error processing image' },
      { status: 500 }
    );
  }
}
