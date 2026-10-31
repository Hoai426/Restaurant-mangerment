import type { Metadata } from "next";
import UserDetailPage from "@/features/users/components/UserDetailPage";

export const metadata: Metadata = {
  title: "Chi tiết người dùng | Restaurant Management",
  description: "Xem thông tin chi tiết người dùng trong hệ thống quản lý nhà hàng",
};

export default async function UserDetailRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const userId = Number(id);

  if (isNaN(userId) || userId <= 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <h3 className="text-lg font-bold text-rms-charcoal">
          ID người dùng không hợp lệ
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          Vui lòng quay lại danh sách và chọn người dùng hợp lệ.
        </p>
      </div>
    );
  }

  return <UserDetailPage userId={userId} />;
}
