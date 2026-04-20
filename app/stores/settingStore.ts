import { defineStore } from "pinia";

type LoadingState = {
  title: string;
  description: string;
  isActive: boolean;
  showLogo: boolean;
  transparent: boolean;
};

type SettingState = {
  loading: LoadingState;
};

export const useSettingStore = defineStore("setting", {
  state: (): SettingState => ({
    loading: {
      title: "Đang xử lý",
      description: "Vui lòng chờ trong giây lát...",
      isActive: false,
      showLogo: true,
      transparent: false,
    },
  }),
  actions: {
    setLoading(value: boolean) {
      this.loading.isActive = value;
    },
    setDetailLoading(value: LoadingState) {
      this.loading = value;
    },
  },
  getters: {
    isLoading: state => state.loading.isActive,
  },
  // {
  //   persist: true,
  // },
});
