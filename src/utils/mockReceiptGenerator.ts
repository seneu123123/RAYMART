/**
 * Utility to generate realistic mock Philippine e-wallet / mobile banking receipt screenshots
 * (GCash, Maya, InstaPay) on an HTML5 canvas and export as data URL.
 */
export function generateMockReceiptCanvas(options: {
  method: "GCash" | "Maya" | "Bank Transfer (BDO/BPI)" | "Cash";
  referenceNumber: string;
  amount: number;
  recipientName?: string;
  recipientNumber?: string;
  senderName?: string;
  timestamp?: string;
  statusText?: string;
  isTampered?: boolean;
  isCropped?: boolean;
}): string {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  const width = 380;
  const height = options.isCropped ? 260 : 640;
  canvas.width = width;
  canvas.height = height;

  const isMaya = options.method === "Maya";
  const primaryColor = isMaya ? "#00D632" : "#005CE6"; // Maya green vs GCash blue
  const darkColor = "#111827";
  const lightBg = "#FFFFFF";

  // 1. Background
  ctx.fillStyle = "#F3F4F6";
  ctx.fillRect(0, 0, width, height);

  // 2. Receipt Card Container
  const cardX = 16;
  const cardY = 16;
  const cardW = width - 32;
  const cardH = height - 32;

  ctx.fillStyle = lightBg;
  ctx.beginPath();
  ctx.roundRect(cardX, cardY, cardW, cardH, 16);
  ctx.fill();

  // Subtle border
  ctx.strokeStyle = "#E5E7EB";
  ctx.lineWidth = 1;
  ctx.stroke();

  // 3. Brand Header Bar
  ctx.fillStyle = primaryColor;
  ctx.beginPath();
  ctx.roundRect(cardX, cardY, cardW, 64, [16, 16, 0, 0]);
  ctx.fill();

  // Brand text / logo simulation
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "bold 18px 'Inter', sans-serif";
  ctx.textAlign = "left";
  ctx.fillText(isMaya ? "Maya / InstaPay" : "GCash • Send Money", cardX + 20, cardY + 38);

  ctx.font = "10px sans-serif";
  ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
  ctx.textAlign = "right";
  ctx.fillText("RECEIPT CONFIRMATION", cardX + cardW - 20, cardY + 38);

  // 4. Success Checkmark Icon
  const checkY = cardY + 105;
  ctx.beginPath();
  ctx.arc(width / 2, checkY, 22, 0, Math.PI * 2);
  ctx.fillStyle = isMaya ? "#E8FBF0" : "#EBF5FF";
  ctx.fill();

  ctx.fillStyle = primaryColor;
  ctx.font = "bold 20px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("✓", width / 2, checkY + 7);

  // 5. Amount Display
  ctx.fillStyle = "#111827";
  ctx.font = "bold 28px 'Inter', sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(`₱${options.amount.toLocaleString()}.00`, width / 2, cardY + 160);

  ctx.fillStyle = "#6B7280";
  ctx.font = "12px sans-serif";
  ctx.fillText(options.statusText || "Sent Successfully", width / 2, cardY + 180);

  if (options.isCropped) {
    // Return early with cropped artifact simulating partial capture
    ctx.fillStyle = "#DC2626";
    ctx.font = "italic 11px sans-serif";
    ctx.fillText("[Image truncated: reference number cut off]", width / 2, cardY + 220);
    return canvas.toDataURL("image/png");
  }

  // 6. Divider Line
  ctx.strokeStyle = "#E5E7EB";
  ctx.beginPath();
  ctx.setLineDash([4, 4]);
  ctx.moveTo(cardX + 20, cardY + 205);
  ctx.lineTo(cardX + cardW - 20, cardY + 205);
  ctx.stroke();
  ctx.setLineDash([]);

  // 7. Details Table
  const drawRow = (label: string, value: string, yPos: number, highlight = false, isWarning = false) => {
    ctx.textAlign = "left";
    ctx.fillStyle = "#6B7280";
    ctx.font = "12px sans-serif";
    ctx.fillText(label, cardX + 20, yPos);

    ctx.textAlign = "right";
    if (isWarning) {
      ctx.fillStyle = "#DC2626";
      ctx.font = "bold 12px monospace";
    } else if (highlight) {
      ctx.fillStyle = primaryColor;
      ctx.font = "bold 12px monospace";
    } else {
      ctx.fillStyle = "#111827";
      ctx.font = "500 12px sans-serif";
    }
    ctx.fillText(value, cardX + cardW - 20, yPos);
  };

  const recipient = options.recipientName || "John Raymart Dordines";
  const phone = options.recipientNumber || "09466455124";
  const dateStr = options.timestamp || "2026-09-12 14:15:30";

  drawRow("Sent To", recipient, cardY + 240);
  drawRow("Mobile Number", phone, cardY + 275);
  drawRow("Sender Name", options.senderName || "Client Account", cardY + 310);
  drawRow("Transaction Time", dateStr, cardY + 345);
  drawRow("Payment Channel", options.method, cardY + 380);
  drawRow("InstaPay Network", "QRPh Interoperable", cardY + 415);
  drawRow("Reference No.", options.referenceNumber, cardY + 450, true);

  if (options.isTampered) {
    // Add artificial suspicious compression/inconsistent font artifact
    ctx.fillStyle = "rgba(239, 68, 68, 0.1)";
    ctx.fillRect(cardX + 10, cardY + 435, cardW - 20, 24);
    ctx.fillStyle = "#B91C1C";
    ctx.font = "bold 9px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("⚠️ [AUDIT WARNING: INCONSISTENT FONT KERNING DETECTED]", width / 2, cardY + 480);
  }

  // 8. Footer InstaPay / QRPh Seal
  const footerY = cardY + cardH - 55;
  ctx.fillStyle = "#F9FAFB";
  ctx.beginPath();
  ctx.roundRect(cardX + 12, footerY, cardW - 24, 42, 8);
  ctx.fill();

  ctx.fillStyle = "#4B5563";
  ctx.font = "10px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("Bangko Sentral ng Pilipinas (BSP) • QRPh Compliant", width / 2, footerY + 18);
  ctx.font = "9px monospace";
  ctx.fillStyle = "#9CA3AF";
  ctx.fillText(`TRACE-ID: PH-NET-${Date.now().toString(36).toUpperCase()}`, width / 2, footerY + 33);

  return canvas.toDataURL("image/png");
}
