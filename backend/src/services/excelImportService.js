const XLSX = require('xlsx');

/**
 * Robust date parser supporting Excel serial date numbers, ISO formats, DD-MM-YYYY, and MM/DD/YYYY.
 */
function parseExcelDate(val) {
  if (!val) return null;

  // 1. Handle Excel Serial Date numbers (e.g., 46249)
  if (typeof val === 'number') {
    const dateObj = XLSX.SSF.parse_date_code(val);
    if (dateObj) {
      const year = dateObj.y;
      const month = String(dateObj.m).padStart(2, '0');
      const day = String(dateObj.d).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
  }

  const str = String(val).trim();
  if (!str) return null;

  // 2. Handle ISO or YYYY-MM-DD format
  if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
    return str.substring(0, 10);
  }

  // 3. Handle DD-MM-YYYY or DD/MM/YYYY format
  const dmyMatch = str.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
  if (dmyMatch) {
    const day = String(dmyMatch[1]).padStart(2, '0');
    const month = String(dmyMatch[2]).padStart(2, '0');
    const year = dmyMatch[3];
    return `${year}-${month}-${day}`;
  }

  // 4. Handle standard JS Date string fallback
  const d = new Date(str);
  if (!isNaN(d.getTime())) {
    return d.toISOString().substring(0, 10);
  }

  return null;
}

/**
 * Standardize vehicle registration numbers (e.g. "PB 01 AB 0001" -> "PB01AB0001").
 */
function sanitizeVehicleNumber(vehNo) {
  if (!vehNo) return '';
  return String(vehNo).toUpperCase().replace(/[\s-]/g, '').trim();
}

/**
 * Standardize phone numbers (e.g. "94635-53271" -> "+919463553271" or "9463553271").
 */
function sanitizePhoneNumber(phone) {
  if (!phone) return '';
  let str = String(phone).trim().replace(/[\s-()]/g, '');
  if (!str.startsWith('+') && str.length === 10) {
    str = `+91${str}`;
  } else if (!str.startsWith('+') && str.length > 10) {
    str = `+${str}`;
  }
  return str;
}

/**
 * Extract and validate vehicle records from an uploaded Excel file buffer.
 */
function parseExcelWorkbook(fileBuffer) {
  const workbook = XLSX.read(fileBuffer, { type: 'buffer', cellDates: true });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];

  // Convert worksheet to JSON rows
  const rawRows = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

  const validRecords = [];
  const validationErrors = [];
  const seenVehicleNumbers = new Set();

  let totalRows = rawRows.length;
  let skippedDuplicates = 0;

  rawRows.forEach((row, index) => {
    const rowNum = index + 2; // Row 1 is header

    // Map column names flexibly
    const ownerName =
      row['Owner Name'] || row['Owner'] || row['owner_name'] || row['Name'] || '';
    const email = row['Email'] || row['email'] || row['Email Address'] || '';
    const rawPhone =
      row['Phone Number'] || row['Phone'] || row['phone_number'] || row['Mobile'] || '';
    const rawVehicleNumber =
      row['Vehicle Number'] || row['Vehicle No'] || row['vehicle_number'] || row['Vehicle'] || '';

    const insuranceDateRaw =
      row['Insurance Expiry Date'] || row['Insurance Expiry'] || row['insurance_expiry'] || '';
    const pucDateRaw =
      row['PUC Expiry Date'] || row['PUC Expiry'] || row['puc_expiry'] || '';
    const roadTaxDateRaw =
      row['Road Tax Expiry Date'] || row['Road Tax Expiry'] || row['road_tax_expiry'] || '';

    const vehicleNumber = sanitizeVehicleNumber(rawVehicleNumber);
    const phoneNumber = sanitizePhoneNumber(rawPhone);

    const rowErrors = [];

    // Validation checks
    if (!ownerName || String(ownerName).trim() === '') {
      rowErrors.push('Missing Owner Name');
    }
    if (!vehicleNumber) {
      rowErrors.push('Missing or invalid Vehicle Number');
    }
    if (!phoneNumber) {
      rowErrors.push('Missing or invalid Phone Number');
    }

    // Parse dates
    const insuranceExpiry = parseExcelDate(insuranceDateRaw);
    const pucExpiry = parseExcelDate(pucDateRaw);
    const roadTaxExpiry = parseExcelDate(roadTaxDateRaw);

    if (insuranceDateRaw && !insuranceExpiry) {
      rowErrors.push(`Invalid Insurance Expiry Date format: "${insuranceDateRaw}"`);
    }
    if (pucDateRaw && !pucExpiry) {
      rowErrors.push(`Invalid PUC Expiry Date format: "${pucDateRaw}"`);
    }
    if (roadTaxDateRaw && !roadTaxExpiry) {
      rowErrors.push(`Invalid Road Tax Expiry Date format: "${roadTaxDateRaw}"`);
    }

    if (rowErrors.length > 0) {
      validationErrors.push({
        rowNumber: rowNum,
        vehicleNumber: vehicleNumber || 'N/A',
        ownerName: ownerName || 'N/A',
        errors: rowErrors,
      });
      return;
    }

    // Check for duplicate vehicle number within the same Excel sheet
    if (seenVehicleNumbers.has(vehicleNumber)) {
      skippedDuplicates++;
      validationErrors.push({
        rowNumber: rowNum,
        vehicleNumber,
        ownerName,
        errors: ['Duplicate vehicle number in same Excel file'],
      });
      return;
    }

    seenVehicleNumbers.add(vehicleNumber);

    validRecords.push({
      ownerName: String(ownerName).trim(),
      email: email ? String(email).trim().toLowerCase() : null,
      phoneNumber,
      vehicleNumber,
      insuranceExpiry,
      pucExpiry,
      roadTaxExpiry,
    });
  });

  const failedRows = validationErrors.length;
  const successRate = totalRows > 0 ? Math.round((validRecords.length / totalRows) * 100) : 100;

  return {
    summary: {
      totalRows,
      validRows: validRecords.length,
      failedRows,
      skippedDuplicates,
      successRate,
    },
    validRecords,
    validationErrors,
  };
}

/**
 * Generate sample Excel template buffer for download.
 */
function generateSampleExcelBuffer() {
  const sampleData = [
    {
      'Owner Name': 'Swayam Kataria',
      Email: 'swayamkataria.dev@gmail.com',
      'Phone Number': '+919463553271',
      'Vehicle Number': 'PB01AB0001',
      'Insurance Expiry Date': '2026-08-15',
      'PUC Expiry Date': '2026-12-30',
      'Road Tax Expiry Date': '2030-01-01',
    },
    {
      'Owner Name': 'Ramesh Kumar',
      Email: 'ramesh.kumar@example.com',
      'Phone Number': '+919876543210',
      'Vehicle Number': 'DL01C1234',
      'Insurance Expiry Date': '2026-08-20',
      'PUC Expiry Date': '2026-09-05',
      'Road Tax Expiry Date': '2027-03-31',
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Vehicle Compliance Data');
  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
}

module.exports = {
  parseExcelWorkbook,
  parseExcelDate,
  sanitizeVehicleNumber,
  sanitizePhoneNumber,
  generateSampleExcelBuffer,
};
