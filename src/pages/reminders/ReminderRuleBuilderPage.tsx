import { useState } from "react";
import { ArrowLeft, Edit2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "../../components/shared/PageHeader";
import { toast } from "../../components/shared/Toast";

interface ReminderRule {
  id: string;
  name: string;
  trigger: string;
  delay: string;
  channels: string[];
  active: boolean;
}

const initialRules: ReminderRule[] = [
  {
    id: "R-001",
    name: "Appointment Confirmation",
    trigger: "Appointment Booked",
    delay: "Immediate",
    channels: ["email", "sms"],
    active: true,
  },
  {
    id: "R-002",
    name: "T-24h Reminder",
    trigger: "Appointment -24h",
    delay: "24h before",
    channels: ["sms", "push"],
    active: true,
  },
  {
    id: "R-003",
    name: "T-2h Reminder",
    trigger: "Appointment -2h",
    delay: "2h before",
    channels: ["sms"],
    active: true,
  },
  {
    id: "R-004",
    name: "Medication Refill",
    trigger: "Prescription Due -7d",
    delay: "7 days before",
    channels: ["sms", "push"],
    active: true,
  },
  {
    id: "R-005",
    name: "Care Plan Milestone",
    trigger: "Goal Status Change",
    delay: "Immediate",
    channels: ["email", "teams"],
    active: true,
  },
  {
    id: "R-006",
    name: "Post-Discharge Follow-up",
    trigger: "Discharge Event",
    delay: "48h after",
    channels: ["voice_call", "sms"],
    active: true,
  },
  {
    id: "R-007",
    name: "Missed Visit Alert",
    trigger: "CSW Visit Missed",
    delay: "Immediate",
    channels: ["sms", "teams"],
    active: true,
  },
  {
    id: "R-008",
    name: "Consent Expiry Warning",
    trigger: "Consent Expiry -30d",
    delay: "30 days before",
    channels: ["email", "sms"],
    active: false,
  },
];

const channelColors: Record<string, string> = {
  sms: "bg-green-100 text-green-800",
  email: "bg-blue-100 text-blue-800",
  push: "bg-purple-100 text-purple-800",
  teams: "bg-indigo-100 text-indigo-800",
  voice_call: "bg-orange-100 text-orange-800",
};

export function ReminderRuleBuilderPage() {
  const navigate = useNavigate();
  const [rules, setRules] = useState(initialRules);
  const [editingRule, setEditingRule] = useState<ReminderRule | null>(null);

  const toggleActive = (id: string) => {
    setRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, active: !r.active } : r)),
    );
    toast("info", "Rule updated");
  };

  const handleSave = () => {
    if (!editingRule) return;
    setRules((prev) =>
      prev.map((r) => (r.id === editingRule.id ? editingRule : r)),
    );
    toast("success", "Rule saved");
    setEditingRule(null);
  };

  return (
    <div>
      <button
        onClick={() => navigate("/reminders")}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Reminders
      </button>
      <PageHeader
        title="Reminder Rule Builder"
        description="Configure automated notification rules"
      />

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <th className="px-4 py-3">Rule Name</th>
                <th className="px-4 py-3">Trigger Event</th>
                <th className="px-4 py-3">Delay</th>
                <th className="px-4 py-3">Channels</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rules.map((rule) => (
                <tr key={rule.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {rule.name}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {rule.trigger}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {rule.delay}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {rule.channels.map((ch) => (
                        <span
                          key={ch}
                          className={`px-2 py-0.5 rounded text-xs font-medium ${channelColors[ch] ?? "bg-gray-100 text-gray-700"}`}
                        >
                          {ch}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleActive(rule.id)}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${rule.active ? "bg-blue-600" : "bg-gray-200"}`}
                    >
                      <span
                        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${rule.active ? "translate-x-4" : "translate-x-1"}`}
                      />
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setEditingRule({ ...rule })}
                      className="flex items-center gap-1 text-xs text-blue-600 border border-blue-200 px-2 py-1 rounded hover:bg-blue-50"
                    >
                      <Edit2 className="h-3 w-3" /> Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {editingRule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setEditingRule(null)}
          />
          <div className="relative bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="font-semibold text-gray-900 mb-4">
              Edit Rule: {editingRule.name}
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rule Name
                </label>
                <input
                  value={editingRule.name}
                  onChange={(e) =>
                    setEditingRule({ ...editingRule, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Trigger Event
                </label>
                <input
                  value={editingRule.trigger}
                  onChange={(e) =>
                    setEditingRule({ ...editingRule, trigger: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Delay
                </label>
                <input
                  value={editingRule.delay}
                  onChange={(e) =>
                    setEditingRule({ ...editingRule, delay: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={() => setEditingRule(null)}
                className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
