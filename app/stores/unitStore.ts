import { defineStore } from "pinia";

export type UnitInfo = {
  name: string;
  address: string;
  email: string;
  phone: string;
  logo: string;
  logo_full: string;
};

const DEFAULT_UNIT: UnitInfo = {
  name: "TRƯỜNG TRUNG HỌC CƠ SỞ GIẢNG VÕ",
  address: "1 Trần Huy Liệu, Phường Giảng Võ, TP. Hà Nội",
  email: "c2giangvo-bd@hanoiedu.vn",
  phone: "0246 295 6637",
  logo: "/images/logo.png",
  logo_full: "/images/logo_full.png",
};

type UnitState = {
  unit: UnitInfo;
};

export const useUnitStore = defineStore("unit", {
  state: (): UnitState => ({
    unit: { ...DEFAULT_UNIT },
  }),

  actions: {
    setUnit(data?: Partial<UnitInfo> | null) {
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
