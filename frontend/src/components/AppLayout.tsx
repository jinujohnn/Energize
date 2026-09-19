
import { ReactNode, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import api from "../api/axios";

interface AppLayoutProps {
    children: ReactNode;
    title: string;
    subtitle?: string;

}

const AppLayout = ({
    children,
    title,
    subtitle,
}: AppLayoutProps) => {
    const [menuOpen, setMenuOpen] = useState(false);

    const location = useLocation();

    const isActive = (path: string) => {
        if (path === "/dashboard") {
            return location.pathname === "/dashboard";
        }

        if (path === "/projects") {
            return location.pathname.startsWith("/projects");
        }

        if (path === "/tasks") {
            return location.pathname === "/tasks";
        }

        if (path === "/assets") {
            return location.pathname === "/assets";
        }

        return false;
    };
    const [userName, setUserName] = useState("");
    useEffect(() => {
    const fetchUser = async () => {
        try {
            const response = await api.get("/user");
            const name = response.data.name.split(" ")
        .map((part:string) => part.charAt(0))
        .slice(0, 2)
        .join("")
        .toUpperCase();
            setUserName(name);
        } catch (error) {
            console.error("Failed to load user:", error);
        }
    };}, []);

    const closeMenu = () => {
        setMenuOpen(false);
    };

    const getNavClass = (path: string) => {
        return `flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition ${
            isActive(path)
                ? "bg-blue-50 font-semibold text-blue-700"
                : "font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900"
        }`;
    };

    const getMobileNavClass = (path: string) => {
        return `flex items-center gap-3 rounded-xl px-3 py-3 text-sm ${
            isActive(path)
                ? "bg-blue-50 font-semibold text-blue-700"
                : "font-medium text-slate-600 hover:bg-slate-50"
        }`;
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900">

            {/* =====================================================
                DESKTOP SIDEBAR
            ===================================================== */}

            <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-slate-200 bg-white lg:block">

                <div className="flex h-full flex-col">

                    {/* Logo */}
                    <div className="flex h-20 items-center border-b border-slate-100 px-6">

                        <div>
                            <h1 className="text-xl font-bold tracking-tight text-slate-900">
                                Energize
                            </h1>

                            <p className="text-xs text-slate-400">
                                Energy Management
                            </p>
                        </div>

                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 space-y-1 px-3 py-6">

                        <Link
                            to="/dashboard"
                            className={getNavClass("/dashboard")}
                        >
                            <span>▦</span>
                            Dashboard
                        </Link>

                        <Link
                            to="/projects"
                            className={getNavClass("/projects")}
                        >
                            <span>▣</span>
                            Projects
                        </Link>

                        <Link
                            to="/tasks"
                            className={getNavClass("/tasks")}
                        >
                            <span>✓</span>
                            Tasks
                        </Link>

                        <Link
                            to="/assets"
                            className={getNavClass("/assets")}
                        >
                            <span>◈</span>
                            Assets
                        </Link>

                    </nav>

                    {/* Profile */}
                    <div className="border-t border-slate-100 p-4">

                        <Link
                            to="/profile"
                            className="flex items-center gap-3 rounded-xl p-2 transition hover:bg-slate-50"
                        >

                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">
                                 {userName
                                    ? userName
                                    : "U"}
                            </div>

                            <div>
                                <p className="text-sm font-semibold text-slate-800">
                                    Account
                                </p>

                                <p className="text-xs text-slate-400">
                                    View profile
                                </p>
                            </div>

                        </Link>

                    </div>

                </div>

            </aside>


            {/* =====================================================
                MAIN CONTENT
            ===================================================== */}

            <main className="lg:pl-64">

                {/* =================================================
                    HEADER
                ================================================= */}

                <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-slate-200 bg-white/90 px-5 backdrop-blur sm:px-6 md:px-8">

                    {/* Page Title */}
                    <div className="min-w-0">

                        {subtitle && (
                            <p className="truncate text-xs font-medium text-slate-400 sm:text-sm">
                                {subtitle}
                            </p>
                        )}

                        <h2 className="truncate text-base font-bold text-slate-900 sm:text-lg">
                            {title}
                        </h2>

                    </div>


                    {/* Right Side */}
                    <div className="flex shrink-0 items-center gap-2 sm:gap-3">

                        {/* Notification */}
                        {/* <button
                            type="button"
                            aria-label="Notifications"
                            className="relative rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                        >
                            <span className="text-xl">
                                ♢
                            </span>

                            <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-blue-600" />
                        </button> */}


                        {/* Profile */}
                        <Link
                            to="/profile"
                            aria-label="Profile"
                            className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white"
                        >
                             {userName
                                    ? userName
                                    : "U"}
                        </Link>


                        {/* Mobile Three-Dot Menu */}
                        <button
                            type="button"
                            onClick={() =>
                                setMenuOpen((current) => !current)
                            }
                            aria-label="Open navigation menu"
                            aria-expanded={menuOpen}
                            className="flex h-10 w-10 items-center justify-center rounded-xl text-2xl font-bold leading-none text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 lg:hidden"
                        >
                            ⋮
                        </button>

                    </div>

                </header>


                {/* =================================================
                    MOBILE MENU
                ================================================= */}

                {menuOpen && (
                    <>
                        {/* Overlay */}
                        <button
                            type="button"
                            aria-label="Close navigation menu"
                            onClick={closeMenu}
                            className="fixed inset-0 z-30 bg-slate-950/20 lg:hidden"
                        />

                        {/* Menu */}
                        <div className="fixed right-4 top-[76px] z-40 w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-xl lg:hidden">

                            <div className="border-b border-slate-100 px-3 py-3">

                                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                    Navigation
                                </p>

                            </div>

                            <nav className="mt-1">

                                <Link
                                    to="/dashboard"
                                    onClick={closeMenu}
                                    className={getMobileNavClass(
                                        "/dashboard"
                                    )}
                                >
                                    <span>▦</span>
                                    Dashboard
                                </Link>

                                <Link
                                    to="/projects"
                                    onClick={closeMenu}
                                    className={getMobileNavClass(
                                        "/projects"
                                    )}
                                >
                                    <span>▣</span>
                                    Projects
                                </Link>

                                <Link
                                    to="/tasks"
                                    onClick={closeMenu}
                                    className={getMobileNavClass(
                                        "/tasks"
                                    )}
                                >
                                    <span>✓</span>
                                    Tasks
                                </Link>

                                <Link
                                    to="/assets"
                                    onClick={closeMenu}
                                    className={getMobileNavClass(
                                        "/assets"
                                    )}
                                >
                                    <span>◈</span>
                                    Assets
                                </Link>

                                <div className="my-2 border-t border-slate-100" />

                                <Link
                                    to="/profile"
                                    onClick={closeMenu}
                                    className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50"
                                >
                                    <span>●</span>
                                    Profile
                                </Link>

                            </nav>

                        </div>
                    </>
                )}


                {/* =================================================
                    PAGE CONTENT
                ================================================= */}

               
                    {children}


            </main>

        </div>
    );
};

export default AppLayout;
