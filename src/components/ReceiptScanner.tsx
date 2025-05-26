import { useState } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faReceipt,
  faSpinner,
  faTimes,
  faCheck,
  faCamera
} from '@fortawesome/free-solid-svg-icons';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useUserSettingsStore } from '../store/userSettingsStore';
import { toast } from 'react-hot-toast';

interface ReceiptScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScanComplete: (data: any) => void;
}

export default function ReceiptScanner({
  isOpen,
  onClose,
  onScanComplete
}: ReceiptScannerProps) {
  const { user } = useAuth();
  const { currency } = useUserSettingsStore();
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<any>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    try {
      setLoading(true);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('receipts')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('receipts')
        .getPublicUrl(filePath);

      // Create receipt record
      const { data: receipt, error: receiptError } = await supabase
        .from('receipts')
        .insert([{
          user_id: user.id,
          image_url: publicUrl,
          status: 'processing',
          currency: currency
        }])
        .select()
        .single();

      if (receiptError) throw receiptError;

      // Call OCR service (replace with your OCR service)
      const ocrResult = await processReceiptWithOCR(publicUrl);

      // Update receipt with OCR data
      const { data: updatedReceipt, error: updateError } = await supabase
        .from('receipts')
        .update({
          ocr_data: ocrResult,
          merchant_name: ocrResult.merchant,
          total_amount: ocrResult.total,
          date: ocrResult.date,
          category: ocrResult.category,
          status: 'completed'
        })
        .eq('id', receipt.id)
        .select()
        .single();

      if (updateError) throw updateError;

      setScanResult(updatedReceipt);
      onScanComplete(updatedReceipt);
      toast.success('Receipt scanned successfully!');
    } catch (error) {
      console.error('Error processing receipt:', error);
      toast.error('Failed to process receipt');
    } finally {
      setLoading(false);
    }
  };

  // Mock OCR processing function (replace with actual OCR service)
  const processReceiptWithOCR = async (imageUrl: string) => {
    // Simulate OCR processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return {
      merchant: 'Sample Store',
      total: 99.99,
      date: new Date().toISOString().split('T')[0],
      category: 'Shopping',
      items: [
        { name: 'Item 1', price: 49.99 },
        { name: 'Item 2', price: 50.00 }
      ]
    };
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gray-900 rounded-2xl p-6 w-full max-w-lg relative"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <FontAwesomeIcon icon={faTimes} />
        </button>

        <h2 className="text-2xl font-semibold text-white mb-6">Scan Receipt</h2>

        {!preview ? (
          <div className="border-2 border-dashed border-gray-600 rounded-xl p-8 text-center">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
              id="receipt-upload"
            />
            <label
              htmlFor="receipt-upload"
              className="cursor-pointer flex flex-col items-center"
            >
              <FontAwesomeIcon
                icon={faReceipt}
                className="w-12 h-12 text-gray-400 mb-4"
              />
              <p className="text-gray-400 mb-2">
                Click to upload or take a photo of your receipt
              </p>
              <p className="text-sm text-gray-500">
                Supports JPG, PNG up to 10MB
              </p>
            </label>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative rounded-xl overflow-hidden">
              <img
                src={preview}
                alt="Receipt preview"
                className="w-full object-cover"
              />
              {loading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <FontAwesomeIcon
                    icon={faSpinner}
                    className="w-8 h-8 text-white animate-spin"
                  />
                </div>
              )}
            </div>

            {scanResult && (
              <div className="bg-white/5 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Merchant</span>
                  <span className="text-white">{scanResult.merchant_name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Total</span>
                  <span className="text-white">
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: scanResult.currency
                    }).format(scanResult.total_amount)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Date</span>
                  <span className="text-white">
                    {new Date(scanResult.date).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Category</span>
                  <span className="text-white">{scanResult.category}</span>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-4">
              <button
                onClick={() => {
                  setPreview(null);
                  setScanResult(null);
                }}
                className="px-4 py-2 text-gray-400 hover:text-white"
              >
                Clear
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
} 