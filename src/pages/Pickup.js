import axios from 'axios';
import React, { useEffect, useState } from 'react'
import Sidebar from '../component/Layout/Sidebar'
import Topbar from '../component/Layout/Topbar'
import PickupList from '../component/Pickup/PickupList';
import { useSelector } from 'react-redux';
import { API_ENDPOINTS, buildApiUrl } from '../config/api';

const Pickup = () => {
    const { user } = useSelector((state) => state.auth);
    const [packages, setPackages] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchPackages = async () => {
            if (!user?.id) {
                setPackages([]);
                setIsLoading(false);
                return;
            }
            setIsLoading(true);
            try {
                const token = localStorage.getItem('token');
                const url = buildApiUrl(API_ENDPOINTS.DELIVERY_LIST);
                const { data } = await axios.get(url, {
                    params: { user_id: user.id },
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });
                if (data?.success && Array.isArray(data?.packages)) {
                    setPackages(data.packages);
                } else {
                    setPackages([]);
                }
            } catch (err) {
                setPackages([]);
            } finally {
                setIsLoading(false);
            }
        };
        fetchPackages();
    }, [user]);

    const pickupItems = packages.map((awb) => ({
        deliveryBoy: user?.name || '—',
        pickupAddress: String(awb || '-'),
    }));

    

    return (
        <div className='flex'>
            <Sidebar />
            <div className='flex-1'>
                <Topbar />
                <div className='p-6'>
                    <PickupList items={pickupItems} loading={isLoading} currentUser={user} />
                </div>
            </div>
        </div>
    )
}

export default Pickup


