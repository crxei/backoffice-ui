import { useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ChevronLeft } from "lucide-react";
import { useRate, useCreateRate, useUpdateRate } from "../../hooks/useRates";
import { PageHeader } from "../../components/shared/PageHeader";
import { PageLoader } from "../../components/shared/LoadingSpinner";
import { type RateEntityType } from "../../data/rates";

const rateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  serviceCode: z.string().min(1, "Service code is required"),
  type: z.enum(["COMPANY", "AGENT"] as const),
  rate: z.number().min(0, "Rate must be 0 or greater"),
  active: z.boolean(),
});

type RateFormValues = z.infer<typeof rateSchema>;

const ENTITY_TYPE_OPTIONS: { value: RateEntityType; label: string }[] = [
  { value: "COMPANY", label: "Company" },
  { value: "AGENT", label: "Agent" },
];

export function RateFormPage() {
  const { rateId } = useParams<{ rateId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isEdit = !!rateId;

  const { data: existing, isLoading } = useRate(rateId ?? "");
  const { mutate: createRate, isPending: creating } = useCreateRate();
  const { mutate: updateRate, isPending: updating } = useUpdateRate();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RateFormValues>({
    resolver: zodResolver(rateSchema),
    defaultValues: {
      name: "Default",
      serviceCode: searchParams.get("serviceCode") ?? "",
      type: "AGENT",
      rate: 0,
      active: true,
    },
  });

  useEffect(() => {
    if (existing) {
      reset({
        name: existing.name,
        serviceCode: existing.serviceCode,
        type: existing.type,
        rate: existing.rate,
        active: existing.active,
      });
    }
  }, [existing, reset]);

  const onSubmit: SubmitHandler<RateFormValues> = (values) => {
    if (isEdit) {
      updateRate(
        { id: rateId!, data: values },
        { onSuccess: () => navigate("/rates") },
      );
    } else {
      createRate(values, { onSuccess: () => navigate("/rates") });
    }
  };

  if (isEdit && isLoading) return <PageLoader />;

  const isPending = creating || updating;

  return (
    <div>
      <div className="mb-4">
        <button
          onClick={() => navigate("/rates")}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <ChevronLeft className="h-4 w-4" /> Back to Rates
        </button>
      </div>

      <PageHeader
        title={isEdit ? "Edit Rate" : "Add Rate"}
        description={
          isEdit
            ? `Editing rate ${rateId}`
            : "Configure a new provider payment rate"
        }
      />

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl space-y-5">
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <h3 className="font-semibold text-gray-900 text-sm">Rate Details</h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name *
              </label>
              <input
                {...register("name")}
                placeholder="Default"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.name && (
                <p className="text-xs text-red-600 mt-1">{errors.name.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Service Code *
              </label>
              <input
                {...register("serviceCode")}
                placeholder="H0036"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.serviceCode && (
                <p className="text-xs text-red-600 mt-1">
                  {errors.serviceCode.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type *
              </label>
              <select
                {...register("type")}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {ENTITY_TYPE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rate ($) *
              </label>
              <input
                {...register("rate", { valueAsNumber: true })}
                type="number"
                step="0.01"
                min="0"
                placeholder="13.25"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.rate && (
                <p className="text-xs text-red-600 mt-1">{errors.rate.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                {...register("active")}
                type="checkbox"
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Active</span>
            </label>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isPending}
            className="px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {isPending
              ? isEdit
                ? "Saving…"
                : "Creating…"
              : isEdit
                ? "Save Changes"
                : "Create Rate"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/rates")}
            className="px-6 py-2.5 border border-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
