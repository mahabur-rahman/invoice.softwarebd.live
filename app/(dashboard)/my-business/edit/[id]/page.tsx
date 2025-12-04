"use client";

import { SINGLE_BUSINESS_QUERY } from "@/lib/graphql/queries/invoice.queries";
import { SingleBusinessQueryResponse } from "@/lib/interfaces/responseTypes";
import ItemNotFound from "@/utils/ItemNotFound";
import { useQuery } from "@apollo/client/react";
import { useParams } from "next/navigation";

const Page = () => {
    const { id } = useParams();

    const { data, loading, error } = useQuery<SingleBusinessQueryResponse>(
        SINGLE_BUSINESS_QUERY,
        {
            variables: { id },
        }
    );

    if (loading) {
        return (
            <div className="py-20 text-center text-gray-500 text-lg">
                Loading business...
            </div>
        );
    }

    if (error) {
        return <ItemNotFound title="Business" />;
    }

    if (!data || !data.singleBusiness) {
        return <ItemNotFound title="Business" />;
    }

    const business = data.singleBusiness;

    return (
        <div className="p-6">
            <h1 className="text-2xl font-semibold mb-4">Edit Business</h1>

            <p className="text-gray-600 mb-1">
                <strong>ID:</strong> {business._id}
            </p>

            <p className="text-gray-800 text-xl">
                Editing: <strong>{business.companyName}</strong>
            </p>
        </div>
    );
};

export default Page;
