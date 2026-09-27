import 'dotenv/config';
import { neon } from '@neondatabase/serverless';
import { convertNumberToUrduWords } from '../src/utils/urduNumberToWords.ts';
import { convertNumberToEnglishWords } from '../src/utils/englishNumberToWords.ts';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("Missing DATABASE_URL");
  process.exit(1);
}

const sql = neon(connectionString);

// Data structure builder
function makeTx({
  sheetId,
  index,
  donorName,
  donorNameUrdu = '',
  branchName = '',
  zila = '',
  phone = '',
  sarparastAla = '',
  profession = '',
  monthlyAmount = 0,
  quarterlyAmount = 0,
  annuallyAmount = 0,
  targetAmount = 0,
  paid = 0,
  notes = '',
  monthsData = {},
  paymentMode = 'Cash'
}) {
  const receiptNo = String(index);
  const id = `tx-${sheetId}-${index}`;
  const amount = Number(paid) || 0;
  
  // Calculate targetAmount if not provided
  let calculatedTarget = Number(targetAmount) || 0;
  if (!calculatedTarget) {
    if (annuallyAmount > 0) calculatedTarget = annuallyAmount;
    else if (quarterlyAmount > 0) calculatedTarget = quarterlyAmount * 4;
    else if (monthlyAmount > 0) calculatedTarget = monthlyAmount * 12;
    else calculatedTarget = amount;
  }

  const enWords = amount > 0 ? convertNumberToEnglishWords(amount) : '';
  const urWords = amount > 0 ? convertNumberToUrduWords(amount) : '';

  return {
    id,
    sheet_id: sheetId,
    receipt_no: receiptNo,
    date: '2026-09-27',
    donor_name: donorName.trim(),
    donor_name_urdu: donorNameUrdu.trim(),
    branch_name: branchName.trim(),
    zila: zila.trim(),
    phone: phone.trim(),
    sarparast_ala: sarparastAla.trim(),
    profession: profession.trim(),
    address: branchName ? `${branchName}, ${zila}` : zila,
    address_urdu: '',
    monthly_amount: Number(monthlyAmount) || 0,
    quarterly_amount: Number(quarterlyAmount) || 0,
    annually_amount: Number(annuallyAmount) || 0,
    target_amount: calculatedTarget,
    months_data: monthsData,
    amount: amount,
    amount_in_words_en: enWords,
    amount_in_words_ur: urWords,
    type: 'income',
    category_id: 'membership',
    payment_method: paymentMode,
    bank_name: '',
    check_number: '',
    transaction_id: '',
    description: notes.trim(),
    description_urdu: '',
    recorded_by: 'Markaz Admin',
    verified_by: 'Markaz Finance Office',
  };
}

// -------------------------------------------------------------
// 1. SIALKOT ZONE 1 (sheet-26-sialkot-zone-1) - 17 records
// -------------------------------------------------------------
const sialkot1Data = [
  { name: "ustaad Nasrullah Tahiri", branch: "Adalat Ghar Old", phone: "+92 346 6617733", prof: "Gloves Maker", target: 12000, paid: 10000 },
  { name: "Hafiz Akhtar Tahiri", branch: "Ugoki", phone: "+92 300 6114735", prof: "Sergical Maker", target: 12000, paid: 1000 },
  { name: "Saeed Ahmed Tahiri", branch: "Adalat Ghar Old", phone: "+92 343 6792001", prof: "Advocate", target: 12000, paid: 8000 },
  { name: "Muhammad Zeshan Tahiri", branch: "Adalat Ghar Old", phone: "+92 346 4194002", prof: "Hosiery", target: 12000, paid: 8000 },
  { name: "Aftab Allam Tahiri", branch: "Adalat Ghar Old", phone: "+92 333 8760598", prof: "Karyana Store", target: 12000, paid: 8000 },
  { name: "Naseer Ahmed Tahiri", branch: "Mallane shreef", phone: "+92 305 7919716", prof: "Karyana Store", target: 12000, paid: 9000 },
  { name: "Muhammad Naeem Tahiri", branch: "Mallane shreef", phone: "+92 302 8091544", prof: "Printing", target: 12000, paid: 6000 },
  { name: "Dr Azeem Tahiri", branch: "Kishny wali", phone: "+92 321 7145773", prof: "Doctor", target: 12000, paid: 12000 },
  { name: "Imran Sindi Tahiri", branch: "Adalat Ghar Old", phone: "+92 348 6767593", prof: "Hosiery", target: 12000, paid: 6000 },
  { name: "Ali Hassan Tahiri", branch: "Adalat Ghar Old", phone: "+92 348 6767593", prof: "Hosiery", target: 12000, paid: 6000 },
  { name: "Naseer Ahmed Tahiri", branch: "Koli Behram", phone: "+92 345 6726898", prof: "Karyana Store", target: 12000, paid: 8000 },
  { name: "Muhammad Zafar Tahiri", branch: "Koli Behram", phone: "+92 304 0609763", prof: "Sergical Maker", target: 12000, paid: 8000 },
  { name: "Muhammad Mustafa Tahiri", branch: "Koli Behram", phone: "+92 331 4233193", prof: "Karyana Store", target: 12000, paid: 8000 },
  { name: "Mian Raza Hussain Tahiri", branch: "Koli Behram", phone: "+92 302 6123784", prof: "property advisor", target: 12000, paid: 8000 },
  { name: "Muhammad Shahid Tahiri", branch: "Koli Behram", phone: "+92 345 6726898", prof: "Business", target: 12000, paid: 4000 },
  { name: "Muhammad Arshad Tahiri", branch: "Pasrur", phone: "+92 302 6116453", prof: "Paper Making", target: 12000, paid: 8000 },
  { name: "Dr Azeem Tahiri (Extra Help)", branch: "Kishny wali", phone: "+92 321 7145773", prof: "Doctor", target: 6000, paid: 6000, notes: "Extra Help" },
].map((r, i) => makeTx({
  sheetId: 'sheet-26-sialkot-zone-1',
  index: i + 1,
  donorName: r.name,
  branchName: r.branch,
  zila: 'Sialkot Zone 1',
  phone: r.phone,
  sarparastAla: '',
  profession: r.prof,
  targetAmount: r.target,
  paid: r.paid,
  notes: r.notes || ''
}));

// -------------------------------------------------------------
// 2. SIALKOT ZONE 2 (sheet-27-sialkot-zone-2) - 32 records
// -------------------------------------------------------------
const sialkot2Data = [
  { name: "INSPECTOR IQBAL SAHIB", branch: "Cant", phone: "0333-7151708", guardian: "", annual: 12000, monthly: 0, quarterly: 0 },
  { name: "MUHAMMAD AMJAD SB", branch: "GHOS PURA BRANCH", phone: "", guardian: "K AFZAL SB", annual: 0, monthly: 1000, quarterly: 0 },
  { name: "MALIK SHAHID", branch: "GHOS PURA BRANCH", phone: "", guardian: "K AFZAL SB", annual: 12000, monthly: 0, quarterly: 0 },
  { name: "MUHAMMAD AKHTAR", branch: "GHOS PURA BRANCH", phone: "", guardian: "K AFZAL SB", annual: 12000, monthly: 0, quarterly: 0 },
  { name: "KHALIFA MUHAMMAD AFZAL SB", branch: "GHOS PURA BRANCH", phone: "0333-8758755", guardian: "K AFZAL SB", annual: 12000, monthly: 0, quarterly: 0 },
  { name: "Eng Aslam Tahiri and branch member", branch: "Hunterpura", phone: "0309-9816268", guardian: "", annual: 0, monthly: 6000, quarterly: 0 },
  { name: "KHALIFA SYED GHULAM RASOOL SHAH SB", branch: "KHAROTA SYDDAN", phone: "", guardian: "sajjad sb", annual: 0, monthly: 1000, quarterly: 0 },
  { name: "Syed Arif Hussain Shah", branch: "KHAROTA SYDDAN", phone: "", guardian: "sajjad sb", annual: 0, monthly: 1000, quarterly: 0 },
  { name: "Master Ishaq", branch: "KHAROTA SYDDAN", phone: "", guardian: "sajjad sb", annual: 0, monthly: 1000, quarterly: 0 },
  { name: "M Sajjad Ali", branch: "KHAROTA SYDDAN", phone: "0333-8623384", guardian: "sajjad sb", annual: 0, monthly: 1000, quarterly: 0 },
  { name: "Haris Ejaz", branch: "KHAROTA SYDDAN", phone: "", guardian: "sajjad sb", annual: 0, monthly: 1000, quarterly: 0 },
  { name: "Muhammad Ejaz", branch: "KHAROTA SYDDAN", phone: "", guardian: "sajjad sb", annual: 0, monthly: 1000, quarterly: 0 },
  { name: "Muhammad Ejaz Faimly", branch: "KHAROTA SYDDAN", phone: "", guardian: "sajjad sb", annual: 0, monthly: 1000, quarterly: 0 },
  { name: "BASHARAT ALI", branch: "Muzaffar Pur", phone: "", guardian: "FARMAN ALI", annual: 0, monthly: 1000, quarterly: 0 },
  { name: "NADEEM HUSSAIN TAHIRI", branch: "Muzaffar Pur", phone: "", guardian: "FARMAN ALI", annual: 0, monthly: 1000, quarterly: 0 },
  { name: "FARMAN ALI", branch: "Muzaffar Pur", phone: "0332-8028616", guardian: "FARMAN ALI", annual: 0, monthly: 1000, quarterly: 0 },
  { name: "KHALIFA MUHAMAMD YOUSAF", branch: "NAWAPIND TF BRANCH", phone: "0300-7131634", guardian: "", annual: 0, monthly: 1000, quarterly: 0 },
  { name: "Muhammad Awais Tahiri", branch: "NAWAPIND TF BRANCH", phone: "0301-6366915", guardian: "", annual: 0, monthly: 1000, quarterly: 0 },
  { name: "Muhammad Mushtaq Tahiri", branch: "NAWAPIND TF BRANCH", phone: "0300-9615625", guardian: "", annual: 0, monthly: 1000, quarterly: 0 },
  { name: "Muhammad IMRAN Tahiri", branch: "NAWAPIND TF BRANCH", phone: "0345-7196947", guardian: "", annual: 0, monthly: 1000, quarterly: 0 },
  { name: "Muhammad RIZWAN Tahir Tahiri", branch: "NAWAPIND TF BRANCH", phone: "", guardian: "IMRAN TAHIRI", annual: 0, monthly: 1000, quarterly: 0 },
  { name: "Asad Ali Tahiri", branch: "NAWAPIND TF BRANCH", phone: "0310-7291726", guardian: "", annual: 0, monthly: 1000, quarterly: 0 },
  { name: "Faqir Akram Tahiri", branch: "NAWAPIND TF BRANCH", phone: "0321-6145176", guardian: "", annual: 0, monthly: 1000, quarterly: 0 },
  { name: "USMAN WARIS TAHIRI", branch: "PAKKA GHARA", phone: "0308-2238233", guardian: "", annual: 12000, monthly: 0, quarterly: 0 },
  { name: "AMMAD NAWAZ SB", branch: "Sambreal Branch", phone: "", guardian: "ADNAN TAHIRI", annual: 0, monthly: 1000, quarterly: 0 },
  { name: "Muhammad Adnan Tahiri", branch: "Sambreal Branch", phone: "0305-1000951", guardian: "ADNAN TAHIRI", annual: 0, monthly: 0, quarterly: 3000 },
  { name: "Salman Ali Tahiri", branch: "Sambreal Branch", phone: "", guardian: "ADNAN TAHIRI", annual: 0, monthly: 0, quarterly: 3000 },
  { name: "REHMAT ALI", branch: "Sambreal Branch", phone: "", guardian: "ADNAN TAHIRI", annual: 0, monthly: 0, quarterly: 3000 },
  { name: "WAJID MEHMOOD TAHIRI", branch: "Sambreal Branch", phone: "", guardian: "ADNAN TAHIRI", annual: 0, monthly: 0, quarterly: 3000 },
  { name: "MUHAMMAD IRFAN MUBARAK", branch: "SHAHAB PURA", phone: "", guardian: "", annual: 0, monthly: 2000, quarterly: 0 },
  { name: "HAJI SARWER TAHIRI", branch: "UGOKI", phone: "0322-7307917", guardian: "", annual: 12000, monthly: 0, quarterly: 0 },
  { name: "MB FARHAN TAHIRI", branch: "UGOKI", phone: "0345-6773311", guardian: "", annual: 12000, monthly: 0, quarterly: 0 },
].map((r, i) => makeTx({
  sheetId: 'sheet-27-sialkot-zone-2',
  index: i + 1,
  donorName: r.name,
  branchName: r.branch,
  zila: 'Sialkot Zone 2',
  phone: r.phone,
  sarparastAla: r.guardian,
  profession: 'Business / Service',
  monthlyAmount: r.monthly,
  quarterlyAmount: r.quarterly,
  annuallyAmount: r.annual,
  targetAmount: r.annual || (r.monthly ? r.monthly * 12 : (r.quarterly ? r.quarterly * 4 : 12000)),
  paid: 0,
  notes: 'Membership Performa 2026'
}));

// -------------------------------------------------------------
// 3. MULTAN (sheet-43-multan) - 26 records
// -------------------------------------------------------------
const multanData = [
  { name: "Khalifa M Rafiq sb", branch: "Alfalah Market new Multan", phone: "0308-5035250", guardian: "Self", prof: "Business", target: 12000, paid: 12000 },
  { name: "Khlifa shah Nawaz sb", branch: "House # 50 V block new multan", phone: "0301-7415385", guardian: "Self", prof: "Employee", target: 12000, paid: 5000 },
  { name: "Abdul Rehman", branch: "House # 50 V block new multan", phone: "0301-7415385", guardian: "Khlifa shah Nawaz sb", prof: "Student", target: 12000, paid: 5000 },
  { name: "Mubasher Ali", branch: "1499/5 Wapda Town phase 2", phone: "0345-4840444", guardian: "Khalifa M Rafiq sb", prof: "Business", target: 12000, paid: 12000 },
  { name: "M Shafiq", branch: "Alfalah Market new Multan", phone: "0307-7969546", guardian: "Khalifa M Rafiq sb", prof: "Employee", target: 12000, paid: 0 },
  { name: "Mrs M Shafiq", branch: "Alfalah Market new Multan", phone: "0307-7969546", guardian: "Khalifa M Rafiq sb", prof: "Housewife", target: 12000, paid: 0 },
  { name: "Hafiz M Arshad", branch: "Alfalah Market new Multan", phone: "0308-5035250", guardian: "Khalifa M Rafiq sb", prof: "Business", target: 12000, paid: 11000 },
  { name: "Muhammad Waseeq", branch: "Alfalah Market new Multan", phone: "0301-7469669", guardian: "Khalifa M Rafiq sb", prof: "Business", target: 12000, paid: 2000 },
  { name: "Mrs M Waseeq", branch: "Alfalah Market new Multan", phone: "0301-7469669", guardian: "Khalifa M Rafiq sb", prof: "Housewife", target: 12000, paid: 20000 },
  { name: "Abdul Waheed", branch: "Rehman Pura Samijabad No1 multan", phone: "0301-7508367", guardian: "Self", prof: "Rtd Employee", target: 12000, paid: 7000 },
  { name: "Muhammad Musharaf", branch: "House no 1 St No 2 V block New Multan", phone: "0307-8660622", guardian: "Self", prof: "Rtd Employee", target: 12000, paid: 12000 },
  { name: "Tahir Javed", branch: "House No 56 G block Royal Orchad", phone: "0333-6114406", guardian: "Self", prof: "Employee", target: 12000, paid: 0 },
  { name: "Zaffar Iqbal", branch: "Makkah Town Multan", phone: "0301-7407911", guardian: "Self", prof: "Business", target: 12000, paid: 0 },
  { name: "Ghulam Rasool", branch: "House No 4 St no 6 W block New Multan", phone: "0306-8151307", guardian: "Self", prof: "Rtd Employee", target: 6000, paid: 0 },
  { name: "Khuhrsheed Ahmed", branch: "Street No 7 shah town phase 1", phone: "0301-7581255", guardian: "Self", prof: "Goldsmith", target: 12000, paid: 0 },
  { name: "M Yousaf", branch: "326/C Strt No 3 Khushhal colony", phone: "0300-0740913", guardian: "Self", prof: "Rtd Employee", target: 12000, paid: 0 },
  { name: "Fouji M Ashraf", branch: "House No 14 st No 3 W block New Multan", phone: "0302-7317359", guardian: "Self", prof: "Rtd Employee", target: 6000, paid: 3000 },
  { name: "M Afzal Khan", branch: "2027/9 Mohala Keeri Afghanan Multan", phone: "0302-7378775", guardian: "Self", prof: "Employee", target: 12000, paid: 7000 },
  { name: "Rao Umer Hayat", branch: "House No 21 St No U block New Multan", phone: "0301-7489805", guardian: "Self", prof: "Rtd Employee", target: 12000, paid: 1000 },
  { name: "Raaj Wali", branch: "Street No 2 zikkria town phase 2", phone: "0300-5729809", guardian: "Self", prof: "Employee", target: 6000, paid: 1000 },
  { name: "Mrs Abdul Waheed", branch: "Rehman Pura Samijabad No1 multan", phone: "0301-7508367", guardian: "Abdul waheed", prof: "Housewife", target: 6000, paid: 0 },
  { name: "Hammad Ali", branch: "Rehman Pura Samijabad No1 multan", phone: "0301-7508367", guardian: "Abdul waheed", prof: "Employee", target: 6000, paid: 0 },
  { name: "Abdul Ghafoor", branch: "Alraheem Colony Sewra chowk Multan", phone: "0301-7878991", guardian: "Self", prof: "Employee", target: 12000, paid: 0 },
  { name: "Abdul Majeed Masoomi", branch: "Shop no 1439 Qadirabad samijabad no1 Multan", phone: "0308-4757037", guardian: "Self", prof: "Rtd Employee", target: 12000, paid: 0 },
  { name: "Ajmal Ghaffar", branch: "House no 2/C U block New Multan", phone: "0345-6322425", guardian: "Self", prof: "Employee", target: 12000, paid: 6000 },
  { name: "Fiaz Ahmed", branch: "Mohallah Mughalpura samijabad no 1 multan", phone: "0303-6305983", guardian: "Self", prof: "Shopkeeper", target: 6000, paid: 0 },
].map((r, i) => makeTx({
  sheetId: 'sheet-43-multan',
  index: i + 1,
  donorName: r.name,
  branchName: r.branch,
  zila: 'Multan',
  phone: r.phone,
  sarparastAla: r.guardian,
  profession: r.prof,
  targetAmount: r.target,
  paid: r.paid,
  notes: `Annual Report 2026 Multan`
}));

// -------------------------------------------------------------
// 4. KHANEWAL (sheet-16-khanewal) - 10 records
// -------------------------------------------------------------
const khanewalData = [
  { name: "Naveed Irfan", branch: "Khanewal City", phone: "0307-1207657", guardian: "Self", prof: "Employee", target: 12000, paid: 12000 },
  { name: "Ahmed Abdullah", branch: "Khanewal City", phone: "", guardian: "Naveed Irfan", prof: "Student", target: 12000, paid: 8000 },
  { name: "Muhammad Waleed", branch: "Khanewal City", phone: "", guardian: "Naveed Irfan", prof: "Student", target: 12000, paid: 8000 },
  { name: "Muhammad Abdul Raheem", branch: "Khanewal City", phone: "", guardian: "Naveed Irfan", prof: "Student", target: 12000, paid: 8000 },
  { name: "Muhammad Hasnain", branch: "Khanewal City", phone: "", guardian: "Naveed Irfan", prof: "Student", target: 12000, paid: 8000 },
  { name: "Zain ul abdeen", branch: "Khanewal City", phone: "", guardian: "Naveed Irfan", prof: "Student", target: 12000, paid: 6000 },
  { name: "Muhammad Qasim", branch: "Khanewal City", phone: "0313-3029290", guardian: "Self", prof: "Business", target: 12000, paid: 12000 },
  { name: "Muhammad Faizan", branch: "Khanewal City", phone: "0323-2047270", guardian: "Muhammad Qasim", prof: "Business", target: 12000, paid: 12000 },
  { name: "Muhammad Ikram", branch: "Khanewal City", phone: "", guardian: "Self", prof: "Business", target: 12000, paid: 12000 },
  { name: "Muhammad Imran", branch: "Khanewal City", phone: "", guardian: "Self", prof: "Employee", target: 12000, paid: 12000 },
].map((r, i) => makeTx({
  sheetId: 'sheet-16-khanewal',
  index: i + 1,
  donorName: r.name,
  branchName: r.branch,
  zila: 'Khanewal',
  phone: r.phone,
  sarparastAla: r.guardian,
  profession: r.prof,
  targetAmount: r.target,
  paid: r.paid,
  notes: `Annual Report 2026 Khanewal`
}));

// -------------------------------------------------------------
// 5. FAISALABAD ZONE 3 (sheet-31-faisalabad-zone-3) - 50 records
// -------------------------------------------------------------
const fsdData = [
  { name: "Amir Waqas", branch: "FSD Zone 3", phone: "0305-2239056", guardian: "ML.Ramzan Sahib", target: 12000, paid: 12000 },
  { name: "Umar Waqas", branch: "FSD Zone 3", phone: "0303-8620482", guardian: "ML.Ramzan Sahib", target: 12000, paid: 12000 },
  { name: "Athar Waqas", branch: "FSD Zone 3", phone: "0308-1397482", guardian: "ML.Ramzan Sahib", target: 12000, paid: 12000 },
  { name: "Ehtisham Waqas", branch: "FSD Zone 3", phone: "0309-4248836", guardian: "ML.Ramzan Sahib", target: 12000, paid: 12000 },
  { name: "Muhammad Hassan", branch: "FSD Zone 3", phone: "0305-2239056", guardian: "ML.Ramzan Sahib", target: 12000, paid: 12000 },
  { name: "Haider Ali", branch: "FSD Zone 3", phone: "0305-2239056", guardian: "ML.Ramzan Sahib", target: 12000, paid: 12000 },
  { name: "Muhammad Saqlain", branch: "FSD Zone 3", phone: "0306-4686562", guardian: "ML. Amanat Ali Sahib", target: 6000, paid: 0, monthly: 500 },
  { name: "Nisar Ahmad", branch: "FSD Zone 3", phone: "0302-4631750", guardian: "ML.Ramzan Sahib", target: 6000, paid: 0 },
  { name: "Muhammad Younas", branch: "FSD Zone 3", phone: "0300-7841121", guardian: "ML. Riyasat Ali Sahib", target: 12000, paid: 1000, monthly: 1000 },
  { name: "Muhammad Shahid", branch: "FSD Zone 3", phone: "0301-7273340", guardian: "ML. Riyasat Ali Sahib", target: 12000, paid: 1000, monthly: 1000 },
  { name: "Muhammad Shakeel", branch: "FSD Zone 3", phone: "0301-6020352", guardian: "ML. Riyasat Ali Sahib", target: 12000, paid: 1000, monthly: 1000 },
  { name: "Shoukat Ali", branch: "FSD Zone 3", phone: "0300-7253636", guardian: "Salah udeen Sahib", target: 12000, paid: 1000, monthly: 1000 },
  { name: "Ghulam Mustafa", branch: "FSD Zone 3", phone: "0300-7841943", guardian: "Rana Dilber Sahib", target: 6000, paid: 0, monthly: 500 },
  { name: "Muhammad Saeed Ahmad", branch: "FSD Zone 3", phone: "0300-4928132", guardian: "ML.Ramzan Sahib", target: 6000, paid: 6000 },
  { name: "Muhammad Hanif Ahmad", branch: "FSD Zone 3", phone: "0305-4466562", guardian: "ML.Ramzan Sahib", target: 6000, paid: 6000 },
  { name: "Rana Mudassar", branch: "FSD Zone 3", phone: "0300-8880493", guardian: "ML.Ramzan Sahib", target: 6000, paid: 500, monthly: 500 },
  { name: "Sarfraz Ahmad", branch: "FSD Zone 3", phone: "0308-8449428", guardian: "ML.Ramzan Sahib", target: 12000, paid: 1000, monthly: 1000 },
  { name: "Muhammad Asghar", branch: "FSD Zone 3", phone: "0302-3325149", guardian: "ML.Ramzan Sahib", target: 6000, paid: 500, monthly: 500 },
  { name: "Muhammad Tariq Boota", branch: "FSD Zone 3", phone: "0304-4325619", guardian: "ML. Tahir Sahib", target: 12000, paid: 1000, monthly: 1000 },
  { name: "Muhammad Riaz", branch: "FSD Zone 3", phone: "0301-4010954", guardian: "ML.Ramzan Sahib", target: 12000, paid: 1000, monthly: 1000 },
  { name: "Rana Muhammad Akmal", branch: "FSD Zone 3", phone: "0300-6532772", guardian: "ML.Ramzan Sahib", target: 6000, paid: 0, monthly: 500 },
  { name: "Rana Mohsin", branch: "FSD Zone 3", phone: "0306-4213558", guardian: "ML.Ramzan Sahib", target: 6000, paid: 0, monthly: 500 },
  { name: "Rana Ahsan", branch: "FSD Zone 3", phone: "0321-7292562", guardian: "ML.Ramzan Sahib", target: 6000, paid: 0, monthly: 500 },
  { name: "Sharafat Ali", branch: "FSD Zone 3", phone: "0301-4377562", guardian: "ML.Ramzan Sahib", target: 12000, paid: 0, monthly: 1000 },
  { name: "Fahad Abbas", branch: "FSD Zone 3", phone: "0301-3162501", guardian: "ML.Ramzan Sahib", target: 12000, paid: 0, monthly: 1000 },
  { name: "Haji Amanat Ali", branch: "FSD Zone 3", phone: "0306-3323662", guardian: "Haji Amanat Sahib", target: 6000, paid: 0, monthly: 500 },
  { name: "Atta Ur Rehman", branch: "FSD Zone 3", phone: "0300-4914301", guardian: "ML.Ramzan Sahib", target: 6000, paid: 6000 },
  { name: "Rana Athar Aqeel", branch: "FSD Zone 3", phone: "0309-7441421", guardian: "ML. Sadeeq Sahib", target: 6000, paid: 6000 },
  { name: "Muhammad Khalil", branch: "FSD Zone 3", phone: "0300-6665708", guardian: "ML. Sadeeq Sahib", target: 12000, paid: 12000 },
  { name: "Abdul Wakeel", branch: "FSD Zone 3", phone: "0300-8836810", guardian: "ML. Sadeeq Sahib", target: 12000, paid: 12000 },
  { name: "Muhammad Shakeel", branch: "FSD Zone 3", phone: "0300-3663958", guardian: "ML. Sadeeq Sahib", target: 12000, paid: 12000 },
  { name: "Hamza Shakeel", branch: "FSD Zone 3", phone: "0346-0159887", guardian: "ML. Sadeeq Sahib", target: 12000, paid: 12000 },
  { name: "Hassan Shabbir", branch: "FSD Zone 3", phone: "0319-3226152", guardian: "ML. Sadeeq Sahib", target: 12000, paid: 12000 },
  { name: "Abdullah Athar", branch: "FSD Zone 3", phone: "0306-9728643", guardian: "ML. Sadeeq Sahib", target: 12000, paid: 12000 },
  { name: "Sajid Ali", branch: "FSD Zone 3", phone: "0343-7681665", guardian: "ML. Sadeeq Sahib", target: 10000, paid: 0 },
  { name: "Hafiz Shahzad", branch: "FSD Zone 3", phone: "0305-4960205", guardian: "ML. Sadeeq Sahib", target: 6000, paid: 0 },
  { name: "Asad Javed", branch: "FSD Zone 3", phone: "0301-4158837", guardian: "ML. Sadeeq Sahib", target: 6000, paid: 0 },
  { name: "Eid Muhammad Khan", branch: "FSD Zone 3", phone: "0300-7051019", guardian: "ML. Sadeeq Sahib", target: 12000, paid: 0 },
  { name: "Zahid Ali", branch: "FSD Zone 3", phone: "0300-4760689", guardian: "ML.Saeed Sahib", target: 12000, paid: 2000, monthly: 1000 },
  { name: "Majid Ali", branch: "FSD Zone 3", phone: "0300-4551688", guardian: "ML.Saeed Sahib", target: 12000, paid: 2000, monthly: 1000 },
  { name: "Farhan Tahiri", branch: "FSD Zone 3", phone: "0349-1323713", guardian: "ML.Saeed Sahib", target: 6000, paid: 1500, monthly: 500 },
  { name: "Hassan Tahiri", branch: "FSD Zone 3", phone: "0300-4078560", guardian: "ML.Saeed Sahib", target: 6000, paid: 1500, monthly: 500 },
  { name: "Saif Ali", branch: "FSD Zone 3", phone: "0301-4440581", guardian: "ML.Ramzan Sahib", target: 12000, paid: 0, monthly: 1000 },
  { name: "Shoukat Ali", branch: "FSD Zone 3", phone: "0300-0024409", guardian: "ML.Saeed Sahib", target: 6000, paid: 0, monthly: 500 },
  { name: "Manzoor Ahmad", branch: "FSD Zone 3", phone: "0301-4535269", guardian: "ML.Saeed Sahib", target: 6000, paid: 0, monthly: 500 },
  { name: "Nasarullah Sahib", branch: "FSD Zone 3", phone: "0305-9170930", guardian: "", target: 12000, paid: 0 },
  { name: "Haji Riaz Sahib", branch: "FSD Zone 3", phone: "0306-7025487", guardian: "", target: 12000, paid: 0 },
  { name: "Muhammad Zahid", branch: "FSD Zone 3", phone: "0300-0601656", guardian: "", target: 12000, paid: 0 },
  { name: "Asad Ali", branch: "FSD Zone 3", phone: "0306-7025487", guardian: "", target: 12000, paid: 0 },
  { name: "Muhammad Farhan", branch: "FSD Zone 3", phone: "0300-0601656", guardian: "", target: 12000, paid: 0 },
].map((r, i) => makeTx({
  sheetId: 'sheet-31-faisalabad-zone-3',
  index: i + 1,
  donorName: r.name,
  branchName: r.branch,
  zila: 'Faisalabad Zone 3',
  phone: r.phone,
  sarparastAla: r.guardian,
  profession: 'Business / Service',
  monthlyAmount: r.monthly || 0,
  targetAmount: r.target,
  paid: r.paid,
  notes: 'Membership Performa Faisalabad Zone-3'
}));

// -------------------------------------------------------------
// 6. RAHIM YAR KHAN ZONE 1 (sheet-19-rahim-yar-khan-zone-1) - 12 records
// -------------------------------------------------------------
const ryk1Data = [
  { name: "Muhammad Asif Nadeem", father: "Munir Ahmad Abbasia", annual: 12000 },
  { name: "Muhammad Hanif Thairi", father: "Ghulam Rasool", annual: 12000 },
  { name: "Muhammad Ramzan Nazir", father: "Nazir Ahmad", annual: 6000 },
  { name: "Nisar Mehmood", father: "Barkat Ali", annual: 2500 },
  { name: "Walida Ghulam Murtaza", father: "Wife of Fakir Shah Din", annual: 6000 },
  { name: "Ghulam Murtaza", father: "Shah Din", annual: 6000 },
  { name: "Muhammad Ramzan", father: "Shah Din", annual: 3000 },
  { name: "Muhammad Afzal", father: "Muhammad Ibrahim", annual: 12000 },
  { name: "Imam Deen", father: "Atta Muhammad", annual: 6000 },
  { name: "Ghulam Mustafa", father: "Shah Din", annual: 6000 },
  { name: "Akhtar Ali", father: "Atta Muhammad", annual: 6000 },
  { name: "Hassan Mustafa", father: "Ghulam Mustafa", annual: 6000 },
].map((r, i) => makeTx({
  sheetId: 'sheet-19-rahim-yar-khan-zone-1',
  index: i + 1,
  donorName: r.name,
  branchName: 'RYK Zone 1',
  zila: 'Rahim Yar Khan Zone 1',
  phone: '',
  sarparastAla: r.father,
  profession: 'Business / Agriculture',
  annuallyAmount: r.annual,
  targetAmount: r.annual,
  paid: r.annual, // Registered Form for Financial Assistance pledge/paid
  notes: `Father: ${r.father}`
}));

// -------------------------------------------------------------
// 7. RAHIM YAR KHAN ZONE 2 (sheet-20-rahim-yar-khan-zone-2) - 12 records
// -------------------------------------------------------------
const ryk2Data = [
  { name: "Waris Ali Tahiri (Sadar)", phone: "03337431445", monthly: 1000, annual: 12000, paid: 12000 },
  { name: "Faiz Rasool Tahiri (General Secretary)", phone: "03006736538", monthly: 1000, annual: 12000, paid: 10000 },
  { name: "M. Akhtar Tahiri", phone: "03067633061", monthly: 1000, annual: 12000, paid: 12000 },
  { name: "Zahid Ali Tahiri", phone: "03468559429", monthly: 1000, annual: 12000, paid: 12000 },
  { name: "Mujahid Ali Tahiri", phone: "03428882240", monthly: 1000, annual: 12000, paid: 12000 },
  { name: "Saeed Ahmad Tahiri", phone: "03062500870", monthly: 1000, annual: 12000, paid: 4000 },
  { name: "Ahsaan Ali Tahiri", phone: "03069027687", monthly: 1000, annual: 12000, paid: 0 },
  { name: "M. Safdar Tahiri", phone: "03281964961", monthly: 1000, annual: 12000, paid: 6000 },
  { name: "Noor Ahmad Tahiri", phone: "", monthly: 1000, annual: 12000, paid: 6000 },
  { name: "m. Saddique Tahiri", phone: "03053763730", monthly: 1000, annual: 12000, paid: 10000 },
  { name: "Muhammad Abid Tahiri", phone: "03428531733", monthly: 1000, annual: 12000, paid: 5000 },
  { name: "Abdul Moeed Tahiri", phone: "03136178193", monthly: 1000, annual: 12000, paid: 6000 },
].map((r, i) => makeTx({
  sheetId: 'sheet-20-rahim-yar-khan-zone-2',
  index: i + 1,
  donorName: r.name,
  branchName: 'RYK-2',
  zila: 'Rahim Yar Khan Zone 2',
  phone: r.phone,
  sarparastAla: '',
  profession: 'Business / Service',
  monthlyAmount: r.monthly,
  annuallyAmount: r.annual,
  targetAmount: r.annual,
  paid: r.paid,
  notes: 'Jamia Arbia Ghafaria Dargah Allah Abad'
}));

// -------------------------------------------------------------
// 8. RAHIM YAR KHAN ZONE 3 (sheet-21-rahim-yar-khan-zone-3) - 8 records
// -------------------------------------------------------------
const ryk3Data = [
  { name: "Moin ud Din Umar", branch: "RYK-3", phone: "03027620284", prof: "Job", annual: 10000, paid: 10000 },
  { name: "Akbar Ali", branch: "RYK-3", phone: "03008677163", prof: "Business", annual: 6000, paid: 6000 },
  { name: "Mohsin Ali", branch: "RYK-3", phone: "03002631739", prof: "Business", annual: 6000, paid: 6000 },
  { name: "Muhammad Irfan", branch: "RYK-3", phone: "03077614877", prof: "Business", annual: 6000, paid: 6000 },
  { name: "Liaquat Ali", branch: "RYK-3", phone: "03006743938", prof: "Job", annual: 6000, paid: 6000 },
  { name: "Faqeer Muhammad", branch: "RYK-3", phone: "03203889540", prof: "Business", annual: 5000, paid: 5000 },
  { name: "Hafiz Shahzad Ahmad", branch: "RYK-3", phone: "03008644292", prof: "Business", annual: 6000, paid: 0 },
  { name: "Muhammad Akhtar", branch: "RYK-3", phone: "03337412105", prof: "Job", annual: 6000, paid: 0 },
].map((r, i) => makeTx({
  sheetId: 'sheet-21-rahim-yar-khan-zone-3',
  index: i + 1,
  donorName: r.name,
  branchName: r.branch,
  zila: 'Rahim Yar Khan Zone 3',
  phone: r.phone,
  sarparastAla: '',
  profession: r.prof,
  annuallyAmount: r.annual,
  targetAmount: r.annual,
  paid: r.paid,
  notes: 'RYK-3 Performa 2026'
}));

// -------------------------------------------------------------
// 9. GUJARAT ZONE 1 (sheet-34-gujarat-zone-1) - 40 records
// -------------------------------------------------------------
const gujratData = [
  // Page 1 (1-14)
  { name: "خلیفہ محمد رفیق طاہری", branch: "جوڑہ", phone: "0300-6272487", prof: "پرائیویٹ ٹیچر", halfYearly: 3600, target: 12000, paid: 3600 },
  { name: "فقیر محمد جاوید", branch: "کھاریاں", phone: "0341-5871011", prof: "گورنمنٹ ملازم", annual: 12000, target: 12000, paid: 30500 },
  { name: "منور حسین", branch: "جوڑہ", phone: "0333-8425820", prof: "ٹھیکیدار", annual: 12000, target: 12000, paid: 20000 },
  { name: "محمد یونس", branch: "طارق آباد", phone: "", prof: "ٹیچر", annual: 12000, target: 12000, paid: 30000 },
  { name: "میاں اختر", branch: "جوڑہ", phone: "0342-6180254", prof: "دکاندار", annual: 12000, target: 12000, paid: 15000 },
  { name: "چوہدری نذر احمد", branch: "جوڑہ", phone: "", prof: "زمیندارہ", annual: 12000, target: 12000, paid: 65000 },
  { name: "شوکت علی قریشی", branch: "جوڑہ", phone: "0300-8265498", prof: "دکاندار", annual: 12000, target: 12000, paid: 10500 },
  { name: "اویس علی", branch: "جوڑہ", phone: "0300-5434953", prof: "زمیندارہ", annual: 12000, target: 12000, paid: 5000 },
  { name: "زاہد اسلام", branch: "جوڑہ", phone: "0346-6571514", prof: "دکاندار", annual: 12000, target: 12000, paid: 25000 },
  { name: "شفقت علی", branch: "جوڑہ", phone: "0342-4537172", prof: "زمیندارہ", annual: 12000, target: 12000, paid: 3000 },
  { name: "عدنان جیلانی", branch: "نشاط آباد", phone: "0344-5980584", prof: "ٹھیکیدار", annual: 12000, target: 12000, paid: 3500 },
  { name: "قمر منیر", branch: "سدھ", phone: "0344-5593157", prof: "زمیندارہ", annual: 12000, target: 12000, paid: 7700 },
  { name: "محمد جنید", branch: "شاہ والا", phone: "0343-5915053", prof: "دکاندار", annual: 12000, target: 12000, paid: 5000 },
  { name: "ایاز خان", branch: "قاضی باقر", phone: "", prof: "گورنمنٹ ملازم", annual: 12000, target: 12000, paid: 12000 },

  // Page 2 (15-32)
  { name: "محمد جمیل ٹریولر", branch: "کٹھیالہ سیداں", phone: "0322-7790888", prof: "ٹرانسپورٹ", target: 12000, paid: 6000 },
  { name: "صوفی بشیر", branch: "جوڑہ", phone: "0343-6216974", prof: "ہومیو ڈاکٹر", target: 12000, paid: 6000 },
  { name: "محمد شریف", branch: "جوڑہ", phone: "0302-6213018", prof: "کاروبار", target: 12000, paid: 2000 },
  { name: "فرزند علی", branch: "جوڑہ", phone: "", prof: "کاروبار", target: 12000, paid: 12000 },
  { name: "شفقت علی", branch: "جوڑہ موڑ", phone: "0342-4958786", prof: "ملازمت", target: 12000, paid: 0 },
  { name: "قمر دین", branch: "جوڑہ موڑ", phone: "0305-8162803", prof: "معزول / ریٹائرڈ", target: 12000, paid: 0 },
  { name: "محمد اسلم", branch: "جوڑہ موڑ", phone: "0300-6232980", prof: "ملازمت", target: 12000, paid: 0 },
  { name: "محمد سلیم", branch: "جوڑہ موڑ", phone: "0347-4913171", prof: "دکاندار", target: 12000, paid: 0 },
  { name: "ارشد علی", branch: "جوڑہ موڑ", phone: "0343-6204472", prof: "درزی", target: 12000, paid: 3000 },
  { name: "محمد نذیر", branch: "جوڑہ موڑ", phone: "0346-706796", prof: "درزی", target: 12000, paid: 0 },
  { name: "عادل بشارت", branch: "جوڑہ موڑ", phone: "0306-6231785", prof: "کاروبار", target: 12000, paid: 0 },
  { name: "عدنان صدیق", branch: "جوڑہ موڑ", phone: "0306-6231785", prof: "دھاگہ ورکر", target: 12000, paid: 0 },
  { name: "احسان الحق", branch: "جوڑہ موڑ", phone: "0300-8724479", prof: "کاروبار", target: 50000, paid: 0 },
  { name: "اکرام احمد", branch: "جوڑہ موڑ", phone: "0342-6180254", prof: "کاروبار", target: 12000, paid: 0 },
  { name: "قمر ذوالفقار", branch: "جوڑہ موڑ", phone: "0301-6289712", prof: "کاروبار", target: 12000, paid: 0 },
  { name: "ذیشان الہی", branch: "میانہ چوک", phone: "0331-6325870", prof: "طالب علم", target: 12000, paid: 0 },
  { name: "سید اسد", branch: "جوڑہ", phone: "0300-6274926", prof: "بزنس", target: 12000, paid: 0 },
  { name: "واقف شہزاد", branch: "جوڑہ", phone: "0300-6203878", prof: "زمیندارہ", target: 12000, paid: 0 },

  // Page 3 (33-40)
  { name: "امانت علی طاہری", branch: "جوڑہ", phone: "0302-6251595", prof: "بزنس", target: 12000, paid: 0 },
  { name: "وسیم عباس طاہری", branch: "جوڑہ", phone: "0301-6282381", prof: "بزنس", target: 12000, paid: 0 },
  { name: "شہباز الحق", branch: "جوڑہ", phone: "0346-6839812", prof: "ٹیچر", target: 12000, paid: 0 },
  { name: "لیاقت علی", branch: "جوڑہ", phone: "0340-4559623", prof: "مزدوری", target: 12000, paid: 0 },
  { name: "روحان علی", branch: "جوڑہ", phone: "0306-8887858", prof: "ڈرائیور", target: 12000, paid: 0 },
  { name: "احسان الحق", branch: "ککرالی", phone: "0345-6942751", prof: "بزنس", target: 12000, paid: 0 },
  { name: "رفاقت علی", branch: "بھمبر روڈ", phone: "0343-6258602", prof: "دکاندار", target: 12000, paid: 12000 },
  { name: "محمد اکرم", branch: "کھاریاں", phone: "", prof: "زمیندارہ", target: 12000, paid: 0 },
].map((r, i) => makeTx({
  sheetId: 'sheet-34-gujarat-zone-1',
  index: i + 1,
  donorName: r.name,
  donorNameUrdu: r.name,
  branchName: r.branch,
  zila: 'Gujarat Zone 1',
  phone: r.phone,
  sarparastAla: '',
  profession: r.prof,
  annuallyAmount: r.annual || 0,
  targetAmount: r.target,
  paid: r.paid,
  notes: 'JIM Gujrat Zone-1'
}));

// -------------------------------------------------------------
// 10. NANKANA SAHIB (sheet-49-nankana-sahib) - 29 records
// -------------------------------------------------------------
const nankanaData = [
  // Page 1 (1-14)
  { name: "Naveed Bashir", branch: "Nankana City", phone: "03008834120", guardian: "M. Ramzan", prof: "Farmer", monthly: 1000, target: 12000, paid: 9000 },
  { name: "Asim Bashir", branch: "Nankana City", phone: "03024468487", guardian: "M. Ramzan", prof: "Business", monthly: 1000, target: 12000, paid: 9000 },
  { name: "Ehsan Bashir", branch: "Nankana City", phone: "03024468487", guardian: "M. Ramzan", prof: "Business", monthly: 1000, target: 12000, paid: 9000 },
  { name: "Danish Naveed", branch: "Nankana City", phone: "03008834120", guardian: "M. Ramzan", prof: "Student", monthly: 1000, target: 12000, paid: 9000 },
  { name: "Shahmir Bashir", branch: "Nankana City", phone: "03008834120", guardian: "M. Ramzan", prof: "Student", monthly: 1000, target: 12000, paid: 9000 },
  { name: "Bashir Ahmad", branch: "Nankana City", phone: "03008834120", guardian: "M. Ramzan", prof: "Farmer", monthly: 1000, target: 12000, paid: 9000 },
  { name: "Qaisar Iqbal", branch: "Nankana City", phone: "03008898624", guardian: "M. Ramzan", prof: "Govt. Employ", monthly: 1000, target: 12000, paid: 9000 },
  { name: "M. Akram", branch: "Nankana City", phone: "03124818720", guardian: "M. Ramzan", prof: "Dry Cleaner", monthly: 1000, target: 12000, paid: 9000 },
  { name: "Saad Ashraf", branch: "Nankana City", phone: "03013084192", guardian: "M. Ramzan", prof: "Govt Teacher", monthly: 1000, target: 12000, paid: 9000 },
  { name: "Imtiaz Ahmad", branch: "Nankana City", phone: "03013084192", guardian: "M. Ramzan", prof: "Professor", monthly: 1000, target: 12000, paid: 9000 },
  { name: "Mrs. Imtiaz Ahmad", branch: "Nankana City", phone: "03013084192", guardian: "M. Ramzan", prof: "House Lady", monthly: 1000, target: 12000, paid: 9000 },
  { name: "M. Waseem", branch: "Bande ki Jagir", phone: "03007213294", guardian: "Syed Shah Nawaz", prof: "Rice Dealer", monthly: 1000, target: 12000, paid: 9000 },
  { name: "M. Shareef", branch: "Bande ki Jageer", phone: "03007213294", guardian: "Syed Shah Nawaz", prof: "Rice Dealer", monthly: 1000, target: 12000, paid: 9000 },
  { name: "Mrs. Shareef", branch: "Bande ki Jageer", phone: "03007213294", guardian: "Syed Shah Nawaz", prof: "House Lady", monthly: 1000, target: 12000, paid: 9000 },

  // Page 2 (15-29)
  { name: "M. Musa", branch: "Bande ki Jageer", phone: "03007213294", guardian: "Syed Shah Nawaz", prof: "Rice Dealer", monthly: 1000, target: 12000, paid: 9000 },
  { name: "Prime Rice Mill", branch: "Bande ki Jageer", phone: "03007213294", guardian: "Syed Shah Nawaz", prof: "Rice Dealer", monthly: 1000, target: 12000, paid: 9000 },
  { name: "M. Nadeem", branch: "Bande ki Jageer", phone: "03007213294", guardian: "Syed Shah Nawaz", prof: "Rice Dealer", monthly: 1000, target: 12000, paid: 9000 },
  { name: "Raheel Ahmad", branch: "More Khunda", phone: "03040328542", guardian: "Syed Shah Nawaz", prof: "Shop keeper", monthly: 1000, target: 12000, paid: 9000 },
  { name: "Ahmad Raheel", branch: "More Khunda", phone: "03040328542", guardian: "Syed Shah Nawaz", prof: "Student", monthly: 1000, target: 12000, paid: 9000 },
  { name: "M. Nadeem", branch: "More Khunda", phone: "03040328542", guardian: "Syed Shah Nawaz", prof: "Business", monthly: 1000, target: 12000, paid: 9000 },
  { name: "M. Latif", branch: "More Khunda", phone: "03040328542", guardian: "Syed Shah Nawaz", prof: "Business", monthly: 1000, target: 12000, paid: 9000 },
  { name: "Mrs. Latif", branch: "More Khunda", phone: "03040328542", guardian: "Syed Shah Nawaz", prof: "House Lady", monthly: 1000, target: 12000, paid: 9000 },
  { name: "Mohsin Raza", branch: "More Khunda", phone: "03018328855", guardian: "Syed Shah Nawaz", prof: "Online business", monthly: 1000, target: 12000, paid: 9000 },
  { name: "Hafiz Bilal", branch: "More Khunda", phone: "03089090863", guardian: "Syed Shah Nawaz", prof: "Rice Dealer", monthly: 1000, target: 12000, paid: 9000 },
  { name: "Muzamal K", branch: "More Khunda", phone: "03024192764", guardian: "Syed Shah Nawaz", prof: "Lab Technician", monthly: 1000, target: 12000, paid: 9000 },
  { name: "Umair Tufail", branch: "More Khunda", phone: "03014148330", guardian: "Syed Shah Nawaz", prof: "Student", monthly: 1000, target: 12000, paid: 9000 },
  { name: "Riaz Ahmad", branch: "More Khunda", phone: "03024120965", guardian: "Syed Shah Nawaz", prof: "Govt. Teacher", monthly: 1000, target: 12000, paid: 9000 },
  { name: "Imran Saeed", branch: "More Khunda", phone: "03014565995", guardian: "Syed Shah Nawaz", prof: "Shop Keeper", monthly: 1000, target: 12000, paid: 9000 },
  { name: "M. Shafique", branch: "Mora Kalan", phone: "03014046989", guardian: "Syed Shah Nawaz", prof: "Cantine Owner", monthly: 1000, target: 12000, paid: 9000 },
].map((r, i) => makeTx({
  sheetId: 'sheet-49-nankana-sahib',
  index: i + 1,
  donorName: r.name,
  branchName: r.branch,
  zila: 'Nankana Sahib',
  phone: r.phone,
  sarparastAla: r.guardian,
  profession: r.prof,
  monthlyAmount: r.monthly,
  targetAmount: r.target,
  paid: r.paid,
  notes: 'Nankana Sahib Annual Report 2026'
}));

// Combine all datasets
const allRecords = [
  ...sialkot1Data,
  ...sialkot2Data,
  ...multanData,
  ...khanewalData,
  ...fsdData,
  ...ryk1Data,
  ...ryk2Data,
  ...ryk3Data,
  ...gujratData,
  ...nankanaData
];

console.log(`Total records prepared: ${allRecords.length}`);

async function run() {
  const targetSheets = [
    'sheet-26-sialkot-zone-1',
    'sheet-27-sialkot-zone-2',
    'sheet-43-multan',
    'sheet-16-khanewal',
    'sheet-31-faisalabad-zone-3',
    'sheet-19-rahim-yar-khan-zone-1',
    'sheet-20-rahim-yar-khan-zone-2',
    'sheet-21-rahim-yar-khan-zone-3',
    'sheet-34-gujarat-zone-1',
    'sheet-49-nankana-sahib'
  ];

  console.log('Cleaning up existing records for the 10 target sheets...');
  for (const sId of targetSheets) {
    await sql`DELETE FROM transactions WHERE sheet_id = ${sId}`;
  }

  console.log('Inserting records in batches...');
  const BATCH_SIZE = 25;
  for (let i = 0; i < allRecords.length; i += BATCH_SIZE) {
    const batch = allRecords.slice(i, i + BATCH_SIZE);
    await Promise.all(batch.map(tx => {
      return sql`
        INSERT INTO transactions (
          id, sheet_id, receipt_no, date, donor_name, donor_name_urdu, branch_name, zila, phone,
          sarparast_ala, profession, address, address_urdu,
          monthly_amount, quarterly_amount, annually_amount, target_amount, months_data,
          amount, amount_in_words_en, amount_in_words_ur, type, category_id,
          payment_method, bank_name, check_number, transaction_id, description, description_urdu,
          recorded_by, verified_by, created_at
        ) VALUES (
          ${tx.id},
          ${tx.sheet_id},
          ${tx.receipt_no},
          ${tx.date},
          ${tx.donor_name},
          ${tx.donor_name_urdu},
          ${tx.branch_name},
          ${tx.zila},
          ${tx.phone},
          ${tx.sarparast_ala},
          ${tx.profession},
          ${tx.address},
          ${tx.address_urdu},
          ${tx.monthly_amount},
          ${tx.quarterly_amount},
          ${tx.annually_amount},
          ${tx.target_amount},
          ${JSON.stringify(tx.months_data)}::jsonb,
          ${tx.amount},
          ${tx.amount_in_words_en},
          ${tx.amount_in_words_ur},
          ${tx.type},
          ${tx.category_id},
          ${tx.payment_method},
          ${tx.bank_name},
          ${tx.check_number},
          ${tx.transaction_id},
          ${tx.description},
          ${tx.description_urdu},
          ${tx.recorded_by},
          ${tx.verified_by},
          NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
          sheet_id = EXCLUDED.sheet_id,
          receipt_no = EXCLUDED.receipt_no,
          date = EXCLUDED.date,
          donor_name = EXCLUDED.donor_name,
          donor_name_urdu = EXCLUDED.donor_name_urdu,
          branch_name = EXCLUDED.branch_name,
          zila = EXCLUDED.zila,
          phone = EXCLUDED.phone,
          sarparast_ala = EXCLUDED.sarparast_ala,
          profession = EXCLUDED.profession,
          address = EXCLUDED.address,
          address_urdu = EXCLUDED.address_urdu,
          monthly_amount = EXCLUDED.monthly_amount,
          quarterly_amount = EXCLUDED.quarterly_amount,
          annually_amount = EXCLUDED.annually_amount,
          target_amount = EXCLUDED.target_amount,
          months_data = EXCLUDED.months_data,
          amount = EXCLUDED.amount,
          amount_in_words_en = EXCLUDED.amount_in_words_en,
          amount_in_words_ur = EXCLUDED.amount_in_words_ur,
          type = EXCLUDED.type,
          category_id = EXCLUDED.category_id,
          payment_method = EXCLUDED.payment_method,
          bank_name = EXCLUDED.bank_name,
          check_number = EXCLUDED.check_number,
          transaction_id = EXCLUDED.transaction_id,
          description = EXCLUDED.description,
          description_urdu = EXCLUDED.description_urdu,
          recorded_by = EXCLUDED.recorded_by,
          verified_by = EXCLUDED.verified_by
      `;
    }));
    console.log(`Inserted ${Math.min(i + BATCH_SIZE, allRecords.length)} / ${allRecords.length}`);
  }

  console.log('\n--- VERIFYING COUNTS IN DATABASE ---');
  const results = await sql`
    SELECT sheet_id, zila, count(*)::int as count, sum(amount)::float as total_paid, sum(target_amount)::float as total_target
    FROM transactions 
    WHERE sheet_id = ANY(${targetSheets})
    GROUP BY sheet_id, zila 
    ORDER BY sheet_id ASC
  `;

  console.table(results);
  console.log('✅ All Markaz Excel records successfully ingested into Neon PostgreSQL!');
  process.exit(0);
}

run().catch(err => {
  console.error('Ingestion failed:', err);
  process.exit(1);
});
