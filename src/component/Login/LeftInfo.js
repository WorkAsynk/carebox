import React from "react";
import {
	FaTruckMoving,
	FaGlobeAsia,
	FaShoppingCart,
	FaUndoAlt,
	FaMoneyCheckAlt,
} from "react-icons/fa";

const LeftInfo = () => {
	return (
		<div className="  p-8 flex flex-col justify-center">
			<h2 className="text-5xl pb-5 font-semibold mb-6 border-b-4 border-red-500 inline-block">
				Supercharge your shipping experience
			</h2>

			<ul className="space-y-6 text-gray-700 text-lg">
				<li className="flex items-start gap-3">
					<FaTruckMoving className="text-2xl text-black" />
					Deliver nationwide — reach every corner of India
				</li>
				<li className="flex items-start gap-3">
					<FaGlobeAsia className="text-2xl text-black" />
					Access Parcel, B2B Cargo and International shipments from a single account
				</li>
				<li className="flex items-start gap-3">
					<FaShoppingCart className="text-2xl text-black" />
					Integrate and sync orders from your website in one click
				</li>
				<li className="flex items-start gap-3">
					<FaUndoAlt className="text-2xl text-black" />
					Reduce returns by up to 40% with our AI-driven RTO predictor
				</li>
				<li className="flex items-start gap-3">
					<FaMoneyCheckAlt className="text-2xl text-black" />
					Receive COD remittance within 2 days at no extra cost
				</li>
			</ul>

			<div className="mt-10 text-xl text-gray-600">
				<p className="mb-2">
					<span className="font-semibold text-[#000]">Trusted by 20,000+ brands</span>, Delhivery empowers India’s e-commerce
				</p>
				{/* <div className="grid grid-cols-4 gap-3 mt-4">
					{[
						"meesho", "flipkart", "amazon", "ajio",
						"nykaa", "myntra", "jiomart", "mamaearth",
						"myglamm", "hm"
					].map((brand, index) => (
						<div
							key={index}
							className="bg-white rounded-md shadow-sm p-2 text-center text-xs font-medium capitalize"
						>
							{brand}
						</div>
					))}
				</div> */}
			</div>
		</div>
	);
};

export default LeftInfo;
