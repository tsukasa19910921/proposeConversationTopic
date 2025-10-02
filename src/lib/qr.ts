import QRCode from "qrcode";

export async function generateQR(url: string): Promise<string> {
  try {
    const svg = await QRCode.toString(url, {
      type: "svg",
      errorCorrectionLevel: "M",
      margin: 2,  // QR内側に均等な白縁を確保
    });
    return svg;
  } catch (error) {
    console.error("QR generation error:", error);
    throw new Error("Failed to generate QR code");
  }
}