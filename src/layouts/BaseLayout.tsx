import { NavLink, Outlet } from 'react-router-dom';
import logo from '../assets/tenrikyoemblem.png';
import { Link } from 'react-router-dom';
import { useLogout } from '../auth/useLogout';

const nav = [
    { to: "/home", label: "Inicio"},
    { to: "/students", label: "Alumnos" },
];

export default function BaseLayout() {
    const logout = useLogout();

    return (
        <div className="min-h-screen min-w-full flex">
            {/* Sidebar */}
            <aside className='w-60 shrink-0 bg-gray-800 text-gray-100 flex flex-col h-screen'>
                <div className='h-16 flex items-center justify-center border-b border-gray-700'>
                    <Link to="/" className='text-xl font-bold'>
                        <img src={logo} alt="Logo" className='w-12 h-12' />
                    </Link>
                </div>

                <nav className='flex-1 overflow-y-auto py-4'>
                    {nav.map(({ to, label }) => (
                        <NavLink
                            key={to}
                            to={to}
                            className={({ isActive }) =>
                                [
                                    'block px-6 py-2',
                                    isActive ? 'bg-gray-700' : 'hover:bg-gray-700/50',
                                ].join(' ')
                            }
                            >
                                {label}
                            </NavLink>
                    ))}
                </nav>

                {/* Bottom logout */}
                <div className="mt-auto p-4 border-t border-gray-700">
                    <button
                        type="button"
                        onClick={logout}
                        className="w-full rounded bg-gray-700 hover:bg-gray-600 px-4 py-2 text-sm font-medium"
                    >
                        Cerrar sesión
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className='flex-1 bg-gray-100 h-screen overflow-y-auto w-full'>
                <div className='p-6 min-w-[800px]'>
                <Outlet />
                </div>
            </main>
        </div>
    )
}