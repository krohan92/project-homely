import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";

export function useResource(res) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const data = await api.list(res);
    setItems(data);
    setLoading(false);
  }, [res]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const add = async (body) => {
    const created = await api.create(res, body);
    setItems((p) => [...p, created]);
    return created;
  };

  const patch = async (id, body) => {
    setItems((p) => p.map((i) => (i.id === id ? { ...i, ...body } : i)));
    await api.update(res, id, body);
  };

  const del = async (id) => {
    setItems((p) => p.filter((i) => i.id !== id));
    await api.remove(res, id);
  };

  return { items, loading, add, patch, del, refresh };
}
