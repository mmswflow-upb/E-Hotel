import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../lib/api";
import { useLoading } from "../contexts/LoadingContext";
import invoiceIcon from "../assets/invoice.png";

export default function Invoice() {
  const { bookingId } = useParams();
  const { showLoading, hideLoading } = useLoading();
  const [inv, setInv] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    showLoading();
    api
      .get(`/invoices/booking/${bookingId}`)
      .then((r) => setInv(r.data[0])) // Get the first invoice since getInvoicesByBooking returns an array
      .catch((e) => setErr(e.message))
      .finally(() => hideLoading());
  }, [bookingId]);

  if (err) return <p className="err text-center py-8">{err}</p>;
  if (!inv) return null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="flex flex-col items-center">
          <div className="flex items-center space-x-2">
            <img
              src={invoiceIcon}
              alt="Invoice"
              className="h-8 w-8 dark:invert dark:brightness-0 dark:opacity-80"
            />
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
              Invoice {inv.invoiceID}
            </h2>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-300 dark:border-gray-600 p-6">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Room Charges
              </h3>
              <ul className="list-disc pl-5 space-y-2 text-gray-600 dark:text-gray-300">
                {inv.roomCharges.map((charge, i) => (
                  <li key={i}>
                    Room {charge.roomNumber}: ${charge.total} ({charge.nights}{" "}
                    nights)
                  </li>
                ))}
              </ul>
            </div>

            {inv.serviceCharges.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Service Charges
                </h3>
                <ul className="list-disc pl-5 space-y-2 text-gray-600 dark:text-gray-300">
                  {inv.serviceCharges.map((charge, i) => (
                    <li key={i}>
                      {charge.name}: ${charge.total} ({charge.quantity}{" "}
                      {charge.unit})
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xl font-semibold text-gray-900 dark:text-white">
                Total: ${inv.totalAmount}
              </p>
              <div className="mt-4 space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <p>
                  Date:{" "}
                  {new Date(inv.issueDate._seconds * 1000).toLocaleDateString()}
                </p>
                <p>
                  Status:{" "}
                  <span
                    className={`px-2 py-1 rounded text-sm font-medium ${
                      inv.status === "Paid"
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        : inv.status === "Pending"
                        ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                        : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                    }`}
                  >
                    {inv.status}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
