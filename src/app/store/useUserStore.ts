/* eslint-disable @typescript-eslint/no-explicit-any */
import { create, StateCreator } from "zustand";
import { createJSONStorage, persist, PersistOptions } from "zustand/middleware";
import { IUser } from "../interface";


interface UserState {
  user: IUser | null;
  setUser: (user: UserState["user"]) => void;
  clearUser: () => void;
}

type MyPersist = (
  config: StateCreator<UserState>,
  options: PersistOptions<UserState>
) => StateCreator<UserState>;

const useUserStore = create<UserState>(
  (persist as MyPersist)(
    (set) => ({
      user: null,
      setUser: (user: IUser | null) => set({ user }),
      clearUser: () => set({ user: null }),
    }),
    {
      name: "user-storage", // Nom de la clé de stockage
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default useUserStore;
