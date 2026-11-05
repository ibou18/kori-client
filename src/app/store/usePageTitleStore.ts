import { create } from "zustand";

interface PageTitleState {
  /** Titre de la page courante, publié par PageWrapper et affiché dans le fil d'Ariane du header. */
  title: string | null;
  setTitle: (title: string | null) => void;
}

const usePageTitleStore = create<PageTitleState>((set) => ({
  title: null,
  setTitle: (title) => set({ title }),
}));

export default usePageTitleStore;
