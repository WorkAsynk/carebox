import { Button, Option, Select } from '@material-tailwind/react';
import React from 'react';
import { FaAngleLeft, FaAngleRight } from 'react-icons/fa';
import { FaRightLeft } from 'react-icons/fa6';

const Pagination = ({ page, totalPages, setPage }) => {
	const getPageNumbers = () => {
		const pages = [];

		if (totalPages <= 6) {
			for (let i = 1; i <= totalPages; i++) pages.push(i);
		} else {
			pages.push(1);

			if (page > 3) pages.push('...');

			const start = Math.max(2, page - 1);
			const end = Math.min(totalPages - 1, page + 1);

			for (let i = start; i <= end; i++) pages.push(i);

			if (page < totalPages - 2) pages.push('...');

			pages.push(totalPages);
		}

		return pages;
	};

	return (
		<div className="flex flex-col md:flex-row justify-between items-center gap-4 mt-6">
			{/* Page numbers */}
			<div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-full">
				<button
					onClick={() => setPage(p => Math.max(p - 1, 1))}
					className="w-10 h-10 rounded-full bg-[#000] text-white flex items-center justify-center hover:bg-[#f44336] transition"
					disabled={page === 1}
				>
					<FaAngleLeft />
				</button>

				{getPageNumbers().map((pg, index) => (
					<button
						key={index}
						onClick={() => typeof pg === 'number' && setPage(pg)}
						className={`px-3 w-10 h-10 py-1 rounded-full border transition text-sm ${pg === page
							? 'border-[#f44336] text-[#f44336] font-semibold bg-white'
							: 'border-transparent text-gray-700 hover:text-[#f44336]'
							}`}
						disabled={pg === '...'}
					>
						{pg}
					</button>
				))}

				<button
					onClick={() => setPage(p => Math.min(p + 1, totalPages))}
					className="w-10 h-10 rounded-full bg-[#000] text-white flex items-center justify-center hover:bg-[#f44336] transition"
					disabled={page === totalPages}
				>
					<FaAngleRight />
				</button>
			</div>

			{/* Go to Page */}
			<div className="flex items-center gap-3 text-sm">
				<span className="text-gray-800 font-medium whitespace-nowrap">Go to page:</span>

				<div className="relative">
					<Select
						label="Page"
						value={page.toString()}
						onChange={(val) => setPage(Number(val))}
						className="w-32 text-sm pr-16" // space for GO button
						containerProps={{
							className: "min-w-[100px]",
						}}
						menuProps={{
							className: "z-[999]",
						}}
						color="red"
					>
						{Array.from({ length: totalPages }, (_, i) => (
							<Option key={i} value={(i + 1).toString()}>
								{i + 1}
							</Option>
						))}
					</Select>

					<Button
						onClick={() => { }}
						size="sm"
						className="!absolute right-1 top-1/2 -translate-y-1/2 rounded-full bg-[#000] hover:opacity-90 text-white px-4 py-1 text-xs normal-case shadow-md"
					>
						GO
					</Button>
				</div>
			</div>

		</div>
	);
};

export default Pagination;
