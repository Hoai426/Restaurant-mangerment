import { useQuery } from "@tanstack/react-query";
import { paymentService } from "../services/payment.service";
import type { PaymentResponse } from "@/types/payment";

export function usePayments() {
  return useQuery<PaymentResponse[], Error>({
    queryKey: ["payments", "list"],
    queryFn: () => paymentService.getAllPayments(),
    staleTime: 30 * 1000,
  });
}

export default usePayments;
