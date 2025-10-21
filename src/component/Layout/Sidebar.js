'use client';
import React, { useState, useEffect } from 'react';
import {
	HomeIcon,
	TruckIcon,
	ExclamationTriangleIcon,
	BanknotesIcon,
	LifebuoyIcon,
	DocumentTextIcon,
	InformationCircleIcon,
	WrenchScrewdriverIcon,
	Cog6ToothIcon,
	ChevronDoubleLeftIcon,
	ChevronDoubleRightIcon,
	ChevronDownIcon,
	ChevronUpIcon,
	ArrowRightEndOnRectangleIcon,
	BuildingLibraryIcon,
	BuildingOfficeIcon,
} from '@heroicons/react/24/outline';
import logo from "../../assets/logo/logocarebox.png";
import logoicon from "../../assets/logo/logocareboxicon.png";
import { Link, useNavigate } from 'react-router-dom';
import { FaAddressBook, FaCaretDown, FaList, FaTruck, FaUser, FaUserAlt } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../redux/actions/authActions';
import { FaBox, FaCaretUp } from 'react-icons/fa6';
import { TiUserAdd } from 'react-icons/ti';
import { PiUserList } from 'react-icons/pi';
import { IoIosCreate } from 'react-icons/io';
import { CalculatorIcon, MapPinIcon } from '@heroicons/react/24/outline';

const menuItems = [
	{ 
		label: 'Dashboard', 
		href: '/', 
		icon: <HomeIcon className="h-5 w-5" />,
		allowedRoles: [] // All authenticated users
	},
	{ 
		label: 'Tracker', 
		href: '/tracker', 
		icon: <MapPinIcon className="h-5 w-5" />,
		allowedRoles: [] // All authenticated users
	},
	{
		label: 'User', 
		icon: <FaUser className="h-5 w-5" />, 
		allowedRoles: ['Admin'], // Only Admin can see User management
		children: [
			{ label: 'Create User', icon: <TiUserAdd className='h-5 w-5' />, href: '/create-user', allowedRoles: ['Admin'] },
			{ label: 'User List', icon: <PiUserList className='h-5 w-5' />, href: '/userlist', allowedRoles: ['Admin'] },
		]
	},	
	{
		label: 'Orders & Pickups', 
		icon: <TruckIcon className="h-5 w-5" />,
		allowedRoles: ['Admin', 'Franchise', 'Developer'], // Based on your route changes
		children: [
			{ label: 'Create Order', icon: <FaBox className='h-5 w-5' />, href: '/create-order', allowedRoles: ['Admin', 'Franchise', 'Developer'] },
			{ label: 'Order List', icon: <FaList className='h-5 w-5' />, href: '/orderlist', allowedRoles: ['Admin', 'Franchise', 'Operational Manager', 'Developer'] }
		]
	},
	{
		label: 'Warehouse', 
		icon: <BuildingOfficeIcon className="w-5 h-5" />,
		allowedRoles: ['Admin', 'Franchise', 'Operational Manager'],
		children: [
			{ label: 'Create Address', icon: <IoIosCreate className='h-5 w-5' />, href: '/create-address', allowedRoles: ['Admin', 'Franchise', 'Operational Manager'] },
			{ label: 'Address List', icon: <FaBox className='h-5 w-5' />, href: '/addresslist', allowedRoles: ['Admin', 'Franchise', 'Operational Manager'] }
		]
	},
	{
		label: 'Rate Calculator', 
		icon: <CalculatorIcon className="w-5 h-5" />,
		allowedRoles: ['Admin', 'Franchise', 'Operational Manager', 'Developer'], // All except Client
		children: [
			{ label: 'Domestic Calculator', icon: <CalculatorIcon className='h-5 w-5' />, href: '/domestic-calculator', allowedRoles: ['Admin', 'Franchise', 'Operational Manager', 'Developer'] }
		]
	},
	{
		label: 'Invoices', 
		icon: <DocumentTextIcon className="w-5 h-5" />,
		allowedRoles: ['Admin', 'Franchise', 'Operational Manager', 'Developer', 'Client'], // All roles can see section
		children: [
			{ label: 'Create Invoice', icon: <IoIosCreate className='h-5 w-5' />, href: '/create-invoice', allowedRoles: ['Admin', 'Franchise', 'Operational Manager'] },
			{ label: 'Invoice Download', icon: <DocumentTextIcon className='h-5 w-5' />, href: '/invoice-download', allowedRoles: ['Admin', 'Franchise', 'Operational Manager', 'Developer', 'Client'] }
		]
	},
	{
		label: 'Finances', 
		icon: <BanknotesIcon className="w-5 h-5" />,
		allowedRoles: ['Admin', 'Operational Manager', 'Franchise'], // Only Admin and Operational Manager
		children: [
			{ label: 'Purchase Billing', icon: <BanknotesIcon className='h-5 w-5' />, href: '/billing-info', allowedRoles: ['Admin', 'Operational Manager'] },
			{ label: 'Sales Billing', icon: <BanknotesIcon className='h-5 w-5' />, href: '/franchise-billing-info', allowedRoles: ['Franchise'] }
		]
	},
	{
		label: 'Bags', 
		icon: <FaBox className="w-5 h-5" />,
		allowedRoles: ['Admin', 'Franchise', 'Operational Manager'],
		children: [
			{ label: 'Create Bag', icon: <IoIosCreate className='h-5 w-5' />, href: '/create-bag', allowedRoles: ['Admin', 'Franchise', 'Operational Manager'] },
			{ label: 'Bag List', icon: <FaBox className='h-5 w-5' />, href: '/bag-list', allowedRoles: ['Admin', 'Franchise', 'Operational Manager'] }
		]
	},
	// {
	// 	label: 'Delivery Boy', 
	// 	icon: <FaTruck className="w-5 h-5" />,
	// 	allowedRoles: ['Admin', 'Franchise', 'Operational Manager'],
	// 	children: [
	// 		{ label: 'Assign Delivery Boy', icon: <FaTruck className='h-5 w-5' />, href: '/assign-delivery-boy', allowedRoles: ['Admin', 'Franchise', 'Operational Manager'] }
	// 	]
	// },
	{ 
		label: 'Settings', 
		href: '/settings', 
		icon: <Cog6ToothIcon className="h-5 w-5" />,
		allowedRoles: ['Admin']
	},
];

const Sidebar = () => {
    const [open, setOpen] = useState(false);
    const [openDropdown, setOpenDropdown] = useState(null);
    const [mobileOpen, setMobileOpen] = useState(false);

	const dispatch = useDispatch();
	const navigate = useNavigate();
	const user = useSelector((state) => state.auth?.user);
	const userRole = user?.role;

	// Function to check if user has access to menu item
	const hasAccess = (allowedRoles) => {
		// If no roles specified, allow all authenticated users
		if (!allowedRoles || allowedRoles.length === 0) {
			return true;
		}
		// Check if user's role is in allowed roles
		return allowedRoles.includes(userRole);
	};

	// Filter menu items based on user role
	const getFilteredMenuItems = () => {
		return menuItems.filter(item => {
			// Check if user has access to main menu item
			if (!hasAccess(item.allowedRoles)) {
				return false;
			}

			// If item has children, filter them too
			if (item.children) {
				const filteredChildren = item.children.filter(child => hasAccess(child.allowedRoles));
				// Only show parent if it has accessible children
				if (filteredChildren.length === 0) {
					return false;
				}
				// Update the item with filtered children
				item.filteredChildren = filteredChildren;
			}

			return true;
		});
	};

	const filteredMenuItems = getFilteredMenuItems();

	const handleLogout = () => {
		dispatch(logout());
		navigate("/login");
	};

    // Properly attach mobile toggle listener
    useEffect(() => {
        const handler = () => setMobileOpen(prev => !prev);
        window.addEventListener('toggle-mobile-sidebar', handler);
        return () => window.removeEventListener('toggle-mobile-sidebar', handler);
    }, []);

    return (
        <>
            {/* Desktop Sidebar */}
            <div
                className={`hidden md:block fixed top-0 left-0 h-screen transition-all duration-700 ${open ? 'w-60' : 'w-16'} bg-gray-900 text-white z-40 group`}
                onMouseEnter={() => setOpen(true)}
                onMouseLeave={() => setOpen(false)}
            >
				<div className="flex items-center justify-center px-3 py-4 border-b border-red-600">
					{open ? (
						<img className="h-[80px]" src={logo} alt="logo" />
					) : (
						<img src={logoicon} alt="logo icon" />
					)}
				</div>

				<nav className="flex flex-col mt-4">
					{filteredMenuItems.map((item, idx) => (
						<div key={idx}>
							{item.children ? (
								<>
									<div
										onClick={() => setOpenDropdown(openDropdown === idx ? null : idx)}
										className="flex items-center justify-between px-4 py-3 hover:bg-red-600 cursor-pointer transition-all"
									>
										<div className="flex items-center gap-2">
											{item.icon}
											<span className={`text-sm ${!open && 'hidden'}`}>{item.label}</span>
										</div>
										{open && (openDropdown === idx ? <FaCaretUp className="h-4 w-4" /> : <FaCaretDown className="h-4 w-4" />)}
									</div>
									{open && openDropdown === idx && (
										<div className="ml-10 space-y-3 text-sm">
											{(item.filteredChildren || item.children).map((child, cIdx) => (
												<Link to={child.href} key={cIdx}>
													<div className="px-4 py-2 flex justify-start items-start gap-3 text-md hover:text-red-400 cursor-pointer">
														{child.icon}
														<span>{child.label}</span>
													</div>
												</Link>
											))}
										</div>
									)}
								</>
							) : (
								<Link to={item.href}>
									<div className="flex items-center px-4 py-3 hover:bg-red-600 cursor-pointer transition-all">
										{item.icon}
										<span className={`ml-4 text-sm ${!open && 'hidden'}`}>{item.label}</span>
									</div>
								</Link>
							)}
						</div>
					))}
				</nav>

				<div
					onClick={handleLogout}
					className="mt-auto absolute bottom-0 w-full hover:bg-red-600 px-4 py-3 flex items-center cursor-pointer transition-all"
				>
					<ArrowRightEndOnRectangleIcon className="h-5 w-5" />
					<span className={`ml-4 text-sm ${!open && 'hidden'}`}>Logout</span>
				</div>
			</div>

            {/* Desktop Toggle */}
            <button
                onClick={() => setOpen(!open)}
                className="hidden md:flex fixed top-[3.2rem] left-[4%] z-40 p-1 rounded-md bg-gray-800 border border-red-500 hover:bg-red-600 transition-all duration-300"
                style={{ transform: open ? 'translateX(170px) translateY(45px)' : 'translateX(0)' }}
            >
                {open ? (
                    <ChevronDoubleLeftIcon className="h-5 w-5 text-white" />
                ) : (
                    <ChevronDoubleRightIcon className="h-5 w-5 text-white" />
                )}
            </button>

            {/* Mobile Overlay Sidebar */}
            <div className={`md:hidden fixed inset-0 z-50 ${mobileOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
                {/* Backdrop */}
                <div
                    className={`absolute inset-0 bg-black/40 transition-opacity ${mobileOpen ? 'opacity-100' : 'opacity-0'}`}
                    onClick={() => setMobileOpen(false)}
                />
                {/* Drawer */}
                <div className={`absolute top-0 left-0 h-full w-64 bg-gray-900 text-white transform transition-transform duration-300 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    <div className="flex items-center justify-between px-4 py-4 border-b border-red-600">
                        <img className="h-[48px]" src={logo} alt="logo" />
                        <button onClick={() => setMobileOpen(false)} className="p-2 rounded-md bg-gray-800 border border-red-500">
                            <ChevronDoubleLeftIcon className="h-5 w-5 text-white" />
                        </button>
                    </div>
                    <nav className="flex flex-col mt-2">
                        {filteredMenuItems.map((item, idx) => (
                            <div key={idx}>
                                {item.children ? (
                                    <>
                                        <div
                                            onClick={() => setOpenDropdown(openDropdown === idx ? null : idx)}
                                            className="flex items-center justify-between px-4 py-3 hover:bg-red-600 cursor-pointer transition-all"
                                        >
                                            <div className="flex items-center gap-2">
                                                {item.icon}
                                                <span className={`text-sm`}>{item.label}</span>
                                            </div>
                                            {openDropdown === idx ? <FaCaretUp className="h-4 w-4" /> : <FaCaretDown className="h-4 w-4" />}
                                        </div>
                                        {openDropdown === idx && (
                                            <div className="ml-10 space-y-3 text-sm">
                                                {(item.filteredChildren || item.children).map((child, cIdx) => (
                                                    <Link to={child.href} key={cIdx} onClick={() => setMobileOpen(false)}>
                                                        <div className="px-4 py-2 flex justify-start items-start gap-3 text-md hover:text-red-400 cursor-pointer">
                                                            {child.icon}
                                                            <span>{child.label}</span>
                                                        </div>
                                                    </Link>
                                                ))}
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <Link to={item.href} onClick={() => setMobileOpen(false)}>
                                        <div className="flex items-center px-4 py-3 hover:bg-red-600 cursor-pointer transition-all">
                                            {item.icon}
                                            <span className={`ml-4 text-sm`}>{item.label}</span>
                                        </div>
                                    </Link>
                                )}
                            </div>
                        ))}
                    </nav>
                </div>
            </div>
		</>
	);
};

export default Sidebar;
