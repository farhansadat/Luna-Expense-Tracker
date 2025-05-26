import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCamera, faReceipt, faSpinner } from '@fortawesome/free-solid-svg-icons';

interface ReceiptScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanComplete: (data: {
    amount?: number;
    date?: string;
    description?: string;
    vendor?: string;
  }) => void;
}

export default function ReceiptScannerModal({
  isOpen,
  onClose,
  onScanComplete,
}: ReceiptScannerModalProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsScanning(true);
      // Display preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);

      // TODO: Implement actual receipt scanning logic
      // For now, just simulate a delay and return mock data
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      onScanComplete({
        amount: 42.99,
        date: new Date().toISOString(),
        description: "Receipt scan",
        vendor: "Sample Store"
      });
      
      onClose();
    } catch (error) {
      console.error('Receipt scanning failed:', error);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        >
          <motion.div
            className="w-full max-w-lg bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl p-6"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <FontAwesomeIcon icon={faReceipt} className="w-6 h-6 text-purple-500" />
                <h2 className="text-2xl font-bold text-white">Scan Receipt</h2>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ×
              </button>
            </div>

            <div className="space-y-6">
              {previewImage ? (
                <div className="relative aspect-[3/4] rounded-lg overflow-hidden">
                  <img
                    src={previewImage}
                    alt="Receipt preview"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  {isScanning && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <FontAwesomeIcon icon={faSpinner} className="w-8 h-8 text-purple-500 animate-spin" />
                    </div>
                  )}
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-[3/4] border-2 border-dashed border-gray-700 rounded-lg flex flex-col items-center justify-center space-y-4 cursor-pointer hover:border-purple-500 transition-colors"
                >
                  <FontAwesomeIcon icon={faCamera} className="w-12 h-12 text-gray-600" />
                  <p className="text-gray-400 text-center">
                    Click to take a photo or<br />upload a receipt
                  </p>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="flex justify-end space-x-3">
                <button onClick={onClose} className="btn-secondary">
                  Cancel
                </button>
                {previewImage && !isScanning && (
                  <button
                    onClick={() => setPreviewImage(null)}
                    className="btn-primary"
                  >
                    Retake
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 