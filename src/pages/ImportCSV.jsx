import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { pelangganService } from '../services/supabaseServices';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaDownload, FaUpload, FaFileImport } from 'react-icons/fa';

const ImportCSV = () => {
    const { profile } = useAuth();
    const navigate = useNavigate();
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [importResults, setImportResults] = useState(null);

    // Check if user is admin
    React.useEffect(() => {
        if (profile && profile.role !== 'admin') {
            navigate('/dashboard');
        }
    }, [profile, navigate]);

    const downloadTemplate = () => {
        // Define CSV template columns based on actual database schema
        const headers = [
            'id_pelanggan',
            'nama_pelanggan',
            'alamat',
            'jumlah_jiwa',
            'latitude',
            'longitude',
            'no_telpon',
            'jenis_meter',
            'tanggal_pemasangan',
            'status_pelanggan',
            'foto_rumah_url',
            'cabang_id',
            'desa_id',
            'kecamatan_id',
            'rayon_id',
            'golongan_id',
            'kelompok_id',
            'distribusi',
            'sumber',
            'kondisi_meter',
            'kondisi_lingkungan',
            'kategori'
        ];

        // Sample data
        const sampleData = [
            'P001',
            'John Doe',
            'Jl. Contoh No. 123',
            '4',
            '-7.2278',
            '107.9087',
            '081234567890',
            'meter_air',
            '2025-01-15',
            'aktif',
            'https://example.com/foto.jpg',
            '1',
            '1',
            '1',
            '1',
            '1',
            '1',
            'distribusi_a',
            'sumber_a',
            'baik',
            'bersih',
            'kategori_a'
        ];

        // Helper function to escape CSV fields
        const escapeCSVField = (field) => {
            if (field === null || field === undefined) return '';
            const stringField = String(field);
            // Always wrap in quotes for Excel compatibility
            return `"${stringField.replace(/"/g, '""')}"`;
        };

        // Create CSV content with comma delimiter and quoted fields
        const headerRow = headers.map(escapeCSVField).join(',');
        const dataRow = sampleData.map(escapeCSVField).join(',');
        
        // Add UTF-8 BOM for better Excel compatibility
        const BOM = '\uFEFF';
        const csvContent = BOM + headerRow + '\n' + dataRow;
        
        // Create blob and download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', 'template_import_pelanggan.csv');
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile && selectedFile.type === 'text/csv') {
            setFile(selectedFile);
            setError('');
        } else {
            setError('Please select a valid CSV file');
            setFile(null);
        }
    };

    const parseCSV = (text) => {
        // Remove BOM if present
        const cleanText = text.replace(/^\uFEFF/, '');
        const lines = cleanText.split('\n').map(line => line.trim()).filter(line => line);
        
        if (lines.length === 0) return [];
        
        // Parse CSV line respecting quoted fields
        const parseCSVLine = (line) => {
            const result = [];
            let current = '';
            let inQuotes = false;
            
            for (let i = 0; i < line.length; i++) {
                const char = line[i];
                const nextChar = line[i + 1];
                
                if (char === '"') {
                    if (inQuotes && nextChar === '"') {
                        // Escaped quote
                        current += '"';
                        i++; // Skip next quote
                    } else {
                        // Toggle quote state
                        inQuotes = !inQuotes;
                    }
                } else if (char === ',' && !inQuotes) {
                    // Field separator
                    result.push(current.trim());
                    current = '';
                } else {
                    current += char;
                }
            }
            
            // Add last field
            result.push(current.trim());
            return result;
        };
        
        const headers = parseCSVLine(lines[0]);
        const data = [];

        for (let i = 1; i < lines.length; i++) {
            const values = parseCSVLine(lines[i]);
            const row = {};
            
            headers.forEach((header, index) => {
                row[header] = values[index] || null;
            });
            
            data.push(row);
        }

        return data;
    };

    const handleImport = async () => {
        if (!file) {
            setError('Please select a file first');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');
        setImportResults(null);

        try {
            const text = await file.text();
            const data = parseCSV(text);

            if (data.length === 0) {
                setError('No data found in CSV file');
                setLoading(false);
                return;
            }

            // Import data
            const results = {
                total: data.length,
                success: 0,
                failed: 0,
                errors: []
            };

            for (const row of data) {
                try {
                    // Convert data types according to database schema
                    const pelangganData = {
                        id_pelanggan: row.id_pelanggan,
                        nama_pelanggan: row.nama_pelanggan,
                        alamat: row.alamat,
                        jumlah_jiwa: row.jumlah_jiwa ? parseInt(row.jumlah_jiwa) : null,
                        latitude: row.latitude ? parseFloat(row.latitude) : null,
                        longitude: row.longitude ? parseFloat(row.longitude) : null,
                        no_telpon: row.no_telpon,
                        jenis_meter: row.jenis_meter || null,
                        tanggal_pemasangan: row.tanggal_pemasangan || null,
                        status_pelanggan: row.status_pelanggan || 'aktif',
                        foto_rumah_url: row.foto_rumah_url || null,
                        cabang_id: row.cabang_id ? parseInt(row.cabang_id) : null,
                        desa_id: row.desa_id ? parseInt(row.desa_id) : null,
                        kecamatan_id: row.kecamatan_id ? parseInt(row.kecamatan_id) : null,
                        rayon_id: row.rayon_id ? parseInt(row.rayon_id) : null,
                        golongan_id: row.golongan_id ? parseInt(row.golongan_id) : null,
                        kelompok_id: row.kelompok_id ? parseInt(row.kelompok_id) : null,
                        distribusi: row.distribusi || null,
                        sumber: row.sumber || null,
                        kondisi_meter: row.kondisi_meter || null,
                        kondisi_lingkungan: row.kondisi_lingkungan || null,
                        kategori: row.kategori || null,
                        user_id: profile.id // Assign to current admin
                    };

                    await pelangganService.create(pelangganData);
                    results.success++;
                } catch (err) {
                    results.failed++;
                    results.errors.push({
                        row: row.id_pelanggan || `Row ${results.success + results.failed}`,
                        error: err.message
                    });
                }
            }

            setImportResults(results);
            
            if (results.success > 0) {
                setSuccess(`Successfully imported ${results.success} out of ${results.total} records`);
            }
            
            if (results.failed > 0) {
                setError(`Failed to import ${results.failed} records. Check details below.`);
            }

        } catch (err) {
            setError('Error reading CSV file: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gray-200 pt-24 min-h-screen px-8 sm:px-16">
            <Navbar />
            
            <div className="mt-16 max-w-4xl mx-auto">
                <div className="flex items-center gap-3 mb-8">
                    <FaFileImport className="text-blue-500 text-3xl" />
                    <h1 className="text-3xl font-bold text-gray-900">Import Data Pelanggan</h1>
                </div>

                {/* Download Template Section */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h2 className="text-xl font-bold mb-4">Download Template CSV</h2>
                    <p className="text-gray-600 mb-4">
                        Download template CSV untuk memastikan format data Anda sesuai dengan yang dibutuhkan.
                    </p>
                    <button
                        onClick={downloadTemplate}
                        className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 transition-colors"
                    >
                        <FaDownload />
                        Download Template CSV
                    </button>
                </div>

                {/* Upload Section */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h2 className="text-xl font-bold mb-4">Upload File CSV</h2>
                    
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                            {error}
                        </div>
                    )}
                    
                    {success && (
                        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                            {success}
                        </div>
                    )}

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Pilih File CSV
                        </label>
                        <input
                            type="file"
                            accept=".csv"
                            onChange={handleFileChange}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                    </div>

                    {file && (
                        <div className="mb-4">
                            <p className="text-sm text-gray-600">
                                Selected file: <span className="font-semibold">{file.name}</span>
                            </p>
                        </div>
                    )}

                    <button
                        onClick={handleImport}
                        disabled={!file || loading}
                        className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                        <FaUpload />
                        {loading ? 'Importing...' : 'Import Data'}
                    </button>
                </div>

                {/* Import Results */}
                {importResults && (
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-bold mb-4">Import Results</h2>
                        
                        <div className="grid grid-cols-3 gap-4 mb-6">
                            <div className="bg-blue-100 p-4 rounded-lg text-center">
                                <p className="text-sm text-gray-600">Total Records</p>
                                <p className="text-2xl font-bold text-blue-600">{importResults.total}</p>
                            </div>
                            <div className="bg-green-100 p-4 rounded-lg text-center">
                                <p className="text-sm text-gray-600">Success</p>
                                <p className="text-2xl font-bold text-green-600">{importResults.success}</p>
                            </div>
                            <div className="bg-red-100 p-4 rounded-lg text-center">
                                <p className="text-sm text-gray-600">Failed</p>
                                <p className="text-2xl font-bold text-red-600">{importResults.failed}</p>
                            </div>
                        </div>

                        {importResults.errors.length > 0 && (
                            <div>
                                <h3 className="font-semibold mb-2">Errors:</h3>
                                <div className="bg-red-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                                    {importResults.errors.map((err, index) => (
                                        <div key={index} className="mb-2 text-sm">
                                            <span className="font-semibold">{err.row}:</span> {err.error}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Instructions */}
                <div className="bg-blue-50 rounded-lg shadow-md p-6 mt-6">
                    <h2 className="text-xl font-bold mb-4">Petunjuk Import</h2>
                    <ul className="list-disc list-inside space-y-2 text-gray-700">
                        <li>Download template CSV terlebih dahulu</li>
                        <li>Isi data sesuai dengan format yang ada di template</li>
                        <li>Field yang wajib diisi: id_pelanggan, nama_pelanggan</li>
                        <li>Format tanggal_pemasangan harus: YYYY-MM-DD (contoh: 2025-01-15)</li>
                        <li>Latitude dan Longitude harus berupa angka desimal (contoh: -7.2278, 107.9087)</li>
                        <li>Status pelanggan: 'aktif' atau 'tidak aktif'</li>
                        <li>ID referensi (cabang_id, desa_id, dll) harus berupa angka yang valid</li>
                        <li>Kosongkan kolom yang tidak diketahui (jangan gunakan tanda strip)</li>
                        <li>Simpan file dalam format CSV</li>
                        <li>Upload dan klik tombol Import Data</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default ImportCSV;
