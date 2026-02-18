import { useMemo } from "react";
import useSWR from "swr";
import axiosServices, { fetcher } from "../utils/axios";

const endpoints = {
  key: `${import.meta.env.VITE_API_KEY_}/${import.meta.env.VITE_API_VER}/users`,
};

const Tickets = {
  addTicket: async (payload) => {
    try {
      //  Do something
    } catch (error) {
      throw new Error(error?.response?.data?.message);
    }
  },
}

export default {
  Tickets
}
