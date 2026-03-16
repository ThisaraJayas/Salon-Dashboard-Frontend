"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { User as FirebaseUser } from "firebase/auth";
import { onAuthStateChanged, signOut } from "firebase/auth";
import axios from "axios";
import { auth } from "@/lib/firebase";
import Swal, { SweetAlertOptions } from "sweetalert2";
import { toast } from "react-toastify";

import logoImage from "../../../assets/Gem Craft Logo.jpg";

import {
  ChevronLeft,
  Gem,
  LogOut,
  User,
  Calendar,
  Clock,
  UserCircle,
  Camera,
  Images,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { Inter } from "next/font/google";

import { AuthUser } from "@/app/types/auth";
import ManagePostsPage from "@/components/Reviewer_Dashboard/ManagePostsPage";
import ReviewerProfile from "@/components/Reviewer_Dashboard/ReviewerProfilePage";
import ManageGalleryPage from "@/components/Reviewer_Dashboard/ManageGalleryPage";
import AddToGallery from "@/components/Reviewer_Dashboard/AddToGallery";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-inter",
});

/* ===========================
   DateTimeDisplay Component
=========================== */
const DateTimeDisplay = ({
  currentDay,
  currentDate,
  currentTime,
}: {
  currentDay: string;
  currentDate: string;
  currentTime: string;
}) => {
  // Get abbreviated day for mobile (e.g., "Tue" instead of "Tuesday")
  const abbreviatedDay = currentDay.slice(0, 3);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="flex items-center rounded-xl px-3 py-1.5"
    >
      {/* Mobile: Abbreviated day and time */}
      <div className="flex items-center gap-2 sm:hidden">
        <span className="text-xs font-medium text-gray-900">
          {abbreviatedDay}
        </span>
        <div className="w-px h-4 bg-gray-300"></div>
        <span className="text-xs font-semibold text-gray-900">
          {currentTime}
        </span>
      </div>

      {/* Desktop: Full date and time */}
      <div className="hidden sm:flex items-center gap-3">
        {/* Calendar Icon */}
        <Calendar className="w-4 h-4 text-gray-800" />

        {/* Separator */}
        <div className="w-px h-5 bg-gray-300"></div>

        {/* Date Info */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-900">
            {currentDay}
          </span>
          <span className="text-xs text-gray-900">{currentDate}</span>
        </div>

        {/* Separator */}
        <div className="w-px h-5 bg-gray-300"></div>

        {/* Time with Clock Icon */}
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-800" />
          <span className="text-xs font-semibold text-gray-900">
            {currentTime}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

const StaffDashboardPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const activeTab = searchParams.get("tab") ?? "posts";
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [adminUser, setAdminUser] = useState<AuthUser | null>(null);

  const mainContentRef = useRef<HTMLElement>(null);

  const [currentTime, setCurrentTime] = useState<string>("");
  const [currentDate, setCurrentDate] = useState<string>("");
  const [currentDay, setCurrentDay] = useState<string>("");

  const handleTabChange = (tab: string) => {
    router.push(`?tab=${tab}`);
  };

  /* ======================================================
     Date & Time Updates
  ====================================================== */
  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();

      // Format date: "February 11, 2026"
      const dateOptions: Intl.DateTimeFormatOptions = {
        month: "long",
        day: "numeric",
        year: "numeric",
      };
      setCurrentDate(now.toLocaleDateString("en-US", dateOptions));

      // Format time: "03:09 PM"
      const timeOptions: Intl.DateTimeFormatOptions = {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      };
      setCurrentTime(now.toLocaleTimeString("en-US", timeOptions));

      // Format day: "Tuesday"
      const dayOptions: Intl.DateTimeFormatOptions = { weekday: "long" };
      setCurrentDay(now.toLocaleDateString("en-US", dayOptions));
    };

    // Update immediately
    updateDateTime();

    // Update every minute
    const interval = setInterval(updateDateTime, 60000);

    return () => clearInterval(interval);
  }, []);

  /* ======================================================
     Scroll reset on tab change
  ====================================================== */
  useEffect(() => {
    mainContentRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [activeTab]);

  /* ======================================================
     Auth Guard
  ====================================================== */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.replace("/auth/login");
        return;
      }

      try {
        const token = await user.getIdToken();
        const { data } = await axios.get<{ user: AuthUser }>(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/me`,
          { headers: { Authorization: `Bearer ${token}` } },
        );

        if (data.user.role !== "REVIEWER") {
          router.replace("/auth/login");
          return;
        }

        setFirebaseUser(user);
        setAdminUser(data.user);
      } catch {
        router.replace("/auth/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  /* ======================================================
     Handle sidebar toggle with animation lock
  ====================================================== */
  const handleSidebarToggle = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setIsSidebarCollapsed(!isSidebarCollapsed);
    setTimeout(() => setIsAnimating(false), 300);
  };

  /* ======================================================
     Logout
  ====================================================== */
  const handleLogout = async () => {
    const result = await Swal.fire({
      title: "Logout?",
      text: "Are you sure you want to logout?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#000",
      confirmButtonText: "Yes, logout",
      cancelButtonText: "No, Stay In",
      customClass: {
        popup: "!rounded-3xl font-inter",
        title: "!font-inter",
        container: "!font-inter",
        confirmButton:
          "!rounded-full !px-5 !py-2 !text-sm font-inter !font-semibold",
        cancelButton:
          "!rounded-full !px-5 !py-2 !text-sm font-inter !font-semibold",
      },
      scrollbarPadding: false,
    } as SweetAlertOptions);

    if (result.isConfirmed) {
      try {
        await signOut(auth);
        router.push("/auth/login");
        toast.success("Logged out successfully");
      } catch {
        toast.error("Logout failed. Please try again.");
      }
    }
  };

  const tabLabels: Record<string, string> = {
    posts: "Gem Posts",
    images: "Add to Gallery",
    my_gallery: "Manage Gallery",
    profile: "Profile",
  };

  const navItems = [
    { icon: Gem, label: "Gem Posts", tab: "posts" },
    { icon: Camera, label: "Add to Gallery", tab: "images" },
    { icon: Images, label: "Manage Gallery", tab: "my_gallery" },
    { icon: UserCircle, label: "Profile", tab: "profile" },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "posts":
        return <ManagePostsPage />;
      case "images":
        return <AddToGallery />;
      case "my_gallery":
        return <ManageGalleryPage />;
      case "profile":
        return <ReviewerProfile />;
      default:
        return <ManagePostsPage />;
    }
  };

  return (
    <div className={`flex h-screen bg-gray-50 ${inter.className}`}>
      {/* ======================================================
         SIDEBAR with Smooth Animation
      ====================================================== */}
      <motion.aside
        initial={false}
        animate={{ width: isSidebarCollapsed ? "5rem" : "16rem" }}
        transition={{
          type: "tween",
          duration: 0.25,
          ease: "easeInOut",
        }}
        className="hidden lg:flex flex-col bg-white dark:bg-blue-950 border-r border-gray-200 dark:border-gray-700 shadow-sm sticky top-0 z-40 overflow-hidden"
      >
        {/* ================= LOGO with Animation ================= */}
        <div className="p-5 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between h-12 relative">
            <motion.div
              className="flex items-center overflow-hidden"
              animate={{
                justifyContent: isSidebarCollapsed ? "center" : "flex-start",
              }}
            >
              {/* Logo */}
              <motion.div
                animate={{
                  scale: isSidebarCollapsed ? 0.95 : 1,
                }}
                transition={{
                  duration: 0.3,
                  ease: "easeOut",
                }}
              >
                <Image
                  src={logoImage}
                  alt="Logo"
                  width={40}
                  height={40}
                  className="rounded-lg border-2 border-gray-100 dark:border-gray-300"
                />
              </motion.div>

              {/* Text */}
              <motion.div
                animate={{
                  opacity: isSidebarCollapsed ? 0 : 1,
                  width: isSidebarCollapsed ? 0 : "auto",
                  x: isSidebarCollapsed ? -20 : 0,
                  marginLeft: isSidebarCollapsed ? 0 : 12,
                }}
                transition={{
                  duration: 0.3,
                  ease: "easeOut",
                }}
                className="overflow-hidden whitespace-nowrap"
              >
                <div className="leading-tight">
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    G L C
                  </p>
                  <p className="text-xs text-gray-700 dark:text-gray-300">
                    Reviewer Dashboard
                  </p>
                </div>
              </motion.div>
            </motion.div>

            <motion.button
              onClick={handleSidebarToggle}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="absolute -right-3.5 top-11.5 bg-white dark:bg-gray-600 border border-gray-400 dark:border-gray-600 rounded-full p-1.5 shadow-md hover:shadow-lg transition-shadow z-50"
            >
              <ChevronLeft
                className={`w-4 h-4 text-gray-700 dark:text-gray-300 transition-transform duration-250 ${
                  isSidebarCollapsed ? "rotate-180" : ""
                }`}
              />
            </motion.button>
          </div>
        </div>

        {/* ================= TAB NAVIGATION ================= */}
        <nav className="flex-1 px-2 py-4 space-y-1">
          {navItems.map(({ icon: Icon, label, tab }) => {
            const isActive = activeTab === tab;
            return (
              <motion.div key={tab} initial={false} className="px-1">
                <motion.button
                  onClick={() => handleTabChange(tab)}
                  whileTap={{ scale: 0.98 }}
                  className={`relative w-full flex items-center rounded-2xl p-3 transition-all duration-200 ${
                    isActive
                      ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white font-medium border dark:border-gray-200"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white border border-gray-300 dark:border-gray-600"
                  } ${isSidebarCollapsed ? "justify-center" : ""}`}
                >
                  {/* Active Indicator - Simple black line */}
                  {isActive && (
                    <motion.div
                      layoutId="active-indicator"
                      className="absolute left-0 w-1 h-6 bg-gray-900 dark:bg-white rounded-r-full"
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 25,
                      }}
                    />
                  )}

                  {/* Icon - Clean and simple */}
                  <div
                    className={`p-2 rounded-lg transition-colors ${
                      isActive
                        ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300"
                    } ${isSidebarCollapsed ? "" : "mr-3"}`}
                  >
                    <Icon className="w-4.5 h-4.5" />
                  </div>

                  {/* Label with smooth width animation */}
                  {!isSidebarCollapsed && (
                    <motion.div
                      initial={false}
                      animate={{
                        opacity: 1,
                        x: 0,
                      }}
                      exit={{
                        opacity: 0,
                        x: -8,
                      }}
                      transition={{
                        duration: 0.15,
                        ease: "easeOut",
                      }}
                      className="flex-1 min-w-0 text-left overflow-hidden"
                    >
                      <span className="text-sm tracking-wide text-gray-900 dark:text-white">
                        {label}
                      </span>
                    </motion.div>
                  )}
                </motion.button>
              </motion.div>
            );
          })}
        </nav>

        {/* =================  PROFILE DESIGN ================= */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div
            className={`flex ${isSidebarCollapsed ? "justify-center" : "items-start"}`}
          >
            {/* Circular Avatar with inset effect */}
            <div className="relative flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 p-[2px] shadow-sm">
                <div className="w-full h-full rounded-full bg-white dark:bg-gray-800 overflow-hidden border border-gray-700/80 dark:border-gray-500">
                  {adminUser?.profilePicture ? (
                    <Image
                      src={adminUser.profilePicture}
                      alt="Profile"
                      width={48}
                      height={48}
                      className="object-cover w-full h-full"
                    />
                  ) : firebaseUser?.photoURL ? (
                    <Image
                      src={firebaseUser.photoURL}
                      alt="Profile"
                      width={48}
                      height={48}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-50 dark:bg-gray-700">
                      <User className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Expanded Profile Details */}
            {!isSidebarCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25 }}
                className="flex-1 min-w-0 ml-4"
              >
                {/* Name and Role */}
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate mb-0.5">
                    {adminUser?.firstname
                      ? `${adminUser.firstname} ${adminUser.lastname || ""}`.trim()
                      : "System Admin"}
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400 truncate mb-2">
                    {adminUser?.email || firebaseUser?.email}
                  </p>
                </div>

                {/* Action Button */}
                <div className="flex gap-2">
                  <motion.button
                    onClick={handleLogout}
                    whileHover={{ backgroundColor: "#111827" }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 text-xs font-medium px-4 py-2.5 rounded-xl bg-gray-900 dark:bg-gray-700 text-white hover:shadow transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Logout
                  </motion.button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </motion.aside>

      {/* ======================================================
         MOBILE AREA
      ====================================================== */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header - Fixed with hamburger menu */}
        <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white z-30 border-b border-gray-200">
          <div className="flex items-center justify-between h-full px-6">
            <div className="flex items-center gap-3">
              <Image
                src={logoImage}
                alt="Logo"
                width={40}
                height={40}
                className="rounded-lg border border-gray-300"
              />
              <div>
                <h1 className="text-lg font-medium text-gray-900">
                  <span className="font-bold">G L C</span>
                </h1>
                <p className="text-xs text-gray-800">Reviewer Dashboard</p>
              </div>
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex items-center gap-2 px-2.5 py-2.5 rounded-full outline-1 outline-gray-700 bg-gray-100 hover:bg-gray-100 transition-colors group"
              aria-label="Toggle menu"
            >
              <div className="relative w-4 h-3.5 flex flex-col justify-between">
                <span
                  className={`w-full h-0.5 bg-gray-700 rounded-full transition-all duration-300 origin-left ${
                    mobileMenuOpen ? "rotate-45 translate-y-1.5" : ""
                  }`}
                ></span>
                <span
                  className={`w-full h-0.5 bg-gray-700 rounded-full transition-all duration-300 ${
                    mobileMenuOpen ? "opacity-0" : ""
                  }`}
                ></span>
                <span
                  className={`w-full h-0.5 bg-gray-700 rounded-full transition-all duration-300 origin-left ${
                    mobileMenuOpen ? "-rotate-45 -translate-y-1.5" : ""
                  }`}
                ></span>
              </div>
            </button>
          </div>
        </header>

        {/* Bottom Sheet Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileMenuOpen(false)}
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
              />

              {/* Bottom Sheet */}
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed bottom-0 left-0 right-0 bg-white dark:bg-blue-950 rounded-t-2xl shadow-2xl z-50 lg:hidden border-t border-gray-200 dark:border-gray-700"
              >
                <div className="p-6">
                  {/* Drag handle */}
                  <div className="flex justify-center mb-6">
                    <div className="w-12 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600"></div>
                  </div>

                  {/* Profile Section */}
                  <div className="flex items-center gap-3 mb-6 px-4 py-3 bg-gradient-to-br from-gray-50 to-indigo-100 dark:from-gray-700 dark:to-gray-600 rounded-2xl">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-50 to-indigo-200 dark:from-gray-600 dark:to-gray-500 p-[2px]">
                      <div className="w-full h-full rounded-full bg-white dark:bg-gray-800 overflow-hidden border border-gray-700 dark:border-gray-500">
                        {adminUser?.profilePicture ? (
                          <Image
                            src={adminUser.profilePicture}
                            alt="Profile"
                            width={48}
                            height={48}
                            className="object-cover w-full h-full"
                          />
                        ) : firebaseUser?.photoURL ? (
                          <Image
                            src={firebaseUser.photoURL}
                            alt="Profile"
                            width={48}
                            height={48}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-indigo-100 dark:bg-gray-600">
                            <User className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                        {adminUser?.firstname
                          ? `${adminUser.firstname} ${adminUser.lastname || ""}`.trim()
                          : "Reviewer"}
                      </h4>
                      <p className="text-xs text-gray-800 dark:text-gray-300 truncate">
                        {adminUser?.email || firebaseUser?.email}
                      </p>
                    </div>
                  </div>

                  {/* Menu items */}
                  <div className="space-y-1">
                    {navItems.map(({ icon: Icon, label, tab }, index) => {
                      const isActive = activeTab === tab;

                      return (
                        <motion.div
                          key={tab}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            delay: index * 0.05,
                          }}
                        >
                          <button
                            onClick={() => {
                              handleTabChange(tab); // Use handler
                              setMobileMenuOpen(false);
                            }}
                            className={`flex items-center w-full gap-4 px-4 py-3 rounded-2xl transition-all ${
                              isActive
                                ? "bg-gray-100 dark:bg-gray-700 text-black dark:text-white font-bold border dark:border-gray-600"
                                : "hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600"
                            }`}
                          >
                            <div
                              className={`p-2 rounded-lg ${
                                isActive
                                  ? "bg-gray-900 dark:bg-white"
                                  : "bg-gray-100 dark:bg-gray-700"
                              }`}
                            >
                              <Icon
                                size={20}
                                className={
                                  isActive
                                    ? "text-white dark:text-gray-900"
                                    : "text-gray-700 dark:text-gray-300"
                                }
                              />
                            </div>
                            <span className="font-medium">{label}</span>
                            {isActive && (
                              <div className="ml-auto w-2 h-2 rounded-full bg-gray-900 dark:bg-white animate-pulse"></div>
                            )}
                          </button>
                        </motion.div>
                      );
                    })}

                    {/* Logout Button */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: navItems.length * 0.05 }}
                      className="pt-2 mt-4 border-t border-gray-200 dark:border-gray-700"
                    >
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full gap-4 px-4 py-3 rounded-xl transition-all hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
                      >
                        <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
                          <LogOut size={20} />
                        </div>
                        <span className="font-medium">Logout</span>
                      </button>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Content with padding for fixed header */}
        <main
          ref={mainContentRef}
          className="flex-1 flex flex-col overflow-hidden mt-16 lg:mt-0"
        >
          {/* Fixed Breadcrumbs Section */}
          <div className="shrink-0">
            <div className="p-3 pl-4 pr-4">
              <div className="flex items-center justify-between">
                {activeTab !== "posts" && (
                  <nav className="text-xs sm:text-sm text-gray-500">
                    <ol className="flex items-center space-x-2">
                      <li>
                        <button
                          onClick={() => handleTabChange("posts")}
                          className="hover:text-gray-800"
                        >
                          Posts
                        </button>
                      </li>
                      <li>/</li>
                      <li className="font-medium text-gray-900">
                        {tabLabels[activeTab]}
                      </li>
                    </ol>
                  </nav>
                )}

                {/* Spacer when no breadcrumbs */}
                {activeTab === "posts" && <div />}

                {/* Date and Time Display on the right */}
                <DateTimeDisplay
                  currentDay={currentDay}
                  currentDate={currentDate}
                  currentTime={currentTime}
                />
              </div>
            </div>
          </div>

          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto pl-6 pr-6 bg-gradient-to-br from-indigo-50/70 via-blue-50/40 to-yellow-50/60">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default StaffDashboardPage;
