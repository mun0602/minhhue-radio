"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import styles from "@/app/admin/admin-layout.module.css";
import { LayoutDashboard, FileText, FolderOpen, Image, Globe, LogOut, Terminal } from "lucide-react";

interface AdminSidebarProps {
  user: {
    name: string | null;
    email: string;
    role: string;
  };
}

export default function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
      });
      if (res.ok) {
        router.push("/admin/login");
        router.refresh();
      }
    } catch (error) {
      console.error("Lỗi đăng xuất:", error);
    }
  };

  const navItems = [
    { name: "Tổng quan", href: "/admin", icon: LayoutDashboard },
    { name: "Bài viết", href: "/admin/posts", icon: FileText },
    { name: "Danh mục", href: "/admin/categories", icon: FolderOpen },
    { name: "Thư viện Media", href: "/admin/media", icon: Image },
  ];

  return (
    <aside className={styles.sidebar}>
      <div className={styles.topSection}>
        <div className={styles.logo}>
          <Terminal size={24} color="#6366f1" />
          <span>EmDash.</span>
        </div>

        <nav>
          <ul className={styles.menu}>
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
              return (
                <li
                  key={item.href}
                  className={`${styles.menuItem} ${isActive ? styles.activeItem : ""}`}
                >
                  <Link href={item.href}>
                    <item.icon size={18} />
                    <span>{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      <div className={styles.bottomSection}>
        <div className={styles.menuItem}>
          <Link href="/" target="_blank">
            <Globe size={18} />
            <span>Xem Website ↗</span>
          </Link>
        </div>

        <div className={styles.userCard}>
          <div className={styles.userAvatar}>
            {(user.name || "A").substring(0, 1).toUpperCase()}
          </div>
          <div className={styles.userInfo}>
            <span className={styles.userName}>{user.name || "Quản trị viên"}</span>
            <span className={styles.userRole}>{user.role}</span>
          </div>
        </div>

        <button onClick={handleLogout} className={styles.logoutBtn}>
          <LogOut size={18} />
          <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
}
