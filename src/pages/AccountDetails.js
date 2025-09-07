import React, { useMemo, useState, useEffect } from 'react'
import Sidebar from '../component/Layout/Sidebar'
import Topbar from '../component/Layout/Topbar'
import { useSelector } from 'react-redux'
import { 
	CurrencyDollarIcon, 
	ExclamationTriangleIcon, 
	ShoppingCartIcon 
} from '@heroicons/react/24/outline'

// Animated Number Component
const AnimatedNumber = ({ value, duration = 2000 }) => {
	const [currentValue, setCurrentValue] = useState(0)

	useEffect(() => {
		let startTime = null
		const startValue = 0
		const endValue = value

		const animate = (timestamp) => {
			if (!startTime) startTime = timestamp
			const progress = Math.min((timestamp - startTime) / duration, 1)
			
			// Easing function for smooth animation
			const easeOutQuart = 1 - Math.pow(1 - progress, 4)
			const current = startValue + (endValue - startValue) * easeOutQuart
			
			setCurrentValue(Math.floor(current))
			
			if (progress < 1) {
				requestAnimationFrame(animate)
			}
		}

		requestAnimationFrame(animate)
	}, [value, duration])

	return <span>{currentValue.toLocaleString()}</span>
}

// Metric Box Component
const MetricBox = ({ title, value, icon: Icon, color = "black" }) => {
	return (
		<div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
			<div className="flex items-center justify-between">
				<div className="flex-1">
					<p className="text-sm font-medium text-gray-600 uppercase tracking-wide mb-2">
						{title}
					</p>
					<p className="text-3xl font-bold text-black mb-1">
						<AnimatedNumber value={value} />
					</p>
				</div>
				<div className="ml-4">
					<div className="p-3 rounded-full bg-gray-100">
						<Icon className="h-8 w-8 text-black" />
					</div>
				</div>
			</div>
		</div>
	)
}

const AccountDetails = () => {
	const { user } = useSelector((state) => state.auth)

	// Static numbers for demo (replace with real data later)
	const metrics = {
		totalAmountPaid: 125000,
		outstandingAmount: 15500,
		totalOrders: 342
	}

	const displayName = useMemo(() => {
		return (
			user?.name || user?.fullName || [user?.firstName, user?.lastName].filter(Boolean).join(' ') || 'User'
		)
	}, [user])

	const initials = useMemo(() => {
		const name = displayName?.trim()
		if (name && name !== 'User') {
			const parts = name.split(/\s+/)
			if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
			return (parts[0][0] + (parts[1]?.[0] || '')).toUpperCase()
		}
		if (user?.email) return String(user.email).split('@')[0].slice(0, 2).toUpperCase()
		return 'U'
	}, [displayName, user])

	return (
		<div className='flex'>
			<Sidebar />
			<div className='flex-1'>
				<Topbar />
				<div className='p-6 max-w-[1200px] mx-auto'>
					{/* Header Card */}
					<div className='bg-white rounded-lg shadow p-6 flex items-center gap-5 mb-6'>
						<div className='h-16 w-16 rounded-full bg-gradient-to-br from-gray-800 to-gray-600 text-white flex items-center justify-center text-xl font-semibold'>
							{initials}
						</div>
						<div className='flex-1'>
							<h1 className='text-xl md:text-2xl font-semibold text-gray-900'>{displayName}</h1>
							<div className='mt-1 text-sm text-gray-600'>{user?.email || '—'}</div>
						</div>
						{user?.role && (
							<span className='px-3 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700 border border-gray-200'>
								{user.role}
							</span>
						)}
					</div>

					{/* Metrics Grid */}
					<div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
						<MetricBox
							title="Total Amount Paid"
							value={metrics.totalAmountPaid}
							icon={CurrencyDollarIcon}
						/>
						<MetricBox
							title="Outstanding Amount"
							value={metrics.outstandingAmount}
							icon={ExclamationTriangleIcon}
						/>
						<MetricBox
							title="Total Orders"
							value={metrics.totalOrders}
							icon={ShoppingCartIcon}
						/>
					</div>

					{/* Details Grid */}
					<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
						<div className='bg-white rounded-lg shadow p-5'>
							<p className='text-gray-500 text-xs uppercase tracking-wide'>Full Name</p>
							<p className='text-gray-900 text-base mt-1'>{displayName}</p>
						</div>
						<div className='bg-white rounded-lg shadow p-5'>
							<p className='text-gray-500 text-xs uppercase tracking-wide'>Email</p>
							<p className='text-gray-900 text-base mt-1 break-all'>{user?.email || '—'}</p>
						</div>
						<div className='bg-white rounded-lg shadow p-5'>
							<p className='text-gray-500 text-xs uppercase tracking-wide'>Phone</p>
							<p className='text-gray-900 text-base mt-1'>{user?.phone || user?.mobile || '—'}</p>
						</div>
						<div className='bg-white rounded-lg shadow p-5'>
							<p className='text-gray-500 text-xs uppercase tracking-wide'>Role</p>
							<p className='text-gray-900 text-base mt-1'>{user?.role || '—'}</p>
						</div>
					</div>
					
				</div>
			</div>
		</div>
	)
}

export default AccountDetails


