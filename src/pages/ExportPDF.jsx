import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { pelangganService } from '../services/supabaseServices';
import { useAuth } from '../contexts/AuthContext';
import { FaFilePdf, FaDownload, FaFilter } from 'react-icons/fa';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const ExportPDF = () => {
    const { profile, isAdmin } = useAuth();
    const [pelangganData, setPelangganData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({
        status: 'all',
        cabang: 'all',
        desa: 'all'
    });

    useEffect(() => {
        fetchPelangganData();
    }, []);

    const fetchPelangganData = async () => {
        setLoading(true);
        try {
            const data = await pelangganService.getAll();
            // Filter berdasarkan role
            if (!isAdmin()) {
                // User biasa hanya bisa lihat pelanggan mereka sendiri
                const filteredData = data.filter(p => p.user_id === profile.id);
                setPelangganData(filteredData);
            } else {
                setPelangganData(data);
            }
        } catch (error) {
            console.error('Error fetching pelanggan:', error);
            alert('Error fetching data: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const getFilteredData = () => {
        let filtered = [...pelangganData];

        if (filters.status !== 'all') {
            filtered = filtered.filter(p => p.status_pelanggan === filters.status);
        }

        if (filters.cabang !== 'all') {
            filtered = filtered.filter(p => p.cabang_id?.toString() === filters.cabang);
        }

        if (filters.desa !== 'all') {
            filtered = filtered.filter(p => p.desa_id?.toString() === filters.desa);
        }

        return filtered;
    };

    const generatePDF = () => {
        const filteredData = getFilteredData();

        if (filteredData.length === 0) {
            alert('Tidak ada data untuk di-export');
            return;
        }

        const doc = new jsPDF('landscape');
        
        // Header - Logo dan Judul
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('PDAM - Data Pelanggan', 148, 15, { align: 'center' });
        
        // Info User yang Export
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Diekspor oleh: ${profile.full_name || profile.email}`, 14, 25);
        doc.text(`Email: ${profile.email}`, 14, 30);
        doc.text(`Tanggal Export: ${new Date().toLocaleDateString('id-ID', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })}`, 14, 35);
        
        // Info Filter (jika ada)
        let yPos = 40;
        if (filters.status !== 'all' || filters.cabang !== 'all' || filters.desa !== 'all') {
            doc.setFont('helvetica', 'italic');
            let filterText = 'Filter: ';
            if (filters.status !== 'all') filterText += `Status=${filters.status} `;
            if (filters.cabang !== 'all') filterText += `Cabang ID=${filters.cabang} `;
            if (filters.desa !== 'all') filterText += `Desa ID=${filters.desa}`;
            doc.text(filterText, 14, yPos);
            yPos += 5;
        }

        // Summary
        doc.setFont('helvetica', 'bold');
        doc.text(`Total Data: ${filteredData.length} pelanggan`, 12, yPos);
        yPos += 10;

        // Table Header
        const headers = [
            'No',
            'ID Pelanggan',
            'Nama',
            'Alamat',
            'No. Telpon',
            'Jumlah Jiwa',
            'Status',
            'Cabang',
            'Desa',
            'Kecamatan',
            'Rayon',
            'Golongan'
        ];

        // Table Data
        const rows = filteredData.map((pelanggan, index) => [
            index + 1,
            pelanggan.id_pelanggan || '-',
            pelanggan.nama_pelanggan || '-',
            pelanggan.alamat || '-',
            pelanggan.no_telpon || '-',
            pelanggan.jumlah_jiwa || '-',
            pelanggan.status_pelanggan || '-',
            pelanggan.cabang?.nama_unit || '-',
            pelanggan.desa?.nama_desa || '-',
            pelanggan.kecamatan?.nama_kecamatan || '-',
            pelanggan.rayon?.nama_rayon || '-',
            pelanggan.golongan?.nama_golongan || '-'
        ]);

        // Generate table
        autoTable(doc, {
            head: [headers],
            body: rows,
            startY: yPos,
            theme: 'striped',
            tableWidth: 'auto',
            headStyles: {
                fillColor: [59, 130, 246], // Blue
                textColor: 255,
                fontStyle: 'bold',
                halign: 'center',
                fontSize: 7
            },
            styles: {
                fontSize: 7,
                cellPadding: 1.5,
                overflow: 'linebreak',
                halign: 'left'
            },
            columnStyles: {
                0: { halign: 'center', cellWidth: 10 },   // No
                1: { cellWidth: 20 },                     // ID Pelanggan
                2: { cellWidth: 22 },                     // Nama
                3: { cellWidth: 25 },                     // Alamat
                4: { cellWidth: 20 },                     // No Telpon
                5: { halign: 'center', cellWidth: 15 },  // Jumlah Jiwa
                6: { halign: 'center', cellWidth: 15 },  // Status
                7: { cellWidth: 22 },                     // Cabang
                8: { cellWidth: 22 },                     // Desa
                9: { cellWidth: 22 },                     // Kecamatan
                10: { cellWidth: 20 },                    // Rayon
                11: { cellWidth: 20 }                     // Golongan
            },
            margin: { left: 10, right: 10, top: 10 },
            didDrawPage: (data) => {
                // Footer
                const pageCount = doc.internal.getNumberOfPages();
                const pageSize = doc.internal.pageSize;
                const pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();
                
                doc.setFontSize(8);
                doc.setFont('helvetica', 'italic');
                doc.text(
                    `Halaman ${data.pageNumber} dari ${pageCount}`,
                    data.settings.margin.left,
                    pageHeight - 10
                );
                doc.text(
                    'PDAM - Sistem Informasi Pelanggan',
                    pageSize.width / 2,
                    pageHeight - 10,
                    { align: 'center' }
                );
            }
        });

        // Save PDF
        const fileName = `Data_Pelanggan_${new Date().getTime()}.pdf`;
        doc.save(fileName);
    };

    // Get unique values for filters
    const uniqueCabang = [...new Set(pelangganData.map(p => p.cabang_id).filter(Boolean))];
    const uniqueDesa = [...new Set(pelangganData.map(p => p.desa_id).filter(Boolean))];

    return (
        <div className="bg-gray-200 pt-24 min-h-screen px-8 sm:px-16">
            <Navbar />
            
            <div className="mt-16 max-w-6xl mx-auto">
                <div className="flex items-center gap-3 mb-8">
                    <FaFilePdf className="text-red-500 text-3xl" />
                    <h1 className="text-3xl font-bold text-gray-900">Export Data Pelanggan ke PDF</h1>
                </div>

                {/* Info Box */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <h3 className="font-semibold text-blue-900 mb-2">Informasi:</h3>
                    <ul className="list-disc list-inside text-blue-800 text-sm space-y-1">
                        <li>Data yang akan di-export: {getFilteredData().length} pelanggan</li>
                        {!isAdmin() && (
                            <li className="font-semibold">Anda hanya dapat meng-export data pelanggan yang ditugaskan kepada Anda</li>
                        )}
                        <li>PDF akan mencantumkan nama dan email Anda sebagai pengekspor</li>
                        <li>Gunakan filter di bawah untuk menyaring data sebelum export</li>
                    </ul>
                </div>

                {/* Filter Section */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <FaFilter className="text-gray-600" />
                        Filter Data
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Status Pelanggan
                            </label>
                            <select
                                value={filters.status}
                                onChange={(e) => setFilters({...filters, status: e.target.value})}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="all">Semua Status</option>
                                <option value="aktif">Aktif</option>
                                <option value="tidak aktif">Tidak Aktif</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Cabang
                            </label>
                            <select
                                value={filters.cabang}
                                onChange={(e) => setFilters({...filters, cabang: e.target.value})}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="all">Semua Cabang</option>
                                {uniqueCabang.map(cabangId => (
                                    <option key={cabangId} value={cabangId}>
                                        Cabang ID: {cabangId}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Desa
                            </label>
                            <select
                                value={filters.desa}
                                onChange={(e) => setFilters({...filters, desa: e.target.value})}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="all">Semua Desa</option>
                                {uniqueDesa.map(desaId => (
                                    <option key={desaId} value={desaId}>
                                        Desa ID: {desaId}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="mt-4">
                        <button
                            onClick={() => setFilters({ status: 'all', cabang: 'all', desa: 'all' })}
                            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                        >
                            Reset Filter
                        </button>
                    </div>
                </div>

                {/* Preview Section */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h2 className="text-xl font-bold mb-4">Preview Data</h2>
                    
                    {loading ? (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                            <p className="text-gray-600 mt-4">Memuat data...</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">No</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Alamat</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kecamatan</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Golongan</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {getFilteredData().slice(0, 10).map((pelanggan, index) => (
                                        <tr key={pelanggan.id}>
                                            <td className="px-4 py-3 text-sm">{index + 1}</td>
                                            <td className="px-4 py-3 text-sm font-medium">{pelanggan.id_pelanggan}</td>
                                            <td className="px-4 py-3 text-sm">{pelanggan.nama_pelanggan}</td>
                                            <td className="px-4 py-3 text-sm">{pelanggan.alamat || '-'}</td>
                                            <td className="px-4 py-3 text-sm">
                                                <span className={`px-2 py-1 rounded-full text-xs ${
                                                    pelanggan.status_pelanggan === 'aktif' 
                                                        ? 'bg-green-100 text-green-800' 
                                                        : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {pelanggan.status_pelanggan}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm">{pelanggan.kecamatan?.nama_kecamatan || '-'}</td>
                                            <td className="px-4 py-3 text-sm">{pelanggan.golongan?.nama_golongan || '-'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {getFilteredData().length > 10 && (
                                <p className="text-sm text-gray-500 mt-4 text-center">
                                    Menampilkan 10 dari {getFilteredData().length} data. Semua data akan di-export ke PDF.
                                </p>
                            )}
                            {getFilteredData().length === 0 && (
                                <p className="text-center text-gray-500 py-8">Tidak ada data yang sesuai dengan filter</p>
                            )}
                        </div>
                    )}
                </div>

                {/* Export Button */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <button
                        onClick={generatePDF}
                        disabled={loading || getFilteredData().length === 0}
                        className="w-full md:w-auto flex items-center justify-center gap-2 bg-red-600 text-white px-8 py-4 rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-lg font-semibold"
                    >
                        <FaDownload />
                        Export ke PDF ({getFilteredData().length} data)
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ExportPDF;
