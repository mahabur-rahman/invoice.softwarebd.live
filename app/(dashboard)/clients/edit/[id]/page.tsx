"use client";

import AddNewClient from "@/components/client/AddNewClient";
import { FIND_ONE_CLIENT } from "@/lib/graphql/queries/invoice.queries";
import { SingleClientQueryResponse } from "@/lib/interfaces/responseTypes";
import ItemNotFound from "@/utils/ItemNotFound";
import { useQuery } from "@apollo/client/react";
import { useParams } from "next/navigation";

const Page = () => {
    const { id } = useParams();

    const { data, loading, error } = useQuery<SingleClientQueryResponse>(
        FIND_ONE_CLIENT,
        {
            variables: { id },
        }
    );

    if (loading) {
        return (
            <div className="py-20 text-center text-gray-500 text-lg">
                Loading client...
            </div>
        );
    }

    if (error) {
        return <ItemNotFound title="Client" />;
    }

    if (!data || !data.findOneClient) {
        return <ItemNotFound title="Client" />;
    }

    const client = data.findOneClient;

    return (
        <div className="p-6">
            <AddNewClient client={client} />
        </div>
    );
};

export default Page;
