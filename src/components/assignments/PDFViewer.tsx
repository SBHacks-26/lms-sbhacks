interface PDFViewerProps {
  pdfBase64: string;
}

export function PDFViewer({ pdfBase64 }: PDFViewerProps) {
  if (!pdfBase64) {
    return <div className="text-gray-500">No PDF available</div>;
  }

  return (
    <iframe
      src={`data:application/pdf;base64,${pdfBase64}`}
      className="w-full h-[600px] border rounded"
      title="Assignment PDF"
    />
  );
}
