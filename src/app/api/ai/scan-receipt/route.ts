import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      imageBase64, 
      mimeType = 'image/jpeg', 
      fileName = 'document',
      categories = []
    } = body;

    if (!imageBase64) {
      return NextResponse.json(
        { success: false, error: 'No document or image data provided' },
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

    // Determine normalized MIME type
    let finalMimeType = mimeType;
    if (fileName.toLowerCase().endsWith('.pdf') || mimeType === 'application/pdf') {
      finalMimeType = 'application/pdf';
    } else if (fileName.toLowerCase().endsWith('.png') || mimeType.includes('png')) {
      finalMimeType = 'image/png';
    } else if (fileName.toLowerCase().endsWith('.webp') || mimeType.includes('webp')) {
      finalMimeType = 'image/webp';
    } else {
      finalMimeType = 'image/jpeg';
    }

    const categoriesListStr = categories && categories.length > 0 
      ? categories.map((c: any) => `"${c.id}" (${c.nameEnglish} / ${c.nameUrdu || ''})`).join(', ')
      : '"zakat" (Zakat), "sadqat" (Sadaqat), "fitrat" (Fitrana), "madrassah" (Madrasa Fund), "construction" (Construction Fund), "membership" (Membership), "general" (General Donations)';

    const systemPrompt = `You are an expert AI accountant and document analyst specialized in institutional financial receipts, invoices, bank deposit slips, payment vouchers, handwritten donation slips (چندہ پرچی), and multi-entry financial records in English, Urdu, and Arabic numerals.

Analyze the uploaded document or image carefully.
It may be a single receipt/voucher, or a document/ledger page with multiple donation entries.

Extract ALL financial transaction records into a strict JSON format with this exact structure:
{
  "entries": [
    {
      "receiptNo": string or null,
      "date": "YYYY-MM-DD" or null (convert DD/MM/YYYY or Urdu dates e.g. "25 ستمبر 2026" to YYYY-MM-DD),
      "donorName": string (Name of contributor, payer, or organization),
      "donorNameUrdu": string or null,
      "phone": string (mobile number if present, else ""),
      "address": string (street, area, or address; empty string if none),
      "city": string (city name e.g. Karachi, Lahore, Rawalpindi, Islamabad, Multan, Hyderabad, Kandiaro, Sukkur, Faisalabad, etc.; empty string if not stated),
      "preferredPeriod": "Monthly" | "Quarterly" | "Half Yearly" | "Annually" | null,
      "monthlyAmount": number or null (amount if specified for monthly, else null),
      "quarterlyAmount": number or null (amount if specified for quarterly, else null),
      "halfYearlyAmount": number or null (amount if specified for half yearly, else null),
      "annuallyAmount": number or null (amount if specified for annually, else null),
      "amount": number (Total amount in numeric digits. If written in words e.g. "دس ہزار", convert to 10000. Must be a positive number),
      "amountInWords": string or null,
      "paymentMode": "Cash" | "Cheque" | "Online" | "DD",
      "bankName": string (e.g. "Meezan Bank", "HBL", "Allied Bank", "MCB", "UBL", etc. Empty string if Cash),
      "categoryId": string (Must match one of available categories: ${categoriesListStr}. Default to "general" or "zakat" based on context),
      "notes": string (brief summary of purpose or notations on the document)
    }
  ],
  "rawSummary": string (1-2 sentence executive explanation of what document was analyzed and total records/amounts detected),
  "confidence": number (between 0.0 and 1.0)
}

Rules:
1. If there is only 1 transaction on the receipt, "entries" must contain that 1 object.
2. If there are multiple entries/rows on a donation sheet or voucher, include an object for EACH entry in "entries".
3. Always return valid JSON only. No markdown ticks, no preamble.`;

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
                      mimeType: finalMimeType,
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
        const parts = resJson?.candidates?.[0]?.content?.parts || [];
        const fullText = parts.map((p: any) => p.text || '').join('\n').trim();

        if (fullText) {
          try {
            // First try direct JSON.parse
            let clean = fullText.replace(/```json/gi, '').replace(/```/g, '').trim();
            extractedData = JSON.parse(clean);
          } catch (e1) {
            // Fallback: match outermost { ... }
            const jsonMatch = fullText.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
            if (jsonMatch) {
              extractedData = JSON.parse(jsonMatch[1]);
            }
          }

          if (extractedData) break;
        }
      } catch (err: any) {
        lastError = err;
      }
    }

    if (!extractedData) {
      throw lastError || new Error('Gemini could not analyze the document.');
    }

    // Normalize entries: handle single object or multi-entries
    let entries: any[] = [];
    if (Array.isArray(extractedData.entries)) {
      entries = extractedData.entries;
    } else if (Array.isArray(extractedData)) {
      entries = extractedData;
    } else if (extractedData.receiptNo !== undefined || extractedData.amount !== undefined || extractedData.donorName !== undefined) {
      entries = [extractedData];
    } else if (extractedData.transactions && Array.isArray(extractedData.transactions)) {
      entries = extractedData.transactions;
    } else {
      entries = [extractedData];
    }

    // Clean and validate each entry
    const normalizedEntries = entries.map((entry: any, idx: number) => {
      const amount = Number(entry.amount) || 0;
      const period = entry.preferredPeriod || (entry.monthlyAmount ? 'Monthly' : entry.annuallyAmount ? 'Annually' : 'Monthly');
      
      return {
        receiptNo: entry.receiptNo && String(entry.receiptNo).trim() !== '' ? String(entry.receiptNo).trim() : null,
        date: entry.date || new Date().toISOString().split('T')[0],
        donorName: entry.donorName || `Donor #${idx + 1}`,
        donorNameUrdu: entry.donorNameUrdu || null,
        phone: entry.phone || '',
        address: entry.address || '',
        city: entry.city || 'Karachi',
        preferredPeriod: period,
        monthlyAmount: entry.monthlyAmount || (period === 'Monthly' ? amount : 0),
        quarterlyAmount: entry.quarterlyAmount || (period === 'Quarterly' ? amount : 0),
        halfYearlyAmount: entry.halfYearlyAmount || (period === 'Half Yearly' ? amount : 0),
        annuallyAmount: entry.annuallyAmount || (period === 'Annually' ? amount : 0),
        amount: amount,
        amountInWords: entry.amountInWords || null,
        paymentMode: ['Cash', 'Cheque', 'Online', 'DD'].includes(entry.paymentMode) ? entry.paymentMode : 'Cash',
        bankName: entry.bankName || '',
        categoryId: entry.categoryId || 'general',
        notes: entry.notes || 'Verified from document via Gemini AI',
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        entries: normalizedEntries,
        rawSummary: extractedData.rawSummary || `Successfully extracted ${normalizedEntries.length} transaction record(s) from document.`,
        confidence: extractedData.confidence ?? 0.95,
      },
    });
  } catch (error: any) {
    console.error('Gemini document scan error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error processing document' },
      { status: 500 }
    );
  }
}
