import { useState, useEffect } from "react";
import { Loader2, Mail, Copy, Check, X } from "lucide-react";
import Button from "../ui/Button";
import TextareaField from "../ui/TextareaField";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import toast from "react-hot-toast";

const RemainderModal = ({ isOpen, onClose, invoiceId }) => {
  const [remainderText, setRemainderText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);

  // Reset state when the modal is closed
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setRemainderText("");
        setHasCopied(false);
      }, 300); // Delay to allow for exit animation
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && invoiceId) {
      const getRemainderText = async () => {
        setIsLoading(true);
        try {
          // Pass invoiceId as a query parameter
          const response = await axiosInstance.get(
            API_PATHS.AI.GENERATE_REMAINDER,
            {
              params: { invoiceId },
            }
          );

          if (response.data && response.data.remainderText) {
            setRemainderText(response.data.remainderText);
          } else {
            // Handle cases where the API might not return the expected format
            setRemainderText(
              "Sorry, we couldn't generate a reminder for this invoice. Please try again."
            );
            toast.error("Failed to generate reminder text.");
          }
        } catch (error) {
          console.error("Error fetching reminder text:", error);
          toast.error("Failed to generate reminder text.");
          // Optionally provide a generic template on error
          setRemainderText(
            "Dear [Client Name],\n\nThis is a friendly reminder that invoice [Invoice Number] for the amount of [Amount] is due on [Due Date].\n\nPlease let us know if you have any questions.\n\nBest regards,\n[Your Name]"
          );
        } finally {
          setIsLoading(false);
        }
      };
      getRemainderText();
    }
  }, [isOpen, invoiceId]);

  const handleCopyToClipboard = () => {
    if (!remainderText) return;
    navigator.clipboard.writeText(remainderText);
    setHasCopied(true);
    toast.success("Reminder copied to clipboard!");
    setTimeout(() => {
      setHasCopied(false);
    }, 2500); // Extend timeout slightly
  };

  // Prevent rendering if not open
  if (!isOpen) {
    return null;
  }

  return (
    // Modal Overlay
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-60 backdrop-blur-sm transition-opacity duration-300 ease-in-out"
      onClick={onClose}
    >
      {/* Modal Content */}
      <div
        className="relative w-full max-w-lg transform rounded-2xl bg-white p-6 shadow-2xl transition-all duration-300 ease-in-out"
        onClick={(e) => e.stopPropagation()} // Prevents modal from closing when clicking inside
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-100">
              <Mail className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-800">
                Send Reminder
              </h3>
              <p className="text-sm text-slate-500">
                AI-generated reminder text for your client.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="my-6">
          {isLoading ? (
            <div className="flex h-48 flex-col items-center justify-center text-center text-slate-500">
              <Loader2 className="mb-3 h-8 w-8 animate-spin text-blue-500" />
              <p className="font-medium">Generating reminder...</p>
              <p className="text-sm">Please wait a moment.</p>
            </div>
          ) : (
            <div>
              <TextareaField
                label="Reminder Text"
                value={remainderText}
                readOnly
                rows={12}
                className="text-sm"
              />
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          <Button
            onClick={handleCopyToClipboard}
            icon={hasCopied ? Check : Copy}
            disabled={isLoading || !remainderText}
            className="bg-blue-600 text-white hover:bg-blue-700"
          >
            {hasCopied ? "Copied!" : "Copy to Clipboard"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RemainderModal;
