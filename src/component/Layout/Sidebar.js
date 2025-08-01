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
	ChevronDownIcon,
	ChevronUpIcon,
	ArrowRightEndOnRectangleIcon,
} from '@heroicons/react/24/outline';
import logo from "../../assets/logo/logocarebox.png";
import logoicon from "../../assets/logo/logocareboxicon.png";
import { Link, useNavigate } from 'react-router-dom';
import { FaCaretDown, FaUser, FaUserAlt } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { logout } from '../../redux/actions/authActions';
import { FaBox, FaCaretUp } from 'react-icons/fa6';
import { TiUserAdd } from 'react-icons/ti';
import { PiUserList } from 'react-icons/pi';

const menuItems = [
	{ label: 'Dashboard', href: '/', icon: <HomeIcon className="h-5 w-5" /> },
	{
		label: 'User', icon: <FaUser className="h-5 w-5" />, children: [
			{ label: 'Create User', icon: <TiUserAdd className='h-5 w-5' />, href: '/create-user' },
			{ label: 'User List', icon: <PiUserList className='h-5 w-5' />, href: '/userlist' },
		]
	},
	{
		label: 'Orders & Pickups', icon: <TruckIcon className="h-5 w-5" />
		, children: [
			{ label: 'Create Order', icon: <FaBox className='h-5 w-5' />, href: '/create-order', }
		]
	},
	{ label: 'Exceptions & NDR', href: '', icon: <ExclamationTriangleIcon className="h-5 w-5" /> },
	{ label: 'Finances', href: '', icon: <BanknotesIcon className="h-5 w-5" /> },
	{ label: 'Support', href: '', icon: <LifebuoyIcon className="h-5 w-5" /> },
	{ label: 'Reports', href: '', icon: <DocumentTextIcon className="h-5 w-5" /> },
	{ label: 'Information Center', href: '', icon: <InformationCircleIcon className="h-5 w-5" /> },
	{ label: 'Services', href: '', icon: <WrenchScrewdriverIcon className="h-5 w-5" /> },
	{ label: 'Settings', href: '', icon: <Cog6ToothIcon className="h-5 w-5" /> },
];

const Sidebar = () => {
	const [open, setOpen] = useState(false);
	const [openDropdown, setOpenDropdown] = useState(null);

	const dispatch = useDispatch();
	const navigate = useNavigate();

	const handleLogout = () => {
		dispatch(logout());
		navigate("/login");
	};

	return (
		<>
			<div
				className={`fixed top-0 left-0 h-screen transition-all duration-700 ${open ? 'w-60' : 'w-16'} bg-gray-900 text-white z-50 group`}
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
					{menuItems.map((item, idx) => (
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
											{item.children.map((child, cIdx) => (
												<Link to={child.href} key={cIdx}>
													<div className="py-1 flex justify-start items-start gap-3 text-md hover:text-red-400 cursor-pointer">
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
