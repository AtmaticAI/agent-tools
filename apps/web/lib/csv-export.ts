import type { ParseResult } from '@atmaticai/agent-tools/csv';

/**
 * Export data to Excel (.xlsx) format
 */
export async function exportToExcel(
  data: ParseResult,
  filename: string = 'data.xlsx'
): Promise<void> {
  const XLSX = await import('xlsx');

  // Create worksheet from data
  const ws = XLSX.utils.json_to_sheet(data.data, {
    header: data.headers,
  });

  // Create workbook and add worksheet
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Data');

  // Generate buffer and trigger download
  XLSX.writeFile(wb, filename);
}

/**
 * Export data to PDF format
 */
export async function exportToPDF(
  data: ParseResult,
  filename: string = 'data.pdf'
): Promise<void> {
  const { default: jsPDF } = await import('jspdf');
  await import('jspdf-autotable');

  const doc = new jsPDF({
    orientation: data.headers.length > 5 ? 'landscape' : 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Add title
  doc.setFontSize(16);
  doc.text('Data Export', 14, 15);

  // Add export info
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`${data.rowCount} rows × ${data.headers.length} columns`, 14, 22);
  doc.text(`Exported: ${new Date().toLocaleString()}`, 14, 27);

  // Prepare table data
  const tableData = data.data.map((row) =>
    data.headers.map((header) => String(row[header] ?? ''))
  );

  // Add table using autoTable
  (doc as any).autoTable({
    head: [data.headers],
    body: tableData,
    startY: 32,
    styles: {
      fontSize: 8,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: 255,
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    margin: { top: 32 },
  });

  // Save the PDF
  doc.save(filename);
}

/**
 * Copy data as CSV and open Google Sheets
 */
export async function openInGoogleSheets(data: ParseResult): Promise<void> {
  // Convert data to TSV format (Google Sheets prefers tab-separated)
  const headerRow = data.headers.join('\t');
  const dataRows = data.data.map((row) =>
    data.headers.map((h) => String(row[h] ?? '')).join('\t')
  );
  const tsvContent = [headerRow, ...dataRows].join('\n');

  // Copy to clipboard
  await navigator.clipboard.writeText(tsvContent);

  // Open Google Sheets in a new tab
  // User can then paste the data
  window.open('https://sheets.new', '_blank');
}
