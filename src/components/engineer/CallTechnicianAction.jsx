import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { X, Loader2 } from "lucide-react";
import { useAlerts } from "@/lib/alert-store";
import { toast } from "sonner";
import { repairAlertsApi } from "@/lib/repairAlertsApi";

function CallTechnicianModal({ isOpen, onClose, onSubmit }) {
  const [subsystem, setSubsystem] = useState("");
  const [problem, setProblem] = useState("");
  const [priority, setPriority] = useState("medium");

  const isValid = useMemo(() => {
    return subsystem.trim().length > 0 && problem.trim().length > 0;
  }, [subsystem, problem]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isValid) return;

    onSubmit({ subsystem: subsystem.trim(), problem: problem.trim(), priority });
    setSubsystem("");
    setProblem("");
    setPriority("medium");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Call Technician</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subsystem <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={subsystem}
              onChange={(e) => setSubsystem(e.target.value)}
              placeholder="e.g., Cutterhead"
              className="w-full px-3 py-2 border border-gray-300 rounded text-gray-900 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priority <span className="text-red-500">*</span>
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded text-gray-900 text-sm"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Problem <span className="text-red-500">*</span>
            </label>
            <textarea
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
              placeholder="Describe the problem"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded text-gray-900 text-sm resize-none"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isValid}
              className={`flex-1 px-4 py-2 rounded font-medium text-white transition-colors ${
                isValid
                  ? "bg-blue-500 hover:bg-blue-600 cursor-pointer"
                  : "bg-gray-400 cursor-not-allowed opacity-50"
              }`}
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CallTechnicianAction({
  buttonClassName,
  buttonVariant = "ghost",
}) {
  const { addAlert } = useAlerts();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async ({ subsystem, problem, priority }) => {
    setIsSubmitting(true);
    try {
      // Send to backend
      await repairAlertsApi.create({
        subsystem,
        issue: problem,
        priority,
      });

      // Also add to local alerts for immediate UI feedback
      addAlert({
        type: "repair",
        subsystem,
        issue: problem,
        status: "pending",
        sensorName: subsystem,
        sensorType: "Repair",
        value: 0,
        unit: "",
        level: "warning",
      });

      setIsOpen(false);
      toast.success("Technician notified", {
        description: `Subsystem: ${subsystem} - Saved to database`,
      });
    } catch (err) {
      console.error("Failed to submit repair alert:", err);
      toast.error("Failed to submit request", {
        description: err.message || "Please try again",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Button
        variant={buttonVariant}
        className={buttonClassName}
        onClick={() => setIsOpen(true)}
        disabled={isSubmitting}
      >
        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
        Call Technician
      </Button>

      <CallTechnicianModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSubmit={handleSubmit}
      />
    </>
  );
}
