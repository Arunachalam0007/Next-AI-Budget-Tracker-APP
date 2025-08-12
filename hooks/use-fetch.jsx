import { useState } from "react";
import { toast } from "sonner";

const useFetchHook = (cb) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(undefined);

  const fn = async (...args) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await cb(...args);
      setIsLoading(false);
      setData(response);
    } catch (error) {
      setError(error);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, error, data, fn, setData };
};

export default useFetchHook;
