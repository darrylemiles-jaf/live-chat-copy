import { useMemo } from "react";
import useSWR from "swr";
import axiosServices, { fetcher } from "../utils/axios";
import { API_URL } from "../constants/constants";

const endpoints = {
  key: `${API_URL}/api/${import.meta.env.VITE_API_VER}/users`,
};

export const useGetUsers = (query) => {
  const { data, isLoading, error, isValidating, mutate } = useSWR(
    [endpoints.key, query],
    ([url, params]) => fetcher(url, true, { params }),
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  const memoizedValue = useMemo(
    () => ({
      users: data?.data || [],
      usersLoading: isLoading,
      usersError: error,
      usersValidating: isValidating,
      usersEmpty: !isLoading && !data?.data?.length,
      usersMutate: mutate,
      pagination: data?.pagination || {},
    }),
    [data, error, isLoading, isValidating, mutate]
  );

  return memoizedValue;
};

const Users = {
  addUser: async (payload) => {
    try {
      const response = await axiosServices.post(endpoints.key, payload);
      return response.data;
    } catch (error) {
      throw new Error(error?.response?.data?.message);
    }
  },
  updateUser: async (id, payload) => {
    try {
      const response = await axiosServices.put(`${endpoints.key}/${id}`, payload);
      return response.data;
    } catch (error) {
      throw new Error(error?.response?.data?.message);
    }
  },
  deleteUser: async (id) => {
    try {
      const response = await axiosServices.delete(`${endpoints.key}/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error?.response?.data?.message);
    }
  },
  getSingleUser: async (id) => {
    try {
      const response = await axiosServices.get(`${endpoints.key}/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error?.response?.data?.message);
    }
  },
  updateUserStatus: async (id, status) => {
    try {
      const response = await axiosServices.patch(`${endpoints.key}/${id}/status`, { status });
      return response.data;
    } catch (error) {
      throw new Error(error?.response?.data?.message);
    }
  }
};

export default Users;
