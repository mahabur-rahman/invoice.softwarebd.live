"use client";

import React from "react";

interface ItemNotFoundProps {
    title: string; 
}

const ItemNotFound: React.FC<ItemNotFoundProps> = ({ title }) => {
    return (
        <div className="w-full flex flex-col items-center justify-center py-20 text-center">
            <h1 className="text-3xl font-semibold text-gray-800 mb-3">
                {title} Not Found
            </h1>
            <p className="text-gray-500 text-lg">
                The {title.toLowerCase()} you&apos;re looking for doesn&apos;t exist or was removed.
            </p>
        </div>
    );
};

export default ItemNotFound;
