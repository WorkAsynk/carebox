import React, { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import Barcode from "react-barcode";
import Grclogo from "../../assets/logo/logocarebox.png";
import { Button } from "@material-tailwind/react";

const ShipperCopy = ({
  order,
  formatAddress,
  packages = [],
  totalActualWeight,
  totalVolumetricWeight,
  invoiceNo,
  invoiceValue,
  ewb,
  id,
  documentType,
}) => {
  const componentRef = useRef(null);

  const handlePrint = useReactToPrint({
   contentRef: componentRef,  
    documentTitle: `Waybill-${documentType}`,
  });

  return (
    <>
      <Button onClick={() => handlePrint()} className="bg-red-600 text-white">Print {documentType}</Button>

      <div
        ref={componentRef}
        className="my-6 border-[1px] min-w-[1000px] max-w-[1200px] border-gray-600"
      >
        <div className="border-b-[1px] border-gray-600  grid grid-flow-col grid-cols-5">
          <div className="col-span-3 py-4 px-2 border-r-[1px] border-gray-600 gap-16 flex items-center justify-between">
            <div className="flex flex-col items-center justify-center bg-red-500 p-2 rounded-sm">
              <img className="w-[120px]" src={Grclogo} alt="logo" />
            </div>
            <div>
              <p className="font-[600] text-[0.8rem]">
                Web: <span>https://carebox.com</span>
              </p>
              <p className="font-[600] text-[0.8rem]">
                Email: <span>info@carebox.com</span>
              </p>
              <p className="font-[600] text-[0.8rem]">
                GST No: <span>27AAECG9349K1Z1</span>
              </p>
            </div>
          </div>
          <div className="col-span-1 py-4 px-2 border-r-[1px] border-gray-600  flex items-center justify-center">
            <Barcode
              value={String(order?.lr_no || order?.order_no || id || "")}
              height={60}
              className="w-[150px]"
            />
          </div>
          <div className="col-span-1 py-4 px-2 border-r-[1px] border-gray-600 flex-col  flex items-center justify-center">
            <h6 className="text-blue-600 font-[600]">Booking Date:</h6>
            <p>{new Date(order?.created_at || Date.now()).toDateString()}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 grid-flow-col">
          <div className="border-[1px] border-gray-600">
            <div className="border-b-[1px] text-center  text-[0.8rem] border-gray-600">
              SHIPPER
            </div>
            <div className="border-b-[1px] py-6 px-3 text-center border-gray-600">
              <p className="text-[1.2rem] font-[600]">
                {order?.sender_address?.consignee_name ||
                  order?.sender?.name ||
                  "N/A"}
              </p>
              <p className="text-[.8rem] font-[500]">
                {formatAddress?.(order?.sender_address)}
              </p>
              <p className="text-[.9rem] font-[500]">
                {order?.sender_address?.pincode || ""},{" "}
                {order?.sender_address?.city || ""},{" "}
                {order?.sender_address?.phone || ""}
              </p>
            </div>
            <div className="border-b-[1px] grid grid-cols-3  text-center   border-gray-600">
              <div className="border-[1px] border-gray-600">
                <div className="border-b-[1px] text-center  text-[0.8rem] border-gray-600">
                  PACKETS
                </div>
                <p className="text-[1.2rem] font-semibold">
                  {packages?.length || 1}
                </p>
              </div>
              <div className="border-[1px] border-gray-600">
                <div className="border-b-[1px] text-center  text-[0.8rem] border-gray-600">
                  Actual Weight
                </div>
                <p className="text-[1.2rem] font-semibold">
                  {totalActualWeight} kgs
                </p>
              </div>
              <div className="border-[1px] border-gray-600">
                <div className="border-b-[1px] text-center  text-[0.8rem] border-gray-600">
                  Volumetric Weight
                </div>
                <p className="text-[1.2rem] font-semibold">
                  {totalVolumetricWeight} kgs
                </p>
              </div>
            </div>
          </div>

          <div className="border-[1px] border-gray-600">
            <div className="border-b-[1px] text-center  text-[0.8rem] border-gray-600">
              CONSIGNEE
            </div>
            <div className="border-b-[1px] py-6 px-3 text-center border-gray-600">
              <p className="text-[1.2rem] font-[600]">
                {order?.receiver_address?.consignee_name ||
                  order?.receiver?.name ||
                  "N/A"}
              </p>
              <p className="text-[.8rem] font-[500]">
                {formatAddress?.(order?.receiver_address)}
              </p>
              <p className="text-[.9rem] font-[500]">
                {order?.receiver_address?.pincode || ""},{" "}
                {order?.receiver_address?.city || ""},{" "}
                {order?.receiver_address?.phone || ""}
              </p>
            </div>
            <div className="border-b-[1px] font-[600] text-red-600 text-center  text-[0.8rem] border-gray-600">
              CONSIGNMENT NO.
            </div>
            <div className="border-b-[1px] py-3 px-3 text-center border-gray-600">
              <p className="text-[1.2rem] font-[600]">
                {order?.lr_no || order?.order_no || "N/A"}
              </p>
            </div>
            <div className="border-b-[1px] font-[600]  text-center  text-[0.8rem] border-gray-600">
              Remark
            </div>
          </div>

          <div className="border-[1px] border-gray-600">
            <div className="border-b-[1px] grid grid-cols-2  text-center   border-gray-600">
              <div className="border-[1px] border-gray-600">
                <div className="border-b-[1px] text-center  text-[0.8rem] border-gray-600">
                  ORIGIN
                </div>
                <p className="text-[1.2rem] font-semibold">
                  {order?.sender_address?.pincode || "N/A"}
                </p>
              </div>
              <div className="border-[1px] border-gray-600">
                <div className="border-b-[1px] text-center  text-[0.8rem] border-gray-600">
                  DESTINATION
                </div>
                <p className="text-[1.2rem] font-semibold">
                  {order?.receiver_address?.pincode || "N/A"}
                </p>
              </div>
            </div>
            <div className="border-b-[1px] text-center  text-[1rem] border-gray-600">
              Order ID.
            </div>
            <div className="border-b-[1px] text-center font-[600]  text-[1rem] border-gray-600">
              {order?.order_id || order?.id || "N/A"}
            </div>
            <div>
              <div className="border-b-[1px] text-center  text-[0.8rem] border-gray-600">
                Invoice Details
              </div>
              <div className="grid grid-cols-3 grid-flow-col">
                <div className="border-r-[1px] text-center border-gray-600">
                  INV.NO{" "}
                </div>
                <div className="border-r-[1px] text-center border-gray-600">
                  INV.Value
                </div>
                <div className="border-r-[1px] text-center border-gray-600">
                  EWB
                </div>
              </div>
              <div className="grid border-[1px] border-gray-600 grid-cols-3 grid-flow-col">
                <div className="border-r-[1px] text-center border-gray-600">
                  {invoiceNo}
                </div>
                <div className="border-r-[1px] text-center border-gray-600">
                  {invoiceValue}
                </div>
                <div className="text-center">{ewb}</div>
              </div>
              <div className="border-b-[1px] py-4 px-3 text-center border-gray-600">
                <p>
                  Received above Shipment along with all document order in good
                  condition.
                </p>
                <div className="flex items-center px-6 justify-between mt-24">
                  <div>
                    <p>Signature</p>
                  </div>
                  <div>
                    <p>Stamp</p>
                  </div>
                </div>
              </div>
              <div className="py-4 px-3 text-center">
                <p>
                  Document Type : <span className="font-[600]"> {documentType}</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Package Details Table (optional) */}
        {/* {packages.length > 0 && (...) } */}
      </div>
    </>
  );
};

export default ShipperCopy;
