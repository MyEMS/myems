import { useEffect, useState } from 'react';

const useFakeFetch = (resolvedData, waitingTime = 500) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);

  useEffect(() => {
    let isMounted = true;
    setTimeout(() => {
      if (isMounted) {
        setData(resolvedData);
        setLoading(false);
      }
    }, waitingTime);

    return () => (isMounted = false);
  }, [resolvedData, waitingTime]);

  return { loading, setLoading, data, setData };
};

export default useFakeFetch;
