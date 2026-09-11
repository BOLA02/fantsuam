type Receipt = {
  reference: string;
  type: string;
  amount: number;
  date: string;
  customerName: string;
  accountNumber?: string;
  paymentMethod?: string;
  balanceAfter?: number;
};

const encoder = new TextEncoder();

function pdfText(value: string) {
  // The built-in PDF fonts support the Latin-1 character set. Normalising
  // here keeps names and references from producing a malformed PDF.
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\x20-\x7E]/g, '?')
    .replace(/([\\()])/g, '\\$1');
}

function formatAmount(value: number) {
  return `NGN ${new Intl.NumberFormat('en-NG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(value) ? value : 0)}`;
}

function buildPdf(receipt: Receipt) {
  const transactionDate = new Date(receipt.date);
  const formattedDate = Number.isNaN(transactionDate.getTime())
    ? receipt.date
    : transactionDate.toLocaleString('en-NG');
  const fields = [
    ['Reference', receipt.reference],
    ['Customer', receipt.customerName],
    ['Transaction', receipt.type],
    ['Date', formattedDate],
    ...(receipt.accountNumber ? [['Account', receipt.accountNumber]] : []),
    ...(receipt.paymentMethod ? [['Payment method', receipt.paymentMethod.replace(/_/g, ' ')]] : []),
    ...(receipt.balanceAfter === undefined ? [] : [['Balance after', formatAmount(receipt.balanceAfter)]]),
  ];

  const commands = [
    'q',
    '0.18 0.19 0.57 rg',
    'BT /F1 24 Tf 50 780 Td (Transaction Receipt) Tj ET',
    '0.10 0.47 0.29 rg',
    `BT /F1 20 Tf 50 732 Td (${pdfText(formatAmount(receipt.amount))}) Tj ET`,
    '0.09 0.13 0.20 rg',
    ...fields.map((field, index) => `BT /F1 11 Tf 50 ${684 - index * 32} Td (${pdfText(`${field[0]}: ${field[1]}`)}) Tj ET`),
    '0.45 0.47 0.52 rg',
    'BT /F1 9 Tf 50 90 Td (This is a system-generated receipt.) Tj ET',
    'Q',
  ].join('\n');

  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>',
    `<< /Length ${encoder.encode(commands).length} >>\nstream\n${commands}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  ];

  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(encoder.encode(pdf).length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xrefOffset = encoder.encode(pdf).length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  pdf += offsets.slice(1).map((offset) => `${String(offset).padStart(10, '0')} 00000 n \n`).join('');
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return encoder.encode(pdf);
}

export function downloadReceipt(receipt: Receipt) {
  const url = URL.createObjectURL(new Blob([buildPdf(receipt)], { type: 'application/pdf' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `receipt-${receipt.reference.replace(/[^a-z0-9-_]/gi, '-') || 'transaction'}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
}
