import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

// Helper to parse numeric amount safely, stripping commas and currency markers
function parseAmount(val: any): number {
  if (typeof val === 'number') return isNaN(val) ? 0 : Math.abs(val);
  if (!val) return 0;
  const cleaned = String(val).replace(/,/g, '').replace(/[^0-9.]/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

// Helper to normalize date to YYYY-MM-DD format
function normalizeDate(d: any): string {
  if (!d) return new Date().toISOString().split('T')[0];
  const s = String(d).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;

  // DD/MM/YYYY or DD-MM-YYYY
  const ddmmyyyy = s.match(/^(\d{1,2})[\/\.-](\d{1,2})[\/\.-](\d{4})$/);
  if (ddmmyyyy) {
    return `${ddmmyyyy[3]}-${ddmmyyyy[2].padStart(2, '0')}-${ddmmyyyy[1].padStart(2, '0')}`;
  }

  // YYYY/MM/DD
  const yyyymmdd = s.match(/^(\d{4})[\/\.-](\d{1,2})[\/\.-](\d{1,2})$/);
  if (yyyymmdd) {
    return `${yyyymmdd[1]}-${yyyymmdd[2].padStart(2, '0')}-${yyyymmdd[3].padStart(2, '0')}`;
  }

  const parsed = Date.parse(s);
  if (!isNaN(parsed)) {
    return new Date(parsed).toISOString().split('T')[0];
  }
  return new Date().toISOString().split('T')[0];
}

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
      : '"membership" (Membership Fund / ممبر شپ فنڈ)';

    const systemPrompt = `You are an expert institutional accountant and financial document analyst for Jamaat Islahul Muslimeen Punjab (JIM Punjab) / جماعت اصلاح المسلمین پنجاب.
You analyze financial receipts, vouchers, bank deposit slips, handwritten donation slips (چندہ پرچی), and multi-entry donation registers in English, Urdu, and Arabic.

Carefully inspect the provided document or picture.
Extract all donation / transaction records into this exact JSON structure:
{
  "entries": [
    {
      "receiptNo": string or null (numeric or receipt code, e.g. "101", "REC-1088"),
      "date": "YYYY-MM-DD" (convert any date format or Urdu date to YYYY-MM-DD),
      "donorName": string (Contributor or donor name in English or Urdu),
      "donorNameUrdu": string or null (Urdu script name if visible, e.g. حاجی محمد طارق),
      "branchName": string or null (Local branch name, e.g. "Main Branch Lahore", "Faisalabad City"),
      "zila": string or null (Punjab District, e.g. "Lahore", "Faisalabad", "Rawalpindi", "Multan", "Gujranwala", "Sialkot"),
      "phone": string (mobile number e.g. 0300-1234567, or empty string),
      "address": string (street or locality, or empty string),
      "city": string (Punjab city name e.g. Lahore, Faisalabad, Rawalpindi, Multan, Gujranwala, Sialkot, Bahawalpur, Sargodha, etc. Default to Lahore if not specified),
      "preferredPeriod": "Monthly" | "Quarterly" | "Half Yearly" | "Annually",
      "monthlyAmount": number or null,
      "quarterlyAmount": number or null,
      "halfYearlyAmount": number or null,
      "annuallyAmount": number or null,
      "targetMonth": "jan" | "feb" | "mar" | "apr" | "may" | "jun" | "jul" | "aug" | "sep" | "oct" | "nov" | "dec" or null (month paid for if indicated),
      "amount": number (Total donation/receipt amount as clean positive numeric number. DO NOT use commas in amount. e.g. 25000),
      "amountInWords": string or null,
      "paymentMode": "Cash" | "Cheque" | "Online" | "DD",
      "bankName": string (e.g. Meezan Bank, HBL, ABL, MCB. Empty string if Cash),
      "categoryId": string (Default to "membership"),
      "notes": string (Purpose or notes on receipt)
    }
  ],
  "rawSummary": string (brief 1-sentence summary of what document was read and total amount detected),
  "confidence": number (between 0.0 and 1.0)
}

Rules:
1. Always output strictly valid JSON only. No markdown ticks, no preamble.
2. If the document has multiple donation rows, output each row as a separate object inside "entries".
3. Amounts must be numeric (e.g. 25000, not "25,000" or "Rs 25000").`;

    // Candidate models in priority order (verified active for this key)
    const candidateModels = [
      'gemini-flash-lite-latest',
      'gemini-3.1-flash-lite-preview',
      'gemini-flash-latest',
      'gemini-3.5-flash',
      'gemini-3.8-flash',
      'gemini-pro-latest'
    ];

    let lastError: any = null;
    let extractedData: any = null;

    // Use official @google/genai SDK
    const ai = new GoogleGenAI({ apiKey });

    for (const model of candidateModels) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: [
            systemPrompt,
            {
              inlineData: {
                mimeType: finalMimeType,
                data: cleanBase64,
              },
            },
          ],
          config: {
            responseMimeType: 'application/json',
            temperature: 0.1,
          },
        });

        const fullText = response.text?.trim();

        if (fullText) {
          try {
            const clean = fullText.replace(/```json/gi, '').replace(/```/g, '').trim();
            extractedData = JSON.parse(clean);
          } catch (e1) {
            const jsonMatch = fullText.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
            if (jsonMatch) {
              extractedData = JSON.parse(jsonMatch[1]);
            }
          }

          if (extractedData) break;
        }
      } catch (err: any) {
        lastError = err;
        // Continue to next model in candidate list
      }
    }

    // Fallback: If SDK throws or fails, try direct REST endpoint as secondary fallback
    if (!extractedData) {
      for (const model of candidateModels) {
        try {
          const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
          const res = await fetch(url, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'x-goog-api-key': apiKey
            },
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

          if (res.ok) {
            const resJson = await res.json();
            const parts = resJson?.candidates?.[0]?.content?.parts || [];
            const txt = parts.map((p: any) => p.text || '').join('\n').trim();
            if (txt) {
              const clean = txt.replace(/```json/gi, '').replace(/```/g, '').trim();
              extractedData = JSON.parse(clean);
              if (extractedData) break;
            }
          }
        } catch (e) {
          // ignore fallback error
        }
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

    // Clean, validate, and format each entry
    const normalizedEntries = entries.map((entry: any, idx: number) => {
      const amount = parseAmount(entry.amount);
      const period: 'Monthly' | 'Quarterly' | 'Half Yearly' | 'Annually' = 
        ['Monthly', 'Quarterly', 'Half Yearly', 'Annually'].includes(entry.preferredPeriod)
          ? entry.preferredPeriod
          : (entry.monthlyAmount ? 'Monthly' : entry.annuallyAmount ? 'Annually' : 'Monthly');
      
      const monthlyAmount = parseAmount(entry.monthlyAmount) || (period === 'Monthly' ? amount : 0);
      const quarterlyAmount = parseAmount(entry.quarterlyAmount) || (period === 'Quarterly' ? amount : 0);
      const halfYearlyAmount = parseAmount(entry.halfYearlyAmount) || (period === 'Half Yearly' ? amount : 0);
      const annuallyAmount = parseAmount(entry.annuallyAmount) || (period === 'Annually' ? amount : 0);

      return {
        receiptNo: entry.receiptNo && String(entry.receiptNo).trim() !== '' ? String(entry.receiptNo).trim() : null,
        date: normalizeDate(entry.date),
        donorName: entry.donorName || `Donor #${idx + 1}`,
        donorNameUrdu: entry.donorNameUrdu || null,
        branchName: entry.branchName ? String(entry.branchName).trim() : 'Main Branch',
        zila: entry.zila ? String(entry.zila).trim() : (entry.city ? String(entry.city).trim() : 'Lahore'),
        phone: entry.phone ? String(entry.phone).trim() : '',
        address: entry.address ? String(entry.address).trim() : '',
        city: entry.city ? String(entry.city).trim() : 'Lahore',
        preferredPeriod: period,
        monthlyAmount,
        quarterlyAmount,
        halfYearlyAmount,
        annuallyAmount,
        targetMonth: entry.targetMonth || null,
        amount: amount || monthlyAmount || quarterlyAmount || halfYearlyAmount || annuallyAmount || 0,
        amountInWords: entry.amountInWords || null,
        paymentMode: ['Cash', 'Cheque', 'Online', 'DD'].includes(entry.paymentMode) ? entry.paymentMode : 'Cash',
        bankName: entry.bankName ? String(entry.bankName).trim() : '',
        categoryId: 'membership',
        notes: entry.notes ? String(entry.notes).trim() : 'Verified from document via Gemini AI',
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
