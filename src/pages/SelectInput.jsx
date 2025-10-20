import React, { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

const SelectInput = () => {
return (
    <>
        <div className="bg-gray-100 pt-24 px-8 sm:px-16 min-h-screen">
            <Navbar />
            <div className="pt-16 pb-8">
                <h1 className="font-bold text-3xl text-gray-800 text-center">Input Data Pelanggan</h1>
            </div>
            <div className="max-w-md mx-auto space-y-4">
                <Link to="/input-data/registrasi" className="block">
                    <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105">
                        Registrasi Pelanggan Baru
                    </button>
                </Link>
                <Link to="/input-data/form" className="block">
                    <button className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105">
                        Input Data Pelanggan Lama
                    </button>
                </Link>
            </div>
        </div>
    </>
);
};

export default SelectInput;
