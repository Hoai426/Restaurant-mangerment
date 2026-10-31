import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";

export interface AlertProps {
  type: "success" | "error";
  message: string;
}

export function Alert({ type, message }: AlertProps) {
  if (!message) return null;

  return (
    <div
      className={`rms-alert ${type === "success" ? "rms-alert--success" : "rms-alert--error"} mb-4`}
      role="alert"
    >
      {type === "success" ? (
        <CheckCircleIcon className="w-5 h-5 shrink-0" strokeWidth={2.5} />
      ) : (
        <XCircleIcon className="w-5 h-5 shrink-0" strokeWidth={2} />
      )}
      <span>{message}</span>
    </div>
  );
}
