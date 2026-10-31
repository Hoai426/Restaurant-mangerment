"use client";

import { useRouter } from "next/navigation";
import type { User } from "@/types/user";
import { getRoleLabel, getStatusLabel } from "@/constants/user.constants";

/** Formats date to Vietnamese locale */
function formatDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

interface UserTableProps {
  users: User[];
}

export default function UserTable({ users }: UserTableProps) {
  const router = useRouter();

  return (
    <div className="overflow-x-auto rounded-2xl border border-gray-100/50 shadow-sm">
      <table className="rms-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Tên đăng nhập</th>
            <th>Họ và tên</th>
            <th>Email</th>
            <th>Số điện thoại</th>
            <th>Vai trò</th>
            <th>Trạng thái</th>
            <th>Ngày tạo</th>
          </tr>
        </thead>

        <tbody>
          {users.map((user) => (
            <tr
              key={user.id}
              onClick={() => router.push(`/dashboard/users/${user.id}`)}
              className="cursor-pointer"
            >
              <td className="font-medium text-rms-charcoal">{user.id}</td>

              <td className="font-mono text-sm">{user.username}</td>

              <td>{user.fullName}</td>

              <td className="text-sm">{user.email}</td>

              <td className="text-sm">{user.phone}</td>

              <td>
                <span className="rms-badge rms-badge--role">
                  {getRoleLabel(user.role)}
                </span>
              </td>

              <td>
                <span
                  className={`rms-badge ${
                    user.isActive
                      ? "rms-badge--active"
                      : "rms-badge--inactive"
                  }`}
                >
                  {getStatusLabel(user.isActive)}
                </span>
              </td>

              <td className="text-sm text-gray-500 whitespace-nowrap">
                {formatDate(user.createdAt)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}