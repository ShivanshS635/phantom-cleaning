import { useState } from "react";

export default function MonthlyReportDownload() {
    const downloadMonthlyReport = async (month) => {
        try {
            const token = localStorage.getItem("token"); // or memory store

            const res = await fetch(
                `${process.env.REACT_APP_API_URL}/api/reports/monthly?month=${month}`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (!res.ok) throw new Error("Download failed");

            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);

            const a = document.createElement("a");
            a.href = url;
            a.download = `PhantomCleaning_${month}.xlsx`;
            document.body.appendChild(a);
            a.click();

            a.remove();
            window.URL.revokeObjectURL(url);

        } catch (err) {
            alert("Failed to download report");
            console.error(err);
        }
    };

    return (
        <div className="flex gap-10 items-center bg-white px-4 py-1 rounded-xl shadow">
            <h2 className="text-lg font-semibold">📊 Download Monthly Report</h2>

            <div className="flex gap-3 items-center">
                <input
                    type="month"
                    onChange={(e) => downloadMonthlyReport(e.target.value)}
                    className="border p-2 rounded"
                />
            </div>
        </div>
    );
}