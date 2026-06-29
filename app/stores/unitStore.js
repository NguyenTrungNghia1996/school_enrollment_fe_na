import { defineStore } from "pinia";

const DEFAULT_UNIT = {
  name: "TRƯỜNG THCS GIẢNG VÕ 2",
  address: "Số 1B Trần Huy Liệu, Phường Giảng Võ, TP. Hà Nội",
  email: "c2giangvo2-bd@hanoiedu.vn",
  phone: "088 699 5511",
  logo: "/images/logo.png",
  logo_full: "/images/logo-full.png",
};

export const useUnitStore = defineStore("unit", {
  state: () => ({
    unit: { ...DEFAULT_UNIT },
  }),

  actions: {
    setUnit(data) {
      this.unit = {
        ...DEFAULT_UNIT,
        ...(data ?? {}),
      };
    },
    resetUnit() {
      this.unit = { ...DEFAULT_UNIT };
    },
  },

  getters: {
    name: state => state.unit.name,
    address: state => state.unit.address,
    email: state => state.unit.email,
    phone: state => state.unit.phone,
    logo: state => state.unit.logo,
    logoFull: state => state.unit.logo_full,
  },
});
