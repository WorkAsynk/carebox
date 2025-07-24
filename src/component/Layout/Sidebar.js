'use client';
import React, { useState } from 'react';
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
	ArrowRightOnRectangleIcon,
	ArrowRightEndOnRectangleIcon,
} from '@heroicons/react/24/outline';
import logo from "../../assets/logo/logocarebox.png";
import logoicon from "../../assets/logo/logocareboxicon.png";
import { Link, useNavigate } from 'react-router-dom';
import { FaUser } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { logout } from '../../redux/actions/authActions';

const menuItems = [
	{ label: 'Dashboard', href: "/", icon: <HomeIcon className="h-5 w-5" /> },
	{ label: 'Create User', href: "/create-user", icon: <FaUser className="h-5 w-5" /> },
	{ label: 'Orders & Pickups', href: "/create-order", icon: <TruckIcon className="h-5 w-5" /> },
	{ label: 'Exceptions & NDR', href: "", icon: <ExclamationTriangleIcon className="h-5 w-5" /> },
	{ label: 'Finances', href: "", icon: <BanknotesIcon className="h-5 w-5" /> },
	{ label: 'Support', href: "", icon: <LifebuoyIcon className="h-5 w-5" /> },
	{ label: 'Reports', href: "", icon: <DocumentTextIcon className="h-5 w-5" /> },
	{ label: 'Information Center', href: "", icon: <InformationCircleIcon className="h-5 w-5" /> },
	{ label: 'Services', href: "", icon: <WrenchScrewdriverIcon className="h-5 w-5" /> },
	{ label: 'Settings', href: "", icon: <Cog6ToothIcon className="h-5 w-5" /> },
];

const Sidebar = () => {
	const [open, setOpen] = useState(false);

	const dispatch = useDispatch();
	const navigate = useNavigate();

	const handleLogout = () => {
		if (window.confirm("Are you sure you want to logout?")) {
			dispatch(logout());
			navigate("/login");
		}
	};

	return (
		<>
			{/* Sidebar */}
			<div
				className={`fixed top-0 left-0 h-screen transition-all duration-700 ${open ? 'w-60' : 'w-16'
					} bg-gray-900 text-white z-50 group`}
				onMouseEnter={() => setOpen(true)}
				onMouseLeave={() => setOpen(false)}
			>
				{/* Logo */}
				<div className="flex items-center justify-center px-3 py-4 border-b border-red-600">
					{open ? (
						<img className="h-[80px]" src={logo} alt="logo" />
					) : (
						<img src={logoicon} alt="logo icon" />
					)}
				</div>

				{/* Menu Items */}
				<nav className="flex flex-col mt-4">
					{menuItems.map((item, idx) => (
						<Link to={item.href} key={idx}>
							<div className="flex items-center px-4 py-3 hover:bg-red-600 cursor-pointer transition-all">
								{item.icon}
								<span className={`ml-4 text-sm ${!open && 'hidden'}`}>{item.label}</span>
							</div>
						</Link>
					))}
				</nav>

				{/* Logout Button */}
				<div
					onClick={handleLogout}
					className="mt-auto absolute bottom-0 w-full hover:bg-red-600 px-4 py-3 flex items-center cursor-pointer transition-all"
				>
					<ArrowRightEndOnRectangleIcon className="h-5 w-5" />
					<span className={`ml-4 text-sm ${!open && 'hidden'}`}>Logout</span>
				</div>

				{/* Bottom gradient */}
				{/* <div className="absolute bottom-0 w-full h-24 bg-gradient-to-t from-gray-800 to-transparent"></div> */}
			</div>

			{/* Toggle Button */}
			<button
				onClick={() => setOpen(!open)}
				className="fixed top-[3.2rem] left-[4%] z-50 p-1 rounded-md bg-gray-800 border border-red-500 hover:bg-red-600 transition-all duration-300"
				style={{ transform: open ? 'translateX(170px) translateY(45px)' : 'translateX(0)' }}
			>
				{open ? (
					<ChevronDoubleLeftIcon className="h-5 w-5 text-white" />
				) : (
					<ChevronDoubleRightIcon className="h-5 w-5 text-white" />
				)}
			</button>
		</>
	);
};

export default Sidebar;
