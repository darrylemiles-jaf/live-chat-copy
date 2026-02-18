import { useMemo } from "react";
import useSWR from "swr";
import axiosServices, { fetcher } from "../utils/axios";
import { API_URL } from "../constants/constants";

const endpoints = {
  key: `${API_URL}/api/${import.meta.env.VITE_API_VER}/tickets`,
};

export const useGetTickets = (query) => {
  const { data, isLoading, error, isValidating } = useSWR(
    [endpoints.key, query],
    ([url, params]) => fetcher(url, { params }),
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  const memoizedValue = useMemo(
    () => ({
      tickets: data?.data || [],
      ticketsLoading: isLoading,
      ticketsError: error,
      ticketsValidating: isValidating,
      ticketsEmpty: !isLoading && !data?.data?.length,
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
};

const Tickets = {
  addTicket: async (payload) => {
    try {
      const response = await axiosServices.post(endpoints.key, payload);
      return response.data;
    } catch (error) {
      throw new Error(error?.response?.data?.message);
    }
  },
  updateTicket: async (id, payload) => {
    try {
      const response = await axiosServices.put(`${endpoints.key}/${id}`, payload);
      return response.data;
    } catch (error) {
      throw new Error(error?.response?.data?.message);
    }
},
  getTickets: async (query) => {
    try {
      const response = await axiosServices.get(endpoints.key, { params: query });
      return response.data;
    } catch (error) {
      throw new Error(error?.response?.data?.message);
    }
  },
  getTicketById: async (id) => {
    try {
      const response = await axiosServices.get(`${endpoints.key}/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error?.response?.data?.message);
    }
  }
  , getTicketStats: async () => {
    try {
      const response = await axiosServices.get(`${endpoints.key}/stats`);
      return response.data;
    } catch (error) {
      throw new Error(error?.response?.data?.message);
    }
  }
};

export default Tickets;
